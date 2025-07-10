import MainLayout from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/url';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Camera, Trash2, Upload, Edit, MapPin, Calendar, User } from "lucide-react";
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      let data: DoctorProfileData;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response format from server");
      }
      setDoctorInfo(data);
      if (data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (file: File, isUpdate: boolean) => {
    if (!file || !["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
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
      const response = await fetch(`${API_BASE_URL}/api/users/profile/image/${isUpdate ? 'update' : 'upload'}`, {
        method: isUpdate ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? 'update' : 'upload'} image`);
      }

      const data = await response.json();
      setImage(data.imageUrl);
      setShowImageActions(false);

      toast({
        title: "Success",
        description: `Profile image ${isUpdate ? 'updated' : 'uploaded'} successfully!`,
      });
    } catch (err) {
      console.error(`Error ${isUpdate ? 'updating' : 'uploading'} image:`, err);
      toast({
        title: "Error",
        description: `Failed to ${isUpdate ? 'update' : 'upload'} image. Please try again.`,
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
      handleImageChange(file, !!image);
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
            <Link to="/doctor/profile/edit">
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Profile Overview */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture and Basic Info */}
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
                    <button
                      type="button"
                      onClick={() => setShowImageActions(!showImageActions)}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                      disabled={isImageLoading}
                      aria-label={image ? "Update profile picture" : "Upload profile picture"}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {showImageActions && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-10">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          disabled={isImageLoading}
                        >
                          <Upload className="w-4 h-4" />
                          {image ? 'Update Photo' : 'Upload Photo'}
                        </button>
                        {image && (
                          <button
                            type="button"
                            onClick={handleImageDelete}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            disabled={isImageLoading}
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
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span>{doctorInfo?.institute || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>
                      Birth Date: {doctorInfo?.birthDate ? new Date(doctorInfo.birthDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>Gender: {doctorInfo?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>
                      Age: {doctorInfo?.birthDate ? new Date().getFullYear() - new Date(doctorInfo.birthDate).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bio Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bio</h3>
            <p className="text-gray-600">
              {doctorInfo?.name && doctorInfo?.specialization && doctorInfo?.institute
                ? `${doctorInfo.name} is a dedicated ${doctorInfo.specialization} specialist with extensive experience at ${doctorInfo.institute}.`
                : 'Bio not available. Please update your profile to include more details.'}
            </p>
          </Card>

          {/* Certifications Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Certifications</h3>
            <div className="space-y-2 text-gray-600">
              <p>License Number: {doctorInfo?.licenseNumber || 'N/A'}</p>
              <p>
                Certified in {doctorInfo?.specialization || 'N/A'} since{' '}
                {doctorInfo?.createdAt ? new Date(doctorInfo.createdAt).getFullYear() : 'N/A'}
              </p>
            </div>
          </Card>

          {/* Availability Section */}
          <Card className="p-6">
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
          </Card>

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