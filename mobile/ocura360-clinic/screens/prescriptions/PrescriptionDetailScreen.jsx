import React from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FileText, User, Calendar, Pill, AlertCircle, Edit, Trash2, FileDown } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePrescription, useDeletePrescription } from '../../api/hooks/usePrescriptions';
import { useMe } from '../../api/hooks/useAuth';
import { useClinicContext } from '../../contexts/ClinicContext';
import { formatDate } from '../../utils/formatters';

export default function PrescriptionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { data: user } = useMe();

  const { data: prescription, isLoading, error } = usePrescription(id);
  const deletePrescription = useDeletePrescription();

  // Check if user can edit/delete (doctors and clinic owners only)
  const canEdit = userClinicRole === 'doctor' || userClinicRole === 'clinic_owner';

  // Get patient code for current clinic
  const patientCode = prescription?.patient?.patientCodes?.find(
    (pc) => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
  )?.code || 'N/A';

  // Get severity color for DDI badges
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'contraindicated':
        return 'destructive';
      case 'major':
        return 'warning';
      case 'moderate':
        return 'secondary';
      case 'minor':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleDelete = () => {
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
              await deletePrescription.mutateAsync(id);
              Alert.alert('Success', 'Prescription deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete prescription');
            }
          },
        },
      ]
    );
  };

  const handleGeneratePDF = () => {
    Alert.alert('Generate PDF', 'PDF generation feature coming soon');
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Prescription Details" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading prescription...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !prescription) {
    return (
      <ScreenWrapper>
        <Header title="Prescription Not Found" showBack />
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Prescription Not Found</Text>
          <Text className="text-gray-600 text-center mt-2">
            {error?.message || "The prescription you're looking for doesn't exist"}
          </Text>
          <Button onPress={() => navigation.goBack()} className="mt-4">
            Go Back
          </Button>
        </View>
      </ScreenWrapper>
    );
  }


  return (
    <ScreenWrapper>
      <Header title="Prescription Details" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Clinic & Doctor Header */}
        <Card className="mb-4">
          <CardContent>
            <Text className="text-lg font-bold text-gray-900">
              {prescription.clinic?.name || 'Clinic Name'}
            </Text>
            {prescription.clinic?.address && (
              <Text className="text-xs text-gray-600 mt-1">
                {[
                  prescription.clinic.address.street,
                  prescription.clinic.address.city,
                  prescription.clinic.address.state,
                  prescription.clinic.address.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            )}
            {prescription.clinic?.phone && (
              <Text className="text-xs text-gray-600">
                📞 {prescription.clinic.phone}
              </Text>
            )}
            <Divider className="my-2" />
            <Text className="text-sm font-semibold text-gray-700">
              Dr. {prescription.doctor?.name || 'N/A'}
            </Text>
            {prescription.doctor?.specialization && (
              <Text className="text-xs text-gray-600">
                {prescription.doctor.specialization}
              </Text>
            )}
            <Text className="text-xs text-gray-500 mt-2">
              Date: {formatDate(prescription.createdAt)}
            </Text>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-base font-semibold text-gray-900">
              {prescription.patient?.name || 'N/A'}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Age: {prescription.patient?.age || 'N/A'} • Gender:{' '}
              {prescription.patient?.gender === 'M'
                ? 'Male'
                : prescription.patient?.gender === 'F'
                ? 'Female'
                : prescription.patient?.gender === 'O'
                ? 'Other'
                : 'N/A'}
            </Text>
            {prescription.patient?.phone && (
              <Text className="text-sm text-gray-600 mt-1">
                Phone: {prescription.patient.phone}
              </Text>
            )}
            <Text className="text-sm text-gray-600 mt-1">
              Patient ID: {patientCode}
            </Text>
          </CardContent>
        </Card>

        {/* Vitals (from appointment) */}
        {prescription.appointment?.vitals && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-3">
                {prescription.appointment.vitals.bloodPressureSystolic && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">BP:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.bloodPressureSystolic}/
                      {prescription.appointment.vitals.bloodPressureDiastolic} mmHg
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.pulse && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Pulse:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.pulse} bpm
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.temperature && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Temperature:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.temperature}°F
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.spo2 && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">SpO2:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.spo2}%
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.weight && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Weight:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.weight} kg
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.height && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">Height:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {prescription.appointment.vitals.height} cm
                    </Text>
                  </View>
                )}
                {prescription.appointment.vitals.weight && prescription.appointment.vitals.height && (
                  <View className="w-[48%]">
                    <Text className="text-xs text-gray-600">BMI:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {(
                        prescription.appointment.vitals.weight /
                        Math.pow(prescription.appointment.vitals.height / 100, 2)
                      ).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Clinical Examination (from appointment) */}
        {prescription.appointment?.clinicalNotes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Clinical Examination</CardTitle>
            </CardHeader>
            <CardContent>
              {prescription.appointment.clinicalNotes.chiefComplaint && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Chief Complaint:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {prescription.appointment.clinicalNotes.chiefComplaint}
                  </Text>
                </View>
              )}
              {prescription.appointment.clinicalNotes.symptoms && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Symptoms:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {prescription.appointment.clinicalNotes.symptoms}
                  </Text>
                </View>
              )}
              {prescription.appointment.clinicalNotes.examination && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Examination:</Text>
                  <Text className="text-sm text-gray-900 mt-1">
                    {prescription.appointment.clinicalNotes.examination}
                  </Text>
                </View>
              )}
              {prescription.appointment.clinicalNotes.diagnosis && (
                <View className="mb-2">
                  <Text className="text-xs font-semibold text-gray-700">Diagnosis:</Text>
                  <Text className="text-sm text-gray-900 mt-1 bg-amber-50 p-2 rounded">
                    {prescription.appointment.clinicalNotes.diagnosis}
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Diagnosis */}
        {prescription.diagnosis && prescription.diagnosis.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              {prescription.diagnosis.map((diag, index) => (
                <Text key={index} className="text-base text-gray-900 mb-1">
                  • {diag}
                </Text>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Medications */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Medications</CardTitle>
              <Badge variant="primary">{prescription.meds?.length || 0}</Badge>
            </View>
          </CardHeader>
          <CardContent>
            {prescription.meds?.map((med, index) => (
              <View key={index}>
                {index > 0 && <Divider className="my-4" />}
                <View className="space-y-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {index + 1}. {med.medication?.brandName || 'Unknown'}
                  </Text>
                  
                  {med.medication?.genericName && (
                    <Text className="text-sm text-gray-600">
                      Generic: {med.medication.genericName}
                    </Text>
                  )}
                  
                  {med.compRefs && med.compRefs.length > 0 && (
                    <Text className="text-sm text-gray-600">
                      Composition: {med.compRefs.map(c => c.name).join(', ')}
                    </Text>
                  )}
                  
                  <View className="flex-row items-center mt-2">
                    <Text className="text-sm text-gray-600 w-24">Dosage:</Text>
                    <Text className="text-base text-gray-900">{med.dosage || 'N/A'}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600 w-24">Frequency:</Text>
                    <Text className="text-base text-gray-900">{med.frequency || 'N/A'}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600 w-24">Duration:</Text>
                    <Text className="text-base text-gray-900">{med.duration || 'N/A'}</Text>
                  </View>
                  
                  {med.notes && (
                    <View className="mt-2 bg-blue-50 p-3 rounded-lg">
                      <Text className="text-sm font-semibold text-blue-900 mb-1">
                        Notes:
                      </Text>
                      <Text className="text-sm text-blue-800">{med.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* DDI Warnings */}
        {prescription.ddiWarnings && prescription.ddiWarnings.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Drug Interaction Warnings</CardTitle>
                <Badge variant="warning">{prescription.ddiWarnings.length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {prescription.ddiWarnings.map((warning, index) => (
                <View key={index}>
                  {index > 0 && <Divider className="my-3" />}
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Badge variant={getSeverityColor(warning.severity)} className="mr-2">
                        {warning.severity?.toUpperCase()}
                      </Badge>
                    </View>
                    <Text className="text-sm text-gray-900">{warning.text}</Text>
                    {warning.recommendation && (
                      <View className="mt-2 bg-yellow-50 p-3 rounded-lg">
                        <Text className="text-sm font-semibold text-yellow-900 mb-1">
                          Recommendation:
                        </Text>
                        <Text className="text-sm text-yellow-800">{warning.recommendation}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {prescription.notes && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-base text-gray-900">{prescription.notes}</Text>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <Button onPress={handleGeneratePDF}>
            <FileDown size={20} color="white" className="mr-2" />
            Generate PDF
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              onPress={() => navigation.navigate('NewPrescription', { 
                prescriptionId: id,
                appointmentId: prescription.appointment?._id 
              })}
            >
              <Edit size={20} color="#2563EB" className="mr-2" />
              Edit Prescription
            </Button>
          )}

          {canEdit && (
            <Button
              variant="destructive"
              onPress={handleDelete}
              disabled={deletePrescription.isPending}
            >
              <Trash2 size={20} color="white" className="mr-2" />
              {deletePrescription.isPending ? 'Deleting...' : 'Delete Prescription'}
            </Button>
          )}

          <Divider className="my-4" />

          <Button
            variant="outline"
            onPress={() => navigation.navigate('PatientDetail', { 
              id: prescription.patient?._id 
            })}
          >
            <User size={20} color="#6B7280" className="mr-2" />
            View Patient Details
          </Button>

          {prescription.appointment && (
            <Button
              variant="outline"
              onPress={() => navigation.navigate('AppointmentDetail', { 
                id: prescription.appointment._id 
              })}
            >
              <Calendar size={20} color="#6B7280" className="mr-2" />
              View Appointment
            </Button>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
