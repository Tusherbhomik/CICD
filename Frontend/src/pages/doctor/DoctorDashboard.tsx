import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Star,
  Award,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Heart,
  Plus,
  ArrowRight,
  CalendarDays,
  Timer,
  Badge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/url";
import MainLayout from "@/components/layout/MainLayout";

const DoctorDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalPaitent, setTotalPaitent] = useState(0);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch doctor profile");
      const data = await response.json();
      setDoctorInfo(data);
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/recent-patients`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setRecentPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchPatientCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/patient-count`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch patient count");
      const data = await response.json();
      setTotalPaitent(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchConfirmedAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctor/confirmed`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch confirmed appointments");
      const data = await response.json();
      setConfirmedAppointments(data);
    } catch (error) {
      console.error("Error fetching confirmed appointments:", error);
      setConfirmedAppointments([]);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/doctor`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchDoctorProfile();
    fetchPatientCount();
    fetchRecentPatients();
    fetchConfirmedAppointments();
    fetchPrescriptions();
  }, []);

  const todayAppointments = confirmedAppointments.filter(apt => 
    new Date(apt.scheduledTime).toDateString() === new Date().toDateString()
  );

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-medical-primary">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-medical-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-medical-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-medical-primary">Welcome back, Dr. {doctorInfo?.name || 'Doctor'}</h1>
                  <p className="text-gray-600 mt-1">
                    {doctorInfo?.specialization || 'General'} • {doctorInfo && doctorInfo?.institute !== 'NOT_SET' ? doctorInfo.institute : 'Medical Center'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-medical-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Patients Today</p>
                      <p className="text-xl font-bold text-medical-primary">{todayAppointments.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-medical-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-xl font-bold text-medical-primary">{calculateAge(doctorInfo?.birthDate)} years</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-medical-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-xl font-bold text-medical-primary">4.8</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 min-w-[280px]">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-medical-primary" />
                Today's Schedule
              </h3>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-medical-primary"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{appointment.patient.name}</p>
                        <p className="text-medical-primary">{formatTime(appointment.scheduledTime)}</p>
                      </div>
                    </div>
                  ))}
                  {todayAppointments.length > 3 && (
                    <p className="text-sm text-gray-500">+{todayAppointments.length - 3} more appointments</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No appointments scheduled for today</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-medical-primary mt-1">{totalPaitent}</p>
                <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-medical-primary/10">
                <Users className="w-8 h-8 text-medical-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-3xl font-bold text-medical-primary mt-1">{confirmedAppointments.length}</p>
                <p className="text-sm text-gray-500 mt-1">{todayAppointments.length} today</p>
              </div>
              <div className="p-3 rounded-full bg-medical-primary/10">
                <Calendar className="w-8 h-8 text-medical-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-3xl font-bold text-medical-primary mt-1">{prescriptions.length}</p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 rounded-full bg-medical-primary/10">
                <FileText className="w-8 h-8 text-medical-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-6 h-6 text-medical-primary" />
                    <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                  </div>
                  <Link to="/doctor/appointments">
                    <button className="flex items-center gap-2 px-4 py-2 text-medical-primary hover:bg-medical-primary/5 rounded-lg transition-colors">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {confirmedAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {confirmedAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-medical-primary flex items-center justify-center text-white font-bold">
                          {appointment.patient.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{appointment.patient.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(appointment.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(appointment.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {appointment.patient.phone}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            appointment.type === 'IN_PERSON' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          )}>
                            {appointment.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: #{appointment.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments scheduled</h3>
                    <p className="text-gray-400">Your upcoming appointments will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Prescriptions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-medical-primary" />
                <h2 className="text-xl font-bold text-gray-800">Recent Prescriptions</h2>
              </div>
              <Link to="/doctor/prescriptions">
                <button className="flex items-center gap-2 px-4 py-2 text-medical-primary hover:bg-medical-primary/5 rounded-lg transition-colors">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {prescriptions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Age</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Diagnosis</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Issue Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Follow-up</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-medical-primary flex items-center justify-center text-white font-medium">
                            {prescription.patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{prescription.patient.name}</p>
                            <p className="text-sm text-gray-600">{prescription.patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {calculateAge(prescription.patient.birthDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-medical-primary/10 text-medical-primary text-sm rounded-full">
                          {prescription.diagnosis}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(prescription.issueDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(prescription.followUpDate)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="flex items-center gap-2 px-3 py-2 text-medical-primary hover:bg-medical-primary/5 rounded-lg transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No prescriptions yet</h3>
                <p className="text-gray-400">Your prescribed medications will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal */}
        {selectedPrescription && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPrescription(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-medical-primary px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Prescription Details</h2>
                    <p className="text-sm text-white/80 mt-1">Complete prescription information</p>
                  </div>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-medical-primary hover:text-medical-primary/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="px-6 py-6 space-y-8">
                  {/* Patient Information */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-medical-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-medical-primary">Patient Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name</span>
                        <p className="text-gray-800 font-medium">{selectedPrescription.patient.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <p className="text-gray-800">{selectedPrescription.patient.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone</span>
                        <p className="text-gray-800">{selectedPrescription.patient.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Gender</span>
                        <p className="text-gray-800 capitalize">{selectedPrescription.patient.gender}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">Birth Date</span>
                        <p className="text-gray-800">{selectedPrescription.patient.birthDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Information */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-medical-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-medical-primary">Doctor Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name</span>
                        <p className="text-gray-800 font-medium">{selectedPrescription.doctor.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <p className="text-gray-800">{selectedPrescription.doctor.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone</span>
                        <p className="text-gray-800">{selectedPrescription.doctor.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Details */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-medical-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-medical-primary">Prescription Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Diagnosis</span>
                        <p className="text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200">{selectedPrescription.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Advice</span>
                        <p className="text-gray-800 bg-gray-50 rounded-md p-3 border border-gray-200">{selectedPrescription.advice}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Issue Date</span>
                          <p className="text-gray-800 font-medium">{selectedPrescription.issueDate}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Follow-up Date</span>
                          <p className="text-gray-800 font-medium">{selectedPrescription.followUpDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-medical-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-medical-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-medical-primary">Prescribed Medicines</h3>
                    </div>
                    <div className="space-y-4">
                      {selectedPrescription.medicines.map((med, index) => (
                        <div key={med.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-medical-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-medical-primary font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-800">
                                {med.medicine.name}
                              </h4>
                              <p className="text-gray-600">
                                {med.medicine.strength} • {med.medicine.form}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Duration</span>
                              <p className="text-gray-800">{med.durationDays} days</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Special Instructions</span>
 miasto                              <p className="text-gray-800">{med.specialInstructions}</p>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-600 mb-2 block">Dosage Schedule</span>
                            <div className="bg-white rounded-md p-3 border border-gray-200">
                              {med.timings.map((timing) => (
                                <div key={timing.id} className="flex items-center gap-2 py-2 border-b border-gray-200 last:border-b-0">
                                  <div className="w-2 h-2 rounded-full bg-medical-primary"></div>
                                  <span className="text-gray-800">
                                    <span className="font-medium capitalize">{timing.mealRelation.replace("_", " ")}</span> • 
                                    <span className="capitalize"> {timing.timeOfDay}</span> • 
                                    <span> {timing.specificTime}</span> • 
                                    <span className="font-medium"> Amount: {timing.amount}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DoctorDashboard;