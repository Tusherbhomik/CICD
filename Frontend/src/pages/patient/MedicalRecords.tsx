import MainLayout  from "@/components/layout/MainLayout";
import { FileText, Download, Calendar, User, Activity, Heart } from "lucide-react";

const MedicalRecords = () => {
  const records = [
    {
      id: 1,
      date: "2024-05-08",
      type: "Lab Results",
      doctor: "Dr. Sarah Wilson",
      description: "Complete Blood Count (CBC)",
      status: "Available",
      file: "cbc_results.pdf",
    },
    {
      id: 2,
      date: "2024-04-15",
      type: "X-Ray",
      doctor: "Dr. Michael Brown",
      description: "Chest X-Ray",
      status: "Available",
      file: "chest_xray.pdf",
    },
    {
      id: 3,
      date: "2024-03-20",
      type: "Prescription",
      doctor: "Dr. Emily Chen",
      description: "Medication Prescription",
      status: "Available",
      file: "prescription.pdf",
    },
  ];

  const vitals = [
    {
      name: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "Normal",
      trend: "stable",
    },
    {
      name: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "Normal",
      trend: "stable",
    },
    {
      name: "Temperature",
      value: "37.0",
      unit: "°C",
      status: "Normal",
      trend: "stable",
    },
    {
      name: "Blood Sugar",
      value: "5.5",
      unit: "mmol/L",
      status: "Normal",
      trend: "stable",
    },
  ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="text-gray-600">Access your complete medical history</p>
        </div>

        {/* Vitals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vitals.map((vital) => (
            <div key={vital.name} className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{vital.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold">{vital.value}</span>
                    <span className="text-sm text-gray-500">{vital.unit}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vital.status === "Normal"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {vital.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Medical Records List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Records</h2>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Download All</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-600">Date</th>
                  <th className="pb-3 font-medium text-gray-600">Type</th>
                  <th className="pb-3 font-medium text-gray-600">Doctor</th>
                  <th className="pb-3 font-medium text-gray-600">Description</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{record.date}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{record.doctor}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{record.description}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Request Records</h4>
                <p className="text-sm text-gray-600">Get copies of your records</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Share Records</h4>
                <p className="text-sm text-gray-600">Share with other providers</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">View History</h4>
                <p className="text-sm text-gray-600">Check your medical history</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default MedicalRecords; 