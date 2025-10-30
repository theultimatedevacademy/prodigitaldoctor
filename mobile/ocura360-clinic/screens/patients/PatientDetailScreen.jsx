import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Phone, Mail, MapPin, Calendar, Edit2, FileText, Activity, AlertCircle, Hash } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { TabView } from '../../components/ui/TabView';
import { ListItem } from '../../components/ui/ListItem';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePatient, usePatientHistory } from '../../api/hooks/usePatients';
import { useClinicContext } from '../../contexts/ClinicContext';
import { formatDate, formatPhone, calculateAge } from '../../utils/formatters';

export default function PatientDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { selectedClinicId } = useClinicContext();

  const { data: patientData, isLoading, error } = usePatient(id);
  const { data: historyData } = usePatientHistory(id);

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Patient Details" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading patient...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error || !patientData) {
    return (
      <ScreenWrapper>
        <Header title="Patient Not Found" showBack />
        <EmptyState
          icon={AlertCircle}
          title="Patient not found"
          description={error?.message || "The patient you're looking for doesn't exist"}
        />
      </ScreenWrapper>
    );
  }

  const patient = patientData;
  // Backend returns nested structure: { appointments: { data: [], total: N }, prescriptions: { data: [], total: N } }
  const appointments = historyData?.appointments?.data || [];
  const prescriptions = historyData?.prescriptions?.data || [];
  const totalVisits = appointments.filter(apt => apt.status === 'completed').length;
  
  // Patient model stores age, not dob
  const age = patient.age || 'N/A';
  
  // Get patient code for current clinic from patientCodes array
  const patientCode = patient.patientCodes?.find(
    pc => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
  )?.code || 'N/A';

  const handleCall = () => {
    Linking.openURL(`tel:${patient.phone}`);
  };

  const handleEmail = () => {
    if (patient.email) {
      Linking.openURL(`mailto:${patient.email}`);
    }
  };

  // Overview Tab Content
  const OverviewTab = () => (
    <ScrollView className="flex-1 p-4">
      {/* Patient Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="items-center mb-4">
            {/* Patient Code */}
            <View className="flex-row items-center mb-2">
              <Hash size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">Patient Code: </Text>
              <Text className="text-sm font-semibold text-gray-900">{patientCode}</Text>
            </View>
            <Avatar name={patient.name} size="xl" className="mb-3" />
            <Text className="text-2xl font-bold text-gray-900">{patient.name}</Text>
            <Text className="text-base text-gray-600">{age} {typeof age === 'number' ? 'years old' : ''}</Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <Phone size={20} color="#6B7280" className="mr-3" />
              <TouchableOpacity onPress={handleCall} className="flex-1">
                <Text className="text-base text-blue-600">{patient.phone}</Text>
              </TouchableOpacity>
            </View>

            {patient.email && (
              <View className="flex-row items-center">
                <Mail size={20} color="#6B7280" className="mr-3" />
                <TouchableOpacity onPress={handleEmail} className="flex-1">
                  <Text className="text-base text-blue-600">{patient.email}</Text>
                </TouchableOpacity>
              </View>
            )}

            {patient.addresses && patient.addresses.length > 0 && (
              <View className="flex-row items-center">
                <MapPin size={20} color="#6B7280" className="mr-3" />
                <Text className="text-base text-gray-900 flex-1">
                  {patient.addresses[0].line1 || ''}
                  {patient.addresses[0].city ? `, ${patient.addresses[0].city}` : ''}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row mt-4 pt-4 border-t border-gray-200">
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-600">Blood Group</Text>
              <Badge variant="danger" className="mt-1">{patient.bloodGroup}</Badge>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-600">Gender</Text>
              <Text className="text-base font-semibold text-gray-900 mt-1 capitalize">
                {patient.gender}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-600">Total Visits</Text>
              <Text className="text-base font-semibold text-gray-900 mt-1">
                {totalVisits}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Last Visit */}
      {appointments.length > 0 && appointments[0].status === 'completed' && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Last Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-base text-gray-900">{formatDate(appointments[0].startAt)}</Text>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <View className="flex-row gap-3 mb-4">
        <Button
          variant="primary"
          className="flex-1"
          onPress={() => navigation.navigate('AppointmentsTab', { 
            screen: 'NewAppointment', 
            params: { patientId: id } 
          })}
        >
          New Appointment
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => navigation.navigate('MoreTab', { 
            screen: 'EditPatient', 
            params: { id } 
          })}
        >
          <Edit2 size={16} color="#1F2937" />
          <Text className="ml-2">Edit</Text>
        </Button>
      </View>
    </ScrollView>
  );

  // Visits Tab Content
  const VisitsTab = () => (
    <ScrollView className="flex-1">
      {appointments.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No visits yet"
          description="No appointment history for this patient"
        />
      ) : (
        appointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            title={formatDate(appointment.startAt)}
            subtitle={`${appointment.doctor?.name || 'Unknown'} • ${appointment.type || 'Visit'}`}
            rightContent={
              <Badge
                variant={
                  appointment.status === 'completed' ? 'success' :
                  appointment.status === 'cancelled' ? 'danger' : 'warning'
                }
              >
                {appointment.status}
              </Badge>
            }
            showChevron
            onPress={() => navigation.navigate('AppointmentsTab', { 
              screen: 'AppointmentDetail', 
              params: { id: appointment._id } 
            })}
          />
        ))
      )}
    </ScrollView>
  );

  // Prescriptions Tab Content
  const PrescriptionsTab = () => (
    <ScrollView className="flex-1">
      {prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prescriptions"
          description="No prescriptions for this patient"
        />
      ) : (
        prescriptions.map((prescription) => (
          <ListItem
            key={prescription._id}
            title={formatDate(prescription.createdAt)}
            subtitle={`${prescription.doctor?.name || 'Unknown'} • ${prescription.meds?.length || 0} medications`}
            leftIcon={FileText}
            showChevron
            onPress={() => navigation.navigate('PrescriptionsTab', { 
              screen: 'PrescriptionDetail', 
              params: { id: prescription._id } 
            })}
          />
        ))
      )}
    </ScrollView>
  );

  return (
    <ScreenWrapper>
      <Header
        title="Patient Details"
        showBack
        rightContent={
          <TouchableOpacity onPress={() => navigation.navigate('EditPatient', { id })}>
            <Edit2 size={24} color="#1F2937" />
          </TouchableOpacity>
        }
      />

      <TabView
        tabs={[
          { label: 'Overview', content: <OverviewTab /> },
          { label: 'Visits', content: <VisitsTab /> },
          { label: 'Prescriptions', content: <PrescriptionsTab /> },
        ]}
      />
    </ScreenWrapper>
  );
}
