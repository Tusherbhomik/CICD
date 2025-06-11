import MainLayout from "@/components/layout/MainLayout";
import { FileText, Download, Calendar, User, AlertCircle } from "lucide-react";

const Prescriptions = () => {
  const prescriptions = [
    {
      id: 1,
      date: "2024-05-08",
      doctor: "Dr. Sarah Wilson",
      medications: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "3 times daily",
          duration: "7 days",
          status: "Active",
        },
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "As needed",
          duration: "5 days",
          status: "Active",
        },
      ],
      notes: "Take with food. Complete full course of antibiotics.",
    },
    {
      id: 2,
      date: "2024-04-15",
      doctor: "Dr. Michael Brown",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          status: "Completed",
        },
      ],
      notes: "Take in the morning. Monitor blood pressure.",
    },
  ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="text-gray-600">View and manage your prescriptions</p>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Prescription #{prescription.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {prescription.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {prescription.doctor}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>

              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-100 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{medication.name}</h4>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                          <p>Dosage: {medication.dosage}</p>
                          <p>Frequency: {medication.frequency}</p>
                          <p>Duration: {medication.duration}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          medication.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {medication.status}
                      </span>
                    </div>
                  </div>
                ))}

                {prescription.notes && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">{prescription.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Request Refill</h4>
                <p className="text-sm text-gray-600">Get prescription refills</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Medication Schedule</h4>
                <p className="text-sm text-gray-600">View your medication calendar</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Report Side Effects</h4>
                <p className="text-sm text-gray-600">Report any adverse reactions</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;
