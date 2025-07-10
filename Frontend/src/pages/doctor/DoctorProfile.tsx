import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, Camera, Trash2, Upload, Edit, MapPin, Calendar } from "lucide-react";
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
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null); // Renamed to doctorInfo
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
      console.log(data); // Log to verify the response
      
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

  return (
    <MainLayout userType="doctor">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Doctor Profile</h1>
              <p className="text-gray-600">View and manage your professional information</p>
            </div>
              
            <Link
              to="/doctor/profile/edit"
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              )}
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Profile Overview */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column - Basic Info */}
              <div className="flex-1">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {isImageLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : image ? (
                        <img 
                          src={image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-primary font-medium">
                          {doctorInfo?.name?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    
                    {/* Image Actions Button */}
                    <button
                      onClick={() => setShowImageActions(!showImageActions)}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                      disabled={isImageLoading}
                    >
                      <Camera className="w-4 h-4" />
                    </button>

                    {/* Image Actions Dropdown */}
                    {showImageActions && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-10">
                        <button
                          onClick={triggerFileInput}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {image ? 'Update Photo' : 'Upload Photo'}
                        </button>
                        {image && (
                          <button
                            onClick={handleImageDelete}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">{doctorInfo?.name || 'Doctor'}</h2>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>{doctorInfo?.specialization || 'N/A'}</span>
                      <span>License: {doctorInfo?.licenseNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{doctorInfo?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{doctorInfo?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>Institute: {doctorInfo?.institute || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>Birth Date: {doctorInfo?.birthDate ? new Date(doctorInfo.birthDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>Gender: {doctorInfo?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>Age: {doctorInfo?.birthDate ? new Date().getFullYear() - new Date(doctorInfo.birthDate).getFullYear() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Bio</h3>
              <p className="text-gray-600">
                {doctorInfo?.name ? `${doctorInfo.name} is a dedicated ${doctorInfo.specialization} specialist with extensive experience at ${doctorInfo.institute}.` : 'Bio not available.'}
              </p>
            </div>

            {/* Certifications Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Certifications</h3>
              <div className="text-gray-600">
                <p>License Number: {doctorInfo?.licenseNumber || 'N/A'}</p>
                <p>Certified in {doctorInfo?.specialization || 'N/A'} since 2020</p>
              </div>
            </div>

            {/* Availability Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Weekdays</p>
                    <p>9:00 AM - 5:00 PM (Based on schedule)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Weekends</p>
                    <p>By appointment only</p>
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
        </div>
      )}
    </MainLayout>
  );
};

export default DoctorProfile;