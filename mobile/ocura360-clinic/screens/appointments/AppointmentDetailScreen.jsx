import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Calendar,
  Clock,
  User,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Weight,
  Edit2,
  Save,
  X,
  FileText,
  Eye,
  Trash2,
  Download,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Divider } from '../../components/ui/Divider';
import {
  useAppointment,
  useUpdateAppointmentVitals,
  useUpdateClinicalNotes,
  useCancelAppointment,
  useAppointments,
} from '../../api/hooks/useAppointments';
import { usePrescriptions, useDeletePrescription } from '../../api/hooks/usePrescriptions';
import { useClinicContext } from '../../contexts/ClinicContext';
import { formatDate, formatTime } from '../../utils/formatters';

export default function AppointmentDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { selectedClinicId, userClinicRole } = useClinicContext();

  const { data: appointment, isLoading, error, refetch } = useAppointment(id);
  const [refreshing, setRefreshing] = useState(false);
  const updateVitals = useUpdateAppointmentVitals();
  const updateClinicalNotes = useUpdateClinicalNotes();
  const cancelAppointment = useCancelAppointment();
  const deletePrescription = useDeletePrescription();

  // Fetch past appointments for follow-up visits
  const { data: appointmentsData, refetch: refetchAppointments } = useAppointments(
    { patient: appointment?.patient?._id },
    { enabled: !!appointment?.patient?._id && appointment?.visitType === 'follow_up' }
  );

  // Fetch prescriptions for past visits
  const { data: prescriptionsData, refetch: refetchPrescriptions } = usePrescriptions(
    { patientId: appointment?.patient?._id },
    { enabled: !!appointment?.patient?._id && appointment?.visitType === 'follow_up' }
  );

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        appointment?.patient?._id && appointment?.visitType === 'follow_up' ? refetchAppointments() : Promise.resolve(),
        appointment?.patient?._id && appointment?.visitType === 'follow_up' ? refetchPrescriptions() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error refreshing appointment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Editing states
  const [editingVitals, setEditingVitals] = useState(false);
  const [editingClinicalNotes, setEditingClinicalNotes] = useState(false);
  const [showPastVisit, setShowPastVisit] = useState(false);

  // Vitals form state
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    pulse: '',
    temperature: '',
    spo2: '',
    weight: '',
    height: '',
    notes: '',
  });

  // Clinical notes form state
  const [clinicalData, setClinicalData] = useState({
    chiefComplaint: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatmentPlan: '',
    additionalNotes: '',
  });

  // Initialize vitals data when appointment loads
  useEffect(() => {
    if (appointment?.vitals) {
      setVitalsData({
        bloodPressureSystolic: appointment.vitals.bloodPressureSystolic?.toString() || '',
        bloodPressureDiastolic: appointment.vitals.bloodPressureDiastolic?.toString() || '',
        pulse: appointment.vitals.pulse?.toString() || '',
        temperature: appointment.vitals.temperature?.toString() || '',
        spo2: appointment.vitals.spo2?.toString() || '',
        weight: appointment.vitals.weight?.toString() || '',
        height: appointment.vitals.height?.toString() || '',
        notes: appointment.vitals.notes || '',
      });
    }
  }, [appointment]);

  // Initialize clinical notes data when appointment loads
  useEffect(() => {
    if (appointment?.clinicalNotes) {
      setClinicalData({
        chiefComplaint: appointment.clinicalNotes.chiefComplaint || '',
        symptoms: appointment.clinicalNotes.symptoms || '',
        examination: appointment.clinicalNotes.examination || '',
        diagnosis: appointment.clinicalNotes.diagnosis || '',
        treatmentPlan: appointment.clinicalNotes.treatmentPlan || '',
        additionalNotes: appointment.clinicalNotes.additionalNotes || '',
      });
    }
  }, [appointment]);

  // Calculate BMI
  const bmi = useMemo(() => {
    if (appointment?.vitals?.weight && appointment?.vitals?.height) {
      const heightInMeters = appointment.vitals.height / 100;
      const bmiValue = appointment.vitals.weight / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [appointment?.vitals]);

  // Get last completed visit for follow-up patients
  const lastCompletedVisit = useMemo(() => {
    if (appointment?.visitType !== 'follow_up' || !appointmentsData?.appointments) {
      return null;
    }

    const completedVisits = appointmentsData.appointments
      .filter(
        (apt) =>
          apt.status === 'completed' &&
          apt._id !== id &&
          new Date(apt.startAt) < new Date(appointment.startAt)
      )
      .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

    return completedVisits[0] || null;
  }, [appointmentsData, appointment, id]);

  // Get prescription from last visit
  const lastVisitPrescription = useMemo(() => {
    if (!lastCompletedVisit || !prescriptionsData?.prescriptions) {
      return null;
    }

    return prescriptionsData.prescriptions.find(
      (p) => p.appointment === lastCompletedVisit._id || p.appointment?._id === lastCompletedVisit._id
    );
  }, [lastCompletedVisit, prescriptionsData]);

  // Role-based permissions
  const canEditVitals = ['staff', 'doctor', 'clinic_owner'].includes(userClinicRole);
  const canEditClinicalNotes = ['doctor', 'clinic_owner'].includes(userClinicRole);
  const canCreatePrescription = ['doctor', 'clinic_owner'].includes(userClinicRole);

  // Handle vitals save
  const handleSaveVitals = async () => {
    try {
      await updateVitals.mutateAsync({
        appointmentId: id,
        vitals: {
          bloodPressureSystolic: vitalsData.bloodPressureSystolic ? Number(vitalsData.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: vitalsData.bloodPressureDiastolic ? Number(vitalsData.bloodPressureDiastolic) : undefined,
          pulse: vitalsData.pulse ? Number(vitalsData.pulse) : undefined,
          temperature: vitalsData.temperature ? Number(vitalsData.temperature) : undefined,
          spo2: vitalsData.spo2 ? Number(vitalsData.spo2) : undefined,
          weight: vitalsData.weight ? Number(vitalsData.weight) : undefined,
          height: vitalsData.height ? Number(vitalsData.height) : undefined,
          notes: vitalsData.notes,
        },
      });
      Alert.alert('Success', 'Vitals saved successfully! Status changed to In Progress.');
      setEditingVitals(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save vitals');
    }
  };

  // Handle clinical notes save
  const handleSaveClinicalNotes = async () => {
    try {
      await updateClinicalNotes.mutateAsync({
        appointmentId: id,
        clinicalNotes: clinicalData,
      });
      Alert.alert('Success', 'Clinical notes saved successfully!');
      setEditingClinicalNotes(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save clinical notes');
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointment.mutateAsync(id);
              Alert.alert('Success', 'Appointment cancelled successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Appointment Details" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading appointment...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error || !appointment) {
    return (
      <ScreenWrapper>
        <Header title="Appointment Details" showBack />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-600 text-lg font-semibold">Error Loading Appointment</Text>
          <Text className="text-gray-600 text-center mt-2">
            {error?.message || 'Appointment not found'}
          </Text>
          <Button onPress={() => navigation.goBack()} className="mt-4">
            Go Back
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  // Get prescription if exists
  const prescription = appointment.prescriptions?.[0];

  return (
    <ScreenWrapper>
      <Header title="Appointment Details" showBack />

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Status Bar */}
        <Card className="mb-4">
          <CardContent className="py-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 mr-2">Status:</Text>
                <Badge variant={getStatusColor(appointment.status)}>
                  {appointment.status.toUpperCase()}
                </Badge>
              </View>
              {appointment.status === 'scheduled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleCancelAppointment}
                  disabled={cancelAppointment.isPending}
                >
                  Cancel
                </Button>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Patient Information</CardTitle>
              <User size={20} color="#2563EB" />
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-lg font-semibold text-gray-900">
              {appointment.patient?.name}
            </Text>
            <View className="flex-row mt-2">
              <Text className="text-sm text-gray-600">
                Age: {appointment.patient?.age || 'N/A'} • Gender:{' '}
                {appointment.patient?.gender === 'M'
                  ? 'Male'
                  : appointment.patient?.gender === 'F'
                  ? 'Female'
                  : appointment.patient?.gender === 'O'
                  ? 'Other'
                  : 'N/A'}
              </Text>
            </View>
            {appointment.patient?.phone && (
              <Text className="text-sm text-gray-600 mt-1">
                Phone: {appointment.patient.phone}
              </Text>
            )}
            {appointment.patient?.patientCodes?.[0]?.code && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500">Patient Code</Text>
                <Text className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                  {appointment.patient.patientCodes[0].code}
                </Text>
              </View>
            )}
            <Button
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('PatientDetail', { id: appointment.patient._id })}
              className="mt-3"
            >
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Appointment Details</CardTitle>
              <Calendar size={20} color="#10B981" />
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-sm text-gray-900 ml-2">
                {formatDate(appointment.startAt)}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#6B7280" />
              <Text className="text-sm text-gray-900 ml-2">
                {formatTime(appointment.startAt)}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <User size={16} color="#6B7280" />
              <Text className="text-sm text-gray-900 ml-2">
                Dr. {appointment.doctor?.name || 'Unknown'}
              </Text>
            </View>
            <View className="mt-2">
              <Badge
                variant={appointment.visitType === 'first_visit' ? 'default' : 'secondary'}
              >
                {appointment.visitType === 'first_visit' ? 'First Visit' : 'Follow Up'}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Vitals Card */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Activity size={20} color="#EF4444" />
                <CardTitle className="ml-2">Vital Signs</CardTitle>
              </View>
              {canEditVitals && !editingVitals && (
                <TouchableOpacity onPress={() => setEditingVitals(true)}>
                  <Edit2 size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {editingVitals ? (
              <>
                {/* Blood Pressure */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Blood Pressure (mmHg)
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Input
                      value={vitalsData.bloodPressureSystolic}
                      onChangeText={(text) =>
                        setVitalsData({ ...vitalsData, bloodPressureSystolic: text })
                      }
                      placeholder="Systolic"
                      keyboardType="numeric"
                      className="flex-1"
                    />
                    <Text className="text-gray-500">/</Text>
                    <Input
                      value={vitalsData.bloodPressureDiastolic}
                      onChangeText={(text) =>
                        setVitalsData({ ...vitalsData, bloodPressureDiastolic: text })
                      }
                      placeholder="Diastolic"
                      keyboardType="numeric"
                      className="flex-1"
                    />
                  </View>
                </View>

                {/* Pulse */}
                <Input
                  label="Pulse (bpm)"
                  value={vitalsData.pulse}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, pulse: text })}
                  placeholder="Enter pulse"
                  keyboardType="numeric"
                />

                {/* Temperature */}
                <Input
                  label="Temperature (°F)"
                  value={vitalsData.temperature}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, temperature: text })}
                  placeholder="Enter temperature"
                  keyboardType="numeric"
                />

                {/* SpO2 */}
                <Input
                  label="SpO2 (%)"
                  value={vitalsData.spo2}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, spo2: text })}
                  placeholder="Enter SpO2"
                  keyboardType="numeric"
                />

                {/* Weight */}
                <Input
                  label="Weight (kg)"
                  value={vitalsData.weight}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, weight: text })}
                  placeholder="Enter weight"
                  keyboardType="numeric"
                />

                {/* Height */}
                <Input
                  label="Height (cm)"
                  value={vitalsData.height}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, height: text })}
                  placeholder="Enter height"
                  keyboardType="numeric"
                />

                {/* Notes */}
                <Textarea
                  label="Notes (Optional)"
                  value={vitalsData.notes}
                  onChangeText={(text) => setVitalsData({ ...vitalsData, notes: text })}
                  placeholder="Additional notes..."
                  numberOfLines={3}
                />

                {/* Action Buttons */}
                <View className="flex-row gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => setEditingVitals(false)}
                  >
                    <X size={16} color="#6B7280" />
                    <Text className="ml-2">Cancel</Text>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onPress={handleSaveVitals}
                    disabled={updateVitals.isPending}
                  >
                    <Save size={16} color="white" />
                    <Text className="ml-2 text-white">
                      {updateVitals.isPending ? 'Saving...' : 'Save'}
                    </Text>
                  </Button>
                </View>
              </>
            ) : appointment.vitals ? (
              <View className="space-y-3">
                {/* Blood Pressure */}
                {(appointment.vitals.bloodPressureSystolic ||
                  appointment.vitals.bloodPressureDiastolic) && (
                  <View className="flex-row items-center">
                    <Heart size={18} color="#EF4444" />
                    <Text className="text-sm text-gray-600 ml-2">Blood Pressure:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">
                      {appointment.vitals.bloodPressureSystolic || '--'}/
                      {appointment.vitals.bloodPressureDiastolic || '--'} mmHg
                    </Text>
                  </View>
                )}

                {/* Pulse */}
                {appointment.vitals.pulse && (
                  <View className="flex-row items-center">
                    <Activity size={18} color="#EF4444" />
                    <Text className="text-sm text-gray-600 ml-2">Pulse:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">
                      {appointment.vitals.pulse} bpm
                    </Text>
                  </View>
                )}

                {/* Temperature */}
                {appointment.vitals.temperature && (
                  <View className="flex-row items-center">
                    <Thermometer size={18} color="#F59E0B" />
                    <Text className="text-sm text-gray-600 ml-2">Temperature:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">
                      {appointment.vitals.temperature}°F
                    </Text>
                  </View>
                )}

                {/* SpO2 */}
                {appointment.vitals.spo2 && (
                  <View className="flex-row items-center">
                    <Droplet size={18} color="#3B82F6" />
                    <Text className="text-sm text-gray-600 ml-2">SpO2:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">
                      {appointment.vitals.spo2}%
                    </Text>
                  </View>
                )}

                {/* Weight & Height */}
                {(appointment.vitals.weight || appointment.vitals.height) && (
                  <View className="flex-row items-center">
                    <Weight size={18} color="#10B981" />
                    <Text className="text-sm text-gray-600 ml-2">Weight/Height:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">
                      {appointment.vitals.weight || '--'} kg /{' '}
                      {appointment.vitals.height || '--'} cm
                    </Text>
                  </View>
                )}

                {/* BMI */}
                {bmi && (
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600 ml-6">BMI:</Text>
                    <Text className="text-sm font-semibold text-gray-900 ml-2">{bmi}</Text>
                  </View>
                )}

                {/* Notes */}
                {appointment.vitals.notes && (
                  <View className="mt-2 pt-2 border-t border-gray-200">
                    <Text className="text-sm text-gray-600">Notes:</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.vitals.notes}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-6">
                No vitals recorded yet. {canEditVitals && 'Tap Edit to add vitals.'}
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Past Visit Information - Only for Follow-Up Visits */}
        {appointment.visitType === 'follow_up' && lastCompletedVisit && (
          <Card className="mb-4 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <TouchableOpacity
                onPress={() => setShowPastVisit(!showPastVisit)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <History size={20} color="#2563EB" />
                  <CardTitle className="ml-2">Past Visit Information</CardTitle>
                  <Text className="text-sm text-gray-500 ml-2">
                    ({formatDate(lastCompletedVisit.startAt)})
                  </Text>
                </View>
                {showPastVisit ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </CardHeader>

            {showPastVisit && (
              <CardContent>
                {/* Clinical Notes from Last Visit */}
                {lastCompletedVisit.clinicalNotes && (
                  <View className="bg-white p-3 rounded-lg mb-3">
                    <View className="flex-row items-center mb-2">
                      <Stethoscope size={16} color="#7C3AED" />
                      <Text className="text-sm font-semibold text-gray-800 ml-2">
                        Clinical Examination
                      </Text>
                    </View>

                    {lastCompletedVisit.clinicalNotes.chiefComplaint && (
                      <View className="mb-2">
                        <Text className="text-xs font-medium text-gray-600">Chief Complaint</Text>
                        <Text className="text-sm text-gray-900 mt-1">
                          {lastCompletedVisit.clinicalNotes.chiefComplaint}
                        </Text>
                      </View>
                    )}

                    {lastCompletedVisit.clinicalNotes.symptoms && (
                      <View className="mb-2">
                        <Text className="text-xs font-medium text-gray-600">Symptoms</Text>
                        <Text className="text-sm text-gray-900 mt-1">
                          {lastCompletedVisit.clinicalNotes.symptoms}
                        </Text>
                      </View>
                    )}

                    {lastCompletedVisit.clinicalNotes.diagnosis && (
                      <View className="mb-2">
                        <Text className="text-xs font-medium text-gray-600">Diagnosis</Text>
                        <View className="bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                          <Text className="text-sm text-gray-900">
                            {lastCompletedVisit.clinicalNotes.diagnosis}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Medications from Last Visit */}
                {lastVisitPrescription && lastVisitPrescription.meds && lastVisitPrescription.meds.length > 0 && (
                  <View className="bg-white p-3 rounded-lg">
                    <View className="flex-row items-center mb-2">
                      <FileText size={16} color="#10B981" />
                      <Text className="text-sm font-semibold text-gray-800 ml-2">
                        Medications Prescribed
                      </Text>
                    </View>

                    {lastVisitPrescription.meds.map((med, idx) => (
                      <View key={idx} className="bg-green-50 p-2 rounded mb-2 border border-green-100">
                        <Text className="text-sm font-medium text-gray-900">
                          {med.medication?.brandName || med.medication?.genericName || 'Medication'}
                        </Text>
                        <Text className="text-xs text-gray-600 mt-1">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {!lastCompletedVisit.clinicalNotes && !lastVisitPrescription && (
                  <Text className="text-gray-500 text-center py-4">
                    No detailed information available from the last visit.
                  </Text>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Clinical Examination Card */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Stethoscope size={20} color="#7C3AED" />
                <CardTitle className="ml-2">Clinical Examination</CardTitle>
              </View>
              {canEditClinicalNotes && !editingClinicalNotes && (
                <TouchableOpacity onPress={() => setEditingClinicalNotes(true)}>
                  <Edit2 size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {editingClinicalNotes ? (
              <>
                <Input
                  label="Chief Complaint"
                  value={clinicalData.chiefComplaint}
                  onChangeText={(text) =>
                    setClinicalData({ ...clinicalData, chiefComplaint: text })
                  }
                  placeholder="Why did the patient come?"
                />

                <Textarea
                  label="Symptoms"
                  value={clinicalData.symptoms}
                  onChangeText={(text) => setClinicalData({ ...clinicalData, symptoms: text })}
                  placeholder="Detailed symptoms..."
                  numberOfLines={3}
                />

                <Textarea
                  label="Examination Findings"
                  value={clinicalData.examination}
                  onChangeText={(text) => setClinicalData({ ...clinicalData, examination: text })}
                  placeholder="Physical examination findings..."
                  numberOfLines={3}
                />

                <Textarea
                  label="Diagnosis"
                  value={clinicalData.diagnosis}
                  onChangeText={(text) => setClinicalData({ ...clinicalData, diagnosis: text })}
                  placeholder="Doctor's diagnosis..."
                  numberOfLines={2}
                />

                <Textarea
                  label="Treatment Plan (Optional)"
                  value={clinicalData.treatmentPlan}
                  onChangeText={(text) =>
                    setClinicalData({ ...clinicalData, treatmentPlan: text })
                  }
                  placeholder="Recommended treatment..."
                  numberOfLines={2}
                />

                <Textarea
                  label="Additional Notes (Optional)"
                  value={clinicalData.additionalNotes}
                  onChangeText={(text) =>
                    setClinicalData({ ...clinicalData, additionalNotes: text })
                  }
                  placeholder="Any other notes..."
                  numberOfLines={3}
                />

                {/* Action Buttons */}
                <View className="flex-row gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => setEditingClinicalNotes(false)}
                  >
                    <X size={16} color="#6B7280" />
                    <Text className="ml-2">Cancel</Text>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onPress={handleSaveClinicalNotes}
                    disabled={updateClinicalNotes.isPending}
                  >
                    <Save size={16} color="white" />
                    <Text className="ml-2 text-white">
                      {updateClinicalNotes.isPending ? 'Saving...' : 'Save'}
                    </Text>
                  </Button>
                </View>
              </>
            ) : appointment.clinicalNotes ? (
              <View className="space-y-3">
                {appointment.clinicalNotes.chiefComplaint && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Chief Complaint</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.chiefComplaint}
                    </Text>
                  </View>
                )}

                {appointment.clinicalNotes.symptoms && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Symptoms</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.symptoms}
                    </Text>
                  </View>
                )}

                {appointment.clinicalNotes.examination && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Examination</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.examination}
                    </Text>
                  </View>
                )}

                {appointment.clinicalNotes.diagnosis && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Diagnosis</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.diagnosis}
                    </Text>
                  </View>
                )}

                {appointment.clinicalNotes.treatmentPlan && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Treatment Plan</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.treatmentPlan}
                    </Text>
                  </View>
                )}

                {appointment.clinicalNotes.additionalNotes && (
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Additional Notes</Text>
                    <Text className="text-sm text-gray-900 mt-1">
                      {appointment.clinicalNotes.additionalNotes}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-6">
                No clinical notes recorded yet.
                {canEditClinicalNotes && ' Tap Edit to add notes.'}
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Prescription Card */}
        {canCreatePrescription && appointment.status !== 'cancelled' && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <FileText size={20} color="#2563EB" />
                  <CardTitle className="ml-2">Prescription</CardTitle>
                </View>
              </View>
            </CardHeader>
            <CardContent>
              {prescription ? (
                <View>
                  {/* Prescription Info */}
                  <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-green-900 text-base">
                          Prescription Created
                        </Text>
                        <Text className="text-sm text-green-700 mt-1">
                          Created on {formatDate(prescription.createdAt)}
                        </Text>
                        {prescription.lastEditedAt && (
                          <Text className="text-sm text-green-600 mt-1">
                            Last edited on {formatDate(prescription.lastEditedAt)}
                          </Text>
                        )}
                        <Text className="text-sm text-green-600 mt-2">
                          {prescription.meds?.length || 0} medication(s) prescribed
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() =>
                          navigation.navigate('PrescriptionDetail', { id: prescription._id })
                        }
                        className="flex-1"
                      >
                        <Eye size={16} color="#6B7280" />
                        <Text className="ml-1 text-sm">View</Text>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() =>
                          navigation.navigate('NewPrescription', {
                            appointmentId: id,
                            prescriptionId: prescription._id,
                          })
                        }
                        className="flex-1"
                      >
                        <Edit2 size={16} color="#6B7280" />
                        <Text className="ml-1 text-sm">Edit</Text>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => {
                          Alert.alert(
                            'Delete Prescription',
                            'Are you sure you want to delete this prescription? This action cannot be undone.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deletePrescription.mutateAsync(prescription._id);
                                    Alert.alert('Success', 'Prescription deleted successfully');
                                  } catch (error) {
                                    Alert.alert(
                                      'Error',
                                      error.message || 'Failed to delete prescription'
                                    );
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        className="flex-1"
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text className="ml-1 text-sm text-red-600">Delete</Text>
                      </Button>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="items-center py-6">
                  <FileText size={48} color="#D1D5DB" />
                  <Text className="text-gray-600 mt-3 mb-4">No prescription created yet</Text>
                  <Button
                    onPress={() =>
                      navigation.navigate('NewPrescription', {
                        appointmentId: id,
                      })
                    }
                  >
                    <FileText size={16} color="white" />
                    <Text className="ml-2 text-white">Create Prescription</Text>
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
