import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  selected: boolean;
}

interface DaySchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  selectedSlots: TimeSlot[];
  consultationFee: number;
}

interface HospitalSchedule {
  id: string;
  hospital: Hospital | null;
  hospitalId: number | null;
  daySchedules: DaySchedule[];
}

interface SentHospital {
  id: string;
  hospital: Hospital | null;
  hospitalId: number | null;
  daySchedules: string;
  timeSlots: string;
}

const HospitalAvailabilityManager = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalSchedules, setHospitalSchedules] = useState<
    HospitalSchedule[]
  >([
    {
      id: "1",
      hospital: null,
      hospitalId: null,
      daySchedules: [],
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const dayLabels = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  useEffect(() => {
    fetchHospitals();
    fetchExistingSchedules();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setError("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSchedules = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/doctor-hospital-schedules/my-schedules`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Existing schedules:", data);
      }
    } catch (error) {
      console.error("Error fetching existing schedules:", error);
    }
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string
  ): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    let current = new Date(start);
    let slotIndex = 0;

    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5);
      current.setMinutes(current.getMinutes() + 30);

      if (current <= end) {
        const slotEnd = current.toTimeString().slice(0, 5);
        slots.push({
          id: `slot-${slotIndex}`,
          startTime: slotStart,
          endTime: slotEnd,
          selected: false,
        });
        slotIndex++;
      }
    }

    return slots;
  };

  const addHospitalSchedule = () => {
    const newSchedule: HospitalSchedule = {
      id: Date.now().toString(),
      hospital: null,
      hospitalId: null,
      daySchedules: [],
    };
    setHospitalSchedules([...hospitalSchedules, newSchedule]);
  };

  const removeHospitalSchedule = (scheduleId: string) => {
    setHospitalSchedules(
      hospitalSchedules.filter((schedule) => schedule.id !== scheduleId)
    );
  };

  const updateHospitalSelection = (scheduleId: string, hospitalId: number) => {
    const selectedHospital = hospitals.find((h) => h.id === hospitalId);
    setHospitalSchedules(
      hospitalSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, hospitalId, hospital: selectedHospital || null }
          : schedule
      )
    );
  };

  const addDaySchedule = (scheduleId: string) => {
    const newDaySchedule: DaySchedule = {
      id: Date.now().toString(),
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      selectedSlots: [],
      consultationFee: 150,
    };

    setHospitalSchedules(
      hospitalSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              daySchedules: [...schedule.daySchedules, newDaySchedule],
            }
          : schedule
      )
    );
  };

  const removeDaySchedule = (scheduleId: string, dayScheduleId: string) => {
    setHospitalSchedules(
      hospitalSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              daySchedules: schedule.daySchedules.filter(
                (day) => day.id !== dayScheduleId
              ),
            }
          : schedule
      )
    );
  };

  const updateDaySchedule = (
    scheduleId: string,
    dayScheduleId: string,
    field: string,
    value: any
  ) => {
    setHospitalSchedules(
      hospitalSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              daySchedules: schedule.daySchedules.map((day) => {
                if (day.id === dayScheduleId) {
                  const updatedDay = { ...day, [field]: value };

                  if (field === "startTime" || field === "endTime") {
                    updatedDay.selectedSlots = generateTimeSlots(
                      field === "startTime" ? value : day.startTime,
                      field === "endTime" ? value : day.endTime
                    );
                  }

                  return updatedDay;
                }
                return day;
              }),
            }
          : schedule
      )
    );
  };

  const toggleTimeSlot = (
    scheduleId: string,
    dayScheduleId: string,
    slotId: string
  ) => {
    setHospitalSchedules(
      hospitalSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              daySchedules: schedule.daySchedules.map((day) =>
                day.id === dayScheduleId
                  ? {
                      ...day,
                      selectedSlots: day.selectedSlots.map((slot) =>
                        slot.id === slotId
                          ? { ...slot, selected: !slot.selected }
                          : slot
                      ),
                    }
                  : day
              ),
            }
          : schedule
      )
    );
  };

  const saveSchedules = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for API according to SentHospital interface
      const schedulesToSave: SentHospital[] = hospitalSchedules
        .filter(
          (schedule) => schedule.hospitalId && schedule.daySchedules.length > 0
        )
        .flatMap((schedule) =>
          schedule.daySchedules
            .filter((day) => day.selectedSlots.some((slot) => slot.selected))
            .map((day) => ({
              id: Date.now().toString(),
              hospital: schedule.hospital,
              hospitalId: schedule.hospitalId,
              daySchedules: day.dayOfWeek,
              timeSlots: day.selectedSlots
                .filter((slot) => slot.selected)
                .map((slot) => `${slot.startTime}-${slot.endTime}`)
                .join(","),
            }))
        );

      // Save each schedule
      for (const scheduleData of schedulesToSave) {
        const payload = {
          hospitalId: scheduleData.hospitalId,
          dayOfWeek: scheduleData.daySchedules,
          timeSlots: scheduleData.timeSlots,
          // Add doctorId if available from context/auth
          doctorId: "1", // Replace with actual doctorId from your auth context
        };

        const response = await fetch(`${API_BASE_URL}/api/schedules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `   Already scheduled For that ${scheduleData.daySchedules} .. You can update From Update Schedule...`
          );
        }
      }

      setSuccess("All schedules saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving schedules:", error);
      setError(error.message || "Failed to save schedules");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout userType="doctor">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hospitals...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hospital Availability Manager
              </h1>
              <p className="text-gray-600">
                Configure your availability across different hospitals
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addHospitalSchedule}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Hospital
              </button>
              <button
                onClick={saveSchedules}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div className="space-y-6">
            {hospitalSchedules.map((hospitalSchedule) => (
              <div
                key={hospitalSchedule.id}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Hospital
                      </label>
                      <select
                        value={hospitalSchedule.hospitalId || ""}
                        onChange={(e) =>
                          updateHospitalSelection(
                            hospitalSchedule.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a hospital...</option>
                        {hospitals.map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name} - {hospital.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {hospitalSchedules.length > 1 && (
                    <button
                      onClick={() =>
                        removeHospitalSchedule(hospitalSchedule.id)
                      }
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {hospitalSchedule.hospital && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {hospitalSchedule.hospital.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {hospitalSchedule.hospital.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {hospitalSchedule.hospital.city},{" "}
                      {hospitalSchedule.hospital.state}
                    </p>
                  </div>
                )}

                {hospitalSchedule.hospitalId && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Day Schedules
                      </h3>
                      <button
                        onClick={() => addDaySchedule(hospitalSchedule.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Day
                      </button>
                    </div>

                    {hospitalSchedule.daySchedules.map((daySchedule) => (
                      <div
                        key={daySchedule.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Day of Week
                            </label>
                            <select
                              value={daySchedule.dayOfWeek}
                              onChange={(e) =>
                                updateDaySchedule(
                                  hospitalSchedule.id,
                                  daySchedule.id,
                                  "dayOfWeek",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                  {day.charAt(0) + day.slice(1).toLowerCase()}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={daySchedule.startTime}
                              onChange={(e) =>
                                updateDaySchedule(
                                  hospitalSchedule.id,
                                  daySchedule.id,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={daySchedule.endTime}
                              onChange={(e) =>
                                updateDaySchedule(
                                  hospitalSchedule.id,
                                  daySchedule.id,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fee ($)
                            </label>
                            <input
                              type="number"
                              value={daySchedule.consultationFee}
                              onChange={(e) =>
                                updateDaySchedule(
                                  hospitalSchedule.id,
                                  daySchedule.id,
                                  "consultationFee",
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {daySchedule.selectedSlots.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700">
                                Available Time Slots (Select your preferred
                                slots)
                              </label>
                              <button
                                onClick={() =>
                                  removeDaySchedule(
                                    hospitalSchedule.id,
                                    daySchedule.id
                                  )
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {daySchedule.selectedSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    toggleTimeSlot(
                                      hospitalSchedule.id,
                                      daySchedule.id,
                                      slot.id
                                    )
                                  }
                                  className={`p-2 rounded-md text-sm border transition-colors ${
                                    slot.selected
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">
                                      {slot.startTime}
                                    </span>
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {slot.endTime}
                                  </div>
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 text-sm text-gray-600">
                              Selected:{" "}
                              {
                                daySchedule.selectedSlots.filter(
                                  (slot) => slot.selected
                                ).length
                              }{" "}
                              slots
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {hospitalSchedule.daySchedules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No day schedules configured yet.</p>
                        <p className="text-sm">
                          Click "Add Day" to get started.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hospitalSchedules.some((hs) => hs.daySchedules.length > 0) && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Schedule Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitalSchedules
                  .filter((hs) => hs.hospital && hs.daySchedules.length > 0)
                  .map((hs) => (
                    <div key={hs.id} className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {hs.hospital?.name}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {hs.daySchedules.map((day) => {
                          const selectedCount = day.selectedSlots.filter(
                            (slot) => slot.selected
                          ).length;
                          return (
                            <div key={day.id} className="flex justify-between">
                              <span>{dayLabels[day.dayOfWeek]}</span>
                              <span>{selectedCount} slots</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HospitalAvailabilityManager;
