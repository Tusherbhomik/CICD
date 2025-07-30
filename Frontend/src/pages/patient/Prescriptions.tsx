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
  Pill,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

// Type definitions for jsPDF
declare global {
  interface Window {
    jspdf: {
      jsPDF: new () => jsPDFDocument;
    };
  }
}

interface jsPDFDocument {
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
    getNumberOfPages(): number;
  };
  setFontSize(size: number): void;
  setFont(fontName: string, fontStyle: string): void;
  setTextColor(r: number, g: number, b: number): void;
  setLineWidth(width: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  text(text: string, x: number, y: number, options?: { align?: string }): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    style?: string
  ): void;
  splitTextToSize(text: string, maxWidth: number): string[];
  addPage(): void;
  setPage(pageNumber: number): void;
  save(filename: string): void;
}

interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength: string;
  form: string;
}

interface Timing {
  timeOfDay: string;
  specificTime: string;
  amount: string;
  mealRelation: string;
}

interface MedicineItem {
  medicine: Medicine;
  durationDays: number;
  timings: Timing[];
  specialInstructions?: string;
}

interface Doctor {
  name: string;
  specialization?: string;
  contactNumber?: string;
}

interface Patient {
  name: string;
  id: number;
}

interface Prescription {
  id: number;
  patient: Patient;
  doctor: Doctor;
  issueDate: string;
  followUpDate: string;
  diagnosis: string;
  medicines: MedicineItem[];
  advice?: string;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState(
    new Set<number>()
  );

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/prescriptions/patient`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const data: Prescription[] = await response.json();
        setPrescriptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMedicationStatus = (prescription: Prescription): string => {
    const today = new Date();
    const followUpDate = new Date(prescription.followUpDate);
    return followUpDate > today ? "Active" : "Completed";
  };

  const togglePrescriptionExpansion = (prescriptionId: number) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  const downloadPrescriptionPDF = async (prescription: Prescription) => {
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
      const doc: jsPDFDocument = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      const addNewPageIfNeeded = (spaceNeeded: number = 30) => {
        if (yPosition + spaceNeeded > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
          addHeader();
          addWatermark();
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

      const addWatermark = () => {
        doc.setFontSize(40);
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "italic");
        doc.text("Medical Document", pageWidth / 2, pageHeight / 2, {
          align: "center",
        });
      };

      // First page setup
      addHeader();
      addWatermark();

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
      doc.text("Patient ID", margin + 2 * colWidth + 5, yPosition + 8);
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

  const formatTimeOfDay = (timeOfDay: string): string => {
    const timeMap: Record<string, string> = {
      MORNING: "🌅 Morning",
      AFTERNOON: "☀️ Afternoon",
      EVENING: "🌅 Evening",
      NIGHT: "🌙 Night",
    };
    return timeMap[timeOfDay] || timeOfDay;
  };

  const formatMealRelation = (mealRelation: string): string => {
    const mealMap: Record<string, string> = {
      BEFORE_MEAL: "🍽️ Before meals",
      AFTER_MEAL: "🍽️ After meals",
      WITH_MEAL: "🍽️ With meals",
      EMPTY_STOMACH: "⭕ Empty stomach",
    };
    return (
      mealMap[mealRelation] || mealRelation.replace("_", " ").toLowerCase()
    );
  };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-700 text-lg font-medium">
              Loading your prescriptions...
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Prescriptions
            </h1>
            <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
              Access, view, and download your medical prescriptions with ease
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                {prescriptions.length} Prescription
                {prescriptions.length !== 1 ? "s" : ""} Available
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {prescriptions.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No prescriptions found
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  You don't have any prescriptions yet
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium">
                  Schedule an Appointment
                </button>
              </div>
            ) : (
              prescriptions.map((prescription) => {
                const isExpanded = expandedPrescriptions.has(prescription.id);
                return (
                  <div
                    key={prescription.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300"
                  >
                    <div
                      className="flex items-center justify-between p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                      onClick={() =>
                        togglePrescriptionExpansion(prescription.id)
                      }
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              #{prescription.id}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2">
                            Prescription #{prescription.id}
                          </h3>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                              <Calendar className="w-4 h-4" />
                              {formatDate(prescription.issueDate)}
                            </span>
                            <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                              <User className="w-4 h-4" />
                              Dr. {prescription.doctor.name}
                            </span>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md">
                            <p className="text-sm font-medium text-amber-800">
                              <strong>Diagnosis:</strong>{" "}
                              {prescription.diagnosis}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              getMedicationStatus(prescription) === "Active"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                            }`}
                          >
                            {getMedicationStatus(prescription)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {prescription.medicines.length} Medicine
                            {prescription.medicines.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPrescriptionPDF(prescription);
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-8 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50 space-y-8">
                        {/* Doctor Information Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                              Doctor Information
                            </h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500">
                                Name
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                Dr. {prescription.doctor.name}
                              </p>
                            </div>
                            {prescription.doctor.specialization && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-500">
                                  Specialization
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {prescription.doctor.specialization}
                                </p>
                              </div>
                            )}
                            {prescription.doctor.contactNumber && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-500">
                                  Contact
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {prescription.doctor.contactNumber}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Patient Information Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                              Patient Information
                            </h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500">
                                Name
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {prescription.patient.name}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500">
                                Patient ID
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                #{prescription.patient.id}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Medicines Section */}
                        <div className="space-y-6">
                          {prescription.medicines.map((medicineItem, index) => (
                            <div
                              key={index}
                              className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <Pill className="w-6 h-6 text-blue-600" />
                                    <h4 className="font-semibold text-xl text-gray-900">
                                      {medicineItem.medicine.name}
                                    </h4>
                                  </div>
                                  <p className="text-gray-600 mb-4 font-medium">
                                    {medicineItem.medicine.genericName}
                                  </p>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-blue-600 font-medium">
                                        Strength
                                      </p>
                                      <p className="text-sm font-semibold text-blue-800">
                                        {medicineItem.medicine.strength}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-green-600 font-medium">
                                        Form
                                      </p>
                                      <p className="text-sm font-semibold text-green-800">
                                        {medicineItem.medicine.form}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                                      <p className="text-xs text-purple-600 font-medium">
                                        Duration
                                      </p>
                                      <p className="text-sm font-semibold text-purple-800">
                                        {medicineItem.durationDays} days
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-5 h-5 text-indigo-600" />
                                      <span className="font-medium text-gray-700">
                                        Dosage Schedule:
                                      </span>
                                    </div>
                                    {medicineItem.timings.map(
                                      (timing, timingIndex) => (
                                        <div
                                          key={timingIndex}
                                          className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-indigo-800">
                                              {formatTimeOfDay(
                                                timing.timeOfDay
                                              )}{" "}
                                              - {timing.specificTime}
                                            </span>
                                            <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
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

                                  {medicineItem.specialInstructions && (
                                    <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <span className="font-medium text-amber-800">
                                          Special Instructions:
                                        </span>
                                      </div>
                                      <p className="text-sm text-amber-700">
                                        {medicineItem.specialInstructions}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <span
                                  className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ml-4 ${
                                    getMedicationStatus(prescription) ===
                                    "Active"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                                  }`}
                                >
                                  {getMedicationStatus(prescription)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {prescription.advice && (
                          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-yellow-800">
                                {prescription.advice}
                              </p>
                            </div>
                          </div>
                        )}

                        {prescription.followUpDate && (
                          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-start gap-2">
                              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-800">
                                <strong>Follow-up:</strong>{" "}
                                {formatDate(prescription.followUpDate)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Enhanced Action Cards */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Pill className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">
                    Request Refill
                  </h4>
                  <p className="text-gray-600">
                    Easily request refills for your current medications
                  </p>
                </div>
              </button>

              <button className="group p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">
                    Medication Schedule
                  </h4>
                  <p className="text-gray-600">
                    Set reminders and track your medication schedule
                  </p>
                </div>
              </button>

              <button className="group p-8 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 hover:border-amber-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">
                    Report Side Effects
                  </h4>
                  <p className="text-gray-600">
                    Report any adverse reactions or concerns
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;