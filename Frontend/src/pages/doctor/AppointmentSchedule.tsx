import MainLayout from "@/components/layout/MainLayout";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const AppointmentSchedule = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    scheduledTime: "",
    scheduledDate: "",
    type: "IN_PERSON",
    location: "",
    notes: "",
  });

  // Sample appointment requests from patients
  const appointmentRequests = [
    {
      id: 1,
      patientName: "Sarah Wilson",
      patientAge: 28,
      requestDate: "2024-05-09",
      reason: "Annual health checkup",
      preferredTimeSlot: "Morning (9 AM - 12 PM)",
      contactInfo: "sarah.wilson@email.com",
      status: "PENDING",
    },
    {
      id: 2,
      patientName: "Michael Brown",
      patientAge: 45,
      requestDate: "2024-05-09",
      reason: "Follow-up consultation for hypertension",
      preferredTimeSlot: "Afternoon (2 PM - 5 PM)",
      contactInfo: "m.brown@email.com",
      status: "PENDING",
    },
    {
      id: 3,
      patientName: "Emily Davis",
      patientAge: 32,
      requestDate: "2024-05-08",
      reason: "Skin condition consultation",
      preferredTimeSlot: "Evening (5 PM - 8 PM)",
      contactInfo: "emily.davis@email.com",
      status: "PENDING",
    },
  ];

  // Confirmed appointments
  const confirmedAppointments = [
    {
      id: 1,
      patientName: "John Doe",
      time: "09:00 AM",
      date: "2024-05-10",
      duration: "30 min",
      type: "IN_PERSON",
      location: "Room 101",
      status: "CONFIRMED",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      time: "10:00 AM",
      date: "2024-05-10",
      duration: "45 min",
      type: "VIDEO",
      location: "Video Call",
      status: "CONFIRMED",
    },
  ];

  const handleScheduleAppointment = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleFormSubmit = () => {
    if (
      !formData.scheduledDate ||
      !formData.scheduledTime ||
      !formData.location
    ) {
      alert("Please fill in all required fields");
      return;
    }

    console.log("Appointment scheduled:", {
      patient: selectedRequest.patientName,
      ...formData,
    });
    setShowModal(false);
    setFormData({
      scheduledTime: "",
      scheduledDate: "",
      type: "IN_PERSON",
      location: "",
      notes: "",
    });
    alert("Appointment scheduled successfully!");
  };

  const handleRejectRequest = (requestId) => {
    console.log("Request rejected:", requestId);
    alert("Appointment request rejected");
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "PHONE":
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

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
                Pending Requests ({appointmentRequests.length})
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

              {appointmentRequests.map((request) => (
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
                            {request.patientName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Age: {request.patientAge} • {request.contactInfo}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Reason for Visit:
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.reason}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Preferred Time:
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.preferredTimeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Request Date:
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.requestDate}
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
              ))}
            </div>
          )}

          {/* Confirmed Appointments Tab */}
          {activeTab === "confirmed" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Today's Confirmed Appointments
              </h2>

              {confirmedAppointments.map((appointment) => (
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
                            {appointment.patientName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.time} ({appointment.duration})
                            </span>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(appointment.type)}
                              {appointment.location}
                            </span>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduling Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Schedule Appointment for {selectedRequest?.patientName}
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                    >
                      Confirm Appointment
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
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
