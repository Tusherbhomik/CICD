import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  User,
  X,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";

const BookAppointment = ({ patientId = 1 }) => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [doctorHospitals, setDoctorHospitals] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

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
    { value: "VIDEO",     label: "Video Call" },
    { value: "PHONE",     label: "Phone Call" },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedHospital("");
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("");
    setReasonForVisit("");
    setBookingSuccess(false);
    setTimeSlots([]);
    setAvailableDates([]);
    setSchedules([]);
    setDoctorHospitals([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsRes, hospitalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/doctors`,   { method: "GET", credentials: "include" }),
          fetch(`${API_BASE_URL}/api/hospitals`, { method: "GET", credentials: "include" }),
        ]);
        if (!doctorsRes.ok)   throw new Error("Failed to fetch doctors");
        if (!hospitalsRes.ok) throw new Error("Failed to fetch hospitals");

        const doctorsData   = await doctorsRes.json();
        const hospitalsData = await hospitalsRes.json();

        const transformed = doctorsData.map((doctor) => ({
          ...doctor,
          specialization: doctor.specialization || doctor.role || "General",
          hospitals: hospitalsData.filter(
            (h) => doctor.hospitalIds?.includes(h.id) || []
          ),
        }));

        setDoctors(transformed);
        setHospitals(hospitalsData);
        setFilteredDoctors(transformed);
      } catch (err) {
        setError(err.message);
        setDoctors([]);
        setFilteredDoctors([]);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update available dates when hospital selection changes inside modal
  useEffect(() => {
    if (selectedHospital && schedules.length > 0) {
      const availableDays = [
        ...new Set(
          schedules
            .filter((s) => s.hospitalId === parseInt(selectedHospital))
            .map((s) => s.dayOfWeek)
        ),
      ];
      setAvailableDates(generateAvailableDates(availableDays));
      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
    } else {
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedTime("");
      setTimeSlots([]);
    }
  }, [selectedHospital, schedules]);

  // Filter doctors by search/specialty/hospital
  useEffect(() => {
    let filtered = doctors;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(term) ||
        (d.email || "").toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term)
      );
    }
    if (selectedSpecialty && selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(
        (d) => d.specialization.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialty, doctors]);

  const generateAvailableDates = (availableDays: string[]) => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d
        .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
        .toUpperCase();
      if (availableDays.includes(dayName)) {
        dates.push(d.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const handleBookAppointment = async (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setBookingSuccess(false);
    setSelectedHospital("");
    setSelectedDate("");
    setSelectedTime("");
    setTimeSlots([]);
    setAvailableDates([]);
    setSchedules([]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/schedules?doctorId=${doctor.id}`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const scheduleData = await res.json();
      setSchedules(scheduleData);

      const uniqueHospitalIds = [...new Set(scheduleData.map((s) => s.hospitalId))];
      setDoctorHospitals(hospitals.filter((h) => uniqueHospitalIds.includes(h.id)));
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleFetchTimeslots = async (date: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/timeslots?doctorId=${selectedDoctor.id}&hospitalId=${selectedHospital}&date=${date}`,
        { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch timeslots");
      const data = await res.json();
      setBookedSlots(data);
      return data;
    } catch (err) {
      console.error("Error fetching timeslots:", err);
      return [];
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateSelection = async (date: string) => {
    const bannedSlots = await handleFetchTimeslots(date);
    setSelectedDate(date);
    setSelectedTime("");

    if (date && schedules.length > 0 && selectedHospital) {
      const dayName = new Date(date)
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();

      const schedule = schedules.find(
        (s) =>
          s.hospitalId === parseInt(selectedHospital) &&
          s.dayOfWeek.toUpperCase() === dayName
      );

      if (schedule) {
        const allSlots = schedule.timeSlots.split(",").map((slot) => {
          const [start, end] = slot.trim().split("-");
          return { display: `${start} - ${end}`, value: `${start} - ${end}` };
        });
        setTimeSlots(allSlots.filter((s) => !bannedSlots.includes(s.value)));
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
      const appointmentData = {
        patientId,
        doctorId: selectedDoctor.id,
        hospitalId: parseInt(selectedHospital),
        appointmentDate: selectedDate,
        appointmentTime: "10:00",
        type: appointmentType,
        reason: reasonForVisit,
        dateandtime: selectedTime,
      };

      const res = await fetch(`${API_BASE_URL}/api/appointments/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book appointment");
      }

      setBookingSuccess(true);
      setTimeout(() => handleCloseModal(), 2500);
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading doctors…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center h-96">
          <div className="text-center bg-white rounded-2xl p-10 border border-red-100 shadow-sm max-w-sm">
            <p className="font-semibold text-gray-800 mb-1">Failed to load</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-sm text-gray-400">Schedule a consultation with our doctors</p>
          </div>
        </div>

        {/* Search / filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 bg-white"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 sm:w-44 bg-white"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {(searchTerm || (selectedSpecialty && selectedSpecialty !== "All Specialties")) && (
            <p className="text-xs text-gray-400 mt-2">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* Doctor grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-600">No doctors found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search or specialty</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => {
              const initial = doctor.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2);
              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-teal-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{doctor.name}</p>
                      <p className="text-sm text-teal-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span className="truncate">{doctor.email || "—"}</span>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.institute && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="truncate">{doctor.institute}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Booking modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              {bookingSuccess ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Appointment Requested!</h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Your appointment with Dr. {selectedDoctor?.name} has been successfully requested.
                  </p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left text-sm text-emerald-800 space-y-1">
                    <p><span className="font-semibold">Date:</span> {selectedDate}</p>
                    <p><span className="font-semibold">Time:</span> {selectedTime}</p>
                    <p><span className="font-semibold">Type:</span> {appointmentTypes.find(t => t.value === appointmentType)?.label}</p>
                    <p><span className="font-semibold">Doctor:</span> Dr. {selectedDoctor?.name}</p>
                    <p><span className="font-semibold">Hospital:</span> {doctorHospitals.find(h => h.id === parseInt(selectedHospital))?.name}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Book Appointment</h2>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Doctor summary */}
                  {selectedDoctor && (
                    <div className="px-6 py-4 bg-teal-50 border-b border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {selectedDoctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Dr. {selectedDoctor.name}</p>
                          <p className="text-sm text-teal-600">{selectedDoctor.specialization}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <div className="p-6 space-y-4">
                    {/* Hospital */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Hospital</label>
                      <select
                        value={selectedHospital}
                        onChange={(e) => setSelectedHospital(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                      >
                        <option value="">Choose a hospital</option>
                        {doctorHospitals.map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Date</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => handleDateSelection(e.target.value)}
                        disabled={!selectedHospital}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!selectedHospital ? "Select a hospital first" : availableDates.length === 0 ? "No available dates" : "Choose a date"}
                        </option>
                        {availableDates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time */}
                    {selectedDate && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Time</label>
                        {slotsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                            Loading slots…
                          </div>
                        ) : timeSlots.length > 0 ? (
                          <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                          >
                            <option value="">Choose a time slot</option>
                            {timeSlots.map((slot, i) => (
                              <option key={i} value={slot.value}>{slot.display}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-gray-400 py-2">No available time slots for this date</p>
                        )}
                      </div>
                    )}

                    {/* Appointment type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Appointment Type</label>
                      <select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                      >
                        <option value="">Choose type</option>
                        {appointmentTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for Visit</label>
                      <textarea
                        value={reasonForVisit}
                        onChange={(e) => setReasonForVisit(e.target.value)}
                        placeholder="Describe your symptoms or reason for the visit…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 min-h-[90px] resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitBooking}
                        disabled={isSubmitting || !selectedDate || !selectedTime || !appointmentType || !reasonForVisit || !selectedHospital}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Booking…
                          </span>
                        ) : "Confirm Booking"}
                      </button>
                    </div>
                  </div>
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
