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

const BookAppointment = ({ patientId = 1 }) => {
  // Add patientId prop with default
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
  const [appointmentType, setAppointmentType] = useState(""); // New state for appointment type
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  // Appointment types from your enum
  const appointmentTypes = [
    { value: "IN_PERSON", label: "In Person" },
    { value: "VIDEO", label: "Video Call" },
    { value: "PHONE", label: "Phone Call" },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/doctors", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        const data = await response.json();

        const transformedDoctors = data.map((doctor) => ({
          ...doctor,
          specialization: doctor.role || "General",
          experience: "5+ years",
          availability: "Mon-Fri, 9:00 AM - 5:00 PM",
          rating: 4.5,
          reviews: 50,
          location: "Hospital Complex",
          qualifications: ["MD", "Board Certified"],
          consultationFee: 150,
          image: "/api/placeholder/120/120",
        }));

        setDoctors(transformedDoctors);
        setFilteredDoctors(transformedDoctors);
      } catch (err) {
        setError(err.message);
        setDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fuzzySearch = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();

    return items.filter((doctor) => {
      const name = doctor.name.toLowerCase();
      const email = doctor.email ? doctor.email.toLowerCase() : "";
      const specialization = doctor.specialization.toLowerCase();

      if (
        name.includes(term) ||
        email.includes(term) ||
        specialization.includes(term)
      ) {
        return true;
      }

      let nameIndex = 0;
      let matchCount = 0;

      for (let i = 0; i < term.length; i++) {
        while (nameIndex < name.length && name[nameIndex] !== term[i]) {
          nameIndex++;
        }
        if (nameIndex < name.length) {
          matchCount++;
          nameIndex++;
        }
      }

      return matchCount / term.length >= 0.7;
    });
  };

  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = fuzzySearch(filtered, searchTerm);
    }

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
    console.log("Selected doctor:", doctor);
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setBookingSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType(""); // Reset appointment type
    setReasonForVisit("");
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      // Convert 12-hour AM/PM time to 24-hour format
      const convertTo24HourFormat = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        // Corrected lines to resolve the "prefer-const" ESLint warning
        const [initialHours, minutes] = time.split(":");
        let hours = initialHours;

        if (modifier === "PM" && hours !== "12") {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        if (modifier === "AM" && hours === "12") {
          hours = "00";
        }

        return `${hours.padStart(2, "0")}:${minutes}`;
      };

      const formattedTime = convertTo24HourFormat(selectedTime);

      // Make actual API call to your endpoint
      const appointmentData = {
        patientId: 70,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: formattedTime, // Use the correctly formatted time
        type: appointmentType,
        reason: reasonForVisit,
      };

      const response = await fetch(
        "http://localhost:8080/api/appointments/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(appointmentData),
        }
      );

      console.log("Submitting booking:", appointmentData);

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      const result = await response.json();
      console.log("Appointment booked successfully:", result);
      setBookingSuccess(true);

      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      // You might want to show an error message to the user here
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Book an Appointment
            </h1>
            <p className="text-gray-600">
              Schedule a consultation with our doctors
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctors by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:w-48"
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

          <div className="text-sm text-gray-600">
            Showing {filteredDoctors.length} doctor
            {filteredDoctors.length !== 1 ? "s" : ""}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedSpecialty &&
              selectedSpecialty !== "All Specialties" &&
              ` in ${selectedSpecialty}`}
          </div>

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
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                      <span className="text-2xl text-blue-600 font-medium">
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium">
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
                    {doctor.email && (
                      <div className="text-sm text-gray-600">
                        <span>{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="text-sm text-gray-600">
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ${doctor.consultationFee}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      Book Now
                    </button>
                    <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {bookingSuccess ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                      Appointment Request Successfully Sent!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Your appointment with {selectedDoctor?.name} has been
                      successfully requested.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg text-left">
                      <p className="text-sm text-green-800">
                        <strong>Date:</strong> {selectedDate}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Time:</strong> {selectedTime}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Type:</strong>{" "}
                        {
                          appointmentTypes.find(
                            (t) => t.value === appointmentType
                          )?.label
                        }
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Doctor:</strong> {selectedDoctor?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 border-b">
                      <h2 className="text-xl font-semibold">
                        Book Appointment
                      </h2>
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
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
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
                            <p className="text-sm text-blue-600 font-medium">
                              ${selectedDoctor.consultationFee}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Date
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={getTomorrowDate()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Time
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
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
                          Appointment Type
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={appointmentType}
                          onChange={(e) => setAppointmentType(e.target.value)}
                        >
                          <option value="">Choose appointment type</option>
                          {appointmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Visit
                        </label>
                        <textarea
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                          placeholder="Please describe your symptoms or reason for visit..."
                          value={reasonForVisit}
                          onChange={(e) => setReasonForVisit(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                          onClick={handleCloseModal}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
                          onClick={handleSubmitBooking}
                          disabled={
                            isSubmitting ||
                            !selectedDate ||
                            !selectedTime ||
                            !appointmentType ||
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
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BookAppointment;
