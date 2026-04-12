import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Settings,
  User,
  Users,
  X,
  Activity,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationCenter from "../ui/NotificationCenter";

interface MainLayoutProps {
  children: React.ReactNode;
  userType: "doctor" | "patient";
}

const MainLayout = ({ children, userType }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const doctorNavItems = [
    { title: "Dashboard",            href: "/doctor/dashboard",       icon: LayoutDashboard },
    { title: "Patients",             href: "/doctor/prescriptions",   icon: Users },
    { title: "Appointments",         href: "/doctor/appointments",    icon: Calendar },
    { title: "New Prescription",     href: "/doctor/new-prescription",icon: FileText },
    { title: "Update Schedule",      href: "/doctor/update-schedule", icon: Settings },
    { title: "Medicines",            href: "/doctor/medicines",       icon: Pill },
    { title: "Profile",              href: "/doctor/profile",         icon: User },
  ];

  const patientNavItems = [
    { title: "Dashboard",       href: "/patient/dashboard",         icon: LayoutDashboard },
    { title: "Book Appointment",href: "/patient/book-appointment",  icon: Calendar },
    { title: "Appointments",    href: "/patient/appointments",      icon: Activity },
    { title: "Prescriptions",   href: "/patient/prescriptions",     icon: FileText },
    { title: "Profile",         href: "/patient/profile",           icon: User },
  ];

  const navItems = userType === "doctor" ? doctorNavItems : patientNavItems;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const isDoctor = userType === "doctor";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-slate-500" />
              ) : (
                <Menu className="w-5 h-5 text-slate-500" />
              )}
            </button>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent hidden sm:block">
                HealthSync
              </span>
            </Link>
          </div>

          {/* Center badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isDoctor ? "bg-indigo-500" : "bg-emerald-500"
            )} />
            <span className="text-sm font-medium text-slate-600">
              {isDoctor ? "Doctor Portal" : "Patient Portal"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 transition-transform duration-300 ease-in-out z-40",
          "flex flex-col",
          isDoctor
            ? "bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950"
            : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* User type indicator strip */}
        <div className={cn(
          "h-0.5 w-full",
          isDoctor
            ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
            : "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
        )} />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? isDoctor
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-all duration-200",
                    isActive
                      ? isDoctor ? "text-indigo-400" : "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span className="text-sm font-medium">{item.title}</span>
                {isActive && (
                  <div className={cn(
                    "ml-auto w-1.5 h-1.5 rounded-full",
                    isDoctor ? "bg-indigo-400" : "bg-emerald-400"
                  )} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="flex-1 flex flex-col">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
