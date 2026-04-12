import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  AlertCircle, Calendar, ChevronDown, ChevronUp,
  Clock, Download, FileText, Pill, Search, User, Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price?: number;
}

interface Timing {
  timeOfDay: string;
  specificTime: string;
  amount: string;
  mealRelation: string;
}

interface MedicineItem {
  medicine: Medicine;
  durationDays: number;
  timings: Timing[];
  specialInstructions?: string;
}

interface Doctor {
  name: string;
  specialization?: string;
  contactNumber?: string;
  email?: string;
}

interface Patient {
  name: string;
  id: number;
  email?: string;
  phone?: string;
  gender?: string;
}

interface Prescription {
  id: number;
  patient: Patient;
  doctor: Doctor;
  issueDate: string;
  followUpDate: string;
  diagnosis: string;
  medicines: MedicineItem[];
  advice?: string;
}

// ─── Shared PDF generation (identical to doctor side) ───────────────
const buildPrescriptionHTML = (prescription: Prescription): string => {
  const fmt = (s: string, map: Record<string, string>) => map[s] || s.replace(/_/g, " ");

  const mealMap: Record<string, string> = {
    BEFORE_MEAL: "Before Meal", AFTER_MEAL: "After Meal",
    WITH_MEAL: "With Meal", EMPTY_STOMACH: "Empty Stomach", ANY_TIME: "Any Time",
  };
  const timeMap: Record<string, string> = {
    MORNING: "Morning", AFTERNOON: "Afternoon", EVENING: "Evening",
    NIGHT: "Night", BEDTIME: "Bedtime", FIXED_TIME: "Fixed Time", INTERVAL: "Interval",
  };

  const issueDate = new Date(prescription.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const followUpDate = prescription.followUpDate
    ? new Date(prescription.followUpDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const generatedOn = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const medicinesHTML = prescription.medicines.map((med, idx) => `
    <div class="rx-item">
      <div class="rx-item-head">
        <div class="rx-num">${idx + 1}</div>
        <div class="rx-drug">
          <span class="rx-drug-name">${med.medicine.name}</span>
          <span class="rx-drug-sub">${med.medicine.genericName} &nbsp;·&nbsp; ${med.medicine.strength} &nbsp;·&nbsp; ${med.medicine.form}</span>
        </div>
        <div class="rx-dur-badge">${med.durationDays} days</div>
      </div>
      <div class="rx-item-body">
        <table class="dose-table">
          <thead>
            <tr><th>Time</th><th>Dose</th><th>Meal Relation</th></tr>
          </thead>
          <tbody>
            ${med.timings.map(t => `
              <tr>
                <td>${fmt(t.timeOfDay, timeMap)}${t.specificTime ? " &nbsp;<span class='t-sub'>(" + t.specificTime + ")</span>" : ""}</td>
                <td><span class="dose-pill">${t.amount} ${med.medicine.form.toLowerCase()}</span></td>
                <td>${fmt(t.mealRelation, mealMap)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        ${med.specialInstructions ? `<div class="rx-note"><span class="rx-note-icon">⚠</span>${med.specialInstructions}</div>` : ""}
      </div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Prescription #${String(prescription.id).padStart(5, "0")}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',sans-serif;background:#e8edf2;color:#1e293b;font-size:13px;line-height:1.55;}

  .page{width:794px;min-height:1123px;margin:24px auto;background:#fff;display:flex;flex-direction:column;box-shadow:0 4px 40px rgba(0,0,0,.18);position:relative;overflow:hidden;}

  /* watermark */
  .page::before{content:'PRESCRIPTION';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:88px;font-weight:800;color:rgba(14,165,233,.04);letter-spacing:6px;pointer-events:none;white-space:nowrap;z-index:0;}

  /* ── HEADER ── */
  .hdr{background:linear-gradient(120deg,#0c1445 0%,#1e3a8a 55%,#0284c7 100%);padding:26px 36px 20px;color:#fff;position:relative;overflow:hidden;}
  .hdr::after{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.05);}
  .hdr-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
  .brand{display:flex;align-items:center;gap:12px;}
  .brand-icon{width:46px;height:46px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;}
  .brand-text .b-name{font-size:22px;font-weight:800;letter-spacing:-.5px;}
  .brand-text .b-tag{font-size:11px;color:rgba(255,255,255,.55);margin-top:1px;}
  .rx-symbol{font-size:52px;font-weight:800;font-style:italic;color:rgba(255,255,255,.85);letter-spacing:-3px;line-height:1;}
  .hdr-sep{height:1px;background:rgba(255,255,255,.15);margin-bottom:14px;}
  .hdr-foot{display:flex;justify-content:space-between;align-items:flex-end;}
  .doc-block .doc-name{font-size:17px;font-weight:700;}
  .doc-block .doc-spec{font-size:12px;color:rgba(255,255,255,.65);margin-top:3px;}
  .pid-block{text-align:right;}
  .pid-block .pid-label{font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.6px;}
  .pid-block .pid-val{font-size:22px;font-weight:800;color:#7dd3fc;letter-spacing:-1px;}

  /* ── BODY ── */
  .body{padding:22px 36px;flex:1;position:relative;z-index:1;}

  /* info grid */
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;}
  .info-box{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;}
  .info-box-head{background:#f8fafc;padding:7px 14px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid #e2e8f0;}
  .info-box-body{padding:10px 14px;}
  .info-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f1f5f9;}
  .info-row:last-child{border-bottom:none;}
  .info-k{font-size:11px;color:#94a3b8;font-weight:500;}
  .info-v{font-size:12px;color:#0f172a;font-weight:600;text-align:right;max-width:60%;}

  /* dates */
  .dates-strip{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
  .date-chip{display:flex;align-items:center;gap:9px;padding:9px 13px;border-radius:9px;font-size:12px;}
  .date-chip.issue{background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;}
  .date-chip.followup{background:#fdf4ff;border:1px solid #e9d5ff;color:#7e22ce;}
  .date-chip .dc-icon{font-size:17px;}
  .date-chip .dc-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;opacity:.65;display:block;}
  .date-chip .dc-val{font-weight:600;}

  /* section label */
  .sec-label{font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
  .sec-label::before{content:'';width:3px;height:14px;background:linear-gradient(to bottom,#0ea5e9,#818cf8);border-radius:2px;display:inline-block;}

  /* diagnosis */
  .diag-box{background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-left:3px solid #3b82f6;border-radius:9px;padding:11px 14px;font-size:13px;font-weight:600;color:#1d4ed8;margin-bottom:18px;}

  /* rx items */
  .rx-item{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:10px;}
  .rx-item:last-child{margin-bottom:0;}
  .rx-item-head{display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);padding:9px 13px;border-bottom:1px solid #e2e8f0;}
  .rx-num{width:26px;height:26px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;}
  .rx-drug{flex:1;}
  .rx-drug-name{display:block;font-size:13.5px;font-weight:700;color:#0f172a;}
  .rx-drug-sub{display:block;font-size:11px;color:#64748b;margin-top:1px;}
  .rx-dur-badge{background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
  .rx-item-body{padding:10px 13px;}

  /* dose table */
  .dose-table{width:100%;border-collapse:collapse;font-size:11.5px;}
  .dose-table th{background:#f8fafc;padding:5px 10px;text-align:left;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;font-size:10.5px;text-transform:uppercase;letter-spacing:.3px;}
  .dose-table td{padding:5px 10px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:middle;}
  .dose-table tr:last-child td{border-bottom:none;}
  .dose-pill{background:#e0f2fe;color:#0369a1;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;}
  .t-sub{color:#94a3b8;font-size:10px;}

  /* special note */
  .rx-note{display:flex;align-items:flex-start;gap:6px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;padding:7px 10px;font-size:11px;color:#92400e;margin-top:8px;}
  .rx-note-icon{color:#d97706;font-size:14px;flex-shrink:0;margin-top:-1px;}

  /* advice */
  .advice-box{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;border-left:3px solid #22c55e;border-radius:9px;padding:11px 14px;font-size:12.5px;color:#14532d;margin-bottom:18px;line-height:1.65;}

  /* ── FOOTER ── */
  .ftr{margin-top:auto;border-top:1px solid #e2e8f0;padding:14px 36px;display:flex;justify-content:space-between;align-items:flex-end;background:#f8fafc;position:relative;z-index:1;}
  .sig-area{text-align:center;}
  .sig-line{width:160px;height:1px;background:#334155;margin:0 auto 5px;}
  .sig-name{font-size:12.5px;font-weight:700;color:#1e293b;}
  .sig-title{font-size:10px;color:#94a3b8;margin-top:1px;}
  .ftr-right{text-align:right;font-size:10px;color:#94a3b8;line-height:1.8;}
  .conf-badge{display:inline-block;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:2px 8px;border-radius:4px;margin-bottom:3px;}

  @media print{
    body{background:#fff;}
    .page{box-shadow:none;margin:0;width:100%;min-height:100vh;}
    @page{margin:0;size:A4 portrait;}
  }
</style>
</head>
<body>
<div class="page">

  <div class="hdr">
    <div class="hdr-top">
      <div class="brand">
        <div class="brand-icon">❤</div>
        <div class="brand-text">
          <div class="b-name">HealthSync</div>
          <div class="b-tag">Digital Health Management Platform</div>
        </div>
      </div>
      <div class="rx-symbol">Rx</div>
    </div>
    <div class="hdr-sep"></div>
    <div class="hdr-foot">
      <div class="doc-block">
        <div class="doc-name">Dr. ${prescription.doctor.name}</div>
        <div class="doc-spec">${prescription.doctor.specialization || "General Physician"}${prescription.doctor.email ? " &nbsp;·&nbsp; " + prescription.doctor.email : ""}</div>
      </div>
      <div class="pid-block">
        <div class="pid-label">Prescription ID</div>
        <div class="pid-val">#${String(prescription.id).padStart(5, "0")}</div>
      </div>
    </div>
  </div>

  <div class="body">

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-head">Patient Information</div>
        <div class="info-box-body">
          <div class="info-row"><span class="info-k">Full Name</span><span class="info-v">${prescription.patient.name}</span></div>
          <div class="info-row"><span class="info-k">Patient ID</span><span class="info-v">#${prescription.patient.id}</span></div>
          ${prescription.patient.email ? `<div class="info-row"><span class="info-k">Email</span><span class="info-v">${prescription.patient.email}</span></div>` : ""}
          ${prescription.patient.phone ? `<div class="info-row"><span class="info-k">Phone</span><span class="info-v">${prescription.patient.phone}</span></div>` : ""}
          ${prescription.patient.gender ? `<div class="info-row"><span class="info-k">Gender</span><span class="info-v">${prescription.patient.gender}</span></div>` : ""}
        </div>
      </div>
      <div class="info-box">
        <div class="info-box-head">Physician Information</div>
        <div class="info-box-body">
          <div class="info-row"><span class="info-k">Doctor</span><span class="info-v">Dr. ${prescription.doctor.name}</span></div>
          <div class="info-row"><span class="info-k">Specialization</span><span class="info-v">${prescription.doctor.specialization || "General Physician"}</span></div>
          ${prescription.doctor.email ? `<div class="info-row"><span class="info-k">Email</span><span class="info-v">${prescription.doctor.email}</span></div>` : ""}
          ${prescription.doctor.contactNumber ? `<div class="info-row"><span class="info-k">Contact</span><span class="info-v">${prescription.doctor.contactNumber}</span></div>` : ""}
        </div>
      </div>
    </div>

    <div class="dates-strip">
      <div class="date-chip issue">
        <span class="dc-icon">📅</span>
        <div><span class="dc-label">Issue Date</span><span class="dc-val">${issueDate}</span></div>
      </div>
      <div class="date-chip followup">
        <span class="dc-icon">🔁</span>
        <div><span class="dc-label">Follow-up Date</span><span class="dc-val">${followUpDate}</span></div>
      </div>
    </div>

    <div class="sec-label">Diagnosis</div>
    <div class="diag-box">${prescription.diagnosis}</div>

    <div class="sec-label">Prescribed Medications (${prescription.medicines.length})</div>
    ${medicinesHTML}

    ${prescription.advice ? `
    <div style="margin-top:14px;">
      <div class="sec-label">Doctor's Advice</div>
      <div class="advice-box">${prescription.advice}</div>
    </div>` : ""}

  </div>

  <div class="ftr">
    <div class="sig-area">
      <div class="sig-line"></div>
      <div class="sig-name">Dr. ${prescription.doctor.name}</div>
      <div class="sig-title">Authorized Signature &nbsp;·&nbsp; ${prescription.doctor.specialization || "Physician"}</div>
    </div>
    <div class="ftr-right">
      <div class="conf-badge">Confidential Medical Document</div>
      <div>Generated: ${generatedOn}</div>
      <div>HealthSync &nbsp;·&nbsp; Digital Health Platform</div>
    </div>
  </div>

</div>
</body>
</html>`;
};

const printPrescription = (prescription: Prescription) => {
  const win = window.open("", "_blank", "width=900,height=750");
  if (!win) { alert("Please allow popups to download the prescription."); return; }
  win.document.write(buildPrescriptionHTML(prescription));
  win.document.close();
  win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 500);
};
// ────────────────────────────────────────────────────────────────────

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/prescriptions/patient`, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch prescriptions"); return r.json(); })
      .then((data: Prescription[]) => setPrescriptions(data))
      .catch(err => setError(err instanceof Error ? err.message : "An error occurred"))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const isActive = (p: Prescription) => p.followUpDate ? new Date(p.followUpDate) > new Date() : false;

  const filtered = prescriptions
    .filter(p => filter === "all" || (filter === "active" ? isActive(p) : !isActive(p)))
    .filter(p => !search || p.diagnosis.toLowerCase().includes(search.toLowerCase()) || p.doctor.name.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search));

  const timeLabel: Record<string, string> = { MORNING: "Morning", AFTERNOON: "Afternoon", EVENING: "Evening", NIGHT: "Night", BEDTIME: "Bedtime", FIXED_TIME: "Fixed Time", INTERVAL: "Interval" };
  const mealLabel: Record<string, string> = { BEFORE_MEAL: "Before meal", AFTER_MEAL: "After meal", WITH_MEAL: "With meal", EMPTY_STOMACH: "Empty stomach", ANY_TIME: "Any time" };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-medical-primary/20 border-t-medical-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading prescriptions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-white rounded-2xl p-10 border border-red-100 shadow-sm max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="font-semibold text-slate-800 mb-1">Failed to load</p>
            <p className="text-sm text-red-500 mb-5">{error}</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Try Again</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const activeCount = prescriptions.filter(isActive).length;
  const completedCount = prescriptions.length - activeCount;

  return (
    <MainLayout userType="patient">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
            <p className="text-slate-500 mt-0.5">View and download your medical prescriptions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-full">{activeCount} Active</span>
            <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-3 py-1.5 rounded-full">{completedCount} Completed</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Prescriptions", value: prescriptions.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Medications", value: activeCount, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Completed", value: completedCount, icon: Calendar, color: "text-slate-500", bg: "bg-slate-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by diagnosis, doctor, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary bg-white"
            />
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white text-sm font-medium">
            {(["all", "active", "completed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 capitalize transition-colors ${filter === f ? "bg-medical-primary text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700 text-lg">{search || filter !== "all" ? "No results found" : "No prescriptions yet"}</p>
            <p className="text-slate-400 text-sm mt-1">{search ? "Try a different search term" : filter !== "all" ? "Try a different filter" : "Your prescriptions will appear here after a doctor visit"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => {
              const active = isActive(p);
              const open = expandedId === p.id;
              return (
                <div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${open ? "border-medical-primary/30 shadow-md" : "border-slate-100 hover:border-slate-200 hover:shadow"}`}>
                  {/* Card header */}
                  <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandedId(open ? null : p.id)}>
                    {/* Rx badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-primary to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-lg italic">Rx</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-900">Prescription #{String(p.id).padStart(4, "0")}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {active ? "Active" : "Completed"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Dr. {p.doctor.name}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{fmtDate(p.issueDate)}</span>
                        <span className="flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" />{p.medicines.length} medicine{p.medicines.length !== 1 ? "s" : ""}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1.5 font-medium truncate">
                        <span className="text-slate-400 font-normal">Diagnosis: </span>{p.diagnosis}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-medical-primary hover:bg-medical-primary/90 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        onClick={e => { e.stopPropagation(); printPrescription(p); }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 space-y-5">
                      {/* Doctor + dates row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl border border-slate-100 p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Physician</p>
                          <p className="font-bold text-slate-800">Dr. {p.doctor.name}</p>
                          {p.doctor.specialization && <p className="text-sm text-slate-500">{p.doctor.specialization}</p>}
                          {p.doctor.contactNumber && <p className="text-sm text-medical-primary mt-1">{p.doctor.contactNumber}</p>}
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Issue Date</p>
                          <p className="font-bold text-blue-800">{fmtDate(p.issueDate)}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Follow-up</p>
                          <p className="font-bold text-purple-800">{p.followUpDate ? fmtDate(p.followUpDate) : "—"}</p>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-blue-50 border border-blue-100 border-l-4 border-l-blue-500 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Diagnosis</p>
                        <p className="text-slate-800 font-medium">{p.diagnosis}</p>
                      </div>

                      {/* Medicines */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medications ({p.medicines.length})</p>
                        {p.medicines.map((med, i) => (
                          <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-medical-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900">{med.medicine.name}</p>
                                <p className="text-xs text-slate-500">{med.medicine.genericName} · {med.medicine.strength} · {med.medicine.form}</p>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full">{med.durationDays} days</span>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                              {med.timings.map((t, ti) => (
                                <div key={ti} className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-slate-600 min-w-[90px]">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">{timeLabel[t.timeOfDay] || t.timeOfDay}</span>
                                  </div>
                                  <span className="bg-medical-primary/10 text-medical-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{t.amount} {med.medicine.form.toLowerCase()}</span>
                                  <span className="text-slate-400 text-xs">{mealLabel[t.mealRelation] || t.mealRelation}</span>
                                  {t.specificTime && <span className="text-slate-400 text-xs">· {t.specificTime}</span>}
                                </div>
                              ))}
                              {med.specialInstructions && (
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-amber-700">{med.specialInstructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Advice */}
                      {p.advice && (
                        <div className="bg-emerald-50 border border-emerald-100 border-l-4 border-l-emerald-500 rounded-xl p-4">
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Doctor's Advice</p>
                          <p className="text-slate-700 text-sm leading-relaxed">{p.advice}</p>
                        </div>
                      )}

                      {/* Download again */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => printPrescription(p)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-medical-primary to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow"
                        >
                          <Download className="w-4 h-4" />
                          Download Prescription PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Prescriptions;
