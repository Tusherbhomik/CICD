import MainLayout  from "@/components/layout/MainLayout";
import { Mail, Phone, MapPin, Calendar, Edit, Heart, Activity } from "lucide-react";

const PatientProfile = () => {
  const patientInfo = {
    name: "John Doe",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    contact: {
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, City, State 12345",
    },
    medicalInfo: {
      height: "175 cm",
      weight: "75 kg",
      allergies: ["Penicillin", "Pollen"],
      conditions: ["Hypertension", "Type 2 Diabetes"],
    },
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
  };

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Patient Profile</h1>
            <p className="text-gray-600">View and manage your health information</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Overview */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Basic Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl text-primary font-medium">J</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{patientInfo.name}</h2>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Age: {patientInfo.age}</span>
                    <span>Gender: {patientInfo.gender}</span>
                    <span>Blood Type: {patientInfo.bloodType}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{patientInfo.contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{patientInfo.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{patientInfo.contact.address}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Medical Info */}
            <div className="md:w-80">
              <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Activity className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Height & Weight</p>
                    <p className="text-sm">
                      {patientInfo.medicalInfo.height}, {patientInfo.medicalInfo.weight}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Allergies</p>
                    <p className="text-sm">
                      {patientInfo.medicalInfo.allergies.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Activity className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Medical Conditions</p>
                    <p className="text-sm">
                      {patientInfo.medicalInfo.conditions.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl text-primary font-medium">
                {patientInfo.emergencyContact.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{patientInfo.emergencyContact.name}</h4>
              <p className="text-sm text-gray-600">
                {patientInfo.emergencyContact.relationship}
              </p>
              <p className="text-sm text-gray-600">
                {patientInfo.emergencyContact.phone}
              </p>
            </div>
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
                <h4 className="font-medium">Book Appointment</h4>
                <p className="text-sm text-gray-600">Schedule a consultation</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">View Medical Records</h4>
                <p className="text-sm text-gray-600">Access your health history</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Update Health Info</h4>
                <p className="text-sm text-gray-600">Modify medical details</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientProfile; 