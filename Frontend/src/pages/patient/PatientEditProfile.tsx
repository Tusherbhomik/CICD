import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/url';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, User, Mail, Phone, Camera, Upload, Trash2, Heart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface PatientData {
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
  heightCm: number;
  weightKg: number;
  bloodType: string;
  updatedAt: string;
}

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  heightCm: string;
  weightKg: string;
  bloodType: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    email: "",
    phone: "",
    heightCm: "",
    weightKg: "",
    bloodType: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);

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
      const data: PatientData = await response.json();
      setPatientData(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        heightCm: data.heightCm?.toString() || "",
        weightKg: data.weightKg?.toString() || "",
        bloodType: data.bloodType || "UNKNOWN",
      });
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

  const validateForm = (data: EditFormData) => {
    const errors: Partial<Record<keyof EditFormData, string>> = {};

    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone?.trim();
    const validBloodTypes = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"];

    if (!name) {
      errors.name = "Name is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (phone && !/^\+?\d{1,4}?[\s-]?(\d{1,4}[\s-]?){1,4}\d{1,4}$/.test(phone)) {
      errors.phone = "Invalid phone number";
    }

    if (data.heightCm == null || isNaN(parseFloat(data.heightCm))) {
      errors.heightCm = "Height is required";
    } else if (parseFloat(data.heightCm) < 0 || parseFloat(data.heightCm) > 300) {
      errors.heightCm = "Height must be between 0 and 300 cm";
    }

    if (data.weightKg == null || isNaN(parseFloat(data.weightKg))) {
      errors.weightKg = "Weight is required";
    } else if (parseFloat(data.weightKg) < 0 || parseFloat(data.weightKg) > 500) {
      errors.weightKg = "Weight must be between 0 and 500 kg";
    }

    if (!data.bloodType || !validBloodTypes.includes(data.bloodType)) {
      errors.bloodType = "Invalid or missing blood type";
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error =>
        toast({ title: "Error", description: error, variant: "destructive" })
      );
      return;
    }
    setIsSubmitting(true);

    const parsedData = {
      ...formData,
      heightCm: parseFloat(formData.heightCm),
      weightKg: parseFloat(formData.weightKg),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/patient-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Response text:", text);
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update profile");
        } catch (jsonError) {
          throw new Error("Invalid response from server");
        }
      }

      const data = await response.json();
      console.log("Update response:", data);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      navigate("/patient/profile");
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
    fetchPatientProfile();
  }, []);

  if (isLoading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/patient/profile")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
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
                      {formData.name.charAt(0) || 'P'}
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

              {/* Height Field */}
              <div className="space-y-2">
                <Label htmlFor="heightCm" className="text-sm font-medium">
                  Height (cm)
                </Label>
                <Input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  value={formData.heightCm}
                  onChange={handleInputChange}
                  placeholder="Enter your height in centimeters"
                  className="pl-10"
                  min="0"
                  max="300"
                />
              </div>

              {/* Weight Field */}
              <div className="space-y-2">
                <Label htmlFor="weightKg" className="text-sm font-medium">
                  Weight (kg)
                </Label>
                <Input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  placeholder="Enter your weight in kg"
                  className="pl-10"
                  min="0"
                  max="500"
                />
              </div>

              {/* Blood Type Field */}
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-sm font-medium">
                  Blood Type
                </Label>
                <div className="relative">
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="" disabled>
                      Select your blood type
                    </option>
                    {["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"].map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ").replace("POSITIVE", "+").replace("NEGATIVE", "-")}
                      </option>
                    ))}
                  </select>
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
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
                    value={patientData?.birthDate ? new Date(patientData.birthDate).toLocaleDateString() : "N/A"}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Gender
                  </Label>
                  <Input
                    value={patientData?.gender || "N/A"}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: Birth date and gender cannot be changed. Contact support if you need to update these fields.
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
                onClick={() => navigate("/patient/profile")}
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