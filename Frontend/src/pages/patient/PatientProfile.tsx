import MainLayout  from "@/components/layout/MainLayout";
import { API_BASE_URL } from '@/url';
import { Mail, Phone, MapPin, Calendar, Edit, Heart, Activity, Camera, Trash2, Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const PatientProfile = () => {
  const [image, setImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Default patient info structure for fallback
  const defaultPatientInfo = {
    name: "Patient",
    age: 'N/A',
    gender: 'N/A',
    bloodType: "N/A",
    contact: {
      email: "N/A",
      phone: "N/A",
      address: "N/A",
    },
    medicalInfo: {
      height: "N/A",
      weight: "N/A",
      allergies: ["N/A"],
      conditions: ["N/A"],
    },
    emergencyContact: {
      name: "N/A",
      relationship: "N/A",
      phone: "N/A",
    },
  };

  // Transform API data to match component structure
  const transformPatientData = (data) => {
    if (!data) return defaultPatientInfo;
    
    return {
      name: data.name || "Patient",
      age: calculateAge(data.birthDate),
      gender: data.gender ? data.gender.charAt(0) + data.gender.slice(1).toLowerCase() : 'N/A',
      bloodType: "N/A", // Not provided in API response
      contact: {
        email: data.email || "N/A",
        phone: data.phone || "N/A",
        address: "N/A", // Not provided in API response
      },
      medicalInfo: {
        height: "N/A", // Not provided in API response
        weight: "N/A", // Not provided in API response
        allergies: ["N/A"], // Not provided in API response
        conditions: ["N/A"], // Not provided in API response
      },
      emergencyContact: {
        name: "N/A", // Not provided in API response
        relationship: "N/A", // Not provided in API response
        phone: "N/A", // Not provided in API response
      },
    };
  };

  const patientInfo = transformPatientData(patientData);

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
      const data = await response.json();
      setPatientData(data);
      
      // Set profile image from API response
      if (data.profileImage) {
        setImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/image`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const data = await response.json();
      setImage(data.imageUrl);
    } catch (err) {
      console.error("Error fetching image:", err);
    }
  };

  const handleImageUpload = async (file) => {
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
      
      // Refresh patient profile to get updated data
      fetchPatientProfile();
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageUpdate = async (file) => {
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
      
      // Refresh patient profile to get updated data
      fetchPatientProfile();
    } catch (err) {
      console.error("Error updating image:", err);
      alert("Failed to update image. Please try again.");
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
      
      // Refresh patient profile to get updated data
      fetchPatientProfile();
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to remove image. Please try again.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if image already exists, update or upload accordingly
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
          <button className="btn-primary flex items-center gap-2">
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
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
                      <span className="text-2xl text-primary font-medium">
                        {patientInfo.name.charAt(0)}
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
                  <h2 className="text-2xl font-semibold">{patientInfo.name}</h2>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Age: {patientInfo.age}</span>
                    <span>Gender: {patientInfo.gender}</span>
                    <span>Blood Type: {patientInfo.bloodType}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{patientInfo.contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{patientInfo.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{patientInfo.contact.address}</span>
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
                      {patientInfo.medicalInfo.height}, {patientInfo.medicalInfo.weight}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Allergies</p>
                    <p className="text-sm">
                      {patientInfo.medicalInfo.allergies.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Activity className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Medical Conditions</p>
                    <p className="text-sm">
                      {patientInfo.medicalInfo.conditions.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl text-primary font-medium">
                {patientInfo.emergencyContact.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{patientInfo.emergencyContact.name}</h4>
              <p className="text-sm text-gray-600">
                {patientInfo.emergencyContact.relationship}
              </p>
              <p className="text-sm text-gray-600">
                {patientInfo.emergencyContact.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Book Appointment</h4>
                <p className="text-sm text-gray-600">Schedule a consultation</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">View Medical Records</h4>
                <p className="text-sm text-gray-600">Access your health history</p>
              </div>
            </div>
          </button>
          <button className="card hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">Update Health Info</h4>
                <p className="text-sm text-gray-600">Modify medical details</p>
              </div>
            </div>
          </button>
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