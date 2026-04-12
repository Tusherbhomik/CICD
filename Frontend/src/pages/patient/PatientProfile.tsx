import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, Camera, Trash2, Upload, Edit, Heart, Activity, User, Calendar, Droplet, Ruler, Weight, Shield, Plus, TrendingUp } from "lucide-react";
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
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [patientData, setPatientData] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate age from birth date
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!patientData?.heightCm || !patientData?.weightKg) return null;
    const heightM = patientData.heightCm / 100;
    const bmi = patientData.weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const fetchPatientProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch patient profile");
      }
      const data: PatientProfileData = await response.json();
      setPatientData(data);
      console.log(data);

      if (data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, or GIF images are allowed.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsImageLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/image/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });

      fetchPatientProfile();
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageUpdate = async (file: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, or GIF images are allowed.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsImageLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/image/update`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update image");
      }

      const data = await response.json();
      setImage(data.imageUrl);
      setShowImageActions(false);
      toast({
        title: "Success",
        description: "Profile image updated successfully!",
      });

      fetchPatientProfile();
    } catch (err) {
      console.error("Error updating image:", err);
      toast({
        title: "Error",
        description: "Failed to update image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setIsImageLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/image`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setImage('');
      setShowImageActions(false);
      toast({
        title: "Success",
        description: "Profile image removed successfully!",
      });

      fetchPatientProfile();
    } catch (err) {
      console.error("Error deleting image:", err);
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (image) {
        handleImageUpdate(file);
      } else {
        handleImageUpload(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Loading your health profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <MainLayout userType="patient">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto space-y-8 p-6">
          {/* Enhanced Header with Health Theme */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Health Profile</h1>
                <p className="text-emerald-100 text-lg">Your personal health dashboard and information</p>
              </div>
              
              <Link
                to="/patient/profile/edit"
                className="group relative overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Edit className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  <span className="font-medium">Edit Profile</span>
                </div>
              </Link>
            </div>
            
            {/* Decorative Health Icons */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <Heart className="absolute top-4 right-8 w-8 h-8 text-white/20" />
            <Activity className="absolute bottom-4 left-8 w-6 h-6 text-white/20" />
          </div>

          {/* Enhanced Profile Overview */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Header Section */}
            <div className="relative bg-gradient-to-r from-gray-50 to-emerald-50 p-8 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Enhanced Profile Image Section */}
                <div className="relative group">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white transition-all duration-300 group-hover:scale-105">
                      {isImageLoading ? (
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : image ? (
                        <img 
                          src={image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-white font-bold">
                          {patientData?.name?.charAt(0) || 'P'}
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced Image Actions Button */}
                    <button
                      onClick={() => setShowImageActions(!showImageActions)}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl group"
                      disabled={isImageLoading}
                    >
                      <Camera className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    </button>

                    {/* Enhanced Image Actions Dropdown */}
                    {showImageActions && (
                      <div className="absolute top-full right-0 mt-4 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 min-w-52 z-10 backdrop-blur-sm">
                        <button
                          onClick={triggerFileInput}
                          className="w-full px-6 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 flex items-center gap-3 transition-all duration-200 text-gray-700 hover:text-emerald-600"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="font-medium">{image ? 'Update Photo' : 'Upload Photo'}</span>
                        </button>
                        {image && (
                          <button
                            onClick={handleImageDelete}
                            className="w-full px-6 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Remove Photo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Health Status Indicator */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <Heart className="w-3 h-3 text-green-600 fill-current animate-pulse" />
                  </div>
                </div>

                {/* Enhanced Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{patientData?.name || 'Patient'}</h2>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        <User className="w-4 h-4 mr-2" />
                        Age: {calculateAge(patientData?.birthDate)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {patientData?.gender || 'N/A'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                        <Droplet className="w-4 h-4 mr-2" />
                        {patientData?.bloodType || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Health Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Height</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {patientData?.heightCm ? `${patientData.heightCm} cm` : 'N/A'}
                          </p>
                        </div>
                        <Ruler className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Weight</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {patientData?.weightKg ? `${patientData.weightKg} kg` : 'N/A'}
                          </p>
                        </div>
                        <Weight className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">BMI</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {bmi ? `${bmi}` : 'N/A'}
                          </p>
                          {bmiInfo && (
                            <p className={`text-xs ${bmiInfo.color} font-medium`}>
                              {bmiInfo.category}
                            </p>
                          )}
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Information */}
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{patientData?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{patientData?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Medical Information Sections */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vital Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Vital Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Height</p>
                    <p className="text-sm text-gray-600">
                      {patientData?.heightCm ? `${patientData.heightCm} cm` : 'Not recorded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Weight className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Weight</p>
                    <p className="text-sm text-gray-600">
                      {patientData?.weightKg ? `${patientData.weightKg} kg` : 'Not recorded'}
                    </p>
                  </div>
                </div>
                {bmi && bmiInfo && (
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${bmiInfo.bg} border-current/20`}>
                    <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-current" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">BMI Index</p>
                      <p className={`text-sm ${bmiInfo.color} font-medium`}>
                        {bmi} - {bmiInfo.category}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blood & Health Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Blood & Health Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Blood Type</p>
                    <p className="text-sm text-gray-600">
                      {patientData?.bloodType || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Health Status</p>
                    <p className="text-sm text-emerald-600 font-medium">Active Profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Date of Birth</p>
                    <p className="text-sm text-gray-600">
                      {patientData?.birthDate ? new Date(patientData.birthDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Tips Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Health Tips & Reminders
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Stay Active</h4>
                <p className="text-sm text-gray-600">Regular exercise helps maintain good health</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Heart Health</h4>
                <p className="text-sm text-gray-600">Monitor your cardiovascular wellness</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Regular Checkups</h4>
                <p className="text-sm text-gray-600">Schedule routine health examinations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside to close dropdown */}
      {showImageActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowImageActions(false)}
        />
      )}
    </MainLayout>
  );
};

export default PatientProfile;