import  MainLayout  from "@/components/layout/MainLayout";
import {
  Users,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DoctorDashboard = () => {
  const stats = [
    {
      title: "Total Patients",
      value: "248",
      change: "+12%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Today's Appointments",
      value: "8",
      change: "+2",
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Pending Prescriptions",
      value: "12",
      change: "-3",
      icon: FileText,
      color: "text-orange-500",
    },
    {
      title: "Average Wait Time",
      value: "15m",
      change: "-5m",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  const recentPatients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      lastVisit: "2 days ago",
      nextAppointment: "Tomorrow, 10:00 AM",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      lastVisit: "1 week ago",
      nextAppointment: "Today, 2:30 PM",
    },
    {
      id: 3,
      name: "Robert Johnson",
      age: 58,
      lastVisit: "3 days ago",
      nextAppointment: "Next Monday, 11:15 AM",
    },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. Smith</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-full bg-opacity-10", stat.color)}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">{stat.change}</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Patients</h2>
            <button className="btn-primary">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-600">Patient</th>
                  <th className="pb-3 font-medium text-gray-600">Age</th>
                  <th className="pb-3 font-medium text-gray-600">Last Visit</th>
                  <th className="pb-3 font-medium text-gray-600">Next Appointment</th>
                  <th className="pb-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <span className="ml-3 font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{patient.age} years</td>
                    <td className="py-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-4 text-gray-600">{patient.nextAppointment}</td>
                    <td className="py-4">
                      <button className="text-primary hover:text-primary/80">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Start New Consultation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Begin a new patient consultation
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Schedule Appointment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Book a new patient appointment
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium">Write Prescription</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create a new prescription
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorDashboard;
