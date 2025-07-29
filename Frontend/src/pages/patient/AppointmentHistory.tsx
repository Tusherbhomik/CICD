// import MainLayout  from "@/components/layout/MainLayout";
// import { Calendar, Clock, User, FileText, ChevronRight } from "lucide-react";

// const AppointmentHistory = () => {
//   const appointments = [
//     {
//       id: 1,
//       date: "2024-05-08",
//       time: "10:00 AM",
//       doctor: "Dr. Sarah Wilson",
//       specialization: "Cardiologist",
//       type: "Regular Checkup",
//       status: "Completed",
//       notes: "Regular checkup completed. All vitals normal.",
//     },
//     {
//       id: 2,
//       date: "2024-04-15",
//       time: "2:30 PM",
//       doctor: "Dr. Michael Brown",
//       specialization: "Neurologist",
//       type: "Follow-up",
//       status: "Completed",
//       notes: "Follow-up consultation for previous treatment.",
//     },
//     {
//       id: 3,
//       date: "2024-05-15",
//       time: "11:00 AM",
//       doctor: "Dr. Emily Chen",
//       specialization: "Pediatrician",
//       type: "New Consultation",
//       status: "Upcoming",
//       notes: "Scheduled for general checkup",
//     },
//   ];

//   return (
//     <MainLayout userType="patient">
//       <div className="space-y-8">
//         {/* Header */}
//         <div>
//           <h1 className="page-title">Appointment History</h1>
//           <p className="text-gray-600">View your past and upcoming appointments</p>
//         </div>

//         {/* Appointments List */}
//         <div className="card">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="text-left border-b border-gray-200">
//                   <th className="pb-3 font-medium text-gray-600">Date & Time</th>
//                   <th className="pb-3 font-medium text-gray-600">Doctor</th>
//                   <th className="pb-3 font-medium text-gray-600">Type</th>
//                   <th className="pb-3 font-medium text-gray-600">Status</th>
//                   <th className="pb-3 font-medium text-gray-600">Notes</th>
//                   <th className="pb-3 font-medium text-gray-600">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {appointments.map((appointment) => (
//                   <tr key={appointment.id} className="border-b border-gray-100">
//                     <td className="py-4">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="w-4 h-4 text-gray-400" />
//                         <div>
//                           <div className="font-medium">{appointment.date}</div>
//                           <div className="text-sm text-gray-600">
//                             {appointment.time}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                           <span className="text-primary font-medium">
//                             {appointment.doctor.charAt(0)}
//                           </span>
//                         </div>
//                         <div>
//                           <div className="font-medium">{appointment.doctor}</div>
//                           <div className="text-sm text-gray-600">
//                             {appointment.specialization}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 text-gray-600">{appointment.type}</td>
//                     <td className="py-4">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           appointment.status === "Completed"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-blue-100 text-blue-800"
//                         }`}
//                       >
//                         {appointment.status}
//                       </span>
//                     </td>
//                     <td className="py-4">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <FileText className="w-4 h-4" />
//                         <span className="text-sm">{appointment.notes}</span>
//                       </div>
//                     </td>
//                     <td className="py-4">
//                       <button className="p-2 hover:bg-gray-100 rounded-full">
//                         <ChevronRight className="w-5 h-5 text-gray-400" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <button className="card hover:bg-gray-50 transition-colors">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Calendar className="w-5 h-5 text-primary" />
//               </div>
//               <div className="text-left">
//                 <h4 className="font-medium">Book New Appointment</h4>
//                 <p className="text-sm text-gray-600">Schedule a consultation</p>
//               </div>
//               <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
//             </div>
//           </button>
//           <button className="card hover:bg-gray-50 transition-colors">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <FileText className="w-5 h-5 text-primary" />
//               </div>
//               <div className="text-left">
//                 <h4 className="font-medium">View Medical Records</h4>
//                 <p className="text-sm text-gray-600">Access your health history</p>
//               </div>
//               <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
//             </div>
//           </button>
//           <button className="card hover:bg-gray-50 transition-colors">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <User className="w-5 h-5 text-primary" />
//               </div>
//               <div className="text-left">
//                 <h4 className="font-medium">Find Doctors</h4>
//                 <p className="text-sm text-gray-600">Browse specialists</p>
//               </div>
//               <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
//             </div>
//           </button>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default AppointmentHistory;

import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";
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

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/patient`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      console.log("Appointments data:", data);
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REQUESTED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "IN_PERSON":
        return "In Person";
      case "VIDEO":
        return "Video Call";
      case "PHONE":
        return "Phone Call";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="space-y-8">
          <div>
            <h1 className="page-title">Appointment History</h1>
            <p className="text-gray-600">
              View your past and upcoming appointments
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading appointments...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="space-y-8">
          <div>
            <h1 className="page-title">Appointment History</h1>
            <p className="text-gray-600">
              View your past and upcoming appointments
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">
                  Error loading appointments
                </p>
                <p className="text-gray-600 mt-2">{error}</p>
                <button
                  onClick={fetchAppointments}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Appointment History</h1>
          <p className="text-gray-600">
            View your past and upcoming appointments
          </p>
        </div>

        {/* Appointment Statistics */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.length}
                </div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    appointments.filter(
                      (a) => a.status.toUpperCase() === "COMPLETED"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    appointments.filter((a) =>
                      ["PENDING", "REQUESTED", "CONFIRMED"].includes(
                        a.status.toUpperCase()
                      )
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
            <div className="card">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    appointments.filter(
                      (a) => a.status.toUpperCase() === "CANCELLED"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="card">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600">
                You haven't booked any appointments yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-600">
                      Date & Time
                    </th>
                    <th className="pb-3 font-medium text-gray-600">Doctor</th>
                    <th className="pb-3 font-medium text-gray-600">Type</th>
                    <th className="pb-3 font-medium text-gray-600">Status</th>
                    <th className="pb-3 font-medium text-gray-600">Notes</th>
                    <th className="pb-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {appointment.scheduledTime
                                ? formatDate(appointment.scheduledTime)
                                : "Not scheduled"}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.scheduledTime
                                ? formatTime(appointment.scheduledTime)
                                : appointment.preferredTimeSlot || "TBD"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {appointment.doctor?.name
                                ? appointment.doctor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "Dr"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {appointment.doctor?.name || "Doctor Name"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.doctor?.specialization ||
                                appointment.doctor?.role ||
                                "General Practice"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">
                        {getAppointmentTypeLabel(appointment.type)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">
                            {appointment.notes || "No notes available"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentHistory;
