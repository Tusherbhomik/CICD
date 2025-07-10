import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/url';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, User, Mail, Phone, Camera, Upload, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface DoctorData {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  profileImage?: string;
  role: string;
  userId: number;
  createdAt: string;
  institute: string;
  licenseNumber: string;
  specialization: string;
  updatedAt: string;
}

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  institute: string;
  licenseNumber: string;
  specialization: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    email: "",
    phone: "",
    institute: "",
    licenseNumber: "",
    specialization: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);

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
      const data: DoctorData = await response.json();
      setDoctorData(data);
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        institute: data.institute || "",
        licenseNumber: data.licenseNumber || "",
        specialization: data.specialization || "",
      });
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Data sent from frontend:", formData);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/doctor-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      navigate("/doctor/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      
      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
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
    fetchDoctorProfile();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center gap-2"
            >
              Back to Profile
            </Button>
            <div>
              <h1 className="page-title">Edit Profile</h1>
              <p className="text-gray-600">Update your information</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
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
                      {formData.name.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
                
                {/* Image Actions Button */}
                <button
                  type="button"
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
                      type="button"
                      onClick={triggerFileInput}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {image ? 'Update Photo' : 'Upload Photo'}
                    </button>
                    {image && (
                      <button
                        type="button"
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
                <h3 className="text-lg font-semibold mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a professional photo
                </p>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, at least 200x200 pixels
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {/* Institute Field */}
              <div className="space-y-2">
                <Label htmlFor="institute" className="text-sm font-medium">
                  Institute
                </Label>
                <Input
                  id="institute"
                  name="institute"
                  type="text"
                  value={formData.institute}
                  onChange={handleInputChange}
                  placeholder="Enter your institute"
                  className="pl-10"
                />
              </div>

              {/* License Number Field */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-sm font-medium">
                  License Number
                </Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your license number"
                  className="pl-10"
                />
              </div>

              {/* Specialization Field */}
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Enter your specialization"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Read-only Information */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Birth Date
                  </Label>
                  <Input
                    value={doctorData?.birthDate ? new Date(doctorData.birthDate).toLocaleDateString() : "N/A"}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Gender
                  </Label>
                  <Input
                    value={doctorData?.gender || "N/A"}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
                
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: Birth date, gender cannot be changed. Contact support if you need to update these fields.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/doctor/profile")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
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
    </MainLayout>
  );
};

export default EditProfile;