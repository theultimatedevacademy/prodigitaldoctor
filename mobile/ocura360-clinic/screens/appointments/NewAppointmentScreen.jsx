import React, { useState, useMemo } from 'react';
import { View, ScrollView, Alert, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { RadioGroup } from '../../components/ui/Radio';
import { SearchBar } from '../../components/ui/SearchBar';
import { ListItem } from '../../components/ui/ListItem';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useCreateFirstVisitAppointment,
  useCreateFollowUpAppointment,
  useSearchPatientsForAppointment,
} from '../../api/hooks/useAppointments';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useClinicDoctors } from '../../api/hooks/useClinics';
import { useDebounce } from '../../hooks/useDebounce';
import { UserSearch } from 'lucide-react-native';

export default function NewAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedClinicId } = useClinicContext();
  const preselectedPatientId = route.params?.patientId;

  const [visitType, setVisitType] = useState('first_visit');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Form state
  const [formData, setFormData] = useState({
    // First Visit fields
    name: '',
    phone: '',
    age: '',
    gender: '',

    // Follow-up fields
    selectedPatient: preselectedPatientId || null,

    // Common fields
    doctorId: '',
    appointmentDate: null,
    appointmentTime: null,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch clinic doctors (owner + staff doctors)
  // Backend returns: { doctors: [{ _id, name, email, isOwner, ... }] }
  const { data: doctorsData, isLoading: isLoadingDoctors } = useClinicDoctors(selectedClinicId);
  const doctors = useMemo(() => {
    if (!doctorsData?.doctors) return [];
    return doctorsData.doctors.map((doctor) => ({
      label: doctor.isOwner ? `${doctor.name} (Owner)` : doctor.name,
      value: doctor._id,
    }));
  }, [doctorsData]);

  // Search patients for follow-up
  // Backend returns: { patients: [{ _id, name, phone, patientCode, ... }] }
  const { data: searchResultsData } = useSearchPatientsForAppointment(
    debouncedSearch,
    selectedClinicId,
    {
      enabled: visitType === 'follow_up' && debouncedSearch.length >= 2 && !!selectedClinicId,
    }
  );

  // Extract patients array from response
  const searchResults = useMemo(() => {
    if (!searchResultsData) return [];
    if (!searchResultsData.patients) return [];
    if (!Array.isArray(searchResultsData.patients)) {
      console.error('Search results patients is not an array:', searchResultsData.patients);
      return [];
    }
    return searchResultsData.patients;
  }, [searchResultsData]);

  // Mutations
  const createFirstVisit = useCreateFirstVisitAppointment();
  const createFollowUp = useCreateFollowUpAppointment();

  const validateForm = () => {
    const newErrors = {};

    if (visitType === 'first_visit') {
      if (!formData.name.trim()) {
        newErrors.name = 'Patient name is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      } else if (isNaN(formData.age) || parseInt(formData.age) < 0) {
        newErrors.age = 'Please enter a valid age';
      }
    } else {
      if (!formData.selectedPatient) {
        newErrors.selectedPatient = 'Please select a patient';
      }
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time
      const date = new Date(formData.appointmentDate);
      const time = new Date(formData.appointmentTime);
      const combinedDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

      // Calculate end time (30 minutes later)
      const endDateTime = new Date(combinedDateTime.getTime() + 30 * 60000);

      if (visitType === 'first_visit') {
        // Create first visit appointment
        // Backend expects name, phone, age, gender at root level (not nested in tempPatientData)
        const result = await createFirstVisit.mutateAsync({
          clinic: selectedClinicId,
          doctor: formData.doctorId,
          name: formData.name,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender || undefined,
          startAt: combinedDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          notes: formData.notes,
        });

        // Show success with patient code
        Alert.alert(
          'Success',
          `Appointment created successfully!\n\nPatient Code: ${result.patientCode || 'N/A'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to appointments list
                navigation.navigate('AppointmentsList');
              },
            },
          ]
        );
      } else {
        // Create follow-up appointment
        const result = await createFollowUp.mutateAsync({
          clinic: selectedClinicId,
          doctor: formData.doctorId,
          patient: formData.selectedPatient,
          startAt: combinedDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          notes: formData.notes,
        });

        Alert.alert('Success', 'Appointment created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to appointments list
              navigation.navigate('AppointmentsList');
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create appointment');
    }
  };

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, selectedPatient: patient._id });
    setSearchQuery('');
  };

  const selectedPatient = useMemo(() => {
    if (!formData.selectedPatient) return null;
    return searchResults.find((p) => p._id === formData.selectedPatient);
  }, [formData.selectedPatient, searchResults]);

  const isLoading = createFirstVisit.isPending || createFollowUp.isPending;

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="New Appointment" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Appointment Type */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Appointment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              options={[
                { label: 'First Visit (New Patient)', value: 'first_visit' },
                { label: 'Follow-Up (Existing Patient)', value: 'follow_up' },
              ]}
              value={visitType}
              onValueChange={(value) => {
                setVisitType(value);
                setErrors({});
              }}
            />
          </CardContent>
        </Card>

        {/* First Visit Form */}
        {visitType === 'first_visit' && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>New Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Patient Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter patient name"
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                label="Phone Number *"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                error={errors.phone}
                keyboardType="phone-pad"
              />

              <Input
                label="Age *"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter age"
                error={errors.age}
                keyboardType="numeric"
              />

              <Select
                label="Gender"
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                options={[
                  { label: 'Select Gender', value: '' },
                  { label: 'Male', value: 'M' },
                  { label: 'Female', value: 'F' },
                  { label: 'Other', value: 'O' },
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* Follow-up Form */}
        {visitType === 'follow_up' && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <>
                  <SearchBar
                    placeholder="Search by patient code or phone..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />

                  {errors.selectedPatient && (
                    <Text className="text-red-500 text-sm mt-1">{errors.selectedPatient}</Text>
                  )}

                  {debouncedSearch.length >= 2 ? (
                    searchResults.length > 0 ? (
                      <View className="mt-3">
                        {searchResults.map((patient) => (
                          <ListItem
                            key={patient._id}
                            title={patient.name}
                            subtitle={`${patient.patientCode} • ${patient.phone}`}
                            leftIcon={() => <Avatar name={patient.name} size="sm" />}
                            onPress={() => handlePatientSelect(patient)}
                            showChevron
                          />
                        ))}
                      </View>
                    ) : (
                      <EmptyState
                        icon={UserSearch}
                        title="No patients found"
                        description="Try searching with a different code or phone number"
                      />
                    )
                  ) : (
                    <Text className="text-gray-500 text-sm mt-3 text-center">
                      Enter at least 2 characters to search
                    </Text>
                  )}
                </>
              ) : (
                <View>
                  <ListItem
                    title={selectedPatient.name}
                    subtitle={`${selectedPatient.patientCode} • ${selectedPatient.phone}`}
                    leftIcon={() => <Avatar name={selectedPatient.name} size="md" />}
                  />
                  <Button
                    variant="outline"
                    onPress={() => {
                      setFormData({ ...formData, selectedPatient: null });
                      setSearchQuery('');
                    }}
                    className="mt-3"
                  >
                    Change Patient
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Appointment Details */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="Doctor *"
              value={formData.doctorId}
              onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
              options={[{ label: 'Select Doctor', value: '' }, ...doctors]}
              error={errors.doctorId}
            />

            <DatePicker
              label="Appointment Date *"
              value={formData.appointmentDate}
              onChange={(date) => setFormData({ ...formData, appointmentDate: date })}
              mode="date"
              minimumDate={new Date()}
              error={errors.appointmentDate}
            />

            <DatePicker
              label="Appointment Time *"
              value={formData.appointmentTime}
              onChange={(time) => setFormData({ ...formData, appointmentTime: time })}
              mode="time"
              error={errors.appointmentTime}
            />

            <Textarea
              label="Notes (Optional)"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add any additional notes..."
              numberOfLines={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button onPress={handleSubmit} disabled={isLoading} className="mb-6">
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white ml-2">Creating...</Text>
            </View>
          ) : (
            'Create Appointment'
          )}
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
