import MainLayout  from "@/components/layout/MainLayout";
import { Calendar, Clock, User, FileText, ChevronRight } from "lucide-react";

const AppointmentHistory = () => {
  const appointments = [
    {
      id: 1,
      date: "2024-05-08",
      time: "10:00 AM",
      doctor: "Dr. Sarah Wilson",
      specialization: "Cardiologist",
      type: "Regular Checkup",
      status: "Completed",
      notes: "Regular checkup completed. All vitals normal.",
    },
    {
      id: 2,
      date: "2024-04-15",
      time: "2:30 PM",
      doctor: "Dr. Michael Brown",
      specialization: "Neurologist",
      type: "Follow-up",
      status: "Completed",
      notes: "Follow-up consultation for previous treatment.",
    },
    {
      id: 3,
      date: "2024-05-15",
      time: "11:00 AM",
      doctor: "Dr. Emily Chen",
      specialization: "Pediatrician",
      type: "New Consultation",
      status: "Upcoming",
      notes: "Scheduled for general checkup",
    },
  ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Appointment History</h1>
          <p className="text-gray-600">View your past and upcoming appointments</p>
        </div>

        {/* Appointments List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-600">Date & Time</th>
                  <th className="pb-3 font-medium text-gray-600">Doctor</th>
                  <th className="pb-3 font-medium text-gray-600">Type</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Notes</th>
                  <th className="pb-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{appointment.date}</div>
                          <div className="text-sm text-gray-600">
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {appointment.doctor.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{appointment.doctor}</div>
                          <div className="text-sm text-gray-600">
                            {appointment.specialization}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{appointment.type}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{appointment.notes}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Book New Appointment</h4>
                <p className="text-sm text-gray-600">Schedule a consultation</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">View Medical Records</h4>
                <p className="text-sm text-gray-600">Access your health history</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Find Doctors</h4>
                <p className="text-sm text-gray-600">Browse specialists</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentHistory; 