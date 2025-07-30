import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/url";
import { debounce } from "lodash";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Pill,
  Plus,
  Search,
  Stethoscope,
  User,
  X,
  Zap,
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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={colorClass} />
        <span className="font-semibold text-sm text-gray-800">{title}</span>
      </div>
      <p className="text-sm text-gray-600 ml-6 leading-relaxed">{content}</p>
    </div>
  );

  return (
    <div
      className={`border-b border-gray-200 last:border-b-0 transition-all duration-200 rounded-lg ${
        isSelected ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div
        className="p-4 cursor-pointer hover:bg-blue-50 rounded-lg"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Pill className="text-blue-600" size={20} />
              <h3 className="font-bold text-lg text-gray-900">
                {medicine.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Manufacturer:</span>
                <span className="ml-2 text-gray-800">
                  {medicine.manufacturer}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Form:</span>
                <span className="ml-2 text-gray-800">
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
            className="ml-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse medicine details"
                : "Expand medicine details"
            }
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-600" />
            <span className="font-semibold text-sm text-gray-800">
              Primary Indication
            </span>
          </div>
          <p className="text-sm text-gray-600 ml-6">{description.indication}</p>
        </div>
      </div>
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-3 border-t border-gray-200 bg-white rounded-b-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
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
              colorClass="text-red-600"
            />
            <InfoSection
              icon={Zap}
              title="Side Effects"
              content={description.sideEffects}
              colorClass="text-orange-600"
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

  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionFormData>({
      patientId: "",
      diseaseDescription: "",
      followUpDate: null,
      advice: "",
    });

  const [medicines, setMedicines] = useState<MedicineForm[]>([
    { medicine: "", dosage: "", timing: "", instructions: "" },
  ]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);

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

    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch patients");
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

    const fetchMedicines = async () => {
      setIsLoadingMedicines(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/medicines/search`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch medicines");
        const data: Medicine[] = await response.json();
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

  const debouncedPatientSearch = useCallback(
    debounce((searchTerm: string) => {
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
    }, 300),
    [patients]
  );

  const debouncedMedicineSearch = useCallback(
    debounce((searchTerm: string, index: number) => {
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
    }, 300),
    [medicinesList]
  );

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

    const findMedicineId = (medicineName: string) => {
      const foundMedicine = medicinesList.find(
        (med) => med.name.toLowerCase() === medicineName.toLowerCase()
      );
      return foundMedicine ? foundMedicine.id : null;
    };

    setIsSubmitting(true);
    try {
      const transformedMedicines = medicines.map((med) => {
        const medicineId = findMedicineId(med.medicine);
        if (!medicineId) {
          throw new Error(`Medicine "${med.medicine}" not found in database`);
        }

        return {
          medicineId: medicineId,
          durationDays: 7,
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
        appointmentId: null,
        medicines: transformedMedicines,
        createdAt: new Date().toISOString(),
      };

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
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Stethoscope className="text-blue-600" size={32} />
            New Prescription
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Create a prescription with patient details, medications, and
            follow-up instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 shadow-lg rounded-xl bg-white">
            {/* Patient Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-blue-600" size={24} />
                <Label
                  htmlFor="patientSearch"
                  className="text-xl font-semibold text-gray-900"
                >
                  Select Patient
                </Label>
              </div>
              <div className="relative">
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
                      : "Search by name, email, phone, or ID"
                  }
                  className="pl-10 py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingPatients}
                  required
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {showPatientDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, i) => (
                        <div
                          key={patient.id}
                          className={`px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                            i === selectedPatientIndex ? "bg-blue-50" : ""
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-semibold text-gray-900 text-lg">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.email} • {patient.phone}
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.gender} • Born:{" "}
                            {new Date(patient.birthDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-3 text-gray-500 text-center">
                        No patients found
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

            {/* Disease Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-blue-600" size={24} />
                <Label
                  htmlFor="diseaseDescription"
                  className="text-xl font-semibold text-gray-900"
                >
                  Diagnosis
                </Label>
              </div>
              <Textarea
                id="diseaseDescription"
                name="diseaseDescription"
                value={prescriptionData.diseaseDescription}
                onChange={handleInputChange}
                placeholder="Enter diagnosis or disease description"
                className="h-32 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Medicines Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Pill className="text-blue-600" size={24} />
                  <Label className="text-xl font-semibold text-gray-900">
                    Medications
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={addMedicineField}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-2" size={18} /> Add Medication
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="p-6 mb-4 border border-gray-200 rounded-xl bg-gray-50 relative"
                >
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineField(index)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <Label
                        htmlFor={`medicine-${index}`}
                        className="block mb-2 font-medium text-gray-800"
                      >
                        Medication Name
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
                              ? "Loading medications..."
                              : "Search for medication"
                          }
                          className="pl-10 py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                          disabled={isLoadingMedicines}
                          required
                        />
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        {showMedicineDropdown[index] &&
                          activeSearchIndex === index && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                              {filteredMedicines[index]?.length > 0 ? (
                                filteredMedicines[index].map((med, i) => (
                                  <MedicineDropdownCard
                                    key={med.id}
                                    medicine={med}
                                    isSelected={i === selectedIndex[index]}
                                    onClick={() =>
                                      handleMedicineSelect(index, med)
                                    }
                                    index={i}
                                    selectedIndex={selectedIndex[index]}
                                  />
                                ))
                              ) : (
                                <div className="p-6 text-center text-gray-500">
                                  <Pill
                                    className="mx-auto mb-3 text-gray-400"
                                    size={28}
                                  />
                                  <p>No medications found</p>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor={`dosage-${index}`}
                        className="block mb-2 font-medium text-gray-800"
                      >
                        Dosage
                      </Label>
                      <Select
                        value={medicine.dosage}
                        onValueChange={(value) =>
                          handleMedicineChange(index, "dosage", value)
                        }
                      >
                        <SelectTrigger
                          id={`dosage-${index}`}
                          className="py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        >
                          <SelectValue placeholder="Select dosage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-0-1">1-0-1</SelectItem>
                          <SelectItem value="1-1-1">1-1-1</SelectItem>
                          <SelectItem value="0-0-1">0-0-1</SelectItem>
                          <SelectItem value="1-0-0">1-0-0</SelectItem>
                          <SelectItem value="sos">As needed (SOS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor={`timing-${index}`}
                        className="block mb-2 font-medium text-gray-800"
                      >
                        When to Take
                      </Label>
                      <Select
                        value={medicine.timing}
                        onValueChange={(value) =>
                          handleMedicineChange(index, "timing", value)
                        }
                      >
                        <SelectTrigger
                          id={`timing-${index}`}
                          className="py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        >
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before_meal">
                            Before meals
                          </SelectItem>
                          <SelectItem value="after_meal">
                            After meals
                          </SelectItem>
                          <SelectItem value="with_meal">With meals</SelectItem>
                          <SelectItem value="empty_stomach">
                            On empty stomach
                          </SelectItem>
                          <SelectItem value="bedtime">At bedtime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor={`instructions-${index}`}
                        className="block mb-2 font-medium text-gray-800"
                      >
                        Special Instructions (Optional)
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
                        placeholder="Any special instructions"
                        className="py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Follow-up Date */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-blue-600" size={24} />
                <Label
                  htmlFor="followUpDate"
                  className="text-xl font-semibold text-gray-900"
                >
                  Follow-up Date
                </Label>
              </div>
              <DatePicker
                selected={prescriptionData.followUpDate}
                onSelect={handleDateChange}
                placeholder="Select follow-up date"
                disabled={(date) => date < new Date()}
                className="py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Advice */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-blue-600" size={24} />
                <Label
                  htmlFor="advice"
                  className="text-xl font-semibold text-gray-900"
                >
                  Advice
                </Label>
              </div>
              <Textarea
                id="advice"
                name="advice"
                value={prescriptionData.advice}
                onChange={handleInputChange}
                placeholder="Enter advice for the patient"
                className="h-32 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 text-lg rounded-lg"
              >
                {isSubmitting ? "Submitting..." : "Create Prescription"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default NewPrescription;
