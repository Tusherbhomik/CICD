#!/usr/bin/env python3
"""
HealthSync — Medicine Data Seeder
Reads archive/ CSVs and generates seed.sql for PostgreSQL.

Usage:
    python3 seed_data.py            # generates seed.sql
    python3 seed_data.py --limit 500  # only first 500 medicines (for testing)

Then run against the running Docker database:
    docker exec -i prescription_db psql -U prescription_user -d prescription_system < seed.sql
"""

import csv
import json
import re
import sys
import os
from pathlib import Path

ARCHIVE_DIR = Path(__file__).parent / "archive"
OUTPUT_FILE = Path(__file__).parent / "seed.sql"

# Limit rows (None = all rows)
LIMIT = None
for i, arg in enumerate(sys.argv[1:]):
    if arg == "--limit" and i + 1 < len(sys.argv) - 1:
        LIMIT = int(sys.argv[i + 2])

# Dosage form → Medicine.Form enum
FORM_MAP = {
    "tablet": "TABLET",
    "chewable tablet": "TABLET",
    "dispersible tablet": "TABLET",
    "sublingual tablet": "TABLET",
    "effervescent tablet": "TABLET",
    "extended release tablet": "TABLET",
    "capsule": "CAPSULE",
    "soft gelatin capsule": "CAPSULE",
    "sustained release capsule": "CAPSULE",
    "capsule (sustained release)": "CAPSULE",
    "capsule (modified release)": "CAPSULE",
    "syrup": "SYRUP",
    "suspension": "SYRUP",
    "oral solution": "SYRUP",
    "oral liquid": "SYRUP",
    "solution": "SYRUP",
    "linctus": "SYRUP",
    "injection": "INJECTION",
    "infusion": "INJECTION",
    "intravenous infusion": "INJECTION",
    "lyophilized injection": "INJECTION",
    "cream": "CREAM",
    "ointment": "CREAM",
    "topical gel": "CREAM",
    "gel": "CREAM",
    "lotion": "CREAM",
    "topical solution": "CREAM",
    "eye drop": "DROPS",
    "eye drops": "DROPS",
    "ear drop": "DROPS",
    "nasal drop": "DROPS",
    "drops": "DROPS",
    "drop": "DROPS",
    "nasal spray": "DROPS",
    "inhaler": "INHALER",
    "aerosol inhaler": "INHALER",
    "dry powder inhaler": "INHALER",
    "pressurized inhaler": "INHALER",
    "patch": "PATCH",
    "transdermal patch": "PATCH",
}

def map_form(raw_form: str) -> str:
    key = raw_form.strip().lower()
    if key in FORM_MAP:
        return FORM_MAP[key]
    for k, v in FORM_MAP.items():
        if k in key:
            return v
    return "OTHER"

def extract_price(package_str: str) -> str:
    """Extract numeric price from strings like '100 ml bottle: ৳ 40.12'"""
    if not package_str:
        return "0.00"
    match = re.search(r"[\u09f3৳]\s*([\d,]+\.?\d*)", package_str)
    if match:
        return match.group(1).replace(",", "")
    match = re.search(r"([\d,]+\.\d{2})\s*$", package_str.strip())
    if match:
        return match.group(1).replace(",", "")
    return "0.00"

def sql_escape(s: str) -> str:
    """Escape single quotes for PostgreSQL."""
    if s is None:
        return ""
    return s.replace("'", "''")

