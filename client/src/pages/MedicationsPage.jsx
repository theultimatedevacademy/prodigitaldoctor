/**
 * MedicationsPage Component
 * Search medications and view detailed information
 */

import { useState, useRef, useEffect } from 'react';
import { Pill, Search, X } from 'lucide-react';
import { useSearchMedications, useMedication } from '../api/hooks/useMedications';
import { useDebounce } from '../hooks/useDebounce';
import { Spinner } from '../components/ui/Spinner';
import { MedicationDetailView } from '../components/medications/MedicationDetailView';

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Search medications
  const { data: searchData, isLoading: isSearching } = useSearchMedications(debouncedQuery);
  const medications = searchData?.medications || [];
  
  // Get selected medication details
  const { data: medicationData, isLoading: isLoadingMedication } = useMedication(selectedMedicationId);
  const selectedMedication = medicationData?.medication || medicationData;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelectMedication = (medication) => {
    setSelectedMedicationId(medication._id);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };
  
  const handleClearSelection = () => {
    setSelectedMedicationId(null);
    setSearchQuery('');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Medications Database</h1>
        <p className="text-gray-600 mt-1">
          Search and view detailed medication information
        </p>
      </div>
      
      {/* Search with Dropdown */}
      <div className="max-w-2xl">
        <div ref={wrapperRef} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search medications by brand name, generic name, or composition..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          
          {/* Dropdown Results */}
          {isDropdownOpen && searchQuery.length >= 2 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-600">
                  <Spinner size="md" className="mx-auto mb-2" />
                  <p>Searching medications...</p>
                </div>
              ) : medications.length > 0 ? (
                <ul>
                  {medications.map((med) => (
                    <li key={med._id}>
                      <button
                        onClick={() => handleSelectMedication(med)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <Pill className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {med.brandName}
                            </div>
                            {med.exact_composition && (
                              <div className="text-sm text-gray-600 truncate">
                                {med.exact_composition}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-600">
                  No medications found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Medication Details */}
      <div>
        {selectedMedicationId ? (
          <div>
            {/* Clear Selection Button */}
            <div className="mb-4">
              <button
                onClick={handleClearSelection}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <X className="w-4 h-4" />
                Clear selection and search again
              </button>
            </div>
            
            {/* Medication Details */}
            {isLoadingMedication ? (
              <div className="text-center py-12">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Loading medication details...</p>
              </div>
            ) : (
              <MedicationDetailView
                medication={selectedMedication}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start searching for medications
            </h3>
            <p className="text-gray-600">
              Enter at least 2 characters to search, then select a medication to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
