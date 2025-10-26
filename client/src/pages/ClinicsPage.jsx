/**
 * ClinicsPage Component
 * Lists all clinics for the current user
 */

import { Link } from "react-router";
import { Building2, Plus, MapPin, Phone, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { useClinics } from "../api/hooks/useClinics";
import { useClinicContext } from '../contexts/ClinicContext';

const ClinicsPage = () => {
  const { data: clinicsData, isLoading } = useClinics();
  const { selectedClinicId, setSelectedClinicId } = useClinicContext();
  const clinics = clinicsData?.clinics || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            My Clinics
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your clinics and their settings
          </p>
        </div>
        <Link to="/clinics/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Clinic
          </Button>
        </Link>
      </div>

      {clinics.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No clinics yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first clinic to start managing patients and
              appointments
            </p>
            <Link to="/clinics/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Clinic
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard
              key={clinic._id}
              clinic={clinic}
              isSelected={clinic._id === selectedClinicId}
              onSelect={() => setSelectedClinicId(clinic._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function ClinicCard({ clinic, isSelected, onSelect }) {
  const address = clinic.address
    ? `${clinic.address.line1}, ${clinic.address.city}`
    : "No address";

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        isSelected ? "ring-1 ring-green-50 shadow-xl" : ""
      }`}
    >
      {/* Clickable area for selection */}
      <div onClick={onSelect} className="cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {clinic.name}
            </CardTitle>
            {isSelected && <Badge variant="success">Active</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{address}</span>
            </div>

            {clinic.contact?.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{clinic.contact.phone}</span>
              </div>
            )}

            {clinic.staff && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{clinic.staff.length} staff members</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      {/* Separate button area - not nested */}
      <CardContent className="pt-0">
        <Link
          to={`/clinics/${clinic._id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ClinicsPage;
