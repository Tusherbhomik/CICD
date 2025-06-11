import  MainLayout  from "@/components/layout/MainLayout";
import { Calendar, Clock, FileText, ChevronRight } from "lucide-react";

const PatientHistory = () => {
  const patientHistory = [
    {
      id: 1,
      date: "2024-05-08",
      time: "10:00 AM",
      type: "Regular Checkup",
      doctor: "Dr. Sarah Wilson",
      notes: "Patient reported mild fever and sore throat. Prescribed antibiotics.",
      status: "Completed",
    },
    {
      id: 2,
      date: "2024-04-15",
      time: "2:30 PM",
      type: "Follow-up",
      doctor: "Dr. Sarah Wilson",
      notes: "Follow-up for previous treatment. Patient showing improvement.",
      status: "Completed",
    },
    {
      id: 3,
      date: "2024-03-20",
      time: "11:15 AM",
      type: "Initial Consultation",
      doctor: "Dr. Sarah Wilson",
      notes: "First visit. Patient diagnosed with seasonal allergies.",
      status: "Completed",
    },
  ];

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Patient History</h1>
          <p className="text-gray-600">View detailed patient medical history</p>
        </div>

        {/* Patient Info Card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl text-primary font-medium">J</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">John Doe</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Age: 45</span>
                <span>Gender: Male</span>
                <span>Blood Type: O+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History Timeline */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Medical History</h3>
          <div className="space-y-6">
            {patientHistory.map((visit) => (
              <div key={visit.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 my-2" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{visit.type}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{visit.date} at {visit.time}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {visit.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{visit.notes}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
                <h4 className="font-medium">View Records</h4>
                <p className="text-sm text-gray-600">Access full medical records</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Schedule Follow-up</h4>
                <p className="text-sm text-gray-600">Book next appointment</p>
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
                <h4 className="font-medium">Add Note</h4>
                <p className="text-sm text-gray-600">Add to medical history</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientHistory; 