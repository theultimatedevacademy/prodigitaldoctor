/**
 * ClinicSelector Component
 * Dropdown to select active clinic
 */

import { Link } from 'react-router';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { useClinics } from '../../api/hooks/useClinics';
import { useClinicContext } from '../../hooks/useClinicContext';
import { Spinner } from '../../components/ui/Spinner';

/**
 * ClinicSelector component for switching between clinics
 * Displays in the top navigation bar
 * @returns {JSX.Element} ClinicSelector component
 */
export function ClinicSelector() {
  const { data: clinicsData, isLoading } = useClinics();
  const { selectedClinicId, setSelectedClinicId } = useClinicContext();
  
  const clinics = clinicsData?.clinics || [];
  const selectedClinic = clinics.find(c => c._id === selectedClinicId) || clinics[0];
  
  // Auto-select first clinic if none selected
  if (!selectedClinicId && clinics.length > 0 && !isLoading) {
    setSelectedClinicId(clinics[0]._id);
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">Loading clinics...</span>
      </div>
    );
  }
  
  if (clinics.length === 0) {
    return (
      <Link 
        to="/clinics/new"
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Building2 className="w-5 h-5" />
        <span className="text-sm font-medium">Create Clinic</span>
      </Link>
    );
  }
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select clinic"
        onClick={(e) => {
          const dropdown = e.currentTarget.nextElementSibling;
          dropdown.classList.toggle('hidden');
        }}
      >
        <Building2 className="w-5 h-5 text-blue-600" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {selectedClinic?.name || 'Select Clinic'}
          </div>
          {selectedClinic?.address?.city && (
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {selectedClinic.address.city}
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      {/* Dropdown menu */}
      <div className="hidden absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-2 max-h-96 overflow-y-auto">
          {clinics.map((clinic) => (
            <button
              key={clinic._id}
              onClick={() => {
                setSelectedClinicId(clinic._id);
                // Close dropdown
                document.querySelector('.relative button').nextElementSibling.classList.add('hidden');
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                clinic._id === selectedClinicId
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm">{clinic.name}</div>
              {clinic.address?.city && (
                <div className="text-xs text-gray-600 mt-0.5">
                  {clinic.address.line1 && `${clinic.address.line1}, `}
                  {clinic.address.city}
                </div>
              )}
              {clinic.contact?.phone && (
                <div className="text-xs text-gray-500 mt-0.5">{clinic.contact.phone}</div>
              )}
            </button>
          ))}
          
          {/* Create New Clinic Button */}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <Link
              to="/clinics/new"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Clinic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
