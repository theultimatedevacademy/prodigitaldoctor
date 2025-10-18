/**
 * PrescriptionBuilder Component
 * Complete prescription creation form with DDI checking
 */

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { Trash2, AlertTriangle, CheckCircle, Calendar, ArrowLeft, Plus, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { MedicationSearch } from './MedicationSearch';
import { DDIWarnings } from './DDIWarnings';
import { prescriptionSchema } from '../../utils/validators';
import { useCheckDDI, useCreatePrescription, useUpdatePrescription, usePrescription } from '../../api/hooks/usePrescriptions';
import { usePatient } from '../../api/hooks/usePatients';
import { useAppointment } from '../../api/hooks/useAppointments';
import { MEDICATION_FREQUENCIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

/**
 * PrescriptionBuilder component
 * @param {object} props - Component props
 * @param {string} props.patientId - Patient ID
 * @param {string} props.clinicId - Clinic ID
 * @param {string} props.doctorId - Doctor ID
 * @param {string} props.appointmentId - Appointment ID (optional)
 * @param {string} props.prescriptionId - Prescription ID (for edit mode)
 * @param {boolean} props.isEditMode - Whether in edit mode
 * @param {Function} props.onSuccess - Success callback
 * @returns {JSX.Element} PrescriptionBuilder component
 */
export function PrescriptionBuilder({ patientId, clinicId, doctorId, appointmentId, prescriptionId, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();
  const [ddiWarnings, setDdiWarnings] = useState([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [savedPrescription, setSavedPrescription] = useState(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  // Staging state for medication being added
  const [stagingMedication, setStagingMedication] = useState(null);
  const [stagingData, setStagingData] = useState({
    dosage: '',
    frequency: 'BID',
    duration: '',
    instructions: ''
  });
  
  // Fetch patient and appointment data
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: appointment, isLoading: appointmentLoading } = useAppointment(appointmentId);
  const { data: existingPrescription, isLoading: prescriptionLoading } = usePrescription(prescriptionId);
  
  // Check if appointment already has a prescription (for create mode)
  // But don't show warning if this was just created (within last 1 minute)
  const checkIfJustCreated = () => {
    if (isEditMode) return false;
    
    const justCreated = localStorage.getItem('prescription_just_created');
    if (justCreated) {
      try {
        const { prescriptionId, timestamp } = JSON.parse(justCreated);
        const oneMinute = 60 * 1000;
        const withinTimeWindow = Date.now() - timestamp < oneMinute;
        const matchesCurrent = prescriptionId === (appointment?.prescriptions?.[0]?._id || appointment?.prescriptions?.[0]);
        return withinTimeWindow && matchesCurrent;
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  
  const appointmentHasPrescription = !isEditMode && appointment?.prescriptions?.length > 0 && !checkIfJustCreated();
  
  const checkDDIMutation = useCheckDDI();
  const createPrescriptionMutation = useCreatePrescription();
  const updatePrescriptionMutation = useUpdatePrescription();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId,
      clinicId,
      doctorId,
      appointmentId,
      medications: [],
      notes: '',
    },
  });

  // Watch medications array to show live updates in PDF preview
  const watchedMedications = watch('medications');
  
  const { fields: medicationFields, append: appendMedication, remove: removeMedication, replace } = useFieldArray({
    control,
    name: 'medications',
  });
  
  // Load existing prescription data in edit mode
  useEffect(() => {
    if (isEditMode && existingPrescription && !isFormInitialized) {
      // Populate medications
      const meds = existingPrescription.meds?.map(med => ({
        medicationId: med.medication._id,
        medication: med.medication,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.notes || '',
      })) || [];
      
      replace(meds);
      setSelectedMedications(meds.map(m => m.medication));
      setValue('notes', existingPrescription.notes || '');
      
      // Check DDI for existing medications
      if (meds.length >= 2) {
        checkDDI(meds.map(m => m.medication));
      }
      
      setIsFormInitialized(true);
    }
  }, [isEditMode, existingPrescription, isFormInitialized, replace, setValue]);
  
  // Handle medication selection from dropdown
  const handleMedicationSelect = (medication) => {
    setStagingMedication(medication);
    setStagingData({
      dosage: '',
      frequency: 'BID',
      duration: '',
      instructions: ''
    });
  };
  
  // Handle adding staged medication to prescription
  const handleAddMedication = () => {
    if (!stagingMedication) return;
    
    if (!stagingData.dosage || !stagingData.duration) {
      toast.error('Please fill in dosage and duration');
      return;
    }
    
    const newMed = {
      medicationId: stagingMedication._id,
      medication: stagingMedication,
      dosage: stagingData.dosage,
      frequency: stagingData.frequency,
      duration: stagingData.duration,
      instructions: stagingData.instructions,
    };
    
    appendMedication(newMed);
    setSelectedMedications([...selectedMedications, stagingMedication]);
    
    // Check DDI with new medication
    checkDDI([...selectedMedications, stagingMedication]);
    
    // Reset staging
    setStagingMedication(null);
    setStagingData({
      dosage: '',
      frequency: 'BID',
      duration: '',
      instructions: ''
    });
  };
  
  // Handle cancel staging
  const handleCancelStaging = () => {
    setStagingMedication(null);
    setStagingData({
      dosage: '',
      frequency: 'BID',
      duration: '',
      instructions: ''
    });
  };
  
  // Check drug-drug interactions
  const checkDDI = async (medications) => {
    if (medications.length < 2) {
      setDdiWarnings([]);
      return;
    }
    
    const compositionIds = medications.flatMap(
      med => med.unique_composition?.map(c => c._id || c) || []
    );
    
    if (compositionIds.length < 2) return;
    
    try {
      const result = await checkDDIMutation.mutateAsync(compositionIds);
      setDdiWarnings(result.warnings || []);
    } catch (error) {
      console.error('DDI check failed:', error);
      toast.error('Failed to check drug interactions');
    }
  };
  
  // Handle medication removal
  const handleRemoveMedication = (index) => {
    removeMedication(index);
    const newMeds = selectedMedications.filter((_, i) => i !== index);
    setSelectedMedications(newMeds);
    checkDDI(newMeds);
  };
  
  // Check if there are contraindicated warnings
  const hasContraindicated = ddiWarnings.some(w => w.severity === 'contraindicated');
  
  // Handle form submission
  const onSubmit = async (data) => {
    // Block if contraindicated without override
    if (hasContraindicated && !overrideReason) {
      setShowOverrideModal(true);
      return;
    }
    
    try {
      console.log('=== PRESCRIPTION SUBMISSION DEBUG ===');
      console.log('Form data:', data);
      console.log('Selected medications:', selectedMedications);
      console.log('Is edit mode:', isEditMode);
      
      // Transform data to match backend expectations
      const prescriptionData = {
        meds: data.medications.map((med, index) => {
          const selectedMed = selectedMedications[index];
          console.log(`Medication ${index}:`, { med, selectedMed });
          
          // Get medication ID - try multiple sources
          const medicationId = med.medicationId || med.medication?._id || med.medication || selectedMed?._id;
          
          if (!medicationId) {
            console.error(`Missing medication ID for index ${index}`, { med, selectedMed });
          }
          
          return {
            medication: medicationId,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.instructions,
          };
        }).filter(med => med.medication), // Filter out any meds without valid medication ID
        notes: data.notes,
        overrideDDI: overrideReason || undefined,
      };
      
      console.log('Transformed prescription data:', prescriptionData);
      console.log('Meds count:', prescriptionData.meds.length);
      console.log('Medication IDs being sent:', prescriptionData.meds.map(m => m.medication));
      console.log('Full meds array:', JSON.stringify(prescriptionData.meds, null, 2));
      console.log('====================================');
      
      // Validate we have medications
      if (prescriptionData.meds.length === 0) {
        toast.error('Please add at least one medication');
        return;
      }
      
      let result;
      if (isEditMode) {
        // Update existing prescription - include clinic ID for RBAC middleware
        prescriptionData.clinic = existingPrescription.clinic._id || existingPrescription.clinic;
        
        result = await updatePrescriptionMutation.mutateAsync({
          prescriptionId,
          data: prescriptionData,
        });
        toast.success('Prescription updated successfully!');
      } else {
        // Create new prescription
        prescriptionData.clinic = data.clinicId;
        prescriptionData.patient = data.patientId;
        prescriptionData.appointment = data.appointmentId;
        result = await createPrescriptionMutation.mutateAsync(prescriptionData);
        toast.success('Prescription created and saved successfully!');
      }
      
      setSavedPrescription(result);
      // Don't call onSuccess - we'll show success state instead
      // onSuccess?.(result);
    } catch (error) {
      console.error('=== PRESCRIPTION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('========================');
      
      const errorMessage = error.response?.data?.error || error.message || `Failed to ${isEditMode ? 'update' : 'create'} prescription`;
      toast.error(errorMessage);
    }
  };
  
  // Handle override confirmation
  const handleOverrideConfirm = () => {
    if (!overrideReason.trim()) {
      toast.error('Please provide a reason for overriding the warning');
      return;
    }
    setShowOverrideModal(false);
    handleSubmit(onSubmit)();
  };
  
  // Calculate BMI if vitals exist
  const bmi = appointment?.vitals?.weight && appointment?.vitals?.height 
    ? (appointment.vitals.weight / Math.pow(appointment.vitals.height / 100, 2)).toFixed(1)
    : null;

  if (patientLoading || appointmentLoading || (isEditMode && prescriptionLoading)) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>;
  }

  // Show success state after prescription is saved
  if (savedPrescription) {
    const handlePrint = () => {
      window.print();
    };

    // Navigate back to appointment
    const backToAppointment = () => {
      if (appointmentId) {
        navigate(`/appointments/${appointmentId}`);
      } else {
        navigate('/appointments');
      }
    };
    
    // Switch to edit mode
    const editPrescription = () => {
      // Store success flag in localStorage for brief period
      localStorage.setItem('prescription_just_created', JSON.stringify({
        prescriptionId: savedPrescription._id,
        timestamp: Date.now()
      }));
      
      // Navigate to edit mode
      navigate(`/prescriptions/new?appointmentId=${appointmentId}&patientId=${patientId}&editId=${savedPrescription._id}&fromCreation=true`);
    };

    return (
      <>
        {/* Print Styles */}
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            /* Hide all navigation and UI elements */
            nav, header, aside, .main-nav, [role="navigation"], button {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
            /* Clean print container - remove shadows and borders */
            .print-container {
              margin: 0 !important;
              padding: 20px !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
            }
            main {
              margin: 0 !important;
              padding: 0 !important;
              max-width: 100% !important;
            }
            /* Remove all card styling on print */
            .container, [class*="card"], [class*="Card"] {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
            }
            /* Ensure only prescription content shows */
            html, body {
              width: 100%;
              height: 100%;
            }
            * {
              box-shadow: none !important;
            }
          }
        `}</style>

        <div className="space-y-6">
          {/* Success Message - Hidden on print */}
          <div className="no-print bg-green-50 border-2 border-green-500 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isEditMode ? 'Prescription Updated Successfully!' : 'Prescription Created Successfully!'}
                  </h2>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                {appointmentId && (
                  <Button onClick={backToAppointment} variant="outline">
                    Back to Appointment
                  </Button>
                )}
                <Button onClick={editPrescription}>
                  Edit Prescription
                </Button>
              </div>
            </div>
          </div>

          {/* Full Prescription Preview */}
          <div className="print-container max-w-5xl mx-auto bg-white p-12 shadow-lg border border-gray-300" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-gray-300 pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PRESCRIPTION</h1>
              </div>
              {appointment?.clinic && (
                <div className="text-right">
                  <p className="text-lg font-semibold">{appointment.clinic.name}</p>
                  {appointment.clinic.address && (
                    <p className="text-sm text-gray-600">
                      {[
                        appointment.clinic.address.line1,
                        appointment.clinic.address.line2,
                        appointment.clinic.address.city,
                        appointment.clinic.address.state,
                        appointment.clinic.address.pin
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {appointment.clinic.phone && (
                    <p className="text-sm text-gray-600">Phone: {appointment.clinic.phone}</p>
                  )}
                </div>
              )}
            </div>

            {/* Doctor Info and Date */}
            <div className="flex justify-between items-start mb-4">
              {appointment?.doctor && (
                <div>
                  <p className="text-base font-semibold">Dr. {appointment.doctor.name}</p>
                  {appointment.doctor.specialization && (
                    <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                  )}
                  {appointment.doctor.registrationNumber && (
                    <p className="text-sm text-gray-600">Reg. No.: {appointment.doctor.registrationNumber}</p>
                  )}
                </div>
              )}

              <div className="text-right">
                <p className="text-sm">
                  <span className="font-semibold">Date:</span> {(() => {
                    const dateStr = savedPrescription.createdAt;
                    const date = new Date(dateStr);
                    const isoStr = typeof dateStr === 'string' ? dateStr : date.toISOString();
                    const [datePart] = isoStr.split('T');
                    const [year, month, day] = datePart.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                  })()}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="border border-gray-300 rounded p-4 mb-6">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">PATIENT INFORMATION</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p><span className="font-semibold">Name:</span> {patient?.name || 'N/A'}</p>
                  <p><span className="font-semibold">Age/Gender:</span> {patient?.age || 'N/A'} years / {patient?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Patient ID:</span> {patient?.patientCodes?.[0]?.code || 'N/A'}</p>
                  <p><span className="font-semibold">Phone:</span> {patient?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vitals */}
            {appointment?.vitals && (
              <div className="border border-gray-300 rounded p-4 mb-6">
                <h2 className="text-sm font-semibold mb-3 text-gray-700">VITALS</h2>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  {appointment.vitals.bloodPressureSystolic && (
                    <div>
                      <p className="font-semibold">BP:</p>
                      <p>{appointment.vitals.bloodPressureSystolic}/{appointment.vitals.bloodPressureDiastolic} mmHg</p>
                    </div>
                  )}
                  {appointment.vitals.pulse && (
                    <div>
                      <p className="font-semibold">Pulse:</p>
                      <p>{appointment.vitals.pulse} bpm</p>
                    </div>
                  )}
                  {appointment.vitals.temperature && (
                    <div>
                      <p className="font-semibold">Temp:</p>
                      <p>{appointment.vitals.temperature}°F</p>
                    </div>
                  )}
                  {appointment.vitals.spo2 && (
                    <div>
                      <p className="font-semibold">SpO2:</p>
                      <p>{appointment.vitals.spo2}%</p>
                    </div>
                  )}
                  {appointment.vitals.weight && (
                    <div>
                      <p className="font-semibold">Weight:</p>
                      <p>{appointment.vitals.weight} kg</p>
                    </div>
                  )}
                  {appointment.vitals.height && (
                    <div>
                      <p className="font-semibold">Height:</p>
                      <p>{appointment.vitals.height} cm</p>
                    </div>
                  )}
                  {bmi && (
                    <div>
                      <p className="font-semibold">BMI:</p>
                      <p>{bmi}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {appointment?.clinicalNotes && (
              <div className="border border-gray-300 rounded p-4 mb-6">
                <h2 className="text-sm font-semibold mb-3 text-gray-700">CLINICAL NOTES</h2>
                <div className="space-y-2 text-sm">
                  {appointment.clinicalNotes.chiefComplaint && (
                    <p><span className="font-semibold">Chief Complaint:</span> {appointment.clinicalNotes.chiefComplaint}</p>
                  )}
                  {appointment.clinicalNotes.symptoms && (
                    <p><span className="font-semibold">Symptoms:</span> {appointment.clinicalNotes.symptoms}</p>
                  )}
                  {appointment.clinicalNotes.examination && (
                    <p><span className="font-semibold">Examination:</span> {appointment.clinicalNotes.examination}</p>
                  )}
                  {appointment.clinicalNotes.diagnosis && (
                    <p><span className="font-semibold">Diagnosis:</span> {appointment.clinicalNotes.diagnosis}</p>
                  )}
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-4 pb-2 border-b-2 border-gray-300">Rx</h2>
              <div className="space-y-4">
                {savedPrescription.meds?.map((med, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3">
                    <div className="flex items-start">
                      <span className="font-semibold mr-2">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="font-semibold text-base">
                          {med.medication?.brandName || med.medication?.genericName || 'Medication'}
                        </p>
                        {med.medication?.exact_composition && (
                          <p className="text-xs italic text-gray-600 mt-1">
                            {med.medication.exact_composition}
                          </p>
                        )}
                        <p className="text-sm text-gray-800 mt-2">
                          <span className="font-semibold">Dosage:</span> {med.dosage} | <span className="font-semibold">Frequency:</span> {med.frequency} | <span className="font-semibold">Duration:</span> {med.duration}
                        </p>
                        {med.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            {med.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {savedPrescription.notes && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-2 text-gray-700">ADDITIONAL NOTES</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{savedPrescription.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300">
              <div className="flex justify-between items-end">
                <div className="text-xs text-gray-600">
                  <p>Electronically generated by Ocura360</p>
                  <p className="mt-1">
                    Generated on: {(() => {
                      const dateStr = savedPrescription.createdAt;
                      const date = new Date(dateStr);
                      const isoStr = typeof dateStr === 'string' ? dateStr : date.toISOString();
                      const [datePart, timePart] = isoStr.split('T');
                      const [year, month, day] = datePart.split('-');
                      const [hour, minute] = timePart.split(':');
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                      let hourNum = parseInt(hour);
                      const ampm = hourNum >= 12 ? 'PM' : 'AM';
                      hourNum = hourNum % 12 || 12;
                      const formattedTime = `${hourNum.toString().padStart(2, '0')}:${minute} ${ampm}`;
                      return `${formattedDate} at ${formattedTime}`;
                    })()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-2 mt-8" style={{ minWidth: '200px' }}>
                    <p className="text-sm font-semibold">Dr. {appointment?.doctor?.name}</p>
                    <p className="text-xs text-gray-600">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Warning if appointment already has prescription */}
      {appointmentHasPrescription && (
        <Alert variant="warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Prescription Already Exists</p>
              <p className="text-sm mt-1">
                This appointment already has a prescription. Please edit the existing prescription instead of creating a new one.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                onClick={() => navigate(`/prescriptions/new?appointmentId=${appointmentId}&patientId=${patientId}&editId=${appointment.prescriptions[0]._id || appointment.prescriptions[0]}`)}
              >
                Edit Existing Prescription
              </Button>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Clinical Summary Section - PDF Style */}
      <div className="bg-white border border-gray-300 p-8 space-y-4" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-gray-300 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">PRESCRIPTION</h2>
          </div>
          {appointment?.clinic && (
            <div className="text-right">
              <p className="text-base font-semibold">{appointment.clinic.name}</p>
              {appointment.clinic.address && (
                <p className="text-xs text-gray-600">
                  {[
                    appointment.clinic.address.line1,
                    appointment.clinic.address.line2,
                    appointment.clinic.address.city,
                    appointment.clinic.address.state,
                    appointment.clinic.address.pin
                  ].filter(Boolean).join(', ')}
                </p>
              )}
              {appointment.clinic.phone && (
                <p className="text-xs text-gray-600">Phone: {appointment.clinic.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Doctor Info and Date - Same Line */}
        <div className="flex justify-between items-start mb-4">
          {/* Doctor Info - Left Side */}
          {appointment?.doctor && (
            <div>
              <p className="text-sm font-semibold">Dr. {appointment.doctor.name}</p>
              {appointment.doctor.specialization && (
                <p className="text-xs text-gray-600">{appointment.doctor.specialization}</p>
              )}
              {appointment.doctor.registrationNumber && (
                <p className="text-xs text-gray-600">Reg. No.: {appointment.doctor.registrationNumber}</p>
              )}
            </div>
          )}

          {/* Date - Right Side */}
          <div className="text-right">
            <p className="text-xs">
              <span className="font-semibold">Date:</span> {(() => {
                // Extract date without timezone conversion
                const dateStr = appointment?.startAt || new Date().toISOString();
                const date = new Date(dateStr);
                const isoStr = typeof dateStr === 'string' ? dateStr : date.toISOString();
                const [datePart] = isoStr.split('T');
                const [year, month, day] = datePart.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
              })()}
            </p>
            {isEditMode && existingPrescription?.lastEditedAt && (
              <p className="text-xs text-gray-600 mt-1">
                Edited on {(() => {
                  const dateStr = existingPrescription.lastEditedAt;
                  const date = new Date(dateStr);
                  const isoStr = typeof dateStr === 'string' ? dateStr : date.toISOString();
                  const [datePart, timePart] = isoStr.split('T');
                  const [year, month, day] = datePart.split('-');
                  const [hour, minute] = timePart.split(':');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                  let hourNum = parseInt(hour);
                  const ampm = hourNum >= 12 ? 'PM' : 'AM';
                  hourNum = hourNum % 12 || 12;
                  const formattedTime = `${hourNum.toString().padStart(2, '0')}:${minute} ${ampm}`;
                  return `${formattedDate} at ${formattedTime}`;
                })()}
              </p>
            )}
          </div>
        </div>
        
        {/* Patient Information */}
        <div className="border border-gray-300 rounded p-4 mb-4">
          <h3 className="text-xs font-semibold mb-2 text-gray-700">PATIENT INFORMATION</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p><span className="font-semibold">Name:</span> {patient?.name || 'N/A'}</p>
              <p><span className="font-semibold">Age/Gender:</span> {patient?.age || 'N/A'} years / {patient?.gender || 'N/A'}</p>
            </div>
            <div>
              <p><span className="font-semibold">Patient ID:</span> {patient?.patientCodes?.[0]?.code || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> {patient?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Vitals */}
        {appointment?.vitals && (
          <div className="border border-gray-300 rounded p-4 mb-4">
            <h3 className="text-xs font-semibold mb-2 text-gray-700">VITALS</h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {appointment.vitals.bloodPressureSystolic && (
                <div>
                  <p className="font-semibold">BP:</p>
                  <p>{appointment.vitals.bloodPressureSystolic}/{appointment.vitals.bloodPressureDiastolic} mmHg</p>
                </div>
              )}
              {appointment.vitals.pulse && (
                <div>
                  <p className="font-semibold">Pulse:</p>
                  <p>{appointment.vitals.pulse} bpm</p>
                </div>
              )}
              {appointment.vitals.temperature && (
                <div>
                  <p className="font-semibold">Temp:</p>
                  <p>{appointment.vitals.temperature}°F</p>
                </div>
              )}
              {appointment.vitals.spo2 && (
                <div>
                  <p className="font-semibold">SpO2:</p>
                  <p>{appointment.vitals.spo2}%</p>
                </div>
              )}
              {appointment.vitals.weight && (
                <div>
                  <p className="font-semibold">Weight:</p>
                  <p>{appointment.vitals.weight} kg</p>
                </div>
              )}
              {appointment.vitals.height && (
                <div>
                  <p className="font-semibold">Height:</p>
                  <p>{appointment.vitals.height} cm</p>
                </div>
              )}
              {bmi && (
                <div>
                  <p className="font-semibold">BMI:</p>
                  <p>{bmi}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clinical Notes */}
        {appointment?.clinicalNotes && (
          <div className="border border-gray-300 rounded p-4 mb-4">
            <h3 className="text-xs font-semibold mb-2 text-gray-700">CLINICAL NOTES</h3>
            <div className="space-y-1 text-xs">
              {appointment.clinicalNotes.chiefComplaint && (
                <p><span className="font-semibold">Chief Complaint:</span> {appointment.clinicalNotes.chiefComplaint}</p>
              )}
              {appointment.clinicalNotes.symptoms && (
                <p><span className="font-semibold">Symptoms:</span> {appointment.clinicalNotes.symptoms}</p>
              )}
              {appointment.clinicalNotes.examination && (
                <p><span className="font-semibold">Examination:</span> {appointment.clinicalNotes.examination}</p>
              )}
              {appointment.clinicalNotes.diagnosis && (
                <p><span className="font-semibold">Diagnosis:</span> {appointment.clinicalNotes.diagnosis}</p>
              )}
            </div>
          </div>
        )}

        {/* Medications Preview */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3 pb-2 border-b-2 border-gray-300">Rx</h3>
          {medicationFields.length > 0 ? (
            <div className="space-y-3">
              {medicationFields.map((field, index) => {
                const medication = selectedMedications[index];
                const medData = watchedMedications?.[index] || {};
                return (
                  <div key={field.id} className="border-b border-gray-200 pb-2">
                    <div className="flex items-start">
                      <span className="font-semibold mr-2 text-sm">{index + 1}.</span>
                      <div className="flex-1">
                        {/* Medicine Name */}
                        <p className="font-semibold text-sm">
                          {medication?.brandName || medication?.genericName || 'Medication'}
                        </p>
                        
                        {/* Exact Composition - Small, Italics */}
                        {medication?.exact_composition && (
                          <p className="text-xs italic text-gray-600 mt-1">
                            {medication.exact_composition}
                          </p>
                        )}
                        
                        {/* Dosage, Frequency, Duration - Single Line */}
                        {medData.dosage && medData.frequency && medData.duration && (
                          <p className="text-xs text-gray-800 mt-1">
                            <span className="font-semibold">Dosage:</span> {medData.dosage} | <span className="font-semibold">Frequency:</span> {medData.frequency} | <span className="font-semibold">Duration:</span> {medData.duration}
                          </p>
                        )}
                        
                        {/* Instructions if available */}
                        {medData.instructions && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            {medData.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No medications added yet</p>
          )}
        </div>
      </div>

      {/* Medications Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Add Medications</h3>
        
        <MedicationSearch onSelect={handleMedicationSelect} />
        
        {/* Staging Form - Show when medication is selected */}
        {stagingMedication && (
          <div className="mt-4 border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-lg">{stagingMedication.brandName}</h4>
                <p className="text-sm text-blue-600">{stagingMedication.genericName}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelStaging}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Dosage *"
                placeholder="e.g., 500 mg"
                value={stagingData.dosage}
                onChange={(e) => setStagingData({...stagingData, dosage: e.target.value})}
              />
              <Select
                label="Frequency"
                options={MEDICATION_FREQUENCIES}
                value={stagingData.frequency}
                onChange={(e) => setStagingData({...stagingData, frequency: e.target.value})}
              />
              <Input
                label="Duration *"
                placeholder="e.g., 5 days"
                value={stagingData.duration}
                onChange={(e) => setStagingData({...stagingData, duration: e.target.value})}
              />
              <Textarea
                label="Instructions"
                placeholder="e.g., Take with food"
                rows={2}
                value={stagingData.instructions}
                onChange={(e) => setStagingData({...stagingData, instructions: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                onClick={handleAddMedication}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Prescription
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelStaging}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Added Medications List */}
        {medicationFields.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-md mb-3">Added Medications ({medicationFields.length})</h4>
            <div className="space-y-2">
              {medicationFields.map((field, index) => {
                const medication = selectedMedications[index];
                const medData = watchedMedications?.[index] || {};
                return (
                  <div key={field.id} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{medication?.brandName || 'Medication'}</h4>
                          <span className="text-xs text-gray-500">({medication?.genericName})</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p><span className="font-medium">Dosage:</span> {medData.dosage}</p>
                          <p><span className="font-medium">Frequency:</span> {medData.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {medData.duration}</p>
                          {medData.instructions && (
                            <p><span className="font-medium">Instructions:</span> {medData.instructions}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {errors.medications && (
          <p className="text-red-600 text-sm mt-2">{errors.medications.message}</p>
        )}
      </div>
      
      {/* DDI Warnings */}
      {medicationFields.length >= 2 && (
        <DDIWarnings
          warnings={ddiWarnings}
          onOverride={() => setShowOverrideModal(true)}
        />
      )}
      
      {/* Notes */}
      <Textarea
        label="Additional Notes"
        placeholder="Any additional instructions or notes..."
        rows={4}
        {...register('notes')}
        error={errors.notes?.message}
      />
      
      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          loading={createPrescriptionMutation.isPending || updatePrescriptionMutation.isPending}
          disabled={
            medicationFields.length === 0 || 
            (hasContraindicated && !overrideReason) ||
            appointmentHasPrescription
          }
        >
          {hasContraindicated 
            ? 'Review & Override' 
            : isEditMode 
              ? 'Update Prescription' 
              : 'Save & Generate PDF'
          }
        </Button>
      </div>
      
      {/* Override Modal */}
      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Override Contraindicated Interaction"
        size="md"
      >
        <Alert variant="error" className="mb-4">
          <AlertTriangle className="w-5 h-5" />
          <strong>Warning:</strong> You are about to override a contraindicated drug interaction.
          This action requires clinical justification.
        </Alert>
        
        <Textarea
          label="Justification for Override"
          placeholder="Provide detailed clinical reasoning for overriding this warning..."
          rows={4}
          value={overrideReason}
          onChange={(e) => setOverrideReason(e.target.value)}
          required
        />
        
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowOverrideModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleOverrideConfirm}>
            Confirm Override
          </Button>
        </ModalFooter>
      </Modal>
    </form>
  );
}
