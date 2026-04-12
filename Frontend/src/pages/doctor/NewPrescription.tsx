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
}

interface PrescriptionFormData {
  patientId: string;
  diseaseDescription: string;
  followUpDate: Date | null;
  advice: string;
}

// Enhanced Medicine Card Component
const MedicineDropdownCard = ({
  medicine,
  isSelected,
  onClick,
  index,
  selectedIndex,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = JSON.parse(medicine.description);

  const InfoSection = ({
    icon: Icon,
    title,
    content,
    colorClass = "text-gray-600",
  }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={colorClass} />
        <span className="font-medium text-sm text-gray-700">{title}</span>
      </div>
      <p className="text-sm text-gray-600 ml-5 leading-relaxed">{content}</p>
    </div>
  );

  return (
    <div
      className={`border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
        isSelected ? "bg-medical-primary/5" : ""
      }`}
    >
      {/* Header - Clickable for Selection */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="text-medical-primary" size={18} />
              <h3 className="font-semibold text-gray-800 text-base">
                {medicine.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Manufacturer:</span>
                <span className="ml-2 text-gray-700">
                  {medicine.manufacturer}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Form:</span>
                <span className="ml-2 text-gray-700">
                  {medicine.form} • {medicine.strength}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse medicine details" : "Expand medicine details"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {/* Quick Preview */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-medical-primary" />
            <span className="font-medium text-sm text-gray-700">
              Primary Indication
            </span>
          </div>
          <p className="text-sm text-gray-600 ml-5">{description.indication}</p>
        </div>
      </div>

      {/* Expanded Details - Not Clickable for Selection */}
      {isExpanded && (
        <div
          className="px-4 pb-4 border-t border-gray-100 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-4 space-y-1">
            <InfoSection
              icon={User}
              title="Adult Dosage"
              content={description.adultDose}
              colorClass="text-green-600"
            />
            <InfoSection
              icon={AlertTriangle}
              title="Contraindications"
              content={description.contraindications}
              colorClass="text-red-500"
            />
            <InfoSection
              icon={Zap}
              title="Side Effects"
              content={description.sideEffects}
              colorClass="text-orange-500"
            />
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
    { medicine: "", dosage: "", timing: "", instructions: "" },
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
      { medicine: "", dosage: "", timing: "", instructions: "" },
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
          durationDays: 7, // Default duration - you might want to add this field to the form
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

  return (
    <MainLayout userType="doctor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  New Prescription
                </h1>
                <p className="text-gray-600 mt-1">Create a new prescription for your patient</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Selection Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Patient Information</h2>
                </div>
                <p className="text-blue-100 mt-1">Search and select the patient for this prescription</p>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="patientSearch"
                    value={patientSearchQuery}
                    onChange={(e) => handlePatientSearchChange(e.target.value)}
                    onKeyDown={handlePatientKeyDown}
                    onFocus={() => {
                      if (patientSearchQuery.length > 0) {
                        debouncedPatientSearch(patientSearchQuery);
                      } else {
                        setFilteredPatients(patients);
                        setShowPatientDropdown(patients.length > 0);
                      }
                    }}
                    placeholder={
                      isLoadingPatients
                        ? "Loading patients..."
                        : "Search for patient by name, email, phone, or ID"
                    }
                    className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200"
                    disabled={isLoadingPatients}
                    required
                  />
                </div>
                
                {showPatientDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, i) => (
                        <div
                          key={patient.id}
                          className={`p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                            i === selectedPatientIndex ? "bg-blue-50 border-blue-200" : ""
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 text-lg">
                                {patient.name}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {patient.phone}
                                </span>
                                <span>{patient.email}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Born: {new Date(patient.birthDate).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                                  {patient.gender}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No patients found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="hidden"
                  name="patientId"
                  value={prescriptionData.patientId}
                />
              </div>
            </div>

            {/* Diagnosis Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Diagnosis & Condition</h2>
                </div>
                <p className="text-green-100 mt-1">Describe the patient's condition and diagnosis</p>
              </div>
              
              <div className="p-6">
                <Textarea
                  id="diseaseDescription"
                  name="diseaseDescription"
                  value={prescriptionData.diseaseDescription}
                  onChange={handleInputChange}
                  placeholder="Enter detailed diagnosis, symptoms, and medical findings..."
                  className="min-h-32 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl resize-none shadow-sm transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Medicines Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Prescribed Medicines</h2>
                      <p className="text-purple-100 mt-1">Add medications with dosage and timing</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addMedicineField}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className="relative p-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg"
                  >
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineField(index)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm"
                      >
                        <X size={18} />
                      </button>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Pill className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Medicine #{index + 1}</h3>
                    </div>

                  <div className="grid grid-cols-1  gap-6">
                    {/* Medicine Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Search className="h-4 w-4 mr-1" />
                        Medicine Name
                      </Label>
                      <div className="relative">
                        <Input
                          id={`medicine-${index}`}
                          value={medicine.medicine}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "medicine",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => handleMedicineKeyDown(e, index)}
                          onFocus={() => {
                            setActiveSearchIndex(index);
                            if (medicine.medicine.length > 0) {
                              debouncedMedicineSearch(medicine.medicine, index);
                            }
                          }}
                          placeholder={
                            isLoadingMedicines
                              ? "Loading medicines..."
                              : "Search for medicine"
                          }
                          className="pl-10 border border-gray-200 focus:border-medical-primary rounded-lg"
                          disabled={isLoadingMedicines}
                          required
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>

                      {/* Medicine Dropdown */}
                      {showMedicineDropdown[index] && activeSearchIndex === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                          {filteredMedicines[index]?.length > 0 ? (
                            filteredMedicines[index].map((med, i) => (
                              <MedicineDropdownCard
                                key={med.id}
                                medicine={med}
                                isSelected={i === selectedIndex[index]}
                                onClick={() => handleMedicineSelect(index, med)}
                                index={i}
                                selectedIndex={selectedIndex[index]}
                              />
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <Pill className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              No medicines found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dosage Pattern */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Dosage Pattern
                      </Label>
                      
                      {/* Interactive Dosage Selector */}
                      <div className="space-y-4">
                        {/* Time-based Dosage */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Daily Schedule</span>
                            <button
                              type="button"
                              onClick={() => {
                                // Reset to 0-0-0 when switching to time-based
                                handleMedicineChange(index, "dosage", "0-0-0");
                              }}
                              className="text-xs text-medical-primary hover:text-medical-primary/80"
                            >
                              Reset
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { time: 'Morning', key: 0, icon: '🌅', period: '8:00 AM' },
                              { time: 'Afternoon', key: 1, icon: '☀️', period: '2:00 PM' },
                              { time: 'Evening', key: 2, icon: '🌙', period: '8:00 PM' }
                            ].map(({ time, key, icon, period }) => {
                              const currentDosage = medicine.dosage || "0-0-0";
                              const dosageParts = currentDosage.split("-").map(Number);
                              const currentValue = dosageParts[key] || 0;
                              
                              return (
                                <div key={time} className="text-center">
                                  <div className="mb-2">
                                    <div className="text-lg mb-1">{icon}</div>
                                    <div className="text-sm font-medium text-gray-700">{time}</div>
                                    <div className="text-xs text-gray-500">{period}</div>
                                  </div>
                                  <div className="flex items-center justify-center gap-1">
                                    {[0, 1, 2].map((num) => (
                                      <button
                                        key={num}
                                        type="button"
                                        onClick={() => {
                                          const newDosageParts = [...dosageParts];
                                          newDosageParts[key] = num;
                                          const newDosage = newDosageParts.join("-");
                                          handleMedicineChange(index, "dosage", newDosage);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                                          currentValue === num
                                            ? 'bg-medical-primary text-white border-medical-primary shadow-md'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-medical-primary hover:text-medical-primary'
                                        }`}
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                  {currentValue > 0 && (
                                    <div className="mt-1 text-xs text-medical-primary font-medium">
                                      {currentValue} tablet{currentValue > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Current Pattern Display */}
                          {medicine.dosage && medicine.dosage !== "0-0-0" && medicine.dosage !== "sos" && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-center gap-2 text-sm">
                                <span className="text-gray-600">Pattern:</span>
                                <span className="px-3 py-1 bg-medical-primary/10 text-medical-primary rounded-full font-medium">
                                  {medicine.dosage}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quick Presets */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="text-sm font-medium text-gray-700 mb-3">Quick Presets</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Once Daily (Morning)', value: '1-0-0' },
                              { label: 'Once Daily (Evening)', value: '0-0-1' },
                              { label: 'Twice Daily', value: '1-0-1' },
                              { label: 'Three Times Daily', value: '1-1-1' }
                            ].map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => handleMedicineChange(index, "dosage", preset.value)}
                                className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                                  medicine.dosage === preset.value
                                    ? 'bg-medical-primary text-white border-medical-primary'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-medical-primary hover:bg-medical-primary/5'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* SOS Option */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <button
                            type="button"
                            onClick={() => handleMedicineChange(index, "dosage", "sos")}
                            className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                              medicine.dosage === "sos"
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">SOS (As Needed)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Meal Timing
                      </Label>
                      <Select
                        value={medicine.timing}
                        onValueChange={(value) =>
                          handleMedicineChange(index, "timing", value)
                        }
                      >
                        <SelectTrigger className="border border-gray-200 focus:border-medical-primary rounded-lg">
                          <SelectValue placeholder="Select meal timing" />
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

                    {/* Instructions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Special Instructions
                      </Label>
                      <Input
                        id={`instructions-${index}`}
                        value={medicine.instructions}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "instructions",
                            e.target.value
                          )
                        }
                        placeholder="Any special instructions (optional)"
                        className="border border-gray-200 focus:border-medical-primary rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up and Advice Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Follow-up Date */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-6 h-6 text-medical-primary" />
                  <h2 className="text-xl font-bold text-gray-800">Follow-up Date</h2>
                </div>
                <p className="text-gray-600 mt-1">Schedule next consultation</p>
              </div>
              
              <div className="p-6">
                <DatePicker
                  selected={prescriptionData.followUpDate}
                  onSelect={handleDateChange}
                  placeholder="Select follow-up date"
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>

            {/* Advice */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-medical-primary" />
                  <h2 className="text-xl font-bold text-gray-800">Medical Advice</h2>
                </div>
                <p className="text-gray-600 mt-1">Additional recommendations</p>
              </div>
              
              <div className="p-6">
                <Textarea
                  id="advice"
                  name="advice"
                  value={prescriptionData.advice}
                  onChange={handleInputChange}
                  placeholder="Enter lifestyle advice, precautions, or additional recommendations..."
                  className="min-h-32 border border-gray-200 focus:border-medical-primary rounded-lg resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 text-lg font-semibold bg-medical-primary hover:bg-medical-primary/90 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Prescription...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  <span>Create Prescription</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </MainLayout>
  );
};

export default NewPrescription;