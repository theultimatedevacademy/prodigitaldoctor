/**
 * PrescriptionDetailPage Component
 * View prescription details with PDF viewer
 * Modern UI with Clerk-inspired design system
 */

import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Download, Share2, User, Stethoscope, Building2, Calendar, Pill } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { LoadingOverlay } from "../components/ui/Spinner";
import { PDFViewer } from "../features/prescriptions/PDFViewer";
import { usePrescription, useShareABDM } from "../api/hooks/usePrescriptions";
import { formatDate } from "../utils/formatters";
import { toast } from "react-toastify";

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = usePrescription(id);
  const shareABDMMutation = useShareABDM();

  const prescription = data?.prescription;

  const handleShareABDM = async () => {
    if (!prescription?.patient?.abhaId) {
      toast.error("Patient does not have an ABHA ID linked");
      return;
    }

    try {
      await shareABDMMutation.mutateAsync({
        prescriptionId: prescription._id,
        abhaId: prescription.patient.abhaId,
      });
      toast.success("Prescription shared via ABDM successfully");
    } catch (error) {
      toast.error("Failed to share prescription via ABDM");
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading prescription..." />;
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Share2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Prescription not found
          </h2>
          <p className="text-sm text-gray-500">
            The prescription you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/prescriptions")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Prescription Details</span>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-100">
                  <Share2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Prescription #{prescription._id.slice(-8).toUpperCase()}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {formatDate(prescription.createdAt, "PPP")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {prescription.patient?.abhaId && (
              <Button
                variant="outline"
                onClick={handleShareABDM}
                loading={shareABDMMutation.isPending}
                className="shadow-sm hover:shadow transition-shadow"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share via ABDM
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Patient & Doctor Info Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Patient Information */}
        <div className="group bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Patient Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="min-w-[100px]">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                </div>
                <p className="font-medium text-gray-900 flex-1">
                  {prescription.patient?.name || "—"}
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="min-w-[100px]">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</p>
                </div>
                <p className="font-mono text-sm text-gray-700 flex-1 bg-gray-50 px-2 py-1 rounded">
                  {prescription.patient?.patientCodes?.[0]?.code || "—"}
                </p>
              </div>
              
              {prescription.patient?.abhaId && (
                <div className="flex items-start gap-3">
                  <div className="min-w-[100px]">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">ABHA ID</p>
                  </div>
                  <p className="font-mono text-sm text-gray-700 flex-1 bg-green-50 px-2 py-1 rounded border border-green-100">
                    {prescription.patient.abhaId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="group bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 border border-purple-100">
                <Stethoscope className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Prescribing Doctor</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="min-w-[100px]">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Doctor</p>
                </div>
                <p className="font-medium text-gray-900 flex-1">
                  {prescription.doctor?.name || "—"}
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="min-w-[100px]">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clinic</p>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-medium text-gray-700">
                    {prescription.clinic?.name || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 border border-green-100">
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Prescribed Medications</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {prescription.medications?.length || 0} medication(s) prescribed
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {prescription.medications?.map((med, index) => (
              <div
                key={index}
                className="group relative p-5 bg-gradient-to-br from-white to-gray-50/30 border border-gray-200/60 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {med.medication?.brandName || "Medication"}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
                        {med.dosage}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 border border-purple-100 text-xs font-medium text-purple-700">
                        {med.frequency}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 border border-green-100 text-xs font-medium text-green-700">
                        {med.duration}
                      </span>
                    </div>
                    
                    {med.instructions && (
                      <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                        <p className="text-xs font-medium text-amber-900 mb-1">
                          Instructions
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {med.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {prescription.pdfUrl && (
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="h-[700px]">
            <PDFViewer
              pdfUrl={prescription.pdfUrl}
              title="Prescription PDF"
              onShare={prescription.patient?.abhaId ? handleShareABDM : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
