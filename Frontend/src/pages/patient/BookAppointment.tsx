import MainLayout from "@/components/layout/MainLayout";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Mock data - Replace with actual API call
  const mockDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialization: "Cardiologist",
      experience: "15 years",
      availability: "Mon-Fri, 9:00 AM - 5:00 PM",
      rating: 4.8,
      reviews: 124,
      email: "sarah.wilson@hospital.com",
      phone: "+1 (555) 123-4567",
      location: "Cardiology Wing, Floor 3",
      qualifications: ["MD - Cardiology", "FACC", "Board Certified"],
      consultationFee: 150,
      image: "/api/placeholder/120/120",
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      specialization: "Neurologist",
      experience: "12 years",
      availability: "Mon-Thu, 10:00 AM - 6:00 PM",
      rating: 4.7,
      reviews: 98,
      email: "michael.brown@hospital.com",
      phone: "+1 (555) 234-5678",
      location: "Neurology Department, Floor 2",
      qualifications: ["MD - Neurology", "Board Certified"],
      consultationFee: 180,
      image: "/api/placeholder/120/120",
    },
    {
      id: 3,
      name: "Dr. Emily Chen",
      specialization: "Pediatrician",
      experience: "8 years",
      availability: "Mon-Sat, 8:00 AM - 4:00 PM",
      rating: 4.9,
      reviews: 156,
      email: "emily.chen@hospital.com",
      phone: "+1 (555) 345-6789",
      location: "Pediatrics Wing, Floor 1",
      qualifications: ["MD - Pediatrics", "Board Certified"],
      consultationFee: 120,
      image: "/api/placeholder/120/120",
    },
    {
      id: 4,
      name: "Dr. Ahmed Hassan",
      specialization: "Dermatologist",
      experience: "10 years",
      availability: "Tue-Sat, 9:00 AM - 5:00 PM",
      rating: 4.6,
      reviews: 89,
      email: "ahmed.hassan@hospital.com",
      phone: "+1 (555) 456-7890",
      location: "Dermatology Clinic, Floor 4",
      qualifications: ["MD - Dermatology", "Board Certified"],
      consultationFee: 140,
      image: "/api/placeholder/120/120",
    },
  ];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const specialties = [
    "All Specialties",
    "Cardiologist",
    "Neurologist",
    "Pediatrician",
    "Dermatologist",
    "Orthopedic",
    "Psychiatrist",
  ];

  useEffect(() => {
    // Simulate API call
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDoctors(mockDoctors);
        setFilteredDoctors(mockDoctors);
      } catch (err) {
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.specialization.toLowerCase() ===
          selectedSpecialty.toLowerCase()
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setBookingSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setReasonForVisit("");
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would make the actual API call
      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        reason: reasonForVisit,
      };

      console.log("Booking appointment:", appointmentData);
      setBookingSuccess(true);

      // Reset form after success
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Get tomorrow's date as minimum selectable date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Book an Appointment</h1>
          <p className="text-gray-600">
            Schedule a consultation with our doctors
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <select
              className="form-input md:w-48"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredDoctors.length} doctor
          {filteredDoctors.length !== 1 ? "s" : ""}
          {searchTerm && ` for "${searchTerm}"`}
          {selectedSpecialty &&
            selectedSpecialty !== "All Specialties" &&
            ` in ${selectedSpecialty}`}
        </div>

        {/* Doctors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No doctors found matching your criteria
              </p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-2xl text-primary font-medium">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-primary font-medium">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(doctor.rating)}
                      <span className="text-sm text-gray-500 ml-1">
                        {doctor.rating} ({doctor.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span>{doctor.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>{doctor.availability}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>30 min consultation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="text-lg font-semibold text-primary">
                    ${doctor.consultationFee}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn-primary flex-1"
                    onClick={() => handleBookAppointment(doctor)}
                  >
                    Book Now
                  </button>
                  <button className="btn-secondary flex-1">View Profile</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Appointment Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {bookingSuccess ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-green-800 mb-2">
                    Appointment Booked!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your appointment with {selectedDoctor?.name} has been
                    successfully scheduled.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg text-left">
                    <p className="text-sm text-green-800">
                      <strong>Date:</strong> {selectedDate}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Time:</strong> {selectedTime}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Doctor:</strong> {selectedDoctor?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Book Appointment</h2>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {selectedDoctor && (
                    <div className="p-6 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {selectedDoctor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {selectedDoctor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedDoctor.specialization}
                          </p>
                          <p className="text-sm text-primary font-medium">
                            ${selectedDoctor.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmitBooking}
                    className="p-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getTomorrowDate()}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time
                      </label>
                      <select
                        className="form-input"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                      >
                        <option value="">Choose a time slot</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Visit
                      </label>
                      <textarea
                        className="form-input min-h-[100px]"
                        placeholder="Please describe your symptoms or reason for visit..."
                        value={reasonForVisit}
                        onChange={(e) => setReasonForVisit(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        className="btn-secondary flex-1"
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={
                          isSubmitting ||
                          !selectedDate ||
                          !selectedTime ||
                          !reasonForVisit
                        }
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Booking...
                          </div>
                        ) : (
                          "Confirm Booking"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BookAppointment;