def strip_html(text: str) -> str:
    """Remove HTML tags from text."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:2000]  # cap at 2000 chars

def main():
    print(f"Reading CSVs from: {ARCHIVE_DIR}")

    # ── Step 1: Load generics ─────────────────────────────────────────────
    print("Loading generic.csv ...")
    generics = {}  # generic_name (lower) → dict
    with open(ARCHIVE_DIR / "generic.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("generic name", "").strip()
            if not name:
                continue
            drug_class = row.get("drug class", "").strip() or "General"
            indication = row.get("indication", "").strip()
            desc_obj = {
                "indication": indication,
                "pharmacology": strip_html(row.get("pharmacology description", "")),
                "side_effects": strip_html(row.get("side effects description", "")),
                "dosage": strip_html(row.get("dosage description", "")),
                "precautions": strip_html(row.get("precautions description", "")),
            }
            # Remove empty fields
            desc_obj = {k: v for k, v in desc_obj.items() if v}
            generics[name.lower()] = {
                "name": name,
                "category": drug_class[:100] if drug_class else "General",
                "description": json.dumps(desc_obj, ensure_ascii=False),
            }

    print(f"  Loaded {len(generics)} generics")

    # ── Step 2: Load medicines and find referenced generics ───────────────
    print("Loading medicine.csv ...")
    medicines = []
    referenced_generic_names = set()

    with open(ARCHIVE_DIR / "medicine.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            brand_name = row.get("brand name", "").strip()
            generic_name = row.get("generic", "").strip()
            dosage_form = row.get("dosage form", "").strip()
            strength = row.get("strength", "").strip() or "N/A"
            manufacturer = row.get("manufacturer", "").strip()
            package_container = row.get("package container", "").strip()

            if not brand_name or not generic_name:
                continue

            referenced_generic_names.add(generic_name.lower())
            medicines.append({
                "name": brand_name,
                "generic_name": generic_name,
                "form": map_form(dosage_form),
                "strength": strength[:200],
                "manufacturer": manufacturer[:200],
                "price": extract_price(package_container),
            })

            if LIMIT and len(medicines) >= LIMIT:
                break

    print(f"  Loaded {len(medicines)} medicines referencing {len(referenced_generic_names)} generics")

    # Only insert generics that are actually used by medicines
    used_generics = {
        k: v for k, v in generics.items() if k in referenced_generic_names
    }
    # Also add any referenced generic not found in generic.csv (fallback)
    for name_lower in referenced_generic_names:
        if name_lower not in used_generics:
            # Use the first medicine's generic name as display name
            display_name = next(
                (m["generic_name"] for m in medicines if m["generic_name"].lower() == name_lower),
                name_lower.title()
            )
            used_generics[name_lower] = {
                "name": display_name,
                "category": "General",
                "description": json.dumps({}),
            }

    print(f"  Will insert {len(used_generics)} generics + {len(medicines)} medicines")

    # ── Step 3: Write SQL ──────────────────────────────────────────────────
    print(f"Writing {OUTPUT_FILE} ...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("-- HealthSync Medicine Seed\n")
        out.write("-- Generated by seed_data.py\n")
        out.write("-- Run: docker exec -i prescription_db psql -U prescription_user -d prescription_system < seed.sql\n\n")
        out.write("BEGIN;\n\n")

        # Insert generics
        out.write("-- medicine_generics\n")
        out.write("INSERT INTO medicine_generics (generic_name, category, description, created_at, updated_at)\n")
        out.write("VALUES\n")

        generic_name_to_sql_order = {}  # lower name → order in INSERT (for RETURNING workaround)
        rows = list(used_generics.values())
        for i, g in enumerate(rows):
            generic_name_to_sql_order[g["name"].lower()] = i + 1
            desc_escaped = sql_escape(g["description"])
            name_escaped = sql_escape(g["name"])
            cat_escaped = sql_escape(g["category"])
            comma = "," if i < len(rows) - 1 else ""
            out.write(
                f"  ('{name_escaped}', '{cat_escaped}', '{desc_escaped}', NOW(), NOW()){comma}\n"
            )

        out.write("ON CONFLICT (generic_name) DO NOTHING;\n\n")

        # Insert medicines using a subquery to look up generic_id
        out.write("-- medicines\n")
        for i, m in enumerate(medicines):
            name_esc = sql_escape(m["name"])
            strength_esc = sql_escape(m["strength"])
            manufacturer_esc = sql_escape(m["manufacturer"])
            generic_name_esc = sql_escape(m["generic_name"])
            form = m["form"]
            price = m["price"]

            out.write(
                f"INSERT INTO medicines (name, strength, form, generic_id, price, manufacturer, created_at, updated_at)\n"
                f"  SELECT '{name_esc}', '{strength_esc}', '{form}', id, {price}, '{manufacturer_esc}', NOW(), NOW()\n"
                f"  FROM medicine_generics WHERE generic_name = '{generic_name_esc}' LIMIT 1;\n"
            )

        out.write("\nCOMMIT;\n")
        out.write(f"\n-- Summary: {len(rows)} generics, {len(medicines)} medicines\n")

    size_kb = OUTPUT_FILE.stat().st_size // 1024
    print(f"\nDone! seed.sql written ({size_kb} KB)")
    print("\nNext step — load into running database:")
    print("  docker exec -i prescription_db psql -U $DB_USERNAME -d prescription_system < seed.sql")
    print("\nOr with explicit credentials:")
    print("  docker exec -i prescription_db psql -U prescription_user -d prescription_system < seed.sql")

if __name__ == "__main__":
    main()
