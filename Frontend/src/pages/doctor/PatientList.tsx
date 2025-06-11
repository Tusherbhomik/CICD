import MainLayout  from "@/components/layout/MainLayout";
import { Search, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PatientList = () => {
  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "Male",
      lastVisit: "2024-05-08",
      nextAppointment: "2024-05-15",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      gender: "Female",
      lastVisit: "2024-05-07",
      nextAppointment: "2024-05-14",
      status: "Active",
    },
    {
      id: 3,
      name: "Robert Johnson",
      age: 58,
      gender: "Male",
      lastVisit: "2024-05-06",
      nextAppointment: "2024-05-13",
      status: "Follow-up",
    },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Patient List</h1>
          <p className="text-gray-600">Manage and view all your patients</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
            <span>Filter</span>
          </button>
        </div>

        {/* Patients Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-600">Patient</th>
                  <th className="pb-3 font-medium text-gray-600">Age</th>
                  <th className="pb-3 font-medium text-gray-600">Gender</th>
                  <th className="pb-3 font-medium text-gray-600">Last Visit</th>
                  <th className="pb-3 font-medium text-gray-600">Next Appointment</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
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
                    <td className="py-4 text-gray-600">{patient.gender}</td>
                    <td className="py-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-4 text-gray-600">{patient.nextAppointment}</td>
                    <td className="py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        patient.status === "Active" 
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      )}>
                        {patient.status}
                      </span>
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
      </div>
    </MainLayout>
  );
};

export default PatientList; 