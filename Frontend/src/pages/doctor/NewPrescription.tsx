import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Heart,
  Info,
  MapPin,
  Phone,
  Pill,
  Plus,
  Search,
  Stethoscope,
  User,
  UserCheck,
  X,
  Zap,
  CalendarDays,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Interfaces remain the same
interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  role: string;
}

interface Medicine {
  category: string;
  description: string;
  form: string;
  genericName: string;
  manufacturer: string;
  name: string;
  price: number;
  id: number;
  strength: string;
}

interface MedicineForm {
  medicine: string;
  dosage: string;
  timing: string;
  instructions: string;
  duration: string;
}

interface PrescriptionFormData {
  patientId: string;
  diseaseDescription: string;
  followUpDate: Date | null;
  advice: string;
}

// Medicine dropdown card
const MedicineDropdownCard = ({ medicine, isSelected, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let desc: Record<string, string> = {};
  try { desc = JSON.parse(medicine.description); } catch {}

  const formColors: Record<string, string> = {
    TABLET: 'bg-blue-50 text-blue-700 border-blue-100',
    CAPSULE: 'bg-purple-50 text-purple-700 border-purple-100',
    SYRUP: 'bg-amber-50 text-amber-700 border-amber-100',
    INJECTION: 'bg-red-50 text-red-700 border-red-100',
    CREAM: 'bg-pink-50 text-pink-700 border-pink-100',
    DROPS: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    INHALER: 'bg-teal-50 text-teal-700 border-teal-100',
  };

  return (
    <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${isSelected ? 'bg-sky-50' : ''}`}>
      {/* Main row — clicking selects the medicine */}
      <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50" onClick={onClick}>
        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <Pill className="w-4 h-4 text-sky-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{medicine.name}</p>
          <p className="text-xs text-gray-400 truncate">{medicine.genericName} · {medicine.strength}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${formColors[medicine.form] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
            {medicine.form}
          </span>
          {/* Expand toggle — stops propagation so it doesn't select */}
          {(desc.indication || desc.adultDose) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(v => !v); }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-sky-500 hover:bg-sky-50 transition-colors"
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail panel */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <div className="mt-2.5 space-y-2">
            {desc.indication && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info size={11} className="text-sky-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Indication</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc.indication}</p>
                </div>
              </div>
            )}
            {desc.adultDose && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={11} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adult Dose</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc.adultDose}</p>
                </div>
              </div>
            )}
            {desc.contraindications && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle size={11} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraindications</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc.contraindications}</p>
                </div>
              </div>
            )}
            {desc.sideEffects && (
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={11} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Side Effects</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc.sideEffects}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NewPrescription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionFormData>({
      patientId: "",
      diseaseDescription: "",
      followUpDate: null,
      advice: "",
    });

  // Medicines state
  const [medicines, setMedicines] = useState<MedicineForm[]>([
    { medicine: "", dosage: "", timing: "", instructions: "", duration: "7" },
  ]);

  // State for patient search
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);

  // State for medicine search
  const [medicinesList, setMedicinesList] = useState<Medicine[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(true);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[][]>([
    [],
  ]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState<boolean[]>([
    false,
  ]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState<number[]>([0]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "doctor") {
      toast({
        title: "Access denied",
        description:
          "You must be logged in as a doctor to write prescriptions.",
        variant: "destructive",
      });
      navigate("/login");
    }

    // Fetch patients
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data: Patient[] = await response.json();
        setPatients(data || []);
        setFilteredPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Error",
          description: "Could not fetch patients list. Please try again later.",
          variant: "destructive",
        });
        setPatients([]);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    // Fetch medicines
    const fetchMedicines = async () => {
      setIsLoadingMedicines(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/medicines/search`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }
        const data: Medicine[] = await response.json();
        console.log("Medicine Data:", data);
        setMedicinesList(data || []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        toast({
          title: "Error",
          description:
            "Could not fetch medicines list. Please try again later.",
          variant: "destructive",
        });
        setMedicinesList([]);
      } finally {
        setIsLoadingMedicines(false);
      }
    };

    fetchPatients();
    fetchMedicines();
  }, [navigate, toast]);

  // Search functions
  const handlePatientSearch = (searchTerm: string) => {
    if (searchTerm.length === 0) {
      setFilteredPatients(patients);
      setShowPatientDropdown(false);
      return;
    }
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.id.toString().includes(searchTerm)
    );
    setFilteredPatients(filtered);
    setShowPatientDropdown(filtered.length > 0);
    setSelectedPatientIndex(0);
  };

  const debouncedPatientSearch = debounce(handlePatientSearch, 300);

  const handleMedicineSearch = (searchTerm: string, index: number) => {
    if (searchTerm.length === 0) {
      setFilteredMedicines((prev) => {
        const newState = [...prev];
        newState[index] = [];
        return newState;
      });
      setShowMedicineDropdown((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
      return;
    }

    const filtered = medicinesList.filter((medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredMedicines((prev) => {
      const newFiltered = [...prev];
      newFiltered[index] = filtered;
      return newFiltered;
    });
    setShowMedicineDropdown((prev) => {
      const newShow = [...prev];
      newShow[index] = filtered.length > 0;
      return newShow;
    });
    setSelectedIndex((prev) => {
      const newIndex = [...prev];
      newIndex[index] = 0;
      return newIndex;
    });
  };

  const debouncedMedicineSearch = debounce(handleMedicineSearch, 300);

  const handlePatientSearchChange = (value: string) => {
    setPatientSearchQuery(value);
    debouncedPatientSearch(value);
  };

  const handlePatientSelect = (patient: Patient) => {
    setPrescriptionData((prev) => ({
      ...prev,
      patientId: patient.id.toString(),
    }));
    setPatientSearchQuery(`${patient.name} (${patient.email})`);
    setShowPatientDropdown(false);
  };

  const handlePatientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPatientDropdown) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedPatientIndex((prev) =>
          Math.min(prev + 1, filteredPatients.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedPatientIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredPatients.length > 0) {
          handlePatientSelect(filteredPatients[selectedPatientIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowPatientDropdown(false);
        break;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPrescriptionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setPrescriptionData((prev) => ({ ...prev, followUpDate: date || null }));
  };

  const handleMedicineChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);

    if (field === "medicine") {
      setActiveSearchIndex(index);
      debouncedMedicineSearch(value, index);
    }
  };

  const handleMedicineKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!showMedicineDropdown[index]) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = [...prev];
          newIndex[index] = Math.min(
            newIndex[index] + 1,
            filteredMedicines[index].length - 1
          );
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = [...prev];
          newIndex[index] = Math.max(newIndex[index] - 1, 0);
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (filteredMedicines[index].length > 0) {
          handleMedicineSelect(
            index,
            filteredMedicines[index][selectedIndex[index]]
          );
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowMedicineDropdown((prev) => {
          const newShow = [...prev];
          newShow[index] = false;
          return newShow;
        });
        break;
    }
  };

  const handleMedicineSelect = (index: number, medicine: Medicine) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      medicine: medicine.name,
    };
    setMedicines(updatedMedicines);
    setShowMedicineDropdown((prev) => {
      const newShow = [...prev];
      newShow[index] = false;
      return newShow;
    });
  };

  const addMedicineField = () => {
    setMedicines([
      ...medicines,
      { medicine: "", dosage: "", timing: "", instructions: "", duration: "7" },
    ]);
    setFilteredMedicines([...filteredMedicines, []]);
    setShowMedicineDropdown([...showMedicineDropdown, false]);
    setSelectedIndex([...selectedIndex, 0]);
  };

  const removeMedicineField = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
      setFilteredMedicines(filteredMedicines.filter((_, i) => i !== index));
      setShowMedicineDropdown(
        showMedicineDropdown.filter((_, i) => i !== index)
      );
      setSelectedIndex(selectedIndex.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionData.patientId) {
      toast({
        title: "Error",
        description: "Please select a patient.",
        variant: "destructive",
      });
      return;
    }
    if (!prescriptionData.diseaseDescription) {
      toast({
        title: "Error",
        description: "Please enter a disease description.",
        variant: "destructive",
      });
      return;
    }
    if (medicines.some((m) => !m.medicine || !m.dosage || !m.timing)) {
      toast({
        title: "Error",
        description: "Please complete all medicine fields.",
        variant: "destructive",
      });
      return;
    }

    // Helper function to convert timing string to meal relation enum
    const getMealRelation = (timing: string) => {
      switch (timing) {
        case "before_meal":
          return "BEFORE_MEAL";
        case "after_meal":
          return "AFTER_MEAL";
        case "with_meal":
          return "WITH_MEAL";
        case "empty_stomach":
          return "BEFORE_MEAL";
        case "bedtime":
          return "AFTER_MEAL";
        default:
          return "AFTER_MEAL";
      }
    };

    // Helper function to parse dosage and create timings array
    const createTimings = (dosage: string, timing: string) => {
      const mealRelation = getMealRelation(timing);
      const timingsArray = [];

      if (dosage === "sos") {
        return [
          {
            mealRelation: mealRelation,
            timeOfDay: "MORNING",
            amount: 1,
            specificTime: "08:00",
            intervalHours: null,
          },
        ];
      }

      // Parse dosage like "1-0-1" or "1-1-1"
      const dosageParts = dosage.split("-").map(Number);
      const timeSlots = ["MORNING", "AFTERNOON", "NIGHT"];
      const specificTimes = ["08:00", "14:00", "20:00"];

      dosageParts.forEach((amount, index) => {
        if (amount > 0 && index < timeSlots.length) {
          timingsArray.push({
            mealRelation: mealRelation,
            timeOfDay: timeSlots[index],
            amount: amount,
            specificTime: specificTimes[index],
            intervalHours: null,
          });
        }
      });

      return timingsArray;
    };

    // Helper function to find medicine ID by name
    const findMedicineId = (medicineName: string) => {
      const foundMedicine = medicinesList.find(
        (med) => med.name.toLowerCase() === medicineName.toLowerCase()
      );
      return foundMedicine ? foundMedicine.id : null;
    };

    setIsSubmitting(true);
    try {
      // Transform medicines to the required format
      const transformedMedicines = medicines.map((med) => {
        const medicineId = findMedicineId(med.medicine);
        if (!medicineId) {
          throw new Error(`Medicine "${med.medicine}" not found in database`);
        }

        return {
          medicineId: medicineId,
          durationDays: parseInt(med.duration) || 7,
          specialInstructions: med.instructions || "",
          timings: createTimings(med.dosage, med.timing),
        };
      });

      const requestData = {
        advice: prescriptionData.advice,
        diagnosis: prescriptionData.diseaseDescription,
        followUpDate: prescriptionData.followUpDate
          ? prescriptionData.followUpDate.toISOString().split("T")[0]
          : null,
        patientId: parseInt(prescriptionData.patientId, 10),
        appointmentId: null, // Optional field - set to null if not available
        medicines: transformedMedicines,
        createdAt: new Date().toISOString(),
      };

      console.log("Sending prescription data:", requestData);

      const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create prescription");
      }

      toast({
        title: "Success",
        description: "Prescription has been created successfully.",
      });
      navigate("/doctor/dashboard");
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ step, icon: Icon, title, subtitle, action }: { step: number; icon: React.ElementType; title: string; subtitle: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Step {step}</span>
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <MainLayout userType="doctor">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-md flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Prescription</h1>
            <p className="text-sm text-gray-400">Write a digital prescription for your patient</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Step 1 — Patient */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader step={1} icon={UserCheck} title="Select Patient" subtitle="Search by name, email, phone, or ID" />
            <div className="p-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={patientSearchQuery}
                  onChange={(e) => handlePatientSearchChange(e.target.value)}
                  onKeyDown={handlePatientKeyDown}
                  onFocus={() => {
                    if (patientSearchQuery.length > 0) debouncedPatientSearch(patientSearchQuery);
                    else { setFilteredPatients(patients); setShowPatientDropdown(patients.length > 0); }
                  }}
                  placeholder={isLoadingPatients ? "Loading patients…" : "Search patient…"}
                  className="pl-10 border-gray-200 focus:border-sky-400 rounded-xl"
                  disabled={isLoadingPatients}
                  required
                />
              </div>

              {showPatientDropdown && (
                <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto z-20 relative">
                  {filteredPatients.length > 0 ? filteredPatients.map((patient, i) => (
                    <div
                      key={patient.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors ${i === selectedPatientIndex ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500 truncate">{patient.email} · {patient.phone}</p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize flex-shrink-0">{patient.gender}</span>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-gray-400 text-sm">No patients found</div>
                  )}
                </div>
              )}
              <input type="hidden" name="patientId" value={prescriptionData.patientId} />
            </div>
          </div>

          {/* Step 2 — Diagnosis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader step={2} icon={Activity} title="Diagnosis" subtitle="Describe the condition and medical findings" />
            <div className="p-5">
              <Textarea
                name="diseaseDescription"
                value={prescriptionData.diseaseDescription}
                onChange={handleInputChange}
                placeholder="Enter diagnosis, symptoms, and clinical findings…"
                className="min-h-28 border-gray-200 focus:border-sky-400 rounded-xl resize-none text-sm"
                required
              />
            </div>
          </div>

          {/* Step 3 — Medicines */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader
              step={3}
              icon={Pill}
              title="Prescribed Medicines"
              subtitle="Add medications with dosage and timing"
              action={
                <button
                  type="button"
                  onClick={addMedicineField}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medicine
                </button>
              }
            />

            <div className="p-5 space-y-4">
              {medicines.map((medicine, index) => (
                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Medicine card header */}
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 flex-1">Medicine #{index + 1}</span>
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicineField(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Medicine search */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Search className="w-3 h-3" /> Medicine Name
                      </Label>
                      <div className="relative">
                        <Input
                          value={medicine.medicine}
                          onChange={(e) => handleMedicineChange(index, "medicine", e.target.value)}
                          onKeyDown={(e) => handleMedicineKeyDown(e, index)}
                          onFocus={() => {
                            setActiveSearchIndex(index);
                            if (medicine.medicine.length > 0) debouncedMedicineSearch(medicine.medicine, index);
                          }}
                          placeholder={isLoadingMedicines ? "Loading medicines…" : "Search medicine…"}
                          className="pl-9 border-gray-200 focus:border-sky-400 rounded-xl text-sm"
                          disabled={isLoadingMedicines}
                          required
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                      </div>

                      {showMedicineDropdown[index] && activeSearchIndex === index && (
                        <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-10 relative">
                          {filteredMedicines[index]?.length > 0 ? filteredMedicines[index].map((med, i) => (
                            <MedicineDropdownCard
                              key={med.id}
                              medicine={med}
                              isSelected={i === selectedIndex[index]}
                              onClick={() => handleMedicineSelect(index, med)}
                            />
                          )) : (
                            <div className="py-6 text-center text-gray-400 text-sm">No medicines found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dosage + Duration row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Daily schedule */}
                      <div className="sm:col-span-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Daily Schedule
                        </Label>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                              { time: 'Morning', key: 0, period: '8 AM' },
                              { time: 'Afternoon', key: 1, period: '2 PM' },
                              { time: 'Night', key: 2, period: '8 PM' },
                            ].map(({ time, key, period }) => {
                              const parts = (medicine.dosage || "0-0-0").split("-").map(Number);
                              const val = parts[key] || 0;
                              return (
                                <div key={time} className="text-center">
                                  <p className="text-xs font-semibold text-gray-600 mb-0.5">{time}</p>
                                  <p className="text-xs text-gray-400 mb-2">{period}</p>
                                  <div className="flex justify-center gap-1">
                                    {[0, 1, 2].map(n => (
                                      <button
                                        key={n}
                                        type="button"
                                        onClick={() => {
                                          const p = [...parts];
                                          p[key] = n;
                                          handleMedicineChange(index, "dosage", p.join("-"));
                                        }}
                                        className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${val === n ? 'bg-sky-500 text-white border-sky-500 shadow' : 'bg-white text-gray-500 border-gray-200 hover:border-sky-400'}`}
                                      >{n}</button>
                                    ))}
                                  </div>
                                  {val > 0 && <p className="text-xs text-sky-600 font-semibold mt-1">{val} tab{val > 1 ? 's' : ''}</p>}
                                </div>
                              );
                            })}
                          </div>

                          {/* Presets */}
                          <div className="grid grid-cols-2 gap-1.5 border-t border-gray-200 pt-3">
                            {[
                              { label: '1×/day AM', value: '1-0-0' },
                              { label: '1×/day PM', value: '0-0-1' },
                              { label: '2×/day', value: '1-0-1' },
                              { label: '3×/day', value: '1-1-1' },
                            ].map(p => (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => handleMedicineChange(index, "dosage", p.value)}
                                className={`py-1.5 text-xs rounded-lg border transition-all ${medicine.dosage === p.value ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-400'}`}
                              >{p.label}</button>
                            ))}
                          </div>

                          {/* SOS */}
                          <button
                            type="button"
                            onClick={() => handleMedicineChange(index, "dosage", "sos")}
                            className={`w-full mt-2 py-2 text-xs rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition-all ${medicine.dosage === "sos" ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            SOS — As Needed
                          </button>

                          {medicine.dosage && medicine.dosage !== "0-0-0" && medicine.dosage !== "sos" && (
                            <p className="text-center text-xs text-sky-600 font-semibold mt-2">
                              Pattern: <span className="bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">{medicine.dosage}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Duration
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                              className="border-gray-200 focus:border-sky-400 rounded-xl text-center font-bold text-lg"
                            />
                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">days</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {[{ label: '5d', value: '5' }, { label: '7d', value: '7' }, { label: '14d', value: '14' }, { label: '30d', value: '30' }].map(d => (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => handleMedicineChange(index, "duration", d.value)}
                                className={`py-1 text-xs rounded-lg border transition-all ${medicine.duration === d.value ? 'bg-sky-500 text-white border-sky-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-400'}`}
                              >{d.label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meal timing + Instructions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Meal Timing
                        </Label>
                        <Select value={medicine.timing} onValueChange={(v) => handleMedicineChange(index, "timing", v)}>
                          <SelectTrigger className="border-gray-200 focus:border-sky-400 rounded-xl text-sm">
                            <SelectValue placeholder="Select timing…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before_meal">Before Meal</SelectItem>
                            <SelectItem value="after_meal">After Meal</SelectItem>
                            <SelectItem value="with_meal">With Meal</SelectItem>
                            <SelectItem value="empty_stomach">Empty Stomach</SelectItem>
                            <SelectItem value="bedtime">Bedtime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Special Instructions
                        </Label>
                        <Input
                          value={medicine.instructions}
                          onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                          placeholder="Optional note…"
                          className="border-gray-200 focus:border-sky-400 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4 — Follow-up + Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <SectionHeader step={4} icon={CalendarDays} title="Follow-up Date" subtitle="Schedule next visit" />
              <div className="p-5">
                <DatePicker
                  selected={prescriptionData.followUpDate}
                  onSelect={handleDateChange}
                  placeholder="Pick a date…"
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <SectionHeader step={5} icon={FileText} title="Doctor's Advice" subtitle="Lifestyle & additional recommendations" />
              <div className="p-5">
                <Textarea
                  name="advice"
                  value={prescriptionData.advice}
                  onChange={handleInputChange}
                  placeholder="Diet, exercise, precautions…"
                  className="min-h-28 border-gray-200 focus:border-sky-400 rounded-xl resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Create Prescription
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default NewPrescription;