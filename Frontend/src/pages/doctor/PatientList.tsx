import MainLayout from "@/components/layout/MainLayout";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Filter,
  Pill,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/prescriptions/doctor",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Add your authorization header here if needed
              // 'Authorization': `Bearer ${token}`
            },
            credentials: "include", // If you're using cookies for auth
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  //you fool how dare you use this logic?//

  const getMedicationStatus = (prescription) => {
    const today = new Date();
    const followUpDate = new Date(prescription.followUpDate);
    return followUpDate > today ? "Active" : "Completed";
  };

  const togglePrescriptionExpansion = (prescriptionId) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  const downloadPrescriptionPDF = async (prescription) => {
    try {
      // Create a script element to load jsPDF
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

      // Wait for script to load
      const loadScript = new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      await loadScript;

      // Access jsPDF from window object
      const { jsPDF } = (window as any).jspdf;

      const doc = new jsPDF();

      // Set up the document
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Medical Prescription", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 15;
      doc.setFontSize(16);
      doc.text(`Prescription #${prescription.id}`, pageWidth / 2, yPosition, {
        align: "center",
      });

      // Draw line
      yPosition += 10;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;

      // Patient and Doctor Info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const info = [
        `Patient: ${prescription.patient.name}`,
        `Doctor: ${prescription.doctor.name}`,
        `Issue Date: ${formatDate(prescription.issueDate)}`,
        `Follow-up Date: ${formatDate(prescription.followUpDate)}`,
        `Diagnosis: ${prescription.diagnosis}`,
      ];

      info.forEach((text) => {
        doc.text(text, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Medicines Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Prescribed Medications:", margin, yPosition);
      yPosition += 15;

      // Medicines
      prescription.medicines.forEach((med: any, index: number) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }

        // Medicine name
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${med.medicine.name}`, margin, yPosition);
        yPosition += 8;

        // Medicine details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const details = [
          `Generic Name: ${med.medicine.genericName}`,
          `Strength: ${med.medicine.strength}`,
          `Form: ${med.medicine.form}`,
          `Duration: ${med.durationDays} days`,
          `Manufacturer: ${med.medicine.manufacturer}`,
          `Price: ৳${med.medicine.price}`,
        ];

        details.forEach((detail) => {
          doc.text(detail, margin + 10, yPosition);
          yPosition += 6;
        });

        // Timing information
        yPosition += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Dosage Schedule:", margin + 10, yPosition);
        yPosition += 6;

        doc.setFont("helvetica", "normal");
        med.timings.forEach((timing: any) => {
          const timeText = `${timing.timeOfDay} at ${timing.specificTime} - ${
            timing.amount
          } ${med.medicine.form.toLowerCase()}`;
          const mealText = `Take ${timing.mealRelation
            .replace("_", " ")
            .toLowerCase()}`;

          doc.text(`• ${timeText}`, margin + 15, yPosition);
          yPosition += 5;
          doc.text(`  ${mealText}`, margin + 15, yPosition);
          yPosition += 6;
        });

        // Special instructions
        if (med.specialInstructions) {
          yPosition += 3;
          doc.setFont("helvetica", "bold");
          doc.text("Special Instructions:", margin + 10, yPosition);
          yPosition += 6;
          doc.setFont("helvetica", "normal");

          // Split long text into multiple lines
          const splitText = doc.splitTextToSize(
            med.specialInstructions,
            pageWidth - margin - 30
          );
          splitText.forEach((line: string) => {
            doc.text(line, margin + 15, yPosition);
            yPosition += 5;
          });
        }

        yPosition += 10;
      });

      // Doctor's advice
      if (prescription.advice) {
        if (yPosition > 230) {
          doc.addPage();
          yPosition = 30;
        }

        yPosition += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Doctor's Advice:", margin, yPosition);
        yPosition += 8;
        doc.setFont("helvetica", "normal");

        const splitAdvice = doc.splitTextToSize(
          prescription.advice,
          pageWidth - 2 * margin
        );
        splitAdvice.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          margin,
          doc.internal.pageSize.getHeight() - 20
        );
        doc.text(
          "This is a computer-generated prescription. Please consult your healthcare provider for any questions.",
          margin,
          doc.internal.pageSize.getHeight() - 12
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          doc.internal.pageSize.getHeight() - 20
        );
      }

      // Save the PDF
      const fileName = `Prescription_${
        prescription.id
      }_${prescription.patient.name.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);

      // Clean up - remove script after use
      document.head.removeChild(script);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to simple text download
      const textContent = `
MEDICAL PRESCRIPTION

Prescription #${prescription.id}

Patient: ${prescription.patient.name}
Doctor: ${prescription.doctor.name}
Issue Date: ${formatDate(prescription.issueDate)}
Follow-up Date: ${formatDate(prescription.followUpDate)}
Diagnosis: ${prescription.diagnosis}

PRESCRIBED MEDICATIONS:

${prescription.medicines
  .map(
    (med: any, index: number) => `
${index + 1}. ${med.medicine.name}
   Generic Name: ${med.medicine.genericName}
   Strength: ${med.medicine.strength}
   Form: ${med.medicine.form}
   Duration: ${med.durationDays} days
   
   Dosage Schedule:
${med.timings
  .map(
    (timing: any) => `   • ${timing.timeOfDay} at ${timing.specificTime} - ${
      timing.amount
    } ${med.medicine.form.toLowerCase()}
     Take ${timing.mealRelation.replace("_", " ").toLowerCase()}`
  )
  .join("\n")}
   
   ${
     med.specialInstructions
       ? `Special Instructions: ${med.specialInstructions}`
       : ""
   }
`
  )
  .join("\n")}

${prescription.advice ? `Doctor's Advice: ${prescription.advice}` : ""}

Generated on ${new Date().toLocaleDateString()}
This is a computer-generated prescription.
      `;

      const blob = new Blob([textContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Prescription_${
        prescription.id
      }_${prescription.patient.name.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const formatTimeOfDay = (timeOfDay) => {
    const timeMap = {
      MORNING: "🌅 Morning",
      AFTERNOON: "☀️ Afternoon",
      EVENING: "🌅 Evening",
      NIGHT: "🌙 Night",
    };
    return timeMap[timeOfDay] || timeOfDay;
  };

  const formatMealRelation = (mealRelation) => {
    const mealMap = {
      BEFORE_MEAL: "🍽️ Before meals",
      AFTER_MEAL: "🍽️ After meals",
      WITH_MEAL: "🍽️ With meals",
      EMPTY_STOMACH: "⭕ Empty stomach",
    };
    return (
      mealMap[mealRelation] || mealRelation.replace("_", " ").toLowerCase()
    );
  };

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading prescriptions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="doctor">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading prescriptions: {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="doctor">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">My Prescriptions</h1>
          <p className="text-gray-600">
            View and manage prescriptions you've written
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, diagnosis, or prescription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
            <span>Filter</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {prescriptions.length}
                </h3>
                <p className="text-sm text-gray-600">Total Prescriptions</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {new Set(prescriptions.map((p) => p.patient.id)).size}
                </h3>
                <p className="text-sm text-gray-600">Unique Patients</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {
                    prescriptions.filter(
                      (p) => getMedicationStatus(p) === "Active"
                    ).length
                  }
                </h3>
                <p className="text-sm text-gray-600">Active Prescriptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No prescriptions found matching your search"
                  : "No prescriptions found"}
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => {
              const isExpanded = expandedPrescriptions.has(prescription.id);
              return (
                <div key={prescription.id} className="card">
                  {/* Prescription Header - Clickable */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => togglePrescriptionExpansion(prescription.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          Prescription #{prescription.id}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Patient: {prescription.patient.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(prescription.issueDate)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          getMedicationStatus(prescription) === "Active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {getMedicationStatus(prescription)}
                      </span>
                      <button
                        className="btn-secondary flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPrescriptionPDF(prescription);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Prescription Details - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        {/* Patient Info */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">
                            Patient Information
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-blue-600 font-medium">
                                Name:
                              </span>
                              <p className="text-blue-800">
                                {prescription.patient.name}
                              </p>
                            </div>
                            <div>
                              <span className="text-blue-600 font-medium">
                                Email:
                              </span>
                              <p className="text-blue-800">
                                {prescription.patient.email}
                              </p>
                            </div>
                            <div>
                              <span className="text-blue-600 font-medium">
                                Phone:
                              </span>
                              <p className="text-blue-800">
                                {prescription.patient.phone}
                              </p>
                            </div>
                            <div>
                              <span className="text-blue-600 font-medium">
                                Gender:
                              </span>
                              <p className="text-blue-800">
                                {prescription.patient.gender}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Medicines */}
                        {prescription.medicines.map((medicineItem, index) => (
                          <div
                            key={index}
                            className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Pill className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-semibold text-lg text-gray-800">
                                    {medicineItem.medicine.name}
                                  </h4>
                                </div>
                                <p className="text-gray-600 mb-3 font-medium">
                                  {medicineItem.medicine.genericName}
                                </p>

                                {/* Medicine Quick Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                  <div className="bg-blue-50 p-2 rounded-lg text-center">
                                    <p className="text-xs text-blue-600 font-medium">
                                      Strength
                                    </p>
                                    <p className="text-sm font-semibold text-blue-800">
                                      {medicineItem.medicine.strength}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded-lg text-center">
                                    <p className="text-xs text-green-600 font-medium">
                                      Form
                                    </p>
                                    <p className="text-sm font-semibold text-green-800">
                                      {medicineItem.medicine.form}
                                    </p>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded-lg text-center">
                                    <p className="text-xs text-purple-600 font-medium">
                                      Duration
                                    </p>
                                    <p className="text-sm font-semibold text-purple-800">
                                      {medicineItem.durationDays} days
                                    </p>
                                  </div>
                                  <div className="bg-orange-50 p-2 rounded-lg text-center">
                                    <p className="text-xs text-orange-600 font-medium">
                                      Price
                                    </p>
                                    <p className="text-sm font-semibold text-orange-800">
                                      ৳{medicineItem.medicine.price}
                                    </p>
                                  </div>
                                </div>

                                {/* Timing Schedule */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    <span className="font-medium text-gray-700">
                                      Dosage Schedule:
                                    </span>
                                  </div>
                                  {medicineItem.timings.map(
                                    (timing, timingIndex) => (
                                      <div
                                        key={timingIndex}
                                        className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-300"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-indigo-800">
                                            {formatTimeOfDay(timing.timeOfDay)}{" "}
                                            - {timing.specificTime}
                                          </span>
                                          <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {timing.amount}{" "}
                                            {medicineItem.medicine.form.toLowerCase()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-indigo-700">
                                          {formatMealRelation(
                                            timing.mealRelation
                                          )}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>

                                {/* Special Instructions */}
                                {medicineItem.specialInstructions && (
                                  <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-300 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <AlertCircle className="w-4 h-4 text-amber-600" />
                                      <span className="font-medium text-amber-800">
                                        Special Instructions:
                                      </span>
                                    </div>
                                    <p className="text-sm text-amber-700">
                                      {medicineItem.specialInstructions}
                                    </p>
                                  </div>
                                )}

                                {/* Manufacturer Info */}
                                <div className="mt-3 text-xs text-gray-500">
                                  <p>
                                    <strong>Manufacturer:</strong>{" "}
                                    {medicineItem.medicine.manufacturer}
                                  </p>
                                  <p>
                                    <strong>Category:</strong>{" "}
                                    {medicineItem.medicine.category}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {prescription.advice && (
                          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-800">
                                Doctor's Advice:
                              </p>
                              <p className="text-sm text-yellow-700">
                                {prescription.advice}
                              </p>
                            </div>
                          </div>
                        )}

                        {prescription.followUpDate && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              <strong>Follow-up Date:</strong>{" "}
                              {formatDate(prescription.followUpDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorPrescriptions;
