





import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
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
          `${API_BASE_URL}/api/prescriptions/doctor`,
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
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

      const loadScript = (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load jsPDF"));
          document.head.appendChild(script);
        });
      };

      await loadScript();

      if (!window.jspdf?.jsPDF) {
        throw new Error("jsPDF library failed to load");
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      const addNewPageIfNeeded = (spaceNeeded: number = 30) => {
        if (yPosition + spaceNeeded > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
          addHeader();
          // addWatermark();
        }
      };

      const addHeader = () => {
        // Gradient header
        for (let i = 0; i < 50; i++) {
          doc.setFillColor(33, 150 - i * 2, 243);
          doc.rect(0, i, pageWidth, 1, "F");
        }

        // Logo placeholder
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, 10, 30, 30, "F");
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(margin, 10, 30, 30);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Logo", margin + 10, 25, { align: "center" });

        // Title
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("Medical Prescription", margin + 40, 25);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Dr. ${prescription.doctor.name}`, margin + 40, 35);

        // Rx Symbol
        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.text("Rx", pageWidth - 40, 35);

        // Header line
        doc.setLineWidth(0.3);
        doc.setDrawColor(255, 255, 255);
        doc.line(margin, 50, pageWidth - margin, 50);
        yPosition = 60;
      };

      // const addWatermark = () => {
      //   doc.setFontSize(40);
      //   doc.setTextColor(200, 200, 200);
      //   doc.setFont("helvetica", "italic");
      // };

      // First page setup
      addHeader();
      // addWatermark();

      // Doctor Information
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("Physician Details", margin, yPosition);
      yPosition += 10;

      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(66, 66, 66);
      yPosition += 7;
      doc.text(prescription.doctor.name, margin + 5, yPosition);
      yPosition += 5;
      if (prescription.doctor.specialization) {
        doc.text(
          `Specialization: ${prescription.doctor.specialization}`,
          margin + 5,
          yPosition
        );
        yPosition += 5;
      }
      if (prescription.doctor.contactNumber) {
        doc.text(
          `Contact: ${prescription.doctor.contactNumber}`,
          margin + 5,
          yPosition
        );
        yPosition += 5;
      }
      yPosition += 10;

      // Patient Information
      const tableWidth = pageWidth - 2 * margin;
      const colWidth = tableWidth / 3;
      const rowHeight = 12;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("Patient Details", margin, yPosition);
      yPosition += 10;

      // Patient info table
      doc.setFillColor(235, 245, 255);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPosition, tableWidth, rowHeight, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      doc.text("Name", margin + 5, yPosition + 8);
      doc.text("Date", margin + colWidth + 5, yPosition + 8);
      // doc.text("Patient ID", margin + 2 * colWidth + 5, yPosition + 8);
      yPosition += rowHeight;

      doc.setFillColor(255, 255, 255);
      doc.rect(margin, yPosition, tableWidth, rowHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.text(prescription.patient.name, margin + 5, yPosition + 8);
      doc.text(
        formatDate(prescription.issueDate),
        margin + colWidth + 5,
        yPosition + 8
      );
      doc.text(
        prescription.patient.id.toString(),
        margin + 2 * colWidth + 5,
        yPosition + 8
      );
      yPosition += rowHeight + 15;

      // Diagnosis
      addNewPageIfNeeded(30);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("Diagnosis", margin, yPosition);
      yPosition += 10;

      doc.setFillColor(245, 245, 245);
      const diagnosisHeight = 25;
      doc.rect(margin, yPosition, tableWidth, diagnosisHeight, "FD");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(66, 66, 66);
      const diagnosisLines = doc.splitTextToSize(
        prescription.diagnosis,
        tableWidth - 10
      );
      let diagnosisY = yPosition + 7;
      diagnosisLines.forEach((line: string) => {
        doc.text(line, margin + 5, diagnosisY);
        diagnosisY += 5;
      });
      yPosition += diagnosisHeight + 15;

      // Medications
      addNewPageIfNeeded(40);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("Medications", margin, yPosition);
      yPosition += 10;

      prescription.medicines.forEach((medicineItem, index) => {
        const baseSpace = 30;
        const timingSpace = medicineItem.timings.length * 6;
        const instructionSpace = medicineItem.specialInstructions ? 12 : 0;
        const totalSpace = baseSpace + timingSpace + instructionSpace;

        addNewPageIfNeeded(totalSpace);

        // Medicine header
        doc.setFillColor(230, 242, 255);
        doc.setDrawColor(33, 150, 243);
        doc.setLineWidth(0.3);
        doc.rect(margin, yPosition, tableWidth, 14, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        doc.text(
          `${index + 1}. ${medicineItem.medicine.name} (${
            medicineItem.medicine.strength
          })`,
          margin + 5,
          yPosition + 10
        );
        yPosition += 14;

        // Medicine details
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPosition, tableWidth, 10, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(66, 66, 66);
        doc.text(
          `${medicineItem.medicine.genericName} | ${medicineItem.medicine.form} | ${medicineItem.durationDays} days`,
          margin + 5,
          yPosition + 7
        );
        yPosition += 10;

        // Dosage schedule
        doc.setFillColor(240, 248, 255);
        const dosageHeight = medicineItem.timings.length * 6 + 6;
        doc.rect(margin, yPosition, tableWidth, dosageHeight, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        let dosageY = yPosition + 5;
        medicineItem.timings.forEach((timing) => {
          const timeOfDayFormatted =
            timing.timeOfDay.charAt(0) +
            timing.timeOfDay.slice(1).toLowerCase();
          const mealFormatted = timing.mealRelation
            .replace("_", " ")
            .toLowerCase();
          const dosageText = `${
            timing.amount
          } ${medicineItem.medicine.form.toLowerCase()}, ${timeOfDayFormatted} (${
            timing.specificTime
          }), ${mealFormatted}`;
          doc.text(dosageText, margin + 7, dosageY);
          dosageY += 6;
        });
        yPosition += dosageHeight;

        // Special instructions
        if (medicineItem.specialInstructions) {
          doc.setFillColor(255, 245, 230);
          doc.setDrawColor(255, 165, 0);
          doc.rect(margin, yPosition, tableWidth, 10, "FD");
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(139, 69, 19);
          const instructionText = doc.splitTextToSize(
            `Note: ${medicineItem.specialInstructions}`,
            tableWidth - 10
          );
          doc.text(instructionText[0], margin + 5, yPosition + 7);
          yPosition += 10;
          if (instructionText.length > 1) {
            doc.text(instructionText[1], margin + 5, yPosition + 7);
            yPosition += 10;
          }
        }

        yPosition += 8;
      });

      // Advice section
      if (prescription.advice) {
        yPosition += 5;
        addNewPageIfNeeded(30);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("Doctor's Advice", margin, yPosition);
        yPosition += 10;

        doc.setFillColor(235, 245, 235);
        doc.setDrawColor(76, 175, 80);
        const adviceLines = doc.splitTextToSize(
          prescription.advice,
          tableWidth - 10
        );
        const adviceHeight = Math.max(20, adviceLines.length * 6 + 6);
        doc.rect(margin, yPosition, tableWidth, adviceHeight, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(27, 94, 32);
        let adviceY = yPosition + 7;
        adviceLines.forEach((line: string) => {
          doc.text(line, margin + 5, adviceY);
          adviceY += 6;
        });
        yPosition += adviceHeight + 15;
      }

      // Footer
      addNewPageIfNeeded(30);
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageHeight - 30, pageWidth, 30, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("Physician Signature:", pageWidth - 80, yPosition);
      doc.setLineWidth(0.3);
      doc.setDrawColor(33, 150, 243);
      doc.line(pageWidth - 80, yPosition + 5, pageWidth - 20, yPosition + 5);
      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Dr. ${prescription.doctor.name}`, pageWidth - 80, yPosition);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on: ${formatDate(new Date().toISOString())}`,
        margin,
        pageHeight - 15
      );
      doc.text(
        "Confidential Medical Document",
        pageWidth - margin,
        pageHeight - 15,
        { align: "right" }
      );

      const fileName = `Prescription_${
        prescription.id
      }_${prescription.patient.name.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      document.head.removeChild(script);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const textContent = `
Prescription #${prescription.id}

Patient: ${prescription.patient.name}
Patient ID: ${prescription.patient.id}

Doctor: ${prescription.doctor.name}
Issue Date: ${formatDate(prescription.issueDate)}
Follow-up Date: ${formatDate(prescription.followUpDate)}
Diagnosis: ${prescription.diagnosis}

Medications:
${prescription.medicines
  .map(
    (med, index) => `
${index + 1}. ${med.medicine.name}
   Generic Name: ${med.medicine.genericName}
   Strength: ${med.medicine.strength}
   Form: ${med.medicine.form}
   Duration: ${med.durationDays} days
   Dosage: ${med.timings
     .map(
       (t) =>
         `${
           t.amount
         } ${med.medicine.form.toLowerCase()}, ${t.timeOfDay.toLowerCase()} (${
           t.specificTime
         }), ${t.mealRelation.replace("_", " ").toLowerCase()}`
     )
     .join("; ")}
   ${med.specialInstructions ? `Instructions: ${med.specialInstructions}` : ""}
`
  )
  .join("\n")}

${prescription.advice ? `Doctor's Advice: ${prescription.advice}` : ""}

Generated on ${formatDate(new Date().toISOString())}
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
