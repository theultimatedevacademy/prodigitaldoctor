import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Filter, AlertCircle, Users } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ListItem } from '../../components/ui/ListItem';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { usePatients } from '../../api/hooks/usePatients';
import { useClinicContext } from '../../contexts/ClinicContext';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export default function PatientsListScreen() {
  const navigation = useNavigation();
  const { selectedClinicId } = useClinicContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
  });

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch ALL patients for the clinic (no filters in API call)
  const { data: patientsData, isLoading, error, refetch } = usePatients({
    clinicId: selectedClinicId,
  });

  const allPatients = patientsData?.patients || [];

  // Apply client-side search and filters (like web version)
  const patients = useMemo(() => {
    let filtered = [...allPatients];

    // Search filter - search by name, phone, or patient code
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((patient) => {
        const patientCode = patient.patientCodes?.find(
          pc => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
        )?.code || '';
        const phoneNumber = patient.phone || '';
        
        return (
          patient.name?.toLowerCase().includes(searchLower) ||
          patientCode.toLowerCase().includes(searchLower) ||
          phoneNumber.includes(searchLower)
        );
      });
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    // Age range filter
    if (filters.minAge) {
      const minAge = parseInt(filters.minAge);
      filtered = filtered.filter(patient => patient.age >= minAge);
    }
    if (filters.maxAge) {
      const maxAge = parseInt(filters.maxAge);
      filtered = filtered.filter(patient => patient.age <= maxAge);
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [allPatients, debouncedSearch, filters, selectedClinicId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const applyFilters = () => {
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      gender: '',
      minAge: '',
      maxAge: '',
    });
  };

  // Loading state
  if (isLoading && !patients.length) {
    return (
      <ScreenWrapper>
        <Header title="Patients" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading patients...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper>
        <Header title="Patients" />
        <EmptyState
          icon={AlertCircle}
          title="Error loading patients"
          description={error.message || 'Failed to load patients'}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  const renderPatient = useCallback(({ item }) => {
    // Get patient code for current clinic
    const patientCode = item.patientCodes?.find(
      pc => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
    )?.code || 'N/A';

    return (
      <ListItem
        title={item.name}
        subtitle={`${item.phone || 'No phone'} • ${patientCode}`}
        leftIcon={() => <Avatar name={item.name} size="md" />}
        rightContent={
          <View className="items-end">
            <Badge variant="default" size="sm">
              {item.age}y
            </Badge>
          </View>
        }
        showChevron
        onPress={() => navigation.navigate('PatientDetail', { id: item._id })}
      />
    );
  }, [navigation, selectedClinicId]);

  return (
    <ScreenWrapper>
      <Header
        title="Patients"
        subtitle={`${patients.length} patients`}
        rightContent={
          <Button variant="ghost" size="sm" onPress={() => setShowFilters(true)}>
            <Filter size={20} color="#1F2937" />
          </Button>
        }
      />

      <View className="p-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search patients..."
        />
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title="No patients found"
            description="Patients are created through appointments"
          />
        }
      />

      {/* Filters Bottom Sheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Patients">
        <Select
          label="Gender"
          value={filters.gender}
          onValueChange={(value) => setFilters({ ...filters, gender: value })}
          options={[
            { label: 'All', value: '' },
            { label: 'Male', value: 'M' },
            { label: 'Female', value: 'F' },
            { label: 'Other', value: 'O' },
          ]}
        />

        <View className="mt-4">
          <Text className="mb-2 text-sm font-medium text-gray-700">Age Range</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Select
                label="Min Age"
                value={filters.minAge}
                onValueChange={(value) => setFilters({ ...filters, minAge: value })}
                options={[
                  { label: 'Any', value: '' },
                  { label: '0', value: '0' },
                  { label: '18', value: '18' },
                  { label: '30', value: '30' },
                  { label: '50', value: '50' },
                ]}
              />
            </View>
            <View className="flex-1">
              <Select
                label="Max Age"
                value={filters.maxAge}
                onValueChange={(value) => setFilters({ ...filters, maxAge: value })}
                options={[
                  { label: 'Any', value: '' },
                  { label: '18', value: '18' },
                  { label: '30', value: '30' },
                  { label: '50', value: '50' },
                  { label: '100', value: '100' },
                ]}
              />
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Button variant="outline" onPress={clearFilters} className="flex-1">
            Clear
          </Button>
          <Button onPress={applyFilters} className="flex-1">
            Apply Filters
          </Button>
        </View>
      </BottomSheet>
    </ScreenWrapper>
  );
}
