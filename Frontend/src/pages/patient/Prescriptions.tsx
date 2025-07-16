import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from '@/url';
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
  rect(x: number, y: number, width: number, height: number, style?: string): void;
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
  const [expandedPrescriptions, setExpandedPrescriptions] = useState(new Set<number>());

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

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

    const addNewPageIfNeeded = (spaceNeeded: number = 20) => {
      if (yPosition + spaceNeeded > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
        addHeader();
      }
    };

    const addHeader = () => {
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 150, 243);
      doc.text("Prescription", margin, 25);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Dr. ${prescription.doctor.name}`, margin, 35);

      doc.setFontSize(36);
      doc.setTextColor(200, 200, 200);
      doc.text("Rx", pageWidth - 40, 35);

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 45, pageWidth - margin, 45);
      yPosition = 50;
    };

    // First page header
    addHeader();

    // Doctor Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Physician Details", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(prescription.doctor.name, margin, yPosition);
    yPosition += 5;
    if (prescription.doctor.specialization) {
      doc.text(`Specialization: ${prescription.doctor.specialization}`, margin, yPosition);
      yPosition += 5;
    }
    if (prescription.doctor.contactNumber) {
      doc.text(`Contact: ${prescription.doctor.contactNumber}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 10;

    // Patient Information
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 3;
    const rowHeight = 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Details", margin, yPosition);
    yPosition += 8;

    // Draw patient info table
    doc.setLineWidth(0.5);
    doc.setDrawColor(100, 100, 100);
    
    // Header row
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, tableWidth, rowHeight, 'FD');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Name", margin + 2, yPosition + 7);
    doc.text("Date", margin + colWidth + 2, yPosition + 7);
    doc.text("Patient ID", margin + 2 * colWidth + 2, yPosition + 7);
    yPosition += rowHeight;

    // Data row
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, yPosition, tableWidth, rowHeight, 'FD');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(prescription.patient.name, margin + 2, yPosition + 7);
    doc.text(formatDate(prescription.issueDate), margin + colWidth + 2, yPosition + 7);
    doc.text(prescription.patient.id.toString(), margin + 2 * colWidth + 2, yPosition + 7);
    yPosition += rowHeight + 15;

    // Diagnosis
    addNewPageIfNeeded(25);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis", margin, yPosition);
    yPosition += 8;

    doc.setFillColor(250, 250, 250);
    const diagnosisHeight = 20;
    doc.rect(margin, yPosition, tableWidth, diagnosisHeight, 'FD');
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, tableWidth - 6);
    let diagnosisY = yPosition + 5;
    diagnosisLines.forEach((line: string) => {
      doc.text(line, margin + 3, diagnosisY);
      diagnosisY += 4;
    });
    yPosition += diagnosisHeight + 15;

    // Medications - COMPACT VERSION
    addNewPageIfNeeded(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Medications", margin, yPosition);
    yPosition += 10;

    prescription.medicines.forEach((medicineItem, index) => {
      // Calculate actual space needed (much more conservative)
      const baseSpace = 25; // Base space for medicine info
      const timingSpace = medicineItem.timings.length * 4; // 4 units per timing
      const instructionSpace = medicineItem.specialInstructions ? 8 : 0;
      const totalSpace = baseSpace + timingSpace + instructionSpace;
      
      addNewPageIfNeeded(totalSpace);

      // Medicine name and basic info - COMPACT
      doc.setFillColor(248, 249, 250);
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.rect(margin, yPosition, tableWidth, 12, 'FD');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${medicineItem.medicine.name} (${medicineItem.medicine.strength})`, margin + 3, yPosition + 8);
      yPosition += 12;

      // Medicine details in ONE compact row
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, yPosition, tableWidth, 8, 'D');
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${medicineItem.medicine.genericName} | ${medicineItem.medicine.form} | ${medicineItem.durationDays} days`, margin + 3, yPosition + 6);
      yPosition += 8;

      // Dosage - VERY COMPACT
      doc.setFillColor(252, 252, 252);
      const dosageHeight = medicineItem.timings.length * 4 + 4;
      doc.rect(margin, yPosition, tableWidth, dosageHeight, 'FD');
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      let dosageY = yPosition + 4;
      
      medicineItem.timings.forEach((timing) => {
        const timeOfDayFormatted = timing.timeOfDay.charAt(0) + timing.timeOfDay.slice(1).toLowerCase();
        const mealFormatted = timing.mealRelation.replace('_', ' ').toLowerCase();
        const dosageText = `${timing.amount} ${medicineItem.medicine.form.toLowerCase()}, ${timeOfDayFormatted} (${timing.specificTime}), ${mealFormatted}`;
        doc.text(dosageText, margin + 5, dosageY);
        dosageY += 4;
      });
      yPosition += dosageHeight;

      // Special instructions - COMPACT if present
      if (medicineItem.specialInstructions) {
        doc.setFillColor(255, 252, 230);
        doc.rect(margin, yPosition, tableWidth, 8, 'FD');
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(139, 69, 19);
        const instructionText = doc.splitTextToSize(`Note: ${medicineItem.specialInstructions}`, tableWidth - 6);
        doc.text(instructionText[0], margin + 3, yPosition + 6); // Only first line to keep compact
        if (instructionText.length > 1) {
          yPosition += 4;
          doc.text(instructionText[1], margin + 3, yPosition + 6);
        }
        yPosition += 8;
      }
      
      yPosition += 6; // Small gap between medications
    });

    // Advice section - COMPACT
    if (prescription.advice) {
      yPosition += 5;
      addNewPageIfNeeded(25);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Doctor's Advice", margin, yPosition);
      yPosition += 8;

      doc.setFillColor(240, 255, 240);
      doc.setLineWidth(0.3);
      doc.setDrawColor(76, 175, 80);
      
      const adviceLines = doc.splitTextToSize(prescription.advice, tableWidth - 6);
      const adviceHeight = Math.max(15, adviceLines.length * 4 + 6);
      
      doc.rect(margin, yPosition, tableWidth, adviceHeight, 'FD');
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(27, 94, 32);
      
      let adviceY = yPosition + 5;
      adviceLines.forEach((line: string) => {
        doc.text(line, margin + 3, adviceY);
        adviceY += 4;
      });
      yPosition += adviceHeight + 10;
    }

    // Footer
    addNewPageIfNeeded(25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Physician Signature:", pageWidth - 80, yPosition);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(pageWidth - 80, yPosition + 5, pageWidth - 20, yPosition + 5);
    yPosition += 10;
    doc.setFontSize(9);
    doc.text(`Dr. ${prescription.doctor.name}`, pageWidth - 80, yPosition);
    
    // Generation date
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, margin, pageHeight - 20);

    const fileName = `Prescription_${prescription.id}_${prescription.patient.name.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
    document.head.removeChild(script);

  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback to text file as in original code
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
   Dosage: ${med.timings.map(t => `${t.amount} ${med.medicine.form.toLowerCase()}, ${t.timeOfDay.toLowerCase()} (${t.specificTime}), ${t.mealRelation.replace('_', ' ').toLowerCase()}`).join('; ')}
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
    link.download = `Prescription_${prescription.id}_${prescription.patient.name.replace(/\s+/g, "_")}.txt`;
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
    return mealMap[mealRelation] || mealRelation.replace("_", " ").toLowerCase();
  };

  if (loading) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading prescriptions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="patient">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">Error: {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="patient">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Prescriptions</h1>
          <p className="mt-2 text-gray-600">View and manage your medical prescriptions</p>
        </div>

        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No prescriptions available</p>
            </div>
          ) : (
            prescriptions.map((prescription) => {
              const isExpanded = expandedPrescriptions.has(prescription.id);
              return (
                <div key={prescription.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                    onClick={() => togglePrescriptionExpansion(prescription.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          Prescription #{prescription.id}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(prescription.issueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Dr. {prescription.doctor.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
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
                    <div className="p-6 border-t border-gray-100 space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600"><strong>Name:</strong> Dr. {prescription.doctor.name}</p>
                          {prescription.doctor.specialization && (
                            <p className="text-sm text-gray-600"><strong>Specialization:</strong> {prescription.doctor.specialization}</p>
                          )}
                          {prescription.doctor.contactNumber && (
                            <p className="text-sm text-gray-600"><strong>Contact:</strong> {prescription.doctor.contactNumber}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600"><strong>Name:</strong> {prescription.patient.name}</p>
                          <p className="text-sm text-gray-600"><strong>Patient ID:</strong> {prescription.patient.id}</p>
                        </div>
                      </div>

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
                                  <p className="text-xs text-blue-600 font-medium">Strength</p>
                                  <p className="text-sm font-semibold text-blue-800">
                                    {medicineItem.medicine.strength}
                                  </p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                  <p className="text-xs text-green-600 font-medium">Form</p>
                                  <p className="text-sm font-semibold text-green-800">
                                    {medicineItem.medicine.form}
                                  </p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg text-center">
                                  <p className="text-xs text-purple-600 font-medium">Duration</p>
                                  <p className="text-sm font-semibold text-purple-800">
                                    {medicineItem.durationDays} days
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-indigo-600" />
                                  <span className="font-medium text-gray-700">Dosage Schedule:</span>
                                </div>
                                {medicineItem.timings.map((timing, timingIndex) => (
                                  <div
                                    key={timingIndex}
                                    className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-indigo-800">
                                        {formatTimeOfDay(timing.timeOfDay)} - {timing.specificTime}
                                      </span>
                                      <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                                        {timing.amount} {medicineItem.medicine.form.toLowerCase()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-indigo-700">
                                      {formatMealRelation(timing.mealRelation)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {medicineItem.specialInstructions && (
                                <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <span className="font-medium text-amber-800">Special Instructions:</span>
                                  </div>
                                  <p className="text-sm text-amber-700">
                                    {medicineItem.specialInstructions}
                                  </p>
                                </div>
                              )}
                            </div>

                            <span
                              className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ml-4 ${getMedicationStatus(prescription) === "Active"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                            >
                              {getMedicationStatus(prescription)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {prescription.advice && (
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">{prescription.advice}</p>
                          </div>
                        </div>
                      )}

                      {prescription.followUpDate && (
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-start gap-2">
                            <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              <strong>Follow-up:</strong> {formatDate(prescription.followUpDate)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg text-gray-900">Request Refill</h4>
                <p className="text-sm text-gray-600">Get prescription refills</p>
              </div>
            </div>
          </button>
          <button className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg text-gray-900">Medication Schedule</h4>
                <p className="text-sm text-gray-600">View your medication calendar</p>
              </div>
            </div>
          </button>
          <button className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg text-gray-900">Report Side Effects</h4>
                <p className="text-sm text-gray-600">Report any adverse reactions</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;