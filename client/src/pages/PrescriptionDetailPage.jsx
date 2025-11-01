/**
 * PrescriptionDetailPage Component
 * View prescription details in print-ready format
 */

import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "../components/ui/Button";
import { LoadingOverlay } from "../components/ui/Spinner";
import { usePrescription } from "../api/hooks/usePrescriptions";
import { formatDate } from "../utils/formatters";

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: prescription, isLoading, error } = usePrescription(id);

  const handlePrint = () => {
    window.print();
  };

  // Debug logging
  if (prescription) {
    console.log("=== PRESCRIPTION DEBUG ===");
    console.log("Prescription ID:", id);
    console.log("Full prescription object:", prescription);
    console.log("createdAt field:", prescription.createdAt);
    console.log("createdAt type:", typeof prescription.createdAt);
    console.log("updatedAt field:", prescription.updatedAt);
    console.log("Parsed createdAt:", new Date(prescription.createdAt));
    console.log("========================");
  }

  if (isLoading) {
    return <LoadingOverlay message="Loading prescription..." />;
  }

  if (!prescription || error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Printer className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Prescription not found
          </h2>
          <p className="text-sm text-gray-500">
            The prescription you're looking for doesn't exist or has been
            removed.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-2">
              Error: {error.message || "Failed to load prescription"}
            </p>
          )}
          {id && <p className="text-xs text-gray-400 font-mono">ID: {id}</p>}
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate BMI if vitals exist
  const bmi =
    prescription.appointment?.vitals?.weight &&
    prescription.appointment?.vitals?.height
      ? (
          prescription.appointment.vitals.weight /
          Math.pow(prescription.appointment.vitals.height / 100, 2)
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          /* Hide all navigation, headers, sidebar, and banners */
          nav, header, aside, .main-nav, [role="navigation"], [role="banner"] {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 210mm;
            height: 297mm;
          }
          .print-container {
            margin: 0 !important;
            padding: 15mm 20mm !important;
            max-width: 100% !important;
            min-width: auto !important;
            box-shadow: none !important;
            page-break-after: avoid;
          }
          /* Make content full width on print */
          main {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .prescription-page-wrapper {
            background: white !important;
            padding: 0 !important;
          }
          /* Ensure only one copy prints */
          .print-once {
            display: block !important;
          }
        }
        @media screen {
          .print-once {
            display: block;
          }
        }
      `}</style>

      {/* Action Bar - Hidden on print */}
      <div className="no-print bg-white border border-gray-200 rounded-lg px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Button onClick={handlePrint} size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Prescription Content - Print Ready A4 Format */}
      <div className="prescription-page-wrapper bg-gray-100 p-4 sm:p-6 overflow-x-auto">
        <div
          className="print-once print-container max-w-5xl mx-auto bg-white shadow-lg"
          style={{
            fontFamily: "Arial, sans-serif",
            padding: "24px",
            minWidth: "210mm",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-gray-300 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PRESCRIPTION</h1>
            </div>
            {prescription.clinic && (
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {prescription.clinic.name}
                </p>
                {prescription.clinic.address && (
                  <p className="text-sm text-gray-600">
                    {[
                      prescription.clinic.address.line1,
                      prescription.clinic.address.line2,
                      prescription.clinic.address.city,
                      prescription.clinic.address.state,
                      prescription.clinic.address.pin,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {(prescription.clinic.contact?.phone ||
                  prescription.clinic.phone) && (
                  <p className="text-sm text-gray-600">
                    Phone:{" "}
                    {prescription.clinic.contact?.phone ||
                      prescription.clinic.phone}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Doctor Info and Date - Same Line */}
          <div className="flex justify-between items-start mb-4">
            {/* Doctor Info - Left Side */}
            {prescription.doctor && (
              <div>
                <p className="text-base font-semibold">
                  Dr. {prescription.doctor.name}
                </p>
                {prescription.doctor.specialization && (
                  <p className="text-sm text-gray-600">
                    {prescription.doctor.specialization}
                  </p>
                )}
                {prescription.doctor.registrationNumber && (
                  <p className="text-sm text-gray-600">
                    Reg. No.: {prescription.doctor.registrationNumber}
                  </p>
                )}
              </div>
            )}

            {/* Date - Right Side */}
            <div className="text-right">
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {(() => {
                  // Extract date without timezone conversion
                  const dateStr = prescription.createdAt;
                  const date = new Date(dateStr);
                  const isoStr =
                    typeof dateStr === "string" ? dateStr : date.toISOString();
                  const [datePart] = isoStr.split("T");
                  const [year, month, day] = datePart.split("-");
                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                })()}
              </p>
              {prescription.lastEditedAt && (
                <p className="text-xs text-gray-600 mt-1">
                  Edited on{" "}
                  {(() => {
                    const dateStr = prescription.lastEditedAt;
                    const date = new Date(dateStr);
                    const isoStr =
                      typeof dateStr === "string"
                        ? dateStr
                        : date.toISOString();
                    const [datePart, timePart] = isoStr.split("T");
                    const [year, month, day] = datePart.split("-");
                    const [hour, minute] = timePart.split(":");
                    const monthNames = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                    let hourNum = parseInt(hour);
                    const ampm = hourNum >= 12 ? "PM" : "AM";
                    hourNum = hourNum % 12 || 12;
                    const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minute} ${ampm}`;
                    return `${formattedDate} at ${formattedTime}`;
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="border border-gray-300 rounded p-4 mb-6">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">
              PATIENT INFORMATION
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {prescription.patient?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Age/Gender:</span>{" "}
                  {prescription.patient?.age || "N/A"} years /{" "}
                  {prescription.patient?.gender || "N/A"}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Patient ID:</span>{" "}
                  {prescription.patient?.patientCodes?.[0]?.code || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {prescription.patient?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Vitals - if available */}
          {prescription.appointment?.vitals && (
            <div className="border border-gray-300 rounded p-4 mb-6">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">
                VITALS
              </h2>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {prescription.appointment.vitals.bloodPressureSystolic && (
                  <div>
                    <p className="font-semibold">BP:</p>
                    <p>
                      {prescription.appointment.vitals.bloodPressureSystolic}/
                      {prescription.appointment.vitals.bloodPressureDiastolic}{" "}
                      mmHg
                    </p>
                  </div>
                )}
                {prescription.appointment.vitals.pulse && (
                  <div>
                    <p className="font-semibold">Pulse:</p>
                    <p>{prescription.appointment.vitals.pulse} bpm</p>
                  </div>
                )}
                {prescription.appointment.vitals.temperature && (
                  <div>
                    <p className="font-semibold">Temp:</p>
                    <p>{Number(prescription.appointment.vitals.temperature).toFixed(1)}°F</p>
                  </div>
                )}
                {prescription.appointment.vitals.spo2 && (
                  <div>
                    <p className="font-semibold">SpO2:</p>
                    <p>{prescription.appointment.vitals.spo2}%</p>
                  </div>
                )}
                {prescription.appointment.vitals.weight && (
                  <div>
                    <p className="font-semibold">Weight:</p>
                    <p>{prescription.appointment.vitals.weight} kg</p>
                  </div>
                )}
                {prescription.appointment.vitals.height && (
                  <div>
                    <p className="font-semibold">Height:</p>
                    <p>{prescription.appointment.vitals.height} cm</p>
                  </div>
                )}
                {bmi && (
                  <div>
                    <p className="font-semibold">BMI:</p>
                    <p>{bmi}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clinical Notes - if available */}
          {prescription.appointment?.clinicalNotes && (
            <div className="border border-gray-300 rounded p-4 mb-6">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">
                CLINICAL NOTES
              </h2>
              <div className="space-y-2 text-sm">
                {prescription.appointment.clinicalNotes.chiefComplaint && (
                  <p className="leading-none">
                    <span className="font-semibold">Chief Complaint:</span>{" "}
                    <span className="whitespace-pre-wrap">
                      {prescription.appointment.clinicalNotes.chiefComplaint}
                    </span>
                  </p>
                )}
                {prescription.appointment.clinicalNotes.symptoms && (
                  <p className="leading-none">
                    <span className="font-semibold">Symptoms:</span>{" "}
                    <span className="whitespace-pre-wrap">
                      {prescription.appointment.clinicalNotes.symptoms}
                    </span>
                  </p>
                )}
                {prescription.appointment.clinicalNotes.examination && (
                  <p className="leading-none">
                    <span className="font-semibold">Examination:</span>{" "}
                    <span className="whitespace-pre-wrap">
                      {prescription.appointment.clinicalNotes.examination}
                    </span>
                  </p>
                )}
                {prescription.appointment.clinicalNotes.diagnosis && (
                  <p className="leading-none">
                    <span className="font-semibold">Diagnosis:</span>{" "}
                    <span className="whitespace-pre-wrap">
                      {prescription.appointment.clinicalNotes.diagnosis}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-gray-300">
              Rx
            </h2>
            <div className="space-y-4">
              {prescription.meds?.map((med, index) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <div className="flex items-start">
                    <span className="font-semibold mr-2">{index + 1}.</span>
                    <div className="flex-1">
                      {/* Medicine Name */}
                      <p className="font-semibold text-base">
                        {med.medication?.brandName ||
                          med.medication?.genericName ||
                          "Medication"}
                      </p>

                      {/* Exact Composition - Small, Italics */}
                      {med.medication?.exact_composition && (
                        <p className="text-xs italic text-gray-600 mt-1">
                          {med.medication.exact_composition}
                        </p>
                      )}

                      {/* Dosage, Frequency, Duration - Single Line */}
                      <p className="text-sm text-gray-800 mt-2">
                        <span className="font-semibold">Dosage:</span>{" "}
                        {med.dosage} |{" "}
                        <span className="font-semibold">Frequency:</span>{" "}
                        {med.frequency} |{" "}
                        <span className="font-semibold">Duration:</span>{" "}
                        {med.duration}
                      </p>

                      {/* Instructions if available */}
                      {med.notes && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {prescription.notes && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2 text-gray-700">
                ADDITIONAL NOTES
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300">
            <div className="text-xs text-gray-600">
              <p>Electronically generated by Ocura360</p>
              <p className="mt-1">
                Generated on:{" "}
                {(() => {
                  // Parse date string without timezone conversion
                  const dateStr = prescription.createdAt;
                  const date = new Date(dateStr);

                  // Extract components directly from the ISO string to avoid timezone conversion
                  const isoStr =
                    typeof dateStr === "string"
                      ? dateStr
                      : date.toISOString();
                  const [datePart, timePart] = isoStr.split("T");
                  const [year, month, day] = datePart.split("-");
                  const [hour, minute] = timePart.split(":");

                  // Format date as "16 Oct 2025"
                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;

                  // Format time as 12-hour with AM/PM
                  let hourNum = parseInt(hour);
                  const ampm = hourNum >= 12 ? "PM" : "AM";
                  hourNum = hourNum % 12 || 12;
                  const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minute} ${ampm}`;

                  return `${formattedDate} at ${formattedTime}`;
                })()}
              </p>
              {prescription.doctor?.name && (
                <p className="mt-1">
                  Digitally signed by Dr. {prescription.doctor.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
