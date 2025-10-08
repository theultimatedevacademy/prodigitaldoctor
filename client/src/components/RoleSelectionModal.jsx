/**
 * RoleSelectionModal Component
 * Shows role selection options for new users without assigned roles
 */

import { useState } from 'react';
import { UserCircle, Stethoscope, Users, Building2 } from 'lucide-react';
import { Button } from './ui/Button';
import { post } from '../api/apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { toast } from 'react-toastify';

const ROLE_OPTIONS = [
  {
    value: 'patient',
    label: 'I am a patient',
    description: 'Access your medical records and prescriptions',
    icon: UserCircle,
    color: 'blue',
  },
  {
    value: 'doctor',
    label: 'I am a doctor and I work in a clinic',
    description: 'Manage patients and create prescriptions',
    icon: Stethoscope,
    color: 'green',
  },
  {
    value: 'assistant',
    label: 'I am a staff/assistant in a clinic',
    description: 'Help manage clinic operations',
    icon: Users,
    color: 'purple',
  },
  {
    value: 'clinic_owner',
    label: 'I am a doctor and I run my own clinic',
    description: 'Full clinic management and ownership',
    icon: Building2,
    color: 'indigo',
  },
];

export function RoleSelectionModal({ onRoleSelected }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to update user role
      await post(API_ENDPOINTS.UPDATE_MY_ROLE, {
        roles: [selectedRole],
      });

      toast.success('Role assigned successfully!');
      
      // Callback to parent to refresh user data
      if (onRoleSelected) {
        onRoleSelected(selectedRole);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">Welcome to ProDigital Doctor!</h2>
          <p className="text-blue-100">
            To get started, please tell us about yourself
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-700 mb-6 text-lg">
            Select the option that best describes you:
          </p>

          {/* Role Options */}
          <div className="space-y-4 mb-8">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedRole(option.value)}
                  className={`
                    w-full text-left p-6 rounded-xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!selectedRole || isSubmitting}
              size="lg"
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
