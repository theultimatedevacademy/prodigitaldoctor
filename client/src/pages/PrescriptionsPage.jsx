/**
 * PrescriptionsPage Component
 * Lists all prescriptions for the selected clinic
 */

import { useState } from "react";
import { Link } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SearchInput } from "../components/ui/SearchInput";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { usePrescriptions } from "../api/hooks/usePrescriptions";
import { useClinicContext } from "../hooks/useClinicContext";
import { formatDate } from "../utils/formatters";

const PrescriptionsPage = () => {
  const { selectedClinicId } = useClinicContext();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: prescriptionsData, isLoading } = usePrescriptions(
    {
      clinicId: selectedClinicId,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  const prescriptions = prescriptionsData?.data || [];

  // Filter prescriptions by search term
  const filteredPrescriptions = prescriptions.filter((rx) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rx.patient?.name?.toLowerCase().includes(searchLower) ||
      rx.doctor?.name?.toLowerCase().includes(searchLower) ||
      rx.diagnosis?.toLowerCase().includes(searchLower)
    );
  });

  if (!selectedClinicId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Clinic Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please select a clinic to view prescriptions
            </p>
            <Link to="/clinics">
              <Button>Select Clinic</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Prescriptions
          </h1>
          <p className="text-gray-600 mt-1">Manage all clinic prescriptions</p>
        </div>
        <Link to="/prescriptions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by patient, doctor, or diagnosis..."
        />
      </div>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length === 0 ? (
        <div>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {prescriptions.length === 0
                ? "No Prescriptions Yet"
                : "No Matching Prescriptions"}
            </h2>
            <p className="text-gray-600 mb-6">
              {prescriptions.length === 0
                ? "Create your first prescription to get started"
                : "Try adjusting your search"}
            </p>
            {prescriptions.length === 0 && (
              <Link to="/prescriptions/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Prescription
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription._id}
              prescription={prescription}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredPrescriptions.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredPrescriptions.length} of {prescriptions.length}{" "}
          prescriptions
        </div>
      )}
    </div>
  );
};

function PrescriptionCard({ prescription }) {
  return (
    <Link to={`/prescriptions/${prescription._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {prescription.patient?.name || "Unknown Patient"}
                </h3>
                <p className="text-sm text-gray-600">
                  Dr. {prescription.doctor?.name || "Unknown"}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {prescription.diagnosis && (
              <p className="text-gray-700">
                <span className="font-medium">Diagnosis:</span>{" "}
                {prescription.diagnosis}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span>{prescription.medications?.length || 0} medication(s)</span>
              <span>•</span>
              <span>{formatDate(prescription.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PrescriptionsPage;
