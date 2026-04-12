import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  Mail, Phone, Camera, Trash2, Upload, Edit,
  Heart, Activity, User, Calendar, Droplet, Ruler, Weight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface PatientProfileData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  birthDate?: string;
  gender?: string;
  profileImage?: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PatientProfile = () => {
  const { toast } = useToast();
  const [image, setImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [patientData, setPatientData] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculateBMI = (data: PatientProfileData | null) => {
    if (!data?.heightCm || !data?.weightKg) return null;
    return (data.weightKg / Math.pow(data.heightCm / 100, 2)).toFixed(1);
  };

  const getBMIInfo = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" };
    if (bmi < 25)   return { label: "Normal",      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" };
    if (bmi < 30)   return { label: "Overweight",  color: "text-amber-600", bg: "bg-amber-50 border-amber-100" };
    return { label: "Obese", color: "text-red-600", bg: "bg-red-50 border-red-100" };
  };

  const fetchPatientProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/profile`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: PatientProfileData = await res.json();
      setPatientData(data);
      if (data.profileImage) setImage(data.profileImage);
    } catch {
      toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, method: "POST" | "PUT", endpoint: string) => {
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({ title: "Error", description: "Only JPEG, PNG, or GIF images are allowed.", variant: "destructive" }); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 5MB.", variant: "destructive" }); return;
    }
    setIsImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method, credentials: "include", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
      toast({ title: "Success", description: "Profile photo updated." });
      fetchPatientProfile();
    } catch {
      toast({ title: "Error", description: "Failed to update image.", variant: "destructive" });
    } finally { setIsImageLoading(false); }
  };

  const handleImageDelete = async () => {
    setIsImageLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile/image`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setImage("");
      setShowImageActions(false);
      toast({ title: "Success", description: "Profile photo removed." });
      fetchPatientProfile();
    } catch {
      toast({ title: "Error", description: "Failed to remove image.", variant: "destructive" });
    } finally { setIsImageLoading(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) image
      ? uploadImage(file, "PUT",  "/api/users/profile/image/update")
      : uploadImage(file, "POST", "/api/users/profile/image/upload");
  };

  useEffect(() => { fetchPatientProfile(); }, []);

  if (isLoading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading profile…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const age = calculateAge(patientData?.birthDate);
  const bmi = calculateBMI(patientData);
  const bmiInfo = bmi ? getBMIInfo(parseFloat(bmi)) : null;
  const initial = patientData?.name?.charAt(0)?.toUpperCase() || "P";

  return (
    <MainLayout userType="patient">
      <div className="flex-1 px-6 py-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ── Left column ── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <Link
                    to="/patient/profile/edit"
                    className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                </div>

                <div className="px-5 pb-5">
                  <div className="flex justify-center -mt-9 mb-4">
                    <div className="relative">
                      <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                        {isImageLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : image ? (
                          <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl text-white font-bold">{initial}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowImageActions(!showImageActions)}
                        disabled={isImageLoading}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      {showImageActions && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 w-44 z-20">
                          <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                            <Upload className="w-4 h-4 text-gray-400" />
                            {image ? "Update Photo" : "Upload Photo"}
                          </button>
                          {image && (
                            <button onClick={handleImageDelete} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5">
                              <Trash2 className="w-4 h-4" />
                              Remove Photo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-lg font-bold text-gray-900">{patientData?.name || "Patient"}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Patient</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {age != null && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
                        <User className="w-3 h-3" />{age} years
                      </span>
                    )}
                    {patientData?.gender && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full border border-gray-100">
                        {patientData.gender}
                      </span>
                    )}
                    {patientData?.bloodType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
                        <Droplet className="w-3 h-3" />{patientData.bloodType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Health metrics */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Health Metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Height", value: patientData?.heightCm ? `${patientData.heightCm} cm` : "—", icon: <Ruler className="w-3.5 h-3.5" />, color: "text-sky-600 bg-sky-50 border-sky-100" },
                    { label: "Weight", value: patientData?.weightKg ? `${patientData.weightKg} kg` : "—", icon: <Weight className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                    { label: "Blood Type", value: patientData?.bloodType || "—", icon: <Droplet className="w-3.5 h-3.5" />, color: "text-red-600 bg-red-50 border-red-100" },
                    {
                      label: "BMI",
                      value: bmi ? `${bmi}` : "—",
                      sub: bmiInfo?.label,
                      icon: <Activity className="w-3.5 h-3.5" />,
                      color: bmiInfo ? `${bmiInfo.color} ${bmiInfo.bg}` : "text-gray-600 bg-gray-50 border-gray-100",
                    },
                  ].map(({ label, value, icon, color, sub }: any) => (
                    <div key={label} className={`rounded-xl border p-3 ${color}`}>
                      <div className="flex items-center gap-1 opacity-70 mb-1">{icon}<p className="text-xs font-semibold">{label}</p></div>
                      <p className="text-sm font-bold">{value}</p>
                      {sub && <p className="text-xs opacity-70">{sub}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Member since */}
              {patientData?.createdAt && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <Calendar className="w-5 h-5 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-400 font-medium">Member since</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">
                    {new Date(patientData.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Mail className="w-4 h-4" />, label: "Email Address", value: patientData?.email, accent: "text-teal-400 bg-teal-50 border-teal-100" },
                    { icon: <Phone className="w-4 h-4" />, label: "Phone Number", value: patientData?.phone, accent: "text-emerald-400 bg-emerald-50 border-emerald-100" },
                  ].map(({ icon, label, value, accent }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${accent}`}>
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Gender", value: patientData?.gender, color: "bg-teal-50 border-teal-100 text-teal-800" },
                    {
                      label: "Date of Birth",
                      value: patientData?.birthDate
                        ? new Date(patientData.birthDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : null,
                      color: "bg-emerald-50 border-emerald-100 text-emerald-800",
                    },
                    { label: "Age", value: age != null ? `${age} years` : null, color: "bg-cyan-50 border-cyan-100 text-cyan-800" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-bold">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Medical Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Blood Type", value: patientData?.bloodType, color: "bg-red-50 border-red-100 text-red-800" },
                    { label: "Height", value: patientData?.heightCm ? `${patientData.heightCm} cm` : null, color: "bg-sky-50 border-sky-100 text-sky-800" },
                    { label: "Weight", value: patientData?.weightKg ? `${patientData.weightKg} kg` : null, color: "bg-violet-50 border-violet-100 text-violet-800" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-bold">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit CTA */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Keep your profile up to date</p>
                  <p className="text-xs text-gray-500 mt-0.5">Accurate information helps your doctors provide better care</p>
                </div>
                <Link
                  to="/patient/profile/edit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      {showImageActions && <div className="fixed inset-0 z-10" onClick={() => setShowImageActions(false)} />}
    </MainLayout>
  );
};

export default PatientProfile;
