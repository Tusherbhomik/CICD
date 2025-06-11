import MainLayout from "@/components/layout/MainLayout";
import { Mail, Phone, MapPin, Calendar, Edit, Award, GraduationCap } from "lucide-react";

const DoctorProfile = () => {
  const doctorInfo = {
    name: "Dr. Sarah Wilson",
    specialization: "Cardiologist",
    experience: "15 years",
    education: [
      {
        degree: "MD",
        institution: "Harvard Medical School",
        year: "2005-2009",
      },
      {
        degree: "Residency in Cardiology",
        institution: "Johns Hopkins Hospital",
        year: "2009-2013",
      },
    ],
    certifications: [
      {
        name: "Board Certified in Cardiology",
        issuer: "American Board of Internal Medicine",
        year: "2014",
      },
      {
        name: "Advanced Cardiac Life Support",
        issuer: "American Heart Association",
        year: "2023",
      },
    ],
    contact: {
      email: "sarah.wilson@hospital.com",
      phone: "+1 (555) 123-4567",
      address: "123 Medical Center Drive, Suite 400",
    },
    availability: {
      weekdays: "9:00 AM - 5:00 PM",
      weekends: "By Appointment",
    },
  };

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Doctor Profile</h1>
            <p className="text-gray-600">View and manage your professional information</p>
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
                  <span className="text-3xl text-primary font-medium">S</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{doctorInfo.name}</h2>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>{doctorInfo.specialization}</span>
                    <span>{doctorInfo.experience} experience</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{doctorInfo.contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{doctorInfo.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{doctorInfo.contact.address}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Availability */}
            <div className="md:w-80">
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Weekdays</p>
                    <p className="text-sm">{doctorInfo.availability.weekdays}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Weekends</p>
                    <p className="text-sm">{doctorInfo.availability.weekends}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Education</h2>
          </div>

          <div className="space-y-4">
            {doctorInfo.education.map((edu, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Certifications</h2>
          </div>

          <div className="space-y-4">
            {doctorInfo.certifications.map((cert, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-medium">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">Issued: {cert.year}</p>
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
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Manage Schedule</h4>
                <p className="text-sm text-gray-600">Update your availability</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Add Certification</h4>
                <p className="text-sm text-gray-600">Update your credentials</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Update Education</h4>
                <p className="text-sm text-gray-600">Add new qualifications</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorProfile; 