import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Video,
  XCircle,
  Calendar,
  Loader2,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

interface AppointmentRequest {
  id: number;
  scheduledTime: string;
  status: string;
  type: string;
  notes: string;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
}

interface ScheduleFormData {
  scheduledTime: string;
  scheduledDate: string;
  type: string;
  location: string;
  notes: string;
}

type Tab = "pending" | "confirmed" | "completed";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "VIDEO":
      return <Video className="w-3.5 h-3.5" />;
    case "PHONE":
      return <Phone className="w-3.5 h-3.5" />;
    default:
      return <MapPin className="w-3.5 h-3.5" />;
  }
};

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtTime = (s: string) =>
  s ? new Date(s).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

const AppointmentSchedule = () => {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    scheduledTime: "",
    scheduledDate: "",
    type: "IN_PERSON",
    location: "",
    notes: "",
  });

  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<AppointmentRequest[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = async () => {
    const res = await fetch(`${API_BASE_URL}/api/appointments/doctor/pending`, { credentials: "include" });
    if (res.ok) setPendingRequests(await res.json());
    else setPendingRequests([]);
  };

  const fetchConfirmed = async () => {
    const res = await fetch(`${API_BASE_URL}/api/appointments/doctor/confirmed`, { credentials: "include" });
    if (res.ok) setConfirmedAppointments(await res.json());
    else setConfirmedAppointments([]);
  };

  const fetchCompleted = async () => {
    const res = await fetch(`${API_BASE_URL}/api/appointments/doctor/all?status=COMPLETED`, { credentials: "include" });
    if (res.ok) setCompletedAppointments(await res.json());
    else setCompletedAppointments([]);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchPending(), fetchConfirmed(), fetchCompleted()]);
      setIsLoading(false);
    };
    load();
  }, []);

  const openScheduleModal = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    const d = new Date(request.scheduledTime);
    setFormData({
      scheduledDate: d.toISOString().slice(0, 10),
      scheduledTime: d.toTimeString().slice(0, 5),
      type: request.type || "IN_PERSON",
      location: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!formData.scheduledDate || !formData.scheduledTime || !formData.location) {
      showToast("error", "Please fill in all required fields.");
      return;
    }
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${selectedRequest.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          scheduledTime: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
          type: formData.type,
          location: formData.location,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm appointment");

      showToast("success", "Appointment confirmed successfully.");
      setShowModal(false);
      await Promise.all([fetchPending(), fetchConfirmed()]);
    } catch (err: any) {
      showToast("error", err.message || "Error confirming appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoadingId(requestId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${requestId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject appointment");
      showToast("success", "Appointment request rejected.");
      await fetchPending();
    } catch (err: any) {
      showToast("error", err.message || "Error rejecting appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (appointmentId: number) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete appointment");
      showToast("success", "Appointment marked as completed.");
      await Promise.all([fetchConfirmed(), fetchCompleted()]);
    } catch (err: any) {
      showToast("error", err.message || "Error completing appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel appointment");
      showToast("success", "Appointment cancelled.");
      await Promise.all([fetchConfirmed(), fetchPending()]);
    } catch (err: any) {
      showToast("error", err.message || "Error cancelling appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading appointments…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending",   label: "Pending Requests", count: pendingRequests.length },
    { key: "confirmed", label: "Confirmed",         count: confirmedAppointments.length },
    { key: "completed", label: "Completed",         count: completedAppointments.length },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Toast */}
        {toast && (
          <div className={cn(
            "fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          )}>
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-sm text-gray-400">Review requests and manage scheduled appointments</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   value: pendingRequests.length,    color: "text-amber-600 bg-amber-50 border-amber-100" },
            { label: "Confirmed", value: confirmedAppointments.length, color: "text-sky-600 bg-sky-50 border-sky-100" },
            { label: "Completed", value: completedAppointments.length, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-semibold transition-colors",
                  activeTab === key
                    ? "border-b-2 border-sky-500 text-sky-600"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {label}
                <span className={cn(
                  "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === key ? "bg-sky-100 text-sky-600" : "bg-gray-100 text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3">

            {/* Pending tab */}
            {activeTab === "pending" && (
              pendingRequests.length === 0 ? (
                <EmptyState icon={<Calendar className="w-7 h-7 text-gray-300" />} text="No pending appointment requests" />
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-sky-100 hover:bg-sky-50/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {req.patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{req.patient.name}</p>
                      <p className="text-xs text-gray-400">{req.patient.email}{req.patient.phone ? ` · ${req.patient.phone}` : ""}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(req.scheduledTime)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(req.scheduledTime)}</span>
                        <span className="flex items-center gap-1">{getTypeIcon(req.type)}{req.type.replace("_", " ")}</span>
                      </div>
                      {req.notes && (
                        <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <span className="font-medium text-gray-600">Reason: </span>{req.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => openScheduleModal(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoadingId === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoadingId === req.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Confirmed tab */}
            {activeTab === "confirmed" && (
              confirmedAppointments.length === 0 ? (
                <EmptyState icon={<Clock className="w-7 h-7 text-gray-300" />} text="No confirmed appointments" />
              ) : (
                confirmedAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-sky-100 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {apt.patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{apt.patient.name}</p>
                        <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 font-semibold px-2 py-0.5 rounded-full">
                          CONFIRMED
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{apt.patient.email}{apt.patient.phone ? ` · ${apt.patient.phone}` : ""}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(apt.scheduledTime)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(apt.scheduledTime)}</span>
                        <span className="flex items-center gap-1">{getTypeIcon(apt.type)}{apt.type.replace("_", " ")}</span>
                      </div>
                      {apt.notes && (
                        <p className="text-xs text-gray-500 mt-1.5">
                          <span className="font-medium text-gray-600">Notes: </span>{apt.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleComplete(apt.id)}
                        disabled={actionLoadingId === apt.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoadingId === apt.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle className="w-3.5 h-3.5" />}
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={actionLoadingId === apt.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoadingId === apt.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Completed tab */}
            {activeTab === "completed" && (
              completedAppointments.length === 0 ? (
                <EmptyState icon={<CheckCircle className="w-7 h-7 text-gray-300" />} text="No completed appointments yet" />
              ) : (
                completedAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {apt.patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{apt.patient.name}</p>
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                          COMPLETED
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{apt.patient.email}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(apt.scheduledTime)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(apt.scheduledTime)}</span>
                        <span className="flex items-center gap-1">{getTypeIcon(apt.type)}{apt.type.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Confirm modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Confirm Appointment</h3>
                  <p className="text-xs text-gray-400">{selectedRequest.patient.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Time *</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                  >
                    <option value="IN_PERSON">In-Person</option>
                    <option value="VIDEO">Video Call</option>
                    <option value="PHONE">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {formData.type === "IN_PERSON" ? "Location / Room *" : "Meeting Link / Phone *"}
                  </label>
                  <input
                    type="text"
                    placeholder={formData.type === "IN_PERSON" ? "e.g. Room 3, 2nd Floor" : "e.g. https://meet.google.com/..."}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any instructions for the patient…"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Confirming…" : "Confirm Appointment"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="text-center py-16">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

export default AppointmentSchedule;
