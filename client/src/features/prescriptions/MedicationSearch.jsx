/**
 * MedicationSearch Component
 * Search and select medications with autocomplete
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Pill } from 'lucide-react';
import { useSearchMedications } from '../../api/hooks/useMedications';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../../components/ui/Spinner';

/**
 * MedicationSearch component with autocomplete
 * @param {object} props - Component props
 * @param {Function} props.onSelect - Callback when medication is selected
 * @param {string} props.placeholder - Placeholder text
 * @returns {JSX.Element} MedicationSearch component
 */
export function MedicationSearch({ onSelect, placeholder = 'Search medications...' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);
  
  const { data, isLoading } = useSearchMedications(debouncedQuery);
  const medications = data?.medications || [];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (medication) => {
    onSelect(medication);
    setQuery('');
    setIsOpen(false);
  };
  
  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-clinical-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-clinical-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Spinner size="sm" />
          </div>
        )}
      </div>
      
      {/* Dropdown results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-clinical-200 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-clinical-600">
              <Spinner size="md" className="mx-auto mb-2" />
              <p>Searching medications...</p>
            </div>
          ) : medications.length > 0 ? (
            <ul>
              {medications.map((med) => (
                <li key={med._id}>
                  <button
                    onClick={() => handleSelect(med)}
                    className="w-full text-left px-4 py-3 hover:bg-clinical-50 transition-colors border-b border-clinical-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-clinical-900">{med.brandName}</div>
                        <div className="text-sm text-clinical-600">{med.genericName}</div>
                        {med.compositions && med.compositions.length > 0 && (
                          <div className="text-xs text-clinical-500 mt-1">
                            {med.compositions.map(c => c.name || c).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-clinical-600">
              No medications found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
