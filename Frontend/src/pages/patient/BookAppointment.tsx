import MainLayout from "@/components/layout/MainLayout";
import { Calendar, Clock, User, Search } from "lucide-react";

const BookAppointment = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialization: "Cardiologist",
      experience: "15 years",
      availability: "Mon-Fri, 9:00 AM - 5:00 PM",
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      specialization: "Neurologist",
      experience: "12 years",
      availability: "Mon-Thu, 10:00 AM - 6:00 PM",
      rating: 4.7,
      reviews: 98,
    },
    {
      id: 3,
      name: "Dr. Emily Chen",
      specialization: "Pediatrician",
      experience: "8 years",
      availability: "Mon-Sat, 8:00 AM - 4:00 PM",
      rating: 4.9,
      reviews: 156,
    },
  ];

  return (
    <MainLayout userType="patient">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Book an Appointment</h1>
          <p className="text-gray-600">Schedule a consultation with our doctors</p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <select className="form-input md:w-48">
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>
        </div>

        {/* Doctors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl text-primary font-medium">
                    {doctor.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {doctor.experience} experience
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {doctor.rating} ({doctor.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{doctor.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>30 min consultation</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="btn-primary flex-1">Book Now</button>
                <button className="btn-secondary flex-1">View Profile</button>
              </div>
            </div>
          ))}
        </div>

        {/* Appointment Form Modal (Hidden by default) */}
        <div className="hidden">
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Time
                  </label>
                  <select className="form-input">
                    <option>09:00 AM</option>
                    <option>09:30 AM</option>
                    <option>10:00 AM</option>
                    <option>10:30 AM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Visit
                  </label>
                  <textarea
                    className="form-input min-h-[100px]"
                    placeholder="Please describe your symptoms or reason for visit..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookAppointment; 