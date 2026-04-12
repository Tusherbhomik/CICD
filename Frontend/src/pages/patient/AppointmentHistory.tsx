import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import { AlertCircle, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  role?: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface Appointment {
  id: number;
  scheduledTime: string;
  status: string;
  type: string;
  notes: string;
  preferredTimeSlot: string;
  requestDate: string;
  followupDate: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: Doctor;
  patient: Patient;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  COMPLETED:  { label: "Completed",  color: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
  CONFIRMED:  { label: "Confirmed",  color: "bg-sky-100 text-sky-700 border-sky-200",              dot: "bg-sky-500" },
  SCHEDULED:  { label: "Scheduled",  color: "bg-sky-100 text-sky-700 border-sky-200",              dot: "bg-sky-500" },
  PENDING:    { label: "Pending",    color: "bg-amber-100 text-amber-700 border-amber-200",        dot: "bg-amber-500" },
  REQUESTED:  { label: "Requested",  color: "bg-violet-100 text-violet-700 border-violet-200",     dot: "bg-violet-500" },
  CANCELLED:  { label: "Cancelled",  color: "bg-red-100 text-red-700 border-red-200",              dot: "bg-red-500" },
};

const TYPE_LABEL: Record<string, string> = {
  IN_PERSON: "In Person",
  VIDEO:     "Video Call",
  PHONE:     "Phone Call",
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/patient`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      setAppointments(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading appointments…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-96">
          <div className="text-center bg-white rounded-2xl p-10 border border-red-100 shadow-sm max-w-sm">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 mb-1">Failed to load</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchAppointments}
              className="px-5 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const total     = appointments.length;
  const completed = appointments.filter(a => a.status.toUpperCase() === "COMPLETED").length;
  const upcoming  = appointments.filter(a => ["PENDING", "REQUESTED", "CONFIRMED", "SCHEDULED"].includes(a.status.toUpperCase())).length;
  const cancelled = appointments.filter(a => a.status.toUpperCase() === "CANCELLED").length;

  return (
    <MainLayout userType="patient">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Appointment History</h1>
            <p className="text-sm text-gray-400">View your past and upcoming appointments</p>
          </div>
        </div>

        {/* Stats strip */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",     value: total,     color: "text-teal-600 bg-teal-50 border-teal-100" },
              { label: "Completed", value: completed, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { label: "Upcoming",  value: upcoming,  color: "text-sky-600 bg-sky-50 border-sky-100" },
              { label: "Cancelled", value: cancelled, color: "text-red-600 bg-red-50 border-red-100" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border p-4 ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Appointment cards */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Your appointments will appear here after booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const status = STATUS_CONFIG[apt.status.toUpperCase()] ?? {
                label: apt.status,
                color: "bg-gray-100 text-gray-600 border-gray-200",
                dot: "bg-gray-400",
              };
              const initial = apt.doctor?.name
                ? apt.doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                : "Dr";

              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-teal-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    {/* Doctor avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{initial}</span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900">Dr. {apt.doctor?.name || "Unknown"}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        {apt.doctor?.specialization || apt.doctor?.role || "General Practice"}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {apt.scheduledTime ? fmtDate(apt.scheduledTime) : "Not scheduled yet"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          {apt.scheduledTime ? fmtTime(apt.scheduledTime) : apt.preferredTimeSlot || "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                          {TYPE_LABEL[apt.type] || apt.type}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <span className="font-medium text-gray-600">Note: </span>{apt.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: request date */}
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 mb-0.5">Requested</p>
                      <p className="text-xs font-semibold text-gray-600">
                        {apt.requestDate ? fmtDate(apt.requestDate) : fmtDate(apt.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AppointmentHistory;
