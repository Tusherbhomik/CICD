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
import { debounce } from "lodash";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Pill,
  Plus,
  Search,
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
      className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onClick={onClick}
    >
      {/* Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="text-blue-600" size={18} />
              <h3 className="font-semibold text-gray-900 text-base">
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
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Quick Preview - Always Visible */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-blue-600" />
            <span className="font-medium text-sm text-gray-700">
              Primary Indication
            </span>
          </div>
          <p className="text-sm text-gray-600 ml-5">{description.indication}</p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-white">
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
        // const response = await fetch("http://localhost:8080/api/patients", {
        const response = await fetch('http://localhost:8080/patients', {
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
          "http://localhost:8080/api/medicines/search",
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

  // Debounced search for patients (fuzzy search)
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

  // Debounced search for medicines (fuzzy search)
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

      const response = await fetch("http://localhost:8080/api/prescriptions", {
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
      <div className="medical-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Prescription
          </h1>
          <p className="text-gray-600">
            Fill out the form below to write a prescription for a patient.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            {/* Patient Selection */}
            <div className="mb-6">
              <Label htmlFor="patientSearch" className="text-lg font-medium">
                Patient Information
              </Label>
              <div className="mt-2 relative">
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
                        : "Search for patient by name, email, phone, or ID"
                    }
                    className="pl-9"
                    disabled={isLoadingPatients}
                    required
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                </div>
                {showPatientDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, i) => (
                        <div
                          key={patient.id}
                          className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-b-0 ${
                            i === selectedPatientIndex ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-medium text-gray-900">
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
                      <div className="px-4 py-2 text-gray-500">
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
            <div className="mb-6">
              <Label
                htmlFor="diseaseDescription"
                className="text-lg font-medium"
              >
                Diagnosis / Disease Description
              </Label>
              <div className="mt-2">
                <Textarea
                  id="diseaseDescription"
                  name="diseaseDescription"
                  value={prescriptionData.diseaseDescription}
                  onChange={handleInputChange}
                  placeholder="Enter diagnosis or disease description"
                  className="h-24"
                  required
                />
              </div>
            </div>

            {/* Medicines Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium">Medicines</Label>
                <Button
                  type="button"
                  onClick={addMedicineField}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-medical-primary border-medical-primary"
                >
                  <Plus className="mr-1" size={16} /> Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="p-4 mb-4 border border-gray-200 rounded-md bg-gray-50 relative"
                >
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineField(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label
                        htmlFor={`medicine-${index}`}
                        className="block mb-1"
                      >
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
                          className="pl-9"
                          disabled={isLoadingMedicines}
                          required
                        />
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          size={16}
                        />
                        {showMedicineDropdown[index] &&
                          activeSearchIndex === index && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-96 overflow-y-auto">
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
                                <div className="p-4 text-center text-gray-500">
                                  <Pill
                                    className="mx-auto mb-2 text-gray-400"
                                    size={24}
                                  />
                                  <p>No medicines found</p>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`} className="block mb-1">
                        Dosage
                      </Label>
                      <Select
                        value={medicine.dosage}
                        onValueChange={(value) =>
                          handleMedicineChange(index, "dosage", value)
                        }
                      >
                        <SelectTrigger id={`dosage-${index}`}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`timing-${index}`} className="block mb-1">
                        When to Take
                      </Label>
                      <Select
                        value={medicine.timing}
                        onValueChange={(value) =>
                          handleMedicineChange(index, "timing", value)
                        }
                      >
                        <SelectTrigger id={`timing-${index}`}>
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
                        className="block mb-1"
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
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Follow-up Date */}
            <div className="mb-6">
              <Label htmlFor="followUpDate" className="text-lg font-medium">
                Follow-up Date
              </Label>
              <div className="mt-2">
                <DatePicker
                  selected={prescriptionData.followUpDate}
                  onSelect={handleDateChange}
                  placeholder="Select follow-up date"
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>

            {/* Advice */}
            <div className="mb-6">
              <Label htmlFor="advice" className="text-lg font-medium">
                Advice
              </Label>
              <div className="mt-2">
                <Textarea
                  id="advice"
                  name="advice"
                  value={prescriptionData.advice}
                  onChange={handleInputChange}
                  placeholder="Enter advice"
                  className="h-24"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default NewPrescription;
