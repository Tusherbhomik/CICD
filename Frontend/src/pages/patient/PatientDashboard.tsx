import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/url";
import { Calendar, ChevronRight, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface PatientData {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  profileImage?: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
}

interface Appointment {
  id: number;
  doctor: {
    id: number;
    name: string;
    specialization: string;
  };
  scheduledTime: string;
  type: string;
  status: string;
  reason?: string;
}

interface Prescription {
  id: number;
  diagnosis: string;
  issueDate: string;
  followUpDate: string;
  medicines: Array<{
    medicine: string;
    dosage: string;
    timing: string;
    instructions: string;
  }>;
}

const PatientDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<
    Prescription[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getAppointmentStatus = (scheduledTime: string) => {
    const appointmentDate = new Date(scheduledTime);
    const now = new Date();
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return "Past";
  };

  const getPrescriptionStatus = (followUpDate: string) => {
    const today = new Date();
    const followUp = new Date(followUpDate);
    return followUp > today ? "Active" : "Completed";
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);

        // Fetch patient profile
        const profileResponse = await fetch(
          `${API_BASE_URL}/api/patients/profile`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch patient profile");
        }

        const profileData = await profileResponse.json();
        console.log(profileData);
        setPatientData(profileData);

        // Fetch patient appointments
        const appointmentsResponse = await fetch(
          `${API_BASE_URL}/api/appointments/patient`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          // Filter for upcoming appointments (scheduled or confirmed)
          const upcoming = appointmentsData
            .filter(
              (apt: Appointment) =>
                (apt.status === "SCHEDULED" || apt.status === "CONFIRMED") &&
                new Date(apt.scheduledTime) > new Date()
            )
            .sort(
              (a: Appointment, b: Appointment) =>
                new Date(a.scheduledTime).getTime() -
                new Date(b.scheduledTime).getTime()
            )
            .slice(0, 3); // Show only next 3 appointments
          setUpcomingAppointments(upcoming);
        }

        // Fetch patient prescriptions
        const prescriptionsResponse = await fetch(
          `${API_BASE_URL}/api/prescriptions/patient`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (prescriptionsResponse.ok) {
          const prescriptionsData = await prescriptionsResponse.json();
          // Sort by issue date and take recent ones
          const recent = prescriptionsData
            .sort(
              (a: Prescription, b: Prescription) =>
                new Date(b.issueDate).getTime() -
                new Date(a.issueDate).getTime()
            )
            .slice(0, 3); // Show only 3 most recent prescriptions
          setRecentPrescriptions(recent);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [toast]);

  const handleBookAppointment = () => {
    navigate("/patient/book-appointment");
  };

  const handleViewPrescriptions = () => {
    navigate("/patient/prescriptions");
  };

  const handleBookNewAppointment = () => {
    navigate("/patient/book-appointment");
  };

  const handleViewAllPrescriptions = () => {
    navigate("/patient/prescriptions");
  };
  if (isLoading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate basic health metrics from patient data
  // const healthMetrics = [
  //   {
  //     title: "Height",
  //     value: patientData?.heightCm ? `${patientData.heightCm}` : "N/A",
  //     unit: "cm",
  //     status: "Normal",
  //     icon: Activity,
  //     color: "text-green-500",
  //   },
  //   {
  //     title: "Weight",
  //     value: patientData?.weightKg ? `${patientData.weightKg}` : "N/A",
  //     unit: "kg",
  //     status: "Normal",
  //     icon: Heart,
  //     color: "text-blue-500",
  //   },
  //   {
  //     title: "Blood Type",
  //     value: patientData?.bloodType?.replace("_", " ") || "N/A",
  //     unit: "",
  //     status: "Recorded",
  //     icon: Clock,
  //     color: "text-purple-500",
  //   },
  // ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {patientData?.name || "Patient"}
            {patientData?.birthDate &&
              ` (Age: ${calculateAge(patientData.birthDate)})`}
          </p>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.scheduledTime);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {appointment.doctor.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor.specialization}
                        </p>
                        {appointment.reason && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reason: {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <span className="text-xs text-primary font-medium">
                          {getAppointmentStatus(appointment.scheduledTime)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <p className="font-medium">{dateTime.date}</p>
                      </div>
                      <p className="text-sm text-gray-600">{dateTime.time}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Prescriptions</h2>
          </div>
          <div className="space-y-4">
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-500/10">
                      <Pill className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{prescription.diagnosis}</h3>
                      <p className="text-sm text-gray-600">
                        {prescription.medicines.length} medicine(s) prescribed
                      </p>
                      <p className="text-xs text-gray-500">
                        Issued:{" "}
                        {new Date(prescription.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(prescription.followUpDate).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getPrescriptionStatus(prescription.followUpDate)}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent prescriptions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="card hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={handleBookAppointment}
          >
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
          <div
            className="card hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={handleViewPrescriptions}
          >
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
