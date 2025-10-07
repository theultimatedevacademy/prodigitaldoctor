/**
 * PrescriptionBuilder Component
 * Complete prescription creation form with DDI checking
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { MedicationSearch } from './MedicationSearch';
import { DDIWarnings } from './DDIWarnings';
import { prescriptionSchema } from '../../utils/validators';
import { useCheckDDI, useCreatePrescription } from '../../api/hooks/usePrescriptions';
import { MEDICATION_FREQUENCIES, DOSAGE_UNITS, DURATION_UNITS } from '../../utils/constants';
import { toast } from 'react-toastify';

/**
 * PrescriptionBuilder component
 * @param {object} props - Component props
 * @param {string} props.patientId - Patient ID
 * @param {string} props.clinicId - Clinic ID
 * @param {string} props.doctorId - Doctor ID
 * @param {string} props.appointmentId - Appointment ID (optional)
 * @param {Function} props.onSuccess - Success callback
 * @returns {JSX.Element} PrescriptionBuilder component
 */
export function PrescriptionBuilder({ patientId, clinicId, doctorId, appointmentId, onSuccess }) {
  const [ddiWarnings, setDdiWarnings] = useState([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedMedications, setSelectedMedications] = useState([]);
  
  const checkDDIMutation = useCheckDDI();
  const createPrescriptionMutation = useCreatePrescription();
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId,
      clinicId,
      doctorId,
      appointmentId,
      medications: [],
      diagnosis: [{ code: '', text: '' }],
      notes: '',
    },
  });
  
  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control,
    name: 'medications',
  });
  
  const { fields: diagnosisFields, append: appendDiagnosis, remove: removeDiagnosis } = useFieldArray({
    control,
    name: 'diagnosis',
  });
  
  // Handle medication selection
  const handleMedicationSelect = (medication) => {
    const newMed = {
      medicationId: medication._id,
      medication,
      dosage: '',
      frequency: 'BID',
      duration: '5 days',
      instructions: '',
    };
    
    appendMedication(newMed);
    setSelectedMedications([...selectedMedications, medication]);
    
    // Check DDI with new medication
    checkDDI([...selectedMedications, medication]);
  };
  
  // Check drug-drug interactions
  const checkDDI = async (medications) => {
    if (medications.length < 2) {
      setDdiWarnings([]);
      return;
    }
    
    const compositionIds = medications.flatMap(
      med => med.compositions?.map(c => c._id || c) || []
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
      const prescriptionData = {
        ...data,
        ddiOverride: overrideReason || undefined,
      };
      
      const result = await createPrescriptionMutation.mutateAsync(prescriptionData);
      toast.success('Prescription created successfully!');
      onSuccess?.(result.prescription);
    } catch (error) {
      toast.error(error.message || 'Failed to create prescription');
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
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Medications Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Medications</h3>
        
        <MedicationSearch onSelect={handleMedicationSelect} />
        
        {medicationFields.length > 0 && (
          <div className="mt-4 space-y-3">
            {medicationFields.map((field, index) => {
              const medication = selectedMedications[index];
              return (
                <div key={field.id} className="border border-clinical-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{medication?.brandName || 'Medication'}</h4>
                      <p className="text-sm text-clinical-600">{medication?.genericName}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Dosage"
                      placeholder="e.g., 500 mg"
                      {...register(`medications.${index}.dosage`)}
                      error={errors.medications?.[index]?.dosage?.message}
                    />
                    <Select
                      label="Frequency"
                      options={MEDICATION_FREQUENCIES}
                      {...register(`medications.${index}.frequency`)}
                      error={errors.medications?.[index]?.frequency?.message}
                    />
                    <Input
                      label="Duration"
                      placeholder="e.g., 5 days"
                      {...register(`medications.${index}.duration`)}
                      error={errors.medications?.[index]?.duration?.message}
                    />
                    <Textarea
                      label="Instructions"
                      placeholder="e.g., Take with food"
                      rows={2}
                      {...register(`medications.${index}.instructions`)}
                    />
                  </div>
                </div>
              );
            })}
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
      
      {/* Diagnosis Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Diagnosis</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendDiagnosis({ code: '', text: '' })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Diagnosis
          </Button>
        </div>
        
        <div className="space-y-3">
          {diagnosisFields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <Input
                placeholder="ICD-10 Code (optional)"
                className="w-32"
                {...register(`diagnosis.${index}.code`)}
              />
              <Input
                placeholder="Diagnosis description"
                className="flex-1"
                {...register(`diagnosis.${index}.text`)}
                error={errors.diagnosis?.[index]?.text?.message}
              />
              {diagnosisFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDiagnosis(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      
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
          loading={createPrescriptionMutation.isPending}
          disabled={medicationFields.length === 0 || (hasContraindicated && !overrideReason)}
        >
          {hasContraindicated ? 'Review & Override' : 'Save & Generate PDF'}
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
