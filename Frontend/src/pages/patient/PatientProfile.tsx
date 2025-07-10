import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, Camera, Trash2, Upload, Edit, Heart, Activity } from "lucide-react";
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
  weightKg?: number; // Align with backend field name
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
      console.log(data); // Log to verify the response

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

      // Refresh patient profile to get updated data
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

      // Refresh patient profile to get updated data
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

      // Refresh patient profile to get updated data
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

  return (
    <MainLayout userType="patient">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Patient Profile</h1>
              <p className="text-gray-600">View and manage your health information</p>
            </div>
            <Link
              to="/patient/profile/edit"
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
                          {patientData?.name?.charAt(0) || 'P'}
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
                    <h2 className="text-2xl font-semibold">{patientData?.name || 'Patient'}</h2>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>Age: {calculateAge(patientData?.birthDate)}</span>
                      <span>Gender: {patientData?.gender || 'N/A'}</span>
                      <span>Blood Type: {patientData?.bloodType || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{patientData?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{patientData?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Medical Info */}
              <div className="md:w-80">
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Activity className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Height & Weight</p>
                      <p className="text-sm">
                        {patientData?.heightCm ? `${patientData.heightCm} cm` : 'N/A'},{' '}
                        {patientData?.weightKg ? `${patientData.weightKg} kg` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Heart className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Blood Type</p>
                      <p className="text-sm">{patientData?.bloodType || 'N/A'}</p>
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
        </div>
      )}
    </MainLayout>
  );
};

export default PatientProfile;