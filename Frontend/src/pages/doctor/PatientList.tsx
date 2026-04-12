





import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Pill,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/prescriptions/doctor`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Add your authorization header here if needed
              // 'Authorization': `Bearer ${token}`
            },
            credentials: "include", // If you're using cookies for auth
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  //you fool how dare you use this logic?//

  const getMedicationStatus = (prescription) => {
    const today = new Date();
    const followUpDate = new Date(prescription.followUpDate);
    return followUpDate > today ? "Active" : "Completed";
  };

  const togglePrescriptionExpansion = (prescriptionId) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  // ── Shared premium prescription PDF ─────────────────────────────
  const buildPrescriptionHTML = (prescription) => {
    const fmt = (s: string, map: Record<string, string>) => map[s] || s.replace(/_/g, " ");
    const mealMap: Record<string, string> = {
      BEFORE_MEAL: "Before Meal", AFTER_MEAL: "After Meal",
      WITH_MEAL: "With Meal", EMPTY_STOMACH: "Empty Stomach", ANY_TIME: "Any Time",
    };
    const timeMap: Record<string, string> = {
      MORNING: "Morning", AFTERNOON: "Afternoon", EVENING: "Evening",
      NIGHT: "Night", BEDTIME: "Bedtime", FIXED_TIME: "Fixed Time", INTERVAL: "Interval",
    };

    const issueDate = new Date(prescription.issueDate).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const followUpDate = prescription.followUpDate
      ? new Date(prescription.followUpDate).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })
      : "—";
    const generatedOn = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

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
            <thead><tr><th>Time</th><th>Dose</th><th>Meal Relation</th></tr></thead>
            <tbody>
              ${med.timings.map(t => `
                <tr>
                  <td>${fmt(t.timeOfDay, timeMap)}${t.specificTime ? " <span class='t-sub'>(" + t.specificTime + ")</span>" : ""}</td>
                  <td><span class="dose-pill">${t.amount} ${med.medicine.form.toLowerCase()}</span></td>
                  <td>${fmt(t.mealRelation, mealMap)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          ${med.specialInstructions ? `<div class="rx-note"><span class="rx-note-icon">⚠</span>${med.specialInstructions}</div>` : ""}
        </div>
      </div>`).join("");

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Prescription #${String(prescription.id).padStart(5,"0")}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#e8edf2;color:#1e293b;font-size:13px;line-height:1.55;}
.page{width:794px;min-height:1123px;margin:24px auto;background:#fff;display:flex;flex-direction:column;box-shadow:0 4px 40px rgba(0,0,0,.18);position:relative;overflow:hidden;}
.page::before{content:'PRESCRIPTION';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:88px;font-weight:800;color:rgba(14,165,233,.04);letter-spacing:6px;pointer-events:none;white-space:nowrap;z-index:0;}
.hdr{background:linear-gradient(120deg,#0c1445 0%,#1e3a8a 55%,#0284c7 100%);padding:26px 36px 20px;color:#fff;position:relative;overflow:hidden;}
.hdr::after{content:'';position:absolute;top:-50px;right:-50px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.05);}
.hdr-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.brand{display:flex;align-items:center;gap:12px;}
.brand-icon{width:46px;height:46px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;}
.b-name{font-size:22px;font-weight:800;letter-spacing:-.5px;}
.b-tag{font-size:11px;color:rgba(255,255,255,.55);margin-top:1px;}
.rx-symbol{font-size:52px;font-weight:800;font-style:italic;color:rgba(255,255,255,.85);letter-spacing:-3px;line-height:1;}
.hdr-sep{height:1px;background:rgba(255,255,255,.15);margin-bottom:14px;}
.hdr-foot{display:flex;justify-content:space-between;align-items:flex-end;}
.doc-name{font-size:17px;font-weight:700;}
.doc-spec{font-size:12px;color:rgba(255,255,255,.65);margin-top:3px;}
.pid-block{text-align:right;}
.pid-label{font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.6px;}
.pid-val{font-size:22px;font-weight:800;color:#7dd3fc;letter-spacing:-1px;}
.body{padding:22px 36px;flex:1;position:relative;z-index:1;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;}
.info-box{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;}
.info-box-head{background:#f8fafc;padding:7px 14px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid #e2e8f0;}
.info-box-body{padding:10px 14px;}
.info-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f1f5f9;}
.info-row:last-child{border-bottom:none;}
.info-k{font-size:11px;color:#94a3b8;font-weight:500;}
.info-v{font-size:12px;color:#0f172a;font-weight:600;text-align:right;max-width:60%;}
.dates-strip{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.date-chip{display:flex;align-items:center;gap:9px;padding:9px 13px;border-radius:9px;font-size:12px;}
.date-chip.issue{background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;}
.date-chip.followup{background:#fdf4ff;border:1px solid #e9d5ff;color:#7e22ce;}
.dc-icon{font-size:17px;}
.dc-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;opacity:.65;display:block;}
.dc-val{font-weight:600;}
.sec-label{font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.sec-label::before{content:'';width:3px;height:14px;background:linear-gradient(to bottom,#0ea5e9,#818cf8);border-radius:2px;display:inline-block;}
.diag-box{background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-left:3px solid #3b82f6;border-radius:9px;padding:11px 14px;font-size:13px;font-weight:600;color:#1d4ed8;margin-bottom:18px;}
.rx-item{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:10px;}
.rx-item:last-child{margin-bottom:0;}
.rx-item-head{display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);padding:9px 13px;border-bottom:1px solid #e2e8f0;}
.rx-num{width:26px;height:26px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;}
.rx-drug{flex:1;}
.rx-drug-name{display:block;font-size:13.5px;font-weight:700;color:#0f172a;}
.rx-drug-sub{display:block;font-size:11px;color:#64748b;margin-top:1px;}
.rx-dur-badge{background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
.rx-item-body{padding:10px 13px;}
.dose-table{width:100%;border-collapse:collapse;font-size:11.5px;}
.dose-table th{background:#f8fafc;padding:5px 10px;text-align:left;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;font-size:10.5px;text-transform:uppercase;letter-spacing:.3px;}
.dose-table td{padding:5px 10px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:middle;}
.dose-table tr:last-child td{border-bottom:none;}
.dose-pill{background:#e0f2fe;color:#0369a1;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;}
.t-sub{color:#94a3b8;font-size:10px;}
.rx-note{display:flex;align-items:flex-start;gap:6px;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;padding:7px 10px;font-size:11px;color:#92400e;margin-top:8px;}
.rx-note-icon{color:#d97706;font-size:14px;flex-shrink:0;margin-top:-1px;}
.advice-box{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;border-left:3px solid #22c55e;border-radius:9px;padding:11px 14px;font-size:12.5px;color:#14532d;margin-bottom:18px;line-height:1.65;}
.ftr{margin-top:auto;border-top:1px solid #e2e8f0;padding:14px 36px;display:flex;justify-content:space-between;align-items:flex-end;background:#f8fafc;position:relative;z-index:1;}
.sig-area{text-align:center;}
.sig-line{width:160px;height:1px;background:#334155;margin:0 auto 5px;}
.sig-name{font-size:12.5px;font-weight:700;color:#1e293b;}
.sig-title{font-size:10px;color:#94a3b8;margin-top:1px;}
.ftr-right{text-align:right;font-size:10px;color:#94a3b8;line-height:1.8;}
.conf-badge{display:inline-block;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:2px 8px;border-radius:4px;margin-bottom:3px;}
@media print{body{background:#fff;}.page{box-shadow:none;margin:0;width:100%;min-height:100vh;}@page{margin:0;size:A4 portrait;}}
</style></head><body>
<div class="page">
<div class="hdr">
  <div class="hdr-top">
    <div class="brand"><div class="brand-icon">❤</div><div><div class="b-name">HealthSync</div><div class="b-tag">Digital Health Management Platform</div></div></div>
    <div class="rx-symbol">Rx</div>
  </div>
  <div class="hdr-sep"></div>
  <div class="hdr-foot">
    <div><div class="doc-name">Dr. ${prescription.doctor.name}</div><div class="doc-spec">${prescription.doctor.specialization || "General Physician"}${prescription.doctor.email ? " &nbsp;·&nbsp; " + prescription.doctor.email : ""}</div></div>
    <div class="pid-block"><div class="pid-label">Prescription ID</div><div class="pid-val">#${String(prescription.id).padStart(5,"0")}</div></div>
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
        ${prescription.doctor.phone ? `<div class="info-row"><span class="info-k">Phone</span><span class="info-v">${prescription.doctor.phone}</span></div>` : ""}
      </div>
    </div>
  </div>
  <div class="dates-strip">
    <div class="date-chip issue"><span class="dc-icon">📅</span><div><span class="dc-label">Issue Date</span><span class="dc-val">${issueDate}</span></div></div>
    <div class="date-chip followup"><span class="dc-icon">🔁</span><div><span class="dc-label">Follow-up Date</span><span class="dc-val">${followUpDate}</span></div></div>
  </div>
  <div class="sec-label">Diagnosis</div>
  <div class="diag-box">${prescription.diagnosis}</div>
  <div class="sec-label">Prescribed Medications (${prescription.medicines.length})</div>
  ${medicinesHTML}
  ${prescription.advice ? `<div style="margin-top:14px;"><div class="sec-label">Doctor's Advice</div><div class="advice-box">${prescription.advice}</div></div>` : ""}
</div>
<div class="ftr">
  <div class="sig-area"><div class="sig-line"></div><div class="sig-name">Dr. ${prescription.doctor.name}</div><div class="sig-title">Authorized Signature &nbsp;·&nbsp; ${prescription.doctor.specialization || "Physician"}</div></div>
  <div class="ftr-right"><div class="conf-badge">Confidential Medical Document</div><div>Generated: ${generatedOn}</div><div>HealthSync &nbsp;·&nbsp; Digital Health Platform</div></div>
</div>
</div></body></html>`;
  };

  const downloadPrescriptionPDF = (prescription) => {
    const html = buildPrescriptionHTML(prescription);
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) { alert("Please allow popups to download the prescription."); return; }
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 500);
  };

  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const formatTimeOfDay = (timeOfDay) => {
    const map = { MORNING: "Morning", AFTERNOON: "Afternoon", EVENING: "Evening", NIGHT: "Night", BEDTIME: "Bedtime", FIXED_TIME: "Fixed Time", INTERVAL: "Interval" };
    return map[timeOfDay] || timeOfDay.replace(/_/g, " ");
  };

  const formatMealRelation = (mealRelation) => {
    const map = { BEFORE_MEAL: "Before Meal", AFTER_MEAL: "After Meal", WITH_MEAL: "With Meal", EMPTY_STOMACH: "Empty Stomach", ANY_TIME: "Any Time" };
    return map[mealRelation] || mealRelation.replace(/_/g, " ");
  };

  const totalActive = prescriptions.filter(p => getMedicationStatus(p) === "Active").length;
  const uniquePatients = new Set(prescriptions.map(p => p.patient.id)).size;

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toString().includes(searchTerm);
    const status = getMedicationStatus(prescription);
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "ACTIVE" && status === "Active") ||
      (activeFilter === "COMPLETED" && status === "Completed");
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading prescriptions…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">Failed to load prescriptions</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-500 text-sm mt-1">Prescriptions you have issued to patients</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{prescriptions.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{totalActive}</p>
              <p className="text-xs text-gray-500 mt-0.5">Active</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{uniquePatients}</p>
              <p className="text-xs text-gray-500 mt-0.5">Patients</p>
            </div>
          </div>
        </div>

        {/* Search + filter tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, diagnosis, or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 bg-white"
            />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
            {(["ALL", "ACTIVE", "COMPLETED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "ALL" ? "All" : f === "ACTIVE" ? "Active" : "Completed"}
              </button>
            ))}
          </div>
        </div>

        {/* Prescriptions list */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No prescriptions found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "Try a different search term" : "Prescriptions you issue will appear here"}
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription, idx) => {
              const isExpanded = expandedPrescriptions.has(prescription.id);
              const status = getMedicationStatus(prescription);
              const isActive = status === "Active";

              return (
                <div
                  key={prescription.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                    onClick={() => togglePrescriptionExpansion(prescription.id)}
                  >
                    {/* Rx badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex flex-col items-center justify-center text-white shadow-sm">
                      <span className="text-xs font-bold italic leading-none">Rx</span>
                      <span className="text-[9px] opacity-75 mt-0.5">#{String(prescription.id).padStart(3, "0")}</span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-base">{prescription.patient.name}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {isActive ? "Active" : "Completed"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        <span className="font-medium text-gray-700">Dx:</span> {prescription.diagnosis}
                      </p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Issued {formatDate(prescription.issueDate)}
                        </span>
                        {prescription.followUpDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Follow-up {formatDate(prescription.followUpDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5" />
                          {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                        onClick={(e) => { e.stopPropagation(); downloadPrescriptionPDF(prescription); }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">

                      {/* Patient info */}
                      <div className="bg-sky-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-3">Patient Information</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Name", val: prescription.patient.name },
                            { label: "Gender", val: prescription.patient.gender || "—" },
                            { label: "Phone", val: prescription.patient.phone || "—" },
                            { label: "Email", val: prescription.patient.email || "—" },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <p className="text-xs text-sky-500 font-medium">{label}</p>
                              <p className="text-sm font-semibold text-sky-900 mt-0.5 truncate">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medicines */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5" />
                          Prescribed Medicines ({prescription.medicines.length})
                        </p>
                        <div className="space-y-3">
                          {prescription.medicines.map((med, mIdx) => (
                            <div key={mIdx} className="border border-gray-100 rounded-xl overflow-hidden">
                              {/* Medicine header */}
                              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {mIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm">{med.medicine.name}</p>
                                  <p className="text-xs text-gray-500">{med.medicine.genericName} · {med.medicine.strength} · {med.medicine.form}</p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                                  {med.durationDays} days
                                </span>
                              </div>

                              {/* Timing table */}
                              <div className="px-4 py-3">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-400 uppercase tracking-wide">
                                      <th className="text-left pb-2 font-semibold">Time</th>
                                      <th className="text-left pb-2 font-semibold">Dose</th>
                                      <th className="text-left pb-2 font-semibold">Meal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {med.timings.map((t, tIdx) => (
                                      <tr key={tIdx}>
                                        <td className="py-1.5 text-gray-700 font-medium">
                                          {formatTimeOfDay(t.timeOfDay)}
                                          {t.specificTime && <span className="text-gray-400 ml-1">({t.specificTime})</span>}
                                        </td>
                                        <td className="py-1.5">
                                          <span className="bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-lg">
                                            {t.amount} {med.medicine.form.toLowerCase()}
                                          </span>
                                        </td>
                                        <td className="py-1.5 text-gray-600">{formatMealRelation(t.mealRelation)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {med.specialInstructions && (
                                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">{med.specialInstructions}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advice */}
                      {prescription.advice && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">Doctor's Advice</p>
                          <p className="text-sm text-emerald-800 leading-relaxed">{prescription.advice}</p>
                        </div>
                      )}

                      {/* Download again */}
                      <div className="flex justify-end pt-1">
                        <button
                          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                          onClick={() => downloadPrescriptionPDF(prescription)}
                        >
                          <Download className="w-4 h-4" />
                          Download Prescription PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorPrescriptions;
