/**
 * AppointmentTypeSelector Component
 * Radio selector for First Visit vs Follow Up
 */

import { Users, UserPlus } from 'lucide-react';

const AppointmentTypeSelector = ({ selectedType, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Visit Type *
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Visit Option */}
        <button
          type="button"
          onClick={() => onChange('first_visit')}
          className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-lg transition-all ${
            selectedType === 'first_visit'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <UserPlus className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${
            selectedType === 'first_visit' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <span className="font-semibold text-base sm:text-lg">First Visit</span>
          <span className="text-xs sm:text-sm text-gray-500 mt-1">New patient registration</span>
          {selectedType === 'first_visit' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Follow Up Option */}
        <button
          type="button"
          onClick={() => onChange('follow_up')}
          className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-lg transition-all ${
            selectedType === 'follow_up'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <Users className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${
            selectedType === 'follow_up' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <span className="font-semibold text-base sm:text-lg">Follow Up</span>
          <span className="text-xs sm:text-sm text-gray-500 mt-1">Existing patient</span>
          {selectedType === 'follow_up' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentTypeSelector;
