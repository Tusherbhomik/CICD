import MainLayout  from "@/components/layout/MainLayout";
import { Calendar, Clock, User, Plus } from "lucide-react";

const AppointmentSchedule = () => {
  const appointments = [
    {
      id: 1,
      patientName: "John Doe",
      time: "09:00 AM",
      duration: "30 min",
      type: "Regular Checkup",
      status: "Confirmed",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      time: "10:00 AM",
      duration: "45 min",
      type: "Follow-up",
      status: "Confirmed",
    },
    {
      id: 3,
      patientName: "Robert Johnson",
      time: "11:30 AM",
      duration: "30 min",
      type: "New Patient",
      status: "Pending",
    },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Appointment Schedule</h1>
            <p className="text-gray-600">Manage your daily appointments</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>New Appointment</span>
          </button>
        </div>

        {/* Calendar View */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>May 10, 2024</span>
            </div>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{appointment.patientName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time} ({appointment.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <h3 className="text-2xl font-semibold">12</h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New Patients</p>
                <h3 className="text-2xl font-semibold">3</h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Slots</p>
                <h3 className="text-2xl font-semibold">5</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentSchedule; 