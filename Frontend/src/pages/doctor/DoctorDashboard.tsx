import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Calendar, FileText, Clock, Activity,
  Phone, Plus, ArrowRight, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/url";
import MainLayout from "@/components/layout/MainLayout";

const DoctorDashboard = () => {
  const [doctorInfo, setDoctorInfo]                     = useState(null);
  const [totalPatient, setTotalPatient]                 = useState(0);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [prescriptions, setPrescriptions]               = useState([]);
  const [isLoading, setIsLoading]                       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [profileRes, countRes, aptsRes, rxRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/doctors/profile`,           { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/doctors/patient-count`,     { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/appointments/doctor/confirmed`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/api/prescriptions/doctor`,      { credentials: "include", headers: { "Content-Type": "application/json" } }),
        ]);
        if (profileRes.ok) setDoctorInfo(await profileRes.json());
        if (countRes.ok)   setTotalPatient(await countRes.json());
        if (aptsRes.ok)    setConfirmedAppointments(await aptsRes.json());
        if (rxRes.ok)      setPrescriptions(await rxRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
  const fmtTime = (s: string) => s ? new Date(s).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

  const todayApts = confirmedAppointments.filter(
    (a) => new Date(a.scheduledTime).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading dashboard…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const initial = doctorInfo?.name?.charAt(0)?.toUpperCase() || "D";

  return (
    <MainLayout userType="doctor">
      {/* Full-height flex column fills the flex-1 slot from MainLayout */}
      <div className="flex-1 flex flex-col px-6 py-5 bg-slate-50 min-h-0">
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 gap-4 min-h-0">

          {/* ── Hero ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
            <div className="h-20 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            </div>
            <div className="px-6 pb-4">
              <div className="flex items-end gap-4 -mt-7 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl text-white font-bold">{initial}</span>
                </div>
                <div className="mb-0.5 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    Welcome back, Dr. {doctorInfo?.name || "Doctor"}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {doctorInfo?.specialization || "General Physician"}
                    {doctorInfo?.institute && doctorInfo.institute !== "NOT_SET" ? ` · ${doctorInfo.institute}` : ""}
                  </p>
                </div>
                <Link
                  to="/doctor/new-prescription"
                  className="mb-1 flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  New Prescription
                </Link>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            {[
              { label: "Total Patients",  value: totalPatient,                  icon: Users,     color: "text-sky-600 bg-sky-50 border-sky-100" },
              { label: "Appointments",    value: confirmedAppointments.length,  icon: Calendar,  color: "text-indigo-600 bg-indigo-50 border-indigo-100", sub: `${todayApts.length} today` },
              { label: "Prescriptions",   value: prescriptions.length,          icon: FileText,  color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className={`rounded-2xl border p-4 ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
                  <Icon className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-3xl font-bold">{value}</p>
                {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Main grid — fills remaining space ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">

            {/* Upcoming appointments */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-500" />
                  <h2 className="font-bold text-gray-900 text-sm">Upcoming Appointments</h2>
                </div>
                <Link to="/doctor/appointments" className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {confirmedAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <Calendar className="w-9 h-9 text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {confirmedAppointments.slice(0, 8).map((apt) => (
                      <div key={apt.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {apt.patient.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{apt.patient.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(apt.scheduledTime)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(apt.scheduledTime)}</span>
                            {apt.patient.phone && (
                              <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3" />{apt.patient.phone}</span>
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                          apt.type === "IN_PERSON" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                        )}>
                          {apt.type.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Today's schedule */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-gray-900 text-sm">Today's Schedule</h2>
                <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                  {todayApts.length} apt{todayApts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {todayApts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <Activity className="w-9 h-9 text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm">Free today</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {todayApts.map((apt) => (
                      <div key={apt.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{apt.patient.name}</p>
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">{fmtTime(apt.scheduledTime)}</p>
                        </div>
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                          apt.type === "IN_PERSON" ? "bg-white text-emerald-700 border border-emerald-100" : "bg-white text-sky-700 border border-sky-100"
                        )}>
                          {apt.type.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Recent Prescriptions ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                <h2 className="font-bold text-gray-900 text-sm">Recent Prescriptions</h2>
              </div>
              <Link to="/doctor/prescriptions" className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-600">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {prescriptions.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="w-9 h-9 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No prescriptions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Patient</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Diagnosis</th>
                      <th className="px-5 py-3 hidden md:table-cell">Issue Date</th>
                      <th className="px-5 py-3 hidden md:table-cell">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prescriptions.slice(0, 6).map((rx) => (
                      <tr key={rx.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {rx.patient.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{rx.patient.name}</p>
                              <p className="text-xs text-gray-400">{rx.patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 font-medium px-2.5 py-1 rounded-full">
                            {rx.diagnosis}
                          </span>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-sm text-gray-500">
                          {rx.issueDate ? new Date(rx.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-sm text-gray-500">
                          {rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorDashboard;
