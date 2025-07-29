import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
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
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [schedules, setSchedules] = useState([]); // Store raw schedule data
  const [doctorHospitals, setDoctorHospitals] = useState([]);

  const specialties = [
    "All Specialties",
    "Cardiologist",
    "Neurologist",
    "Pediatrician",
    "Dermatologist",
    "Orthopedic",
    "Psychiatrist",
  ];

  const appointmentTypes = [
    { value: "IN_PERSON", label: "In Person" },
    { value: "VIDEO", label: "Video Call" },
    { value: "PHONE", label: "Phone Call" },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedHospital(null);
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("");
    setReasonForVisit("");
    setPatientName("");
    setBookingSuccess(false);
  };

  useEffect(() => {
    const fetchDoctorsAndHospitals = async () => {
      try {
        setLoading(true);
        const [doctorsResponse, hospitalsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/doctors`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/hospitals`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors");
        if (!hospitalsResponse.ok) throw new Error("Failed to fetch hospitals");

        const doctorsData = await doctorsResponse.json();
        console.log(doctorsData);
        const hospitalsData = await hospitalsResponse.json();
        console.log(hospitalsData);

        const transformedDoctors = doctorsData.map((doctor) => ({
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
          hospitals: hospitalsData.filter(
            (h) => doctor.hospitalIds?.includes(h.id) || []
          ),
        }));

        setDoctors(transformedDoctors);
        setHospitals(hospitalsData);
        setFilteredDoctors(transformedDoctors);
      } catch (err) {
        setError(err.message);
        setDoctors([]);
        setFilteredDoctors([]);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsAndHospitals();
  }, []);

  const fuzzySearch = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((doctor) => {
      const name = doctor.name.toLowerCase();
      const email = doctor.email ? doctor.email.toLowerCase() : "";
      const specialization = doctor.specialization.toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        specialization.includes(term)
      );
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

    if (selectedHospital) {
      filtered = filtered.filter((doctor) =>
        doctor.hospitals.some((h) => h.id === selectedHospital)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, selectedHospital, doctors]);

  const handleBookAppointment = async (doctor) => {
    try {
      // console.log("magi");
      console.log(doctor);
      setSelectedDoctor(doctor);
      setIsModalOpen(true);
      setBookingSuccess(false);

      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
      setSchedules([]); // Reset schedules

      const response = await fetch(
        `${API_BASE_URL}/api/schedules?doctorId=${doctor.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      ///schedule data hospital id (unique)
      ////hospitalsData ---(id,,,name)

      /////schedule data---unique id
      ////hospitalsData----id ----> name
      const scheduleData = await response.json();
      console.log("yes");
      console.log(scheduleData);
      // setHospitals(scheduleData.)
      setSchedules(scheduleData);

      const uniqueHospitalIds = [
        ...new Set(scheduleData.map((item) => item.hospitalId)),
      ];
      const filteredHospitals = hospitals.filter((h) =>
        uniqueHospitalIds.includes(h.id)
      );
      setDoctorHospitals(filteredHospitals);

      const availableDays = [
        ...new Set(
          scheduleData
            .filter((s) => s.hospitalId === selectedHospital)
            .map((s) => s.dayOfWeek)
        ),
      ];
      const dates = generateAvailableDates(availableDays);
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const generateAvailableDates = (availableDays) => {
    const dates = [];
    const today = new Date("2025-07-29T04:42:00+06:00"); // Current date and time
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (
      let d = new Date(today);
      d <= oneMonthLater;
      d.setDate(d.getDate() + 1)
    ) {
      const dayName = d
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();
      if (availableDays.includes(dayName)) {
        dates.push(d.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const handleDateSelection = (selectedDate) => {
    setSelectedDate(selectedDate);
    setSelectedTime("");

    if (selectedDate && schedules.length > 0) {
      const schedule = schedules.find(
        (s) =>
          s.hospitalId === selectedHospital &&
          s.dayOfWeek.toUpperCase() ===
            new Date(selectedDate)
              .toLocaleDateString("en-US", { weekday: "long" })
              .toUpperCase()
      );
      if (schedule) {
        const slots = schedule.timeSlots.split(",").map((slot) => {
          const [start, end] = slot.split("-");
          return {
            display: `${start} - ${end}`,
            value: start,
            slotId: `${schedule.id}_${start}`, // Use schedule ID with start time
          };
        });

        // Filter out past slots for today
        const selectedDateObj = new Date(selectedDate);
        if (
          selectedDateObj.toDateString() ===
            new Date("2025-07-29").toDateString() &&
          new Date("2025-07-29T04:42:00+06:00") > new Date()
        ) {
          const currentTime = "04:42";
          setTimeSlots(slots.filter((slot) => slot.value >= currentTime));
        } else {
          setTimeSlots(slots);
        }
      } else {
        setTimeSlots([]);
      }
    } else {
      setTimeSlots([]);
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      const selectedSlotData = timeSlots.find(
        (slot) => slot.value === selectedTime
      );

      if (!selectedSlotData) throw new Error("Please select a valid time slot");

      const appointmentData = {
        patientId: patientId,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        type: appointmentType,
        reason: reasonForVisit,
        patientName: patientName,
        slotId: selectedSlotData.slotId,
      };

      // Placeholder for appointment table check
      // TODO: Implement API call to check if the slot is booked in the appointment table
      // Example: const availabilityResponse = await fetch(`${API_BASE_URL}/api/appointments/check?doctorId=${selectedDoctor.id}&hospitalId=${selectedHospital}&date=${selectedDate}&time=${selectedTime}`, { method: "GET", credentials: "include" });
      // if (!availabilityResponse.ok) throw new Error("Slot already booked");

      const response = await fetch(`${API_BASE_URL}/api/appointments/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book appointment");
      }

      setBookingSuccess(true);
      setTimeout(() => handleCloseModal(), 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(`Error: ${error.message}`);
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
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:w-48"
                value={selectedHospital || ""}
                onChange={(e) =>
                  setSelectedHospital(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
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
            {selectedHospital &&
              ` at ${hospitals.find((h) => h.id === selectedHospital)?.name}`}
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
                      <p className="text-sm text-green-800">
                        <strong>Patient:</strong> {patientName}
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
                          Select Hospital
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={selectedHospital || ""}
                          onChange={(e) =>
                            setSelectedHospital(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          // disabled={!!selectedDoctor}
                        >
                          <option value="">Select Hospital</option>
                          {doctorHospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Date
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={selectedDate}
                          onChange={(e) => handleDateSelection(e.target.value)}
                          // disabled={!selectedHospital}
                        >
                          <option value="">Select a date</option>
                          {availableDates.map((date) => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedDate && timeSlots.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Time
                          </label>
                          <select
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                          >
                            <option value="">Select a time</option>
                            {timeSlots.map((slot, index) => (
                              <option key={index} value={slot.value}>
                                {slot.display}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {selectedDate && timeSlots.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No available time slots for the selected date
                          </p>
                        </div>
                      )}
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
                          Patient Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Enter your name"
                        />
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
                            !reasonForVisit ||
                            !patientName ||
                            !selectedHospital
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
