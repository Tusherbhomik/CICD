import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from '@/url';
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
} from "lucide-react";
import { useState, useEffect } from "react";

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

const AppointmentSchedule = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    scheduledTime: "",
    scheduledDate: "",
    type: "IN_PERSON",
    location: "",
    notes: "",
  });

  // State for API data
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctor/pending`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setPendingRequests([]);
    }
  };

  // Fetch confirmed appointments
  const fetchConfirmedAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctor/confirmed`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch confirmed appointments");
      }
      const data = await response.json();
      setConfirmedAppointments(data);
    } catch (error) {
      console.error("Error fetching confirmed appointments:", error);
      setConfirmedAppointments([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPendingRequests(), fetchConfirmedAppointments()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleScheduleAppointment = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    
    // Pre-fill form with request data if available
    const requestDate = new Date(request.scheduledTime);
    setFormData({
      scheduledTime: requestDate.toTimeString().slice(0, 5), // HH:MM format
      scheduledDate: requestDate.toISOString().slice(0, 10), // YYYY-MM-DD format
      type: request.type || "IN_PERSON",
      location: "",
      notes: "",
    });
  };

  const handleFormSubmit = async () => {
    if (!formData.scheduledDate || !formData.scheduledTime || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      // Combine date and time into LocalDateTime format
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;

      const scheduleData = {
        scheduledTime: scheduledDateTime,
        type: formData.type,
        location: formData.location,
        notes: formData.notes,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${selectedRequest.id}/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(scheduleData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule appointment");
      }

      const result = await response.json();
      console.log("Appointment scheduled:", result);

      // Refresh data
      await Promise.all([fetchPendingRequests(), fetchConfirmedAppointments()]);
      
      // Close modal and reset form
      setShowModal(false);
      setFormData({
        scheduledTime: "",
        scheduledDate: "",
        type: "IN_PERSON",
        location: "",
        notes: "",
      });
      
      alert("Appointment scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert(`Error scheduling appointment:`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to reject this appointment request?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${requestId}/reject?doctorId=${selectedRequest?.doctor?.id || 1}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject appointment");
      }

      // Refresh pending requests
      await fetchPendingRequests();
      alert("Appointment request rejected successfully");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert(`Error rejecting appointment: `);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "PHONE":
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Appointment Management
              </h1>
              <p className="text-gray-600">
                Manage patient requests and scheduled appointments
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab("confirmed")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "confirmed"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Confirmed Appointments ({confirmedAppointments.length})
              </button>
            </nav>
          </div>

          {/* Pending Requests Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Patient Appointment Requests
              </h2>

              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending appointment requests</p>
                </div>
              ) : (
                pendingRequests.map((request) => {
                  const { date, time } = formatDateTime(request.scheduledTime);
                  return (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {request.patient.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.patient.email} • {request.patient.phone}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Reason for Visit:
                              </p>
                              <p className="text-sm text-gray-600">
                                {request.notes || "General consultation"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Requested Date & Time:
                              </p>
                              <p className="text-sm text-gray-600">
                                {date} at {time}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Appointment Type:
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                {getTypeIcon(request.type)}
                                {request.type.replace('_', ' ')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Request Date:
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDateTime(request.createdAt).date}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleScheduleAppointment(request)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Schedule
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Confirmed Appointments Tab */}
          {activeTab === "confirmed" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmed Appointments
              </h2>

              {confirmedAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No confirmed appointments</p>
                </div>
              ) : (
                confirmedAppointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.scheduledTime);
                  return (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.patient.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {appointment.patient.email} • {appointment.patient.phone}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {date} at {time}
                                </span>
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(appointment.type)}
                                  {appointment.type.replace('_', ' ')}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              )}
                            </div>
                            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Scheduling Modal */}
          {showModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Schedule Appointment for {selectedRequest.patient.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledTime: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IN_PERSON">In-Person</option>
                      <option value="VIDEO">Video Call</option>
                      <option value="PHONE">Phone Call</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location/Details *
                    </label>
                    <input
                      type="text"
                      placeholder={
                        formData.type === "IN_PERSON"
                          ? "Room number or location"
                          : "Meeting link or phone number"
                      }
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any additional notes or instructions"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleFormSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSubmitting ? "Scheduling..." : "Confirm Appointment"}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentSchedule;