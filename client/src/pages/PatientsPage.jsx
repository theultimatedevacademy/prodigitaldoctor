/**
 * PatientsPage Component
 * List and search patients
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { PatientCard } from '../features/patients/PatientCard';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { usePatients, useSearchPatients } from '../api/hooks/usePatients';
import { useClinicContext } from '../hooks/useClinicContext';

export default function PatientsPage() {
  const { selectedClinicId } = useClinicContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: patientsData, isLoading } = usePatients(selectedClinicId);
  const { data: searchData, isLoading: searching } = useSearchPatients(searchQuery, selectedClinicId);
  
  const patients = searchQuery ? (searchData?.patients || []) : (patientsData?.patients || []);
  
  if (!selectedClinicId) {
    return (
      <Alert variant="warning">
        Please select a clinic to view patients
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your patients
          </p>
        </div>
        <Link to="/patients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </Link>
      </div>
      
      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patients by name, phone, or patient code..."
        />
      </div>
      
      {/* Patients Grid */}
      {isLoading || searching ? (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      ) : patients.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onClick={() => window.location.href = `/patients/${patient._id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? 'No patients found' : 'No patients yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first patient'
            }
          </p>
          {!searchQuery && (
            <Link to="/patients/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
