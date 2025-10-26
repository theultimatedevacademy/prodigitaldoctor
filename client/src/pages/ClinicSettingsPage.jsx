/**
 * ClinicSettingsPage - Edit current clinic settings (Owner only)
 * Allows editing clinic name, phone, address, and other details
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Save, ArrowLeft, Building2, Phone, MapPin, Clock } from 'lucide-react';
import { useClinicContext } from '../contexts/ClinicContext';
import { useClinic, useUpdateClinic } from '../api/hooks/useClinics';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { toast } from 'react-toastify';

export function ClinicSettingsPage() {
  const navigate = useNavigate();
  const { selectedClinicId, userClinicRole, isLoading: isContextLoading } = useClinicContext();
  const { data: clinicData, isLoading: isClinicLoading } = useClinic(selectedClinicId);
  const updateClinicMutation = useUpdateClinic();
  
  const clinic = clinicData?.clinic || clinicData;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    registrationNumber: '',
    workingHours: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  });
  
  const [errors, setErrors] = useState({});

  // Load clinic data into form - MUST be before any conditional returns
  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        phone: clinic.contact?.phone || '',
        email: clinic.contact?.email || '',
        address: {
          street: clinic.address?.street || '',
          city: clinic.address?.city || '',
          state: clinic.address?.state || '',
          pincode: clinic.address?.pincode || '',
          country: clinic.address?.country || 'India',
        },
        registrationNumber: clinic.registrationNumber || '',
        workingHours: clinic.workingHours || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      });
    }
  }, [clinic]);

  // Conditional returns AFTER all hooks
  // Wait for context to load
  if (isContextLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if clinic is selected
  if (!selectedClinicId) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="error">
          <p>No clinic selected. Please select a clinic from the dropdown.</p>
        </Alert>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Only owners can access
  if (userClinicRole !== 'clinic_owner') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only clinic owners can edit clinic settings.</p>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Working Hours Handlers
  const handleTimeSlotChange = (day, index, field, value) => {
    setFormData((prev) => {
      const newWorkingHours = { ...prev.workingHours };
      const daySlots = [...newWorkingHours[day]];
      daySlots[index] = { ...daySlots[index], [field]: value };
      newWorkingHours[day] = daySlots;
      return { ...prev, workingHours: newWorkingHours };
    });
  };

  const addTimeSlot = (day) => {
    setFormData((prev) => {
      const newWorkingHours = { ...prev.workingHours };
      newWorkingHours[day] = [...newWorkingHours[day], { start: '09:00', end: '17:00' }];
      return { ...prev, workingHours: newWorkingHours };
    });
  };

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => {
      const newWorkingHours = { ...prev.workingHours };
      newWorkingHours[day] = newWorkingHours[day].filter((_, i) => i !== index);
      return { ...prev, workingHours: newWorkingHours };
    });
  };

  const toggleDayClosed = (day) => {
    setFormData((prev) => {
      const newWorkingHours = { ...prev.workingHours };
      if (newWorkingHours[day].length > 0) {
        // If has slots, clear them (mark as closed)
        newWorkingHours[day] = [];
      } else {
        // If no slots, add default slot (mark as open)
        newWorkingHours[day] = [{ start: '09:00', end: '17:00' }];
      }
      return { ...prev, workingHours: newWorkingHours };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Clinic name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.pincode.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Pincode must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check clinic ID exists
    if (!selectedClinicId) {
      toast.error('No clinic selected. Please refresh the page.');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      await updateClinicMutation.mutateAsync({
        clinicId: selectedClinicId,  // ✅ Changed from 'id' to 'clinicId'
        data: {
          name: formData.name,
          contact: {
            phone: formData.phone,
            email: formData.email || undefined,
          },
          address: formData.address,
          registrationNumber: formData.registrationNumber || undefined,
          workingHours: formData.workingHours,
        },
      });
      
      toast.success('Clinic settings updated successfully!');
    } catch (error) {
      console.error('Error updating clinic:', error);
      toast.error(error.message || 'Failed to update clinic settings');
    }
  };

  if (isClinicLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="error">
          <p>Clinic not found</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Settings</h1>
            <p className="text-gray-600 mt-1">Manage your clinic information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="space-y-4">
            {/* Clinic Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter clinic name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number (Optional)
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter registration number"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Phone className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="clinic@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Address</h2>
          </div>
          
          <div className="space-y-4">
            {/* Street */}
            <div>
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Building, Street"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City"
                />
                {errors['address.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>
                )}
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="State"
                />
                {errors['address.state'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>
                )}
              </div>
            </div>

            {/* Pincode and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address.pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['address.pincode'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="6-digit pincode"
                  maxLength="6"
                />
                {errors['address.pincode'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['address.pincode']}</p>
                )}
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OPD Timings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">OPD Timings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Set your clinic's operating hours. You can add multiple time slots for each day.
          </p>
          
          <div className="space-y-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              const isOpen = formData.workingHours[day].length > 0;
              
              return (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 w-24">{dayName}</span>
                      <button
                        type="button"
                        onClick={() => toggleDayClosed(day)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          isOpen
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Slot
                      </button>
                    )}
                  </div>
                  
                  {isOpen && (
                    <div className="space-y-2">
                      {formData.workingHours[day].map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleTimeSlotChange(day, index, 'start', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleTimeSlotChange(day, index, 'end', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {formData.workingHours[day].length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day, index)}
                              className="text-red-600 hover:text-red-700 px-2"
                              title="Remove this slot"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            disabled={updateClinicMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateClinicMutation.isPending}
          >
            {updateClinicMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
