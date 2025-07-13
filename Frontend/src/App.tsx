import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "./contexts/AdminContext";

// Auth Pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import NewPrescription from "./pages/doctor/NewPrescription";
import PatientList from "./pages/doctor/PatientList";
import PatientHistory from "./pages/doctor/PatientHistory";
import AppointmentSchedule from "./pages/doctor/AppointmentSchedule";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import EditDoctorProfile from "./pages/doctor/DoctorEditProfile";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import MedicinesPages from "./pages/doctor/Medicines"; // Added import
import GenericDetailPage from "./pages/doctor/GenericDetailPage";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import Prescriptions from "./pages/patient/Prescriptions";
import PrescriptionDetail from "./pages/patient/PrescriptionDetail";
import BookAppointment from "./pages/patient/BookAppointment";
import AppointmentHistory from "./pages/patient/AppointmentHistory";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientSettings from "./pages/patient/PatientSettings";
import MedicalRecords from "./pages/patient/MedicalRecords";
import PatientEditProfile from "./pages/patient/PatientEditProfile";


import AdminLogin from './pages/auth/AdminLogin';
import AdminSetup from './pages/admin/AdminSetup';
import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminSignup from './pages/auth/AdminSignup';
// import AdminPendingApproval from './pages/admin/AdminPendingApproval';
import Hello from "./Hello";

const queryClient = new QueryClient();

const App = () => (
  <AdminProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path ="/hello" element={<Hello/>}/>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          {/* <Route path="/admin/signup" element={<AdminSignup />} /> */}
          {/* <Route path="/admin/pending-approval" element={<AdminPendingApproval />} /> */}

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* <Route path="/admin/dashboard/root" element={<RootAdminDashboard />} /> */}

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route
            path="/doctor/new-prescription"
            element={<NewPrescription />}
          />
          <Route path="/doctor/prescriptions" element={<PatientList />} />
          <Route path="/doctor/patients/:id" element={<PatientHistory />} />
          <Route
            path="/doctor/appointments"
            element={<AppointmentSchedule />}
          />
          <Route path="/doctor/medicines" element={<MedicinesPages />} />{" "}
          {/* Added route */}
          <Route
            path="/doctor/medicines/:genericName"
            element={<GenericDetailPage />}
          />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/profile/edit" element={<EditDoctorProfile />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/prescriptions" element={<Prescriptions />} />
          <Route
            path="/patient/prescriptions/:id"
            element={<PrescriptionDetail />}
          />
          <Route
            path="/patient/book-appointment"
            element={<BookAppointment />}
          />
          <Route
            path="/patient/appointments"
            element={<AppointmentHistory />}
          />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/profile/edit" element={<PatientEditProfile />} />
          <Route path="/patient/settings" element={<PatientSettings />} />
          <Route path="/patient/medical-records" element={<MedicalRecords />} />

          {/* Admin Routes (placeholder for future admin pages) */}
          {/* You can add admin dashboard and other admin pages here later */}

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AdminProvider>
);

export default App;