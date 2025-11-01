/**
 * NewPrescriptionPage Component
 * Create a new prescription with DDI checking
 */

import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { PrescriptionBuilder } from "../features/prescriptions/PrescriptionBuilder";
import { useClinicContext } from "../contexts/ClinicContext";
import { useAuth } from "../hooks/useAuth";
import { useAppointment } from "../api/hooks/useAppointments";

export default function NewPrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();

  const patientId = searchParams.get("patientId");
  const appointmentId = searchParams.get("appointmentId");
  const editId = searchParams.get("editId"); // If editing existing prescription
  const fromCreation = searchParams.get("fromCreation"); // If just created

  const isEditMode = !!editId;
  const [showSuccessBanner, setShowSuccessBanner] = useState(
    fromCreation === "true"
  );

  // Fetch appointment data to check if prescription already exists
  const { data: appointment, isLoading: appointmentLoading } = useAppointment(
    appointmentId,
    {
      enabled: !!appointmentId && !isEditMode, // Only fetch in create mode
    }
  );

  // Auto-redirect to edit mode if prescription already exists
  useEffect(() => {
    if (!isEditMode && appointment?.prescriptions?.length > 0) {
      const existingPrescriptionId =
        appointment.prescriptions[0]._id || appointment.prescriptions[0];

      // Check if this was just created (within last 1 minute)
      const justCreated = localStorage.getItem("prescription_just_created");
      if (justCreated) {
        try {
          const { prescriptionId, timestamp } = JSON.parse(justCreated);
          const oneMinute = 60 * 1000;
          if (
            Date.now() - timestamp < oneMinute &&
            prescriptionId === existingPrescriptionId
          ) {
            // Add fromCreation flag to URL
            navigate(
              `/prescriptions/new?appointmentId=${appointmentId}&patientId=${patientId}&editId=${existingPrescriptionId}&fromCreation=true`,
              { replace: true }
            );
            return;
          }
        } catch (e) {
          // Invalid data, ignore
        }
      }

      // Normal redirect without banner
      navigate(
        `/prescriptions/new?appointmentId=${appointmentId}&patientId=${patientId}&editId=${existingPrescriptionId}`,
        { replace: true }
      );
    }
  }, [appointment, isEditMode, appointmentId, patientId, navigate]);

  // Auto-dismiss success banner and clean up
  useEffect(() => {
    if (showSuccessBanner) {
      // Remove fromCreation param from URL after 500ms
      const cleanupTimer = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("fromCreation");
        setSearchParams(params, { replace: true });
      }, 500);

      // Auto-dismiss banner after 8 seconds
      const dismissTimer = setTimeout(() => {
        setShowSuccessBanner(false);
        // Clean up localStorage
        localStorage.removeItem("prescription_just_created");
      }, 8000);

      return () => {
        clearTimeout(cleanupTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [showSuccessBanner, searchParams, setSearchParams]);

  const handleSuccess = (prescription) => {
    // Don't navigate - stay on page to show success state
    // navigate(`/prescriptions/${prescription._id}`);
  };

  if (!selectedClinicId) {
    return (
      <Alert variant="warning">
        Please select a clinic before creating a prescription
      </Alert>
    );
  }

  if (!patientId) {
    return <Alert variant="warning">Please select a patient first</Alert>;
  }

  // Show loading while checking for existing prescription
  if (appointmentLoading && appointmentId && !isEditMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading prescription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="no-print mb-4 sm:mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-3 sm:p-4 animate-in slide-in-from-top">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Prescription Created Successfully!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You can now edit the prescription below or go back to the
                  appointment.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuccessBanner(false);
                localStorage.removeItem("prescription_just_created");
              }}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="no-print mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-3 sm:mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Prescription" : "Create Prescription"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          {isEditMode
            ? "Update medications and prescription details"
            : "Add medications, check interactions, and generate prescription"}
        </p>
      </div>

      {/* Single PrescriptionBuilder with responsive Card wrapper */}
      {/* Mobile: Break out of container padding for prescription scroll */}
      {/* Desktop: Normal card with padding */}
      <div className="mb-4 sm:mb-6 -mx-4 sm:mx-0">
        {/* Card styling: visible on desktop, invisible on mobile */}
        <div className="sm:bg-white sm:rounded-lg sm:shadow-sm sm:border sm:border-gray-200">
          {/* Card Header - only visible on desktop */}
          <div className="hidden sm:block no-print px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Prescription Details
            </h3>
          </div>
          {/* Card Content - padding only on desktop */}
          <div className="sm:px-6 sm:py-6">
            <PrescriptionBuilder
              patientId={patientId}
              clinicId={selectedClinicId}
              doctorId={user._id}
              appointmentId={appointmentId}
              prescriptionId={editId}
              isEditMode={isEditMode}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
