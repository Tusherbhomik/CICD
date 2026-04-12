import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, Camera, Trash2, Upload, Edit, MapPin, Calendar, Award, User, Briefcase, Clock, Star } from "lucide-react";
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
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch doctor profile");
      }
      const data = await response.json();
      setDoctorInfo(data);
      console.log(data);
      
      if (data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
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
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageUpdate = async (file: File) => {
    if (!file) return;
    
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
    } catch (err) {
      console.error("Error updating image:", err);
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
    } catch (err) {
      console.error("Error deleting image:", err);
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
    fetchDoctorProfile();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 animate-pulse">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto space-y-8 p-6">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Doctor Profile</h1>
                <p className="text-blue-100 text-lg">Manage your professional information with ease</p>
              </div>
              
              <Link
                to="/doctor/profile/edit"
                className="group relative overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Edit className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  <span className="font-medium">Edit Profile</span>
                </div>
              </Link>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Enhanced Profile Overview */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Header Section */}
            <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Enhanced Profile Image Section */}
                <div className="relative group">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white transition-all duration-300 group-hover:scale-105">
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
                          {doctorInfo?.name?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    
                    {/* Enhanced Image Actions Button */}
                    <button
                      onClick={() => setShowImageActions(!showImageActions)}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl group"
                      disabled={isImageLoading}
                    >
                      <Camera className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    </button>

                    {/* Enhanced Image Actions Dropdown */}
                    {showImageActions && (
                      <div className="absolute top-full right-0 mt-4 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 min-w-52 z-10 backdrop-blur-sm">
                        <button
                          onClick={triggerFileInput}
                          className="w-full px-6 py-3 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-3 transition-all duration-200 text-gray-700 hover:text-blue-600"
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
                  
                  {/* Status Indicator */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Enhanced Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{doctorInfo?.name || 'Doctor'}</h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {doctorInfo?.specialization || 'General Practice'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        <Award className="w-4 h-4 mr-2" />
                        License: {doctorInfo?.licenseNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="text-lg font-semibold text-gray-900">5+ Years</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Patients</p>
                          <p className="text-lg font-semibold text-gray-900">500+</p>
                        </div>
                        <User className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Rating</p>
                          <p className="text-lg font-semibold text-gray-900">4.9/5</p>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Information */}
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Institute</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.institute || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Birth Date</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.birthDate ? new Date(doctorInfo.birthDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">{doctorInfo?.birthDate ? new Date().getFullYear() - new Date(doctorInfo.birthDate).getFullYear() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sections Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Bio Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Professional Bio
              </h3>
              <div className="prose prose-gray">
                <p className="text-gray-600 leading-relaxed">
                  {doctorInfo?.name ? `Dr. ${doctorInfo.name} is a dedicated ${doctorInfo.specialization} specialist with extensive experience at ${doctorInfo.institute}. Committed to providing exceptional patient care and staying current with the latest medical advances.` : 'Professional bio will be displayed here once profile information is complete.'}
                </p>
              </div>
            </div>

            {/* Enhanced Certifications Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Certifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Medical License</h4>
                    <p className="text-sm text-gray-600">License Number: {doctorInfo?.licenseNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Specialization Certificate</h4>
                    <p className="text-sm text-gray-600">Certified in {doctorInfo?.specialization || 'General Practice'} since 2020</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Availability Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Availability Schedule
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Weekdays</h4>
                    <p className="text-gray-600">Monday - Friday</p>
                    <p className="text-sm text-blue-600 font-medium">9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Weekends</h4>
                    <p className="text-gray-600">Saturday - Sunday</p>
                    <p className="text-sm text-purple-600 font-medium">By appointment only</p>
                  </div>
                </div>
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

export default DoctorProfile;