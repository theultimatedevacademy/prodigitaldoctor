/**
 * ClinicSelector Component
 * Dropdown to select active clinic
 */

import { Building2, ChevronDown } from 'lucide-react';
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
      <div className="flex items-center gap-2 px-3 py-2">
        <Spinner size="sm" />
        <span className="text-sm text-clinical-600">Loading clinics...</span>
      </div>
    );
  }
  
  if (clinics.length === 0) {
    return (
      <div className="text-sm text-clinical-600 px-3 py-2">
        No clinics available
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-clinical-100 transition-colors"
        aria-label="Select clinic"
        onClick={(e) => {
          const dropdown = e.currentTarget.nextElementSibling;
          dropdown.classList.toggle('hidden');
        }}
      >
        <Building2 className="w-5 h-5 text-primary-600" />
        <div className="text-left">
          <div className="text-sm font-medium text-clinical-900">
            {selectedClinic?.name || 'Select Clinic'}
          </div>
          {selectedClinic?.address && (
            <div className="text-xs text-clinical-500 truncate max-w-[200px]">
              {selectedClinic.address}
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-clinical-400" />
      </button>
      
      {/* Dropdown menu */}
      <div className="hidden absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-clinical-200 z-50">
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
                  ? 'bg-primary-50 text-primary-900'
                  : 'hover:bg-clinical-50'
              }`}
            >
              <div className="font-medium text-sm">{clinic.name}</div>
              {clinic.address && (
                <div className="text-xs text-clinical-600 mt-0.5">{clinic.address}</div>
              )}
              {clinic.phone && (
                <div className="text-xs text-clinical-500 mt-0.5">{clinic.phone}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
