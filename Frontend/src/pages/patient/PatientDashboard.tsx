import MainLayout  from "@/components/layout/MainLayout";
import {
  Calendar,
  Pill,
  FileText,
  Clock,
  Heart,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PatientDashboard = () => {
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiology",
      date: "Tomorrow, 10:00 AM",
      type: "Follow-up",
    },
    {
      id: 2,
      doctor: "Dr. Michael Brown",
      specialty: "Dermatology",
      date: "Next Monday, 2:30 PM",
      type: "Consultation",
    },
  ];

  const recentPrescriptions = [
    {
      id: 1,
      medication: "Amoxicillin 500mg",
      dosage: "1 tablet, 3 times daily",
      duration: "7 days",
      status: "Active",
    },
    {
      id: 2,
      medication: "Ibuprofen 400mg",
      dosage: "1 tablet, as needed",
      duration: "30 days",
      status: "Active",
    },
  ];

  const healthMetrics = [
    {
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "Normal",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "Normal",
      icon: Heart,
      color: "text-blue-500",
    },
    {
      title: "Last Check-up",
      value: "2",
      unit: "weeks ago",
      status: "Up to date",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back, John Doe</p>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="ml-1 text-sm text-gray-500">{metric.unit}</p>
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-full bg-opacity-10", metric.color)}>
                    <Icon className={cn("w-6 h-6", metric.color)} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    metric.status === "Normal" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  )}>
                    {metric.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <button className="btn-primary">Book New</button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.doctor}</h3>
                    <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appointment.date}</p>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Active Prescriptions</h2>
            <button className="btn-primary">View All</button>
          </div>
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Pill className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{prescription.medication}</h3>
                    <p className="text-sm text-gray-600">{prescription.dosage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{prescription.duration}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {prescription.status}
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Book Appointment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule a new doctor visit
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Medical Records</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View your health history
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Pill className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium">Prescriptions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View all your medications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDashboard;
