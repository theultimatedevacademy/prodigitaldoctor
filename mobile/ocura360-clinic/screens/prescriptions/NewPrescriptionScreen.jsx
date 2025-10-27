import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Text, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Plus, X, Pill, AlertTriangle, Check, Search } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Divider } from '../../components/ui/Divider';
import { useSearchMedications, useCheckDDI } from '../../api/hooks/useMedications';
import { useCreatePrescription, useUpdatePrescription, usePrescription } from '../../api/hooks/usePrescriptions';
import { useAppointment } from '../../api/hooks/useAppointments';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useMe } from '../../api/hooks/useAuth';

const MEDICATION_FREQUENCIES = [
  { label: 'Once daily (OD)', value: 'OD' },
  { label: 'Twice daily (BD)', value: 'BD' },
  { label: 'Three times daily (TDS)', value: 'TDS' },
  { label: 'Four times daily (QDS)', value: 'QDS' },
  { label: 'As needed (PRN)', value: 'PRN' },
  { label: 'Before meals', value: 'Before meals' },
  { label: 'After meals', value: 'After meals' },
];

export default function NewPrescriptionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId, prescriptionId } = route.params || {};
  const { selectedClinicId } = useClinicContext();
  const { data: user } = useMe();

  // Fetch appointment data if provided
  const { data: appointment, isLoading: appointmentLoading } = useAppointment(appointmentId, {
    enabled: !!appointmentId,
  });

  // Fetch existing prescription for edit mode
  const { data: existingPrescription, isLoading: prescriptionLoading } = usePrescription(prescriptionId, {
    enabled: !!prescriptionId,
  });

  const isEditMode = !!prescriptionId;

  // Form state
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [notes, setNotes] = useState('');

  // Medication search state
  const [medicationSearchQuery, setMedicationSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);

  // Staging medication (being added)
  const [stagingMedication, setStagingMedication] = useState(null);
  const [stagingData, setStagingData] = useState({
    dosage: '',
    frequency: 'BD',
    duration: '',
    notes: '',
  });

  // DDI state
  const [ddiWarnings, setDdiWarnings] = useState([]);
  const [overrideDDI, setOverrideDDI] = useState(false);

  // Debounce medication search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(medicationSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [medicationSearchQuery]);

  // Search medications
  const { data: medicationsResponse, isLoading: medicationsLoading } = useSearchMedications(
    debouncedSearchQuery,
    { enabled: debouncedSearchQuery.length >= 2 }
  );
  const medications = medicationsResponse?.medications || [];

  // Mutations
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const checkDDIMutation = useCheckDDI();

  // Load existing prescription data in edit mode
  useEffect(() => {
    if (existingPrescription && isEditMode) {
      setNotes(existingPrescription.notes || '');

      const meds = existingPrescription.meds?.map(med => ({
        medication: med.medication,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        notes: med.notes || '',
      })) || [];

      setSelectedMedications(meds);

      // Check DDI for existing medications
      if (meds.length >= 2) {
        checkDDI(meds.map(m => m.medication));
      }
    }
  }, [existingPrescription, isEditMode]);

  // Check DDI when medications change
  const checkDDI = async (medicationList) => {
    if (medicationList.length < 2) {
      setDdiWarnings([]);
      return;
    }

    try {
      const medicationIds = medicationList.map(m => m._id || m.medication?._id);
      const result = await checkDDIMutation.mutateAsync({ medicationIds });

      if (result.warnings && result.warnings.length > 0) {
        setDdiWarnings(result.warnings);
      } else {
        setDdiWarnings([]);
      }
    } catch (error) {
      console.error('DDI check failed:', error);
    }
  };

  // Handle medication selection from dropdown
  const handleMedicationSelect = (medication) => {
    setStagingMedication(medication);
    setMedicationSearchQuery('');
    setShowMedicationDropdown(false);
    setStagingData({
      dosage: '',
      frequency: 'BD',
      duration: '',
      notes: '',
    });
  };

  // Add staged medication to list
  const handleAddMedication = async () => {
    if (!stagingMedication) {
      Alert.alert('Error', 'Please select a medication');
      return;
    }

    if (!stagingData.dosage || !stagingData.duration) {
      Alert.alert('Error', 'Please fill in dosage and duration');
      return;
    }

    const newMed = {
      medication: stagingMedication,
      dosage: stagingData.dosage,
      frequency: stagingData.frequency,
      duration: stagingData.duration,
      notes: stagingData.notes,
    };

    const updatedMeds = [...selectedMedications, newMed];
    setSelectedMedications(updatedMeds);

    // Check DDI with new medication
    await checkDDI([...selectedMedications.map(m => m.medication), stagingMedication]);

    // Reset staging
    setStagingMedication(null);
    setStagingData({
      dosage: '',
      frequency: 'BD',
      duration: '',
      notes: '',
    });
  };

  // Remove medication from list
  const handleRemoveMedication = async (index) => {
    const updatedMeds = selectedMedications.filter((_, i) => i !== index);
    setSelectedMedications(updatedMeds);

    // Re-check DDI
    if (updatedMeds.length >= 2) {
      await checkDDI(updatedMeds.map(m => m.medication));
    } else {
      setDdiWarnings([]);
    }
  };

  // Cancel staging medication
  const handleCancelStaging = () => {
    setStagingMedication(null);
    setStagingData({
      dosage: '',
      frequency: 'BD',
      duration: '',
      notes: '',
    });
  };

  // Check if has severe DDI warnings
  const hasSevereWarnings = ddiWarnings.some(
    w => w.severity === 'contraindicated' || w.severity === 'major'
  );

  // Validate and submit
  const handleSubmit = async () => {
    // Validation
    if (selectedMedications.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one medication');
      return;
    }

    // Check for severe DDI without override
    if (hasSevereWarnings && !overrideDDI) {
      Alert.alert(
        'Severe Drug Interactions',
        'This prescription has severe drug interactions. Please review the warnings and check the override box to proceed.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const prescriptionData = {
        clinic: selectedClinicId,
        patient: appointment?.patient?._id || existingPrescription?.patient?._id,
        appointment: appointmentId,
        meds: selectedMedications.map(med => ({
          medication: med.medication._id,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          notes: med.notes,
        })),
        diagnosis: [], // Empty array - diagnosis is in clinical notes
        notes,
        overrideDDI: hasSevereWarnings ? overrideDDI : undefined,
      };

      let result;
      if (isEditMode) {
        result = await updatePrescription.mutateAsync({
          prescriptionId,
          data: prescriptionData,
        });
        Alert.alert('Success', 'Prescription updated successfully');
      } else {
        result = await createPrescription.mutateAsync(prescriptionData);
        Alert.alert('Success', 'Prescription created successfully');
      }

      // Navigate to prescription detail
      navigation.replace('PrescriptionDetail', { id: result._id });
    } catch (error) {
      if (error.response?.data?.requiresOverride) {
        setDdiWarnings(error.response.data.ddiWarnings || []);
        Alert.alert('Severe Drug Interactions', 'Please review the warnings and enable override to continue');
      } else if (error.response?.data?.existingPrescriptionId) {
        Alert.alert(
          'Prescription Already Exists',
          'A prescription already exists for this appointment. Redirecting to edit mode...',
          [{
            text: 'OK',
            onPress: () => navigation.replace('NewPrescription', {
              prescriptionId: error.response.data.existingPrescriptionId,
              appointmentId
            })
          }]
        );
      } else {
        Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to save prescription');
      }
    }
  };

  // Loading states
  if (appointmentLoading || prescriptionLoading) {
    return (
      <ScreenWrapper>
        <Header title={isEditMode ? 'Edit Prescription' : 'New Prescription'} showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title={isEditMode ? 'Edit Prescription' : 'New Prescription'}
        showBack
      />

      <ScrollView className="flex-1 p-4">
        {/* Prescription Preview Header */}
        <Card className="mb-4 bg-blue-50 border-2 border-blue-200">
          <CardContent className="py-3">
            <Text className="text-center text-sm font-semibold text-blue-900">
              📋 PRESCRIPTION PREVIEW
            </Text>
            <Text className="text-center text-xs text-blue-700 mt-1">
              This will be printed/saved as the patient's prescription
            </Text>
          </CardContent>
        </Card>

        {/* Clinic & Doctor Info */}
        {appointment && (
          <Card className="mb-4">
            <CardContent>
              <Text className="text-lg font-bold text-gray-900">
                {appointment.clinic?.name || 'Clinic Name'}
              </Text>
              {appointment.clinic?.address && (
                <Text className="text-xs text-gray-600 mt-1">
                  {[
                    appointment.clinic.address.street,
                    appointment.clinic.address.city,
                    appointment.clinic.address.state,
                    appointment.clinic.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              )}
              {appointment.clinic?.phone && (
                <Text className="text-xs text-gray-600">
                  📞 {appointment.clinic.phone}
                </Text>
              )}
              <Divider className="my-2" />
              <Text className="text-sm font-semibold text-gray-700">
                Dr. {appointment.doctor?.name || user?.name}
              </Text>
              {appointment.doctor?.specialization && (
                <Text className="text-xs text-gray-600">
                  {appointment.doctor.specialization}
                </Text>
              )}
            </CardContent>
          </Card>
        )}

        {/* Patient Info (Auto-populated from appointment) */}
        {(appointment || existingPrescription) && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-base font-semibold text-gray-900">
                {appointment?.patient?.name || existingPrescription?.patient?.name}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Age: {appointment?.patient?.age || existingPrescription?.patient?.age} • Gender:{' '}
                {appointment?.patient?.gender === 'M'
                  ? 'Male'
                  : appointment?.patient?.gender === 'F'
                  ? 'Female'
                  : appointment?.patient?.gender === 'O'
                  ? 'Other'
                  : 'N/A'}
              </Text>
              {appointment?.patient?.phone && (
                <Text className="text-sm text-gray-600 mt-1">
                  Phone: {appointment.patient.phone}
                </Text>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vitals (from appointment) */}
        {appointment?.vitals && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-3">
                {appointment.vitals.bloodPressureSystolic && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">BP:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.bloodPressureSystolic}/
                      {appointment.vitals.bloodPressureDiastolic} mmHg
                    </Text>
                  </View>
                )}
                {appointment.vitals.pulse && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Pulse:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.pulse} bpm
                    </Text>
                  </View>
                )}
                {appointment.vitals.temperature && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Temperature:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.temperature}°F
                    </Text>
                  </View>
                )}
                {appointment.vitals.spo2 && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">SpO2:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.spo2}%
                    </Text>
                  </View>
                )}
                {appointment.vitals.weight && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Weight:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.weight} kg
                    </Text>
                  </View>
                )}
                {appointment.vitals.height && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Height:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {appointment.vitals.height} cm
                    </Text>
                  </View>
                )}
                {appointment.vitals.weight && appointment.vitals.height && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">BMI:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {(
                        appointment.vitals.weight /
                        Math.pow(appointment.vitals.height / 100, 2)
                      ).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Clinical Notes (from appointment) */}
        {appointment?.clinicalNotes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Clinical Examination</CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.clinicalNotes.chiefComplaint && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Chief Complaint:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {appointment.clinicalNotes.chiefComplaint}
                  </Text>
                </View>
              )}
              {appointment.clinicalNotes.symptoms && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Symptoms:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {appointment.clinicalNotes.symptoms}
                  </Text>
                </View>
              )}
              {appointment.clinicalNotes.examination && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Examination:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {appointment.clinicalNotes.examination}
                  </Text>
                </View>
              )}
              {appointment.clinicalNotes.diagnosis && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Diagnosis:</Text>
                  <Text className="text-sm text-gray-900 mt-1 bg-amber-50 p-2 rounded">
                    {appointment.clinicalNotes.diagnosis}
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selected Medications List */}
        {selectedMedications.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Selected Medications</CardTitle>
                <Badge variant="primary">{selectedMedications.length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {selectedMedications.map((med, index) => (
                <View key={index}>
                  {index > 0 && <Divider className="my-3" />}
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {index + 1}. {med.medication.brandName}
                      </Text>
                      {med.medication.genericName && (
                        <Text className="text-sm text-gray-600 mt-1">
                          {med.medication.genericName}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                      <X size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <View className="mt-2">
                    <Text className="text-sm text-gray-700">
                      Dosage: {med.dosage}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      Frequency: {med.frequency}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      Duration: {med.duration}
                    </Text>
                    {med.notes && (
                      <Text className="text-sm text-gray-600 mt-1">
                        Notes: {med.notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* DDI Warnings Display */}
        {ddiWarnings.length > 0 && (
          <Card className="mb-4 border-2 border-yellow-500">
            <CardHeader>
              <View className="flex-row items-center">
                <AlertTriangle size={20} color="#F59E0B" />
                <CardTitle className="ml-2">Drug Interaction Warnings</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              {ddiWarnings.map((warning, index) => (
                <View key={index} className="mb-3">
                  {index > 0 && <Divider className="my-2" />}
                  <Badge
                    variant={warning.severity === 'contraindicated' || warning.severity === 'major' ? 'destructive' : 'warning'}
                    className="mb-2"
                  >
                    {warning.severity?.toUpperCase()}
                  </Badge>
                  <Text className="text-sm text-gray-900">{warning.description || warning.text}</Text>
                  {warning.recommendation && (
                    <Text className="text-sm text-gray-600 mt-1">
                      Recommendation: {warning.recommendation}
                    </Text>
                  )}
                </View>
              ))}
              {hasSevereWarnings && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => setOverrideDDI(!overrideDDI)}
                    className="flex-row items-center"
                  >
                    <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${overrideDDI ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                      {overrideDDI && <Check size={16} color="white" />}
                    </View>
                    <Text className="text-sm text-gray-900 flex-1">
                      I acknowledge the severe drug interactions and choose to override
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Medication Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>
              {stagingMedication ? 'Configure Medication' : 'Add Medication'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Medication Search */}
            {!stagingMedication && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Search Medication</Text>
                <TouchableOpacity
                  onPress={() => setShowMedicationDropdown(true)}
                  className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-white"
                >
                  <Search size={20} color="#6B7280" />
                  <Text className="flex-1 ml-2 text-gray-500">
                    {medicationSearchQuery || 'Tap to search medication...'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Staging Medication Details */}
            {stagingMedication && (
              <>
                <View className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-base font-semibold text-gray-900">
                    {stagingMedication.brandName}
                  </Text>
                  {stagingMedication.genericName && (
                    <Text className="text-sm text-gray-600">{stagingMedication.genericName}</Text>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={handleCancelStaging}
                    className="mt-2"
                  >
                    Change Medication
                  </Button>
                </View>

                <Input
                  label="Dosage *"
                  value={stagingData.dosage}
                  onChangeText={(text) => setStagingData({ ...stagingData, dosage: text })}
                  placeholder="e.g., 500mg, 1 tablet"
                />

                <Select
                  label="Frequency *"
                  value={stagingData.frequency}
                  onValueChange={(value) => setStagingData({ ...stagingData, frequency: value })}
                  options={MEDICATION_FREQUENCIES}
                />

                <Input
                  label="Duration *"
                  value={stagingData.duration}
                  onChangeText={(text) => setStagingData({ ...stagingData, duration: text })}
                  placeholder="e.g., 7 days, 2 weeks"
                />

                <Textarea
                  label="Instructions (Optional)"
                  value={stagingData.notes}
                  onChangeText={(text) => setStagingData({ ...stagingData, notes: text })}
                  placeholder="Special instructions..."
                  numberOfLines={3}
                />

                <View className="flex-row gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={handleCancelStaging}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onPress={handleAddMedication}
                  >
                    <Plus size={16} color="white" />
                    <Text className="ml-2 text-white">Add to List</Text>
                  </Button>
                </View>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Additional Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes for the prescription..."
              numberOfLines={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onPress={handleSubmit}
            disabled={createPrescription.isPending || updatePrescription.isPending}
          >
            {createPrescription.isPending || updatePrescription.isPending
              ? 'Saving...'
              : isEditMode
                ? 'Update Prescription'
                : 'Create Prescription'}
          </Button>
        </View>
      </ScrollView>

      {/* Medication Search Modal */}
      <Modal
        visible={showMedicationDropdown}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMedicationDropdown(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-12 rounded-t-3xl">
            {/* Modal Header with Search */}
            <View className="p-4 border-b border-gray-200 bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">Search Medication</Text>
                <TouchableOpacity onPress={() => setShowMedicationDropdown(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {/* Search Input */}
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Search size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  value={medicationSearchQuery}
                  onChangeText={setMedicationSearchQuery}
                  placeholder="Type medication name (min 2 characters)..."
                  autoFocus
                />
                {medicationSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setMedicationSearchQuery('')}>
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Results - Scrollable area below search */}
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
              {medicationSearchQuery.length < 2 ? (
                <View className="p-8 items-center">
                  <Search size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 mt-4 text-center">
                    Type at least 2 characters to search
                  </Text>
                </View>
              ) : medicationsLoading ? (
                <View className="p-8 items-center">
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text className="text-sm text-gray-600 mt-4">Searching medications...</Text>
                </View>
              ) : medications.length > 0 ? (
                <View className="p-2">
                  {medications.map((med, index) => (
                    <TouchableOpacity
                      key={med._id}
                      onPress={() => {
                        handleMedicationSelect(med);
                        setShowMedicationDropdown(false);
                      }}
                      className="p-4 mb-2 bg-white border border-gray-200 rounded-lg active:bg-gray-50"
                    >
                      <View className="flex-row items-start">
                        <View className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Pill size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900 mb-1">
                            {med.brandName}
                          </Text>
                          {med.genericName && (
                            <Text className="text-sm text-gray-600 mb-1">
                              Generic: {med.genericName}
                            </Text>
                          )}
                          {med.unique_composition && med.unique_composition.length > 0 && (
                            <Text className="text-xs text-gray-500 mt-1">
                              Composition: {med.unique_composition.map(c => c.name).join(', ')}
                            </Text>
                          )}
                          {med.manufacturer && (
                            <Text className="text-xs text-gray-400 mt-1">
                              Mfr: {med.manufacturer}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="p-8 items-center">
                  <Pill size={48} color="#D1D5DB" />
                  <Text className="text-gray-600 mt-4 text-center font-medium">
                    No medications found
                  </Text>
                  <Text className="text-gray-500 mt-2 text-center text-sm">
                    Try a different search term
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
