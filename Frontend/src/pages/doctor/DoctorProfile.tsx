import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  Mail, Phone, Camera, Trash2, Upload, Edit,
  MapPin, Calendar, Award, User, Briefcase, Stethoscope,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

interface DoctorProfileData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  birthDate?: string;
  gender?: string;
  profileImage?: string;
  institute?: string;
  licenseNumber?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DoctorProfile = () => {
  const [image, setImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch doctor profile");
      const data = await response.json();
      setDoctorInfo(data);
      if (data.profileImage) setImage(data.profileImage);
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile/image/upload`, { method: "POST", credentials: "include", body: formData });
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageUpdate = async (file: File) => {
    setIsImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile/image/update`, { method: "PUT", credentials: "include", body: formData });
      if (!res.ok) throw new Error("Failed to update image");
      const data = await res.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
    } catch (err) {
      console.error("Error updating image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    setIsImageLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile/image`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete image");
      setImage("");
      setShowImageActions(false);
    } catch (err) {
      console.error("Error deleting image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) image ? handleImageUpdate(file) : handleImageUpload(file);
  };

  useEffect(() => { fetchDoctorProfile(); }, []);

  const calcAge = (birthDate?: string) => {
    if (!birthDate) return null;
    return Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading profile…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const age = calcAge(doctorInfo?.birthDate);
  const initial = doctorInfo?.name?.charAt(0)?.toUpperCase() || "D";

  return (
    <MainLayout userType="doctor">
      <div className="flex-1 px-6 py-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* ── Left column ── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cover */}
                <div className="h-24 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <Link
                    to="/doctor/profile/edit"
                    className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                </div>

                {/* Avatar */}
                <div className="px-5 pb-5">
                  <div className="flex justify-center -mt-9 mb-4">
                    <div className="relative">
                      <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center"
                           style={{ width: 72, height: 72 }}>
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
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
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
                    <h1 className="text-lg font-bold text-gray-900">Dr. {doctorInfo?.name || "Unknown"}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{doctorInfo?.specialization || "General Physician"}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {doctorInfo?.licenseNumber && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                        <Award className="w-3 h-3" />{doctorInfo.licenseNumber}
                      </span>
                    )}
                    {doctorInfo?.gender && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full border border-gray-100">
                        <User className="w-3 h-3" />{doctorInfo.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Info</p>
                {[
                  { icon: <Stethoscope className="w-4 h-4" />, label: "Role", value: "Doctor" },
                  { icon: <Briefcase className="w-4 h-4" />, label: "Institute", value: doctorInfo?.institute },
                  {
                    icon: <Calendar className="w-4 h-4" />,
                    label: "Member Since",
                    value: doctorInfo?.createdAt
                      ? new Date(doctorInfo.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                      : null,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-400">
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

            {/* ── Right column ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Mail className="w-4 h-4" />, label: "Email Address", value: doctorInfo?.email, accent: "text-sky-400 bg-sky-50 border-sky-100" },
                    { icon: <Phone className="w-4 h-4" />, label: "Phone Number", value: doctorInfo?.phone, accent: "text-indigo-400 bg-indigo-50 border-indigo-100" },
                    { icon: <MapPin className="w-4 h-4" />, label: "Institute", value: doctorInfo?.institute, accent: "text-violet-400 bg-violet-50 border-violet-100" },
                    { icon: <Award className="w-4 h-4" />, label: "License No.", value: doctorInfo?.licenseNumber, accent: "text-emerald-400 bg-emerald-50 border-emerald-100" },
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
                    { label: "Gender", value: doctorInfo?.gender, color: "bg-sky-50 border-sky-100 text-sky-800" },
                    {
                      label: "Date of Birth",
                      value: doctorInfo?.birthDate
                        ? new Date(doctorInfo.birthDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : null,
                      color: "bg-indigo-50 border-indigo-100 text-indigo-800",
                    },
                    {
                      label: "Age",
                      value: age != null ? `${age} years` : null,
                      color: "bg-violet-50 border-violet-100 text-violet-800",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-bold">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Professional Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Specialization", value: doctorInfo?.specialization, color: "bg-sky-50 border-sky-100 text-sky-800" },
                    { label: "License Number", value: doctorInfo?.licenseNumber, color: "bg-indigo-50 border-indigo-100 text-indigo-800" },
                    { label: "Institute", value: doctorInfo?.institute, color: "bg-emerald-50 border-emerald-100 text-emerald-800" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-bold">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit CTA */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border border-sky-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Keep your profile up to date</p>
                  <p className="text-xs text-gray-500 mt-0.5">Patients and colleagues see this information</p>
                </div>
                <Link
                  to="/doctor/profile/edit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
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

export default DoctorProfile;
