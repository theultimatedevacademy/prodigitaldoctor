/**
 * NewClinicPage Component
 * Form for creating a new clinic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useCreateClinic } from '../api/hooks/useClinics';
import { toast } from 'react-toastify';

const NewClinicPage = () => {
  const navigate = useNavigate();
  const { mutate: createClinic, isPending } = useCreateClinic();

  const [formData, setFormData] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pin: '',
    },
    contact: {
      phone: '',
      email: '',
    },
    workingHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '09:00', end: '13:00' }],
      sunday: [],
    },
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Clinic name is required';
    if (!formData.address.line1.trim()) newErrors['address.line1'] = 'Address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.pin.trim()) newErrors['address.pin'] = 'PIN code is required';
    if (!formData.contact.phone.trim()) newErrors['contact.phone'] = 'Phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    createClinic(formData, {
      onSuccess: (data) => {
        toast.success('Clinic created successfully!');
        navigate(`/clinics/${data._id}`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create clinic');
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Create New Clinic
        </h1>
        <p className="text-gray-600 mt-2">
          Set up your clinic profile and working hours
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Clinic Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g., City Medical Center"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  name="contact.phone"
                  type="tel"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  error={errors['contact.phone']}
                  placeholder="+91-XXXXXXXXXX"
                  required
                />
                <Input
                  label="Email"
                  name="contact.email"
                  type="email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="contact@clinic.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Address Line 1"
                name="address.line1"
                value={formData.address.line1}
                onChange={handleChange}
                error={errors['address.line1']}
                placeholder="Street address"
                required
              />
              <Input
                label="Address Line 2"
                name="address.line2"
                value={formData.address.line2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc. (optional)"
              />
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  error={errors['address.city']}
                  required
                />
                <Input
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  error={errors['address.state']}
                  required
                />
                <Input
                  label="PIN Code"
                  name="address.pin"
                  value={formData.address.pin}
                  onChange={handleChange}
                  error={errors['address.pin']}
                  placeholder="400001"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="info">
              Default working hours are set to Monday-Friday 9:00 AM - 5:00 PM, and Saturday 9:00 AM - 1:00 PM.
              You can customize these after creating the clinic.
            </Alert>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Clinic
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClinicPage;
