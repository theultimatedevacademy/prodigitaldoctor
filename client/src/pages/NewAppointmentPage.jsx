/**
 * NewAppointmentPage Component
 * Form for creating a new appointment with First Visit / Follow Up options
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useClinicContext } from '../hooks/useClinicContext';
import { useCreateFirstVisitAppointment, useCreateFollowUpAppointment } from '../api/hooks/useAppointments';
import { useClinicDoctors } from '../api/hooks/useClinics';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import AppointmentTypeSelector from '../components/appointments/AppointmentTypeSelector';
import FirstVisitForm from '../components/appointments/FirstVisitForm';
import FollowUpForm from '../components/appointments/FollowUpForm';

const NewAppointmentPage = () => {
  const navigate = useNavigate();
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();
  
  // Mutations
  const { mutate: createFirstVisit, isPending: isCreatingFirstVisit } = useCreateFirstVisitAppointment();
  const { mutate: createFollowUp, isPending: isCreatingFollowUp } = useCreateFollowUpAppointment();
  
  // Fetch clinic doctors
  const { data: doctorsData, isLoading: isLoadingDoctors } = useClinicDoctors(selectedClinicId);
  const doctors = doctorsData?.doctors || [];

  // State
  const [visitType, setVisitType] = useState('first_visit');
  const [formData, setFormData] = useState({
    doctor: '',
    name: '',
    phone: '',
    patient: '',
    date: '',
    time: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPatientCode, setGeneratedPatientCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleVisitTypeChange = (type) => {
    setVisitType(type);
    // Reset form data when switching visit type (form components will auto-select doctor)
    setFormData({
      doctor: '',
      name: '',
      phone: '',
      patient: '',
      date: formData.date, // Keep date
      time: '',
      notes: '',
    });
    setErrors({});
  };

  const validateFirstVisitForm = () => {
    const newErrors = {};

    if (!selectedClinicId) {
      newErrors.clinic = 'Please select a clinic first';
    }
    if (!formData.doctor) {
      newErrors.doctor = 'Doctor is required';
    }
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Patient name is required';
    }
    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFollowUpForm = () => {
    const newErrors = {};

    if (!selectedClinicId) {
      newErrors.clinic = 'Please select a clinic first';
    }
    if (!formData.doctor) {
      newErrors.doctor = 'Doctor is required';
    }
    if (!formData.patient) {
      newErrors.patient = 'Patient is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate based on visit type
    const isValid = visitType === 'first_visit' 
      ? validateFirstVisitForm() 
      : validateFollowUpForm();

    if (!isValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Combine date and time - send as-is to backend without timezone conversion
    // The backend will treat this as the appointment time in the clinic's local timezone
    const startAt = `${formData.date}T${formData.time}:00`;
    
    // Calculate end time (30 minutes later)
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    const endAt = `${formData.date}T${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;

    if (visitType === 'first_visit') {
      const appointmentData = {
        clinic: selectedClinicId,
        doctor: formData.doctor,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        startAt,
        endAt,
        notes: formData.notes,
      };

      createFirstVisit(appointmentData, {
        onSuccess: (response) => {
          setGeneratedPatientCode(response.patientCode);
          setShowSuccess(true);
          toast.success(`Appointment created! Patient Code: ${response.patientCode}`);
          
          // Navigate after showing success
          setTimeout(() => {
            navigate('/appointments');
          }, 3000);
        },
        onError: (error) => {
          toast.error(error.response?.data?.error || 'Failed to create appointment');
        },
      });
    } else {
      const appointmentData = {
        clinic: selectedClinicId,
        doctor: formData.doctor,
        patient: formData.patient,
        startAt,
        endAt,
        notes: formData.notes,
      };

      createFollowUp(appointmentData, {
        onSuccess: () => {
          toast.success('Appointment created successfully!');
          navigate('/appointments');
        },
        onError: (error) => {
          toast.error(error.response?.data?.error || 'Failed to create appointment');
        },
      });
    }
  };

  if (!selectedClinicId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="warning">
          <p>Please select a clinic before creating an appointment.</p>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="warning">
          <p>Loading user information...</p>
        </Alert>
      </div>
    );
  }

  const isPending = isCreatingFirstVisit || isCreatingFollowUp;

  // Success screen for first visit
  if (showSuccess && generatedPatientCode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Patient has been registered and appointment has been scheduled.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 inline-block">
              <p className="text-sm text-gray-600 mb-2">Patient Code</p>
              <p className="text-3xl font-bold text-blue-600">{generatedPatientCode}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Please note down this patient code for future reference.
            </p>
            <Button onClick={() => navigate('/appointments')}>
              Go to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </button>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          New Appointment
        </h1>
        <p className="text-gray-600 mt-2">Book a new appointment for patient</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Visit Type Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <AppointmentTypeSelector
              selectedType={visitType}
              onChange={handleVisitTypeChange}
            />
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {visitType === 'first_visit' ? 'First Visit Details' : 'Follow-Up Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDoctors ? (
              <div className="text-center py-8 text-gray-500">
                Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <Alert variant="warning">
                <p>No doctors found for this clinic. Please add doctors first.</p>
              </Alert>
            ) : visitType === 'first_visit' ? (
              <FirstVisitForm
                formData={formData}
                onChange={handleChange}
                errors={errors}
                doctors={doctors}
                selectedClinic={selectedClinicId}
              />
            ) : (
              <FollowUpForm
                formData={formData}
                onChange={handleChange}
                errors={errors}
                doctors={doctors}
                selectedClinic={selectedClinicId}
              />
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        {!isLoadingDoctors && doctors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information about the appointment..."
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {!isLoadingDoctors && doctors.length > 0 && (
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/appointments')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Create Appointment
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewAppointmentPage;
