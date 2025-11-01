import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Filter, Calendar as CalendarIcon, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ListItem } from '../../components/ui/ListItem';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { SearchBar } from '../../components/ui/SearchBar';
import { useAppointments } from '../../api/hooks/useAppointments';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useMe } from '../../api/hooks/useAuth';
import { useClinicDoctors } from '../../api/hooks/useClinics';
import { formatDate, formatTime } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AppointmentsListScreen() {
  const navigation = useNavigation();
  const { selectedClinicId } = useClinicContext();
  const { data: user } = useMe();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const today = getTodayDate();

  const [filters, setFilters] = useState({
    status: '',
    visitType: '',
    doctorId: '',
    startDate: today,
    endDate: today,
  });

  // Debounce search query for server-side search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch clinic doctors for filter dropdown
  const { data: doctorsData } = useClinicDoctors(selectedClinicId);
  const doctorOptions = useMemo(() => {
    if (!doctorsData?.doctors) return [];
    return doctorsData.doctors.map((doctor) => ({
      label: doctor.isOwner ? `${doctor.name} (Owner)` : doctor.name,
      value: doctor._id,
    }));
  }, [doctorsData]);

  // Build API filters based on user role - includes server-side search
  const apiFilters = useMemo(() => {
    const baseFilters = {
      clinicId: selectedClinicId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };

    // Add server-side search parameter
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      baseFilters.search = debouncedSearch.trim();
    }

    // Doctors only see their own appointments
    if (user?.role === 'doctor') {
      baseFilters.doctorId = user._id;
    }

    // Apply user-selected filters
    if (filters.status) baseFilters.status = filters.status;
    if (filters.visitType) baseFilters.visitType = filters.visitType;
    if (filters.doctorId && user?.role !== 'doctor') baseFilters.doctorId = filters.doctorId;

    return baseFilters;
  }, [selectedClinicId, user, filters, debouncedSearch]);

  // Fetch appointments
  const {
    data: appointmentsResponse,
    isLoading,
    error,
    refetch,
  } = useAppointments(apiFilters, {
    enabled: !!selectedClinicId,
  });

  // Extract appointments array from response (search is now server-side)
  const appointments = appointmentsResponse?.appointments || [];

  // Refetch appointments when screen comes into focus (e.g., after creating new appointment)
  useFocusEffect(
    useCallback(() => {
      if (selectedClinicId) {
        refetch();
      }
    }, [selectedClinicId, refetch])
  );

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
      status: '',
      visitType: '',
      doctorId: '',
      startDate: today,
      endDate: today,
    });
    setSearchQuery('');
  };

  // Check if viewing today's appointments
  const isViewingToday = filters.startDate === today && filters.endDate === today;

  // Generate subtitle message (memoized for performance)
  const subtitle = useMemo(() => {
    const count = appointments.length;
    if (isViewingToday) {
      return count === 0
        ? 'No appointments for today'
        : `${count} appointment${count !== 1 ? 's' : ''} today`;
    }
    if (filters.startDate === filters.endDate) {
      return count === 0
        ? 'No appointments for selected date'
        : `${count} appointment${count !== 1 ? 's' : ''} on ${filters.startDate}`;
    }
    return count === 0
      ? 'No appointments in date range'
      : `${count} appointment${count !== 1 ? 's' : ''} in selected range`;
  }, [appointments.length, isViewingToday, filters.startDate, filters.endDate]);

  const renderAppointment = useCallback(({ item }) => {
    const patientName = item.patient?.name || item.tempPatientData?.name || 'Unknown Patient';
    const doctorName = item.doctor?.name || 'Unassigned';
    const visitType = item.visitType === 'first_visit' ? 'First Visit' : 'Follow-Up';
    const subtitleText = `${formatDate(item.startAt)} at ${formatTime(item.startAt)}\n${doctorName} • ${visitType}`;

    return (
      <ListItem
        title={patientName}
        subtitle={subtitleText}
        leftIcon={() => <Avatar name={patientName} size="md" />}
        rightContent={<StatusBadge status={item.status} />}
        showChevron
        onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
      />
    );
  }, [navigation]);

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <ScreenWrapper>
        <Header title="Appointments" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading appointments...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper>
        <Header title="Appointments" />
        <EmptyState
          icon={AlertCircle}
          title="Error loading appointments"
          description={error.message || 'Failed to load appointments'}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title="Appointments"
        subtitle={subtitle}
        rightContent={
          <Button variant="ghost" size="sm" onPress={() => setShowFilters(true)}>
            <Filter size={20} color="#1F2937" />
          </Button>
        }
      />

      {/* Search Bar */}
      <View className="px-4 pt-2">
        <SearchBar
          placeholder="Search by name, code, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={15}
        ListEmptyComponent={
          <EmptyState
            icon={CalendarIcon}
            title={isViewingToday ? 'No appointments today' : 'No appointments found'}
            description={
              isViewingToday
                ? 'Schedule a new appointment or adjust filters'
                : 'Try adjusting your search or filters'
            }
            actionLabel="New Appointment"
            onAction={() => navigation.navigate('NewAppointment')}
          />
        }
      />

      <FloatingActionButton onPress={() => navigation.navigate('NewAppointment')} icon={Plus} />

      {/* Filters Bottom Sheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Appointments">
        <View style={{ maxHeight: 500 }}>
          <ScrollView
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}>
            <Select
              label="Status"
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />

            <Select
              label="Visit Type"
              value={filters.visitType}
              onValueChange={(value) => setFilters({ ...filters, visitType: value })}
              options={[
                { label: 'All Visit Types', value: '' },
                { label: 'First Visit', value: 'first_visit' },
                { label: 'Follow Up', value: 'follow_up' },
              ]}
            />

            {/* Only show doctor filter for clinic owners/staff */}
            {user?.role !== 'doctor' && (
              <Select
                label="Doctor"
                value={filters.doctorId}
                onValueChange={(value) => setFilters({ ...filters, doctorId: value })}
                options={[
                  { label: 'All Doctors', value: '' },
                  ...doctorOptions,
                ]}
              />
            )}

            <DatePicker
              label="Start Date"
              value={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) =>
                setFilters({
                  ...filters,
                  startDate: date ? date.toISOString().split('T')[0] : today,
                })
              }
              mode="date"
            />

            <DatePicker
              label="End Date"
              value={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) =>
                setFilters({ ...filters, endDate: date ? date.toISOString().split('T')[0] : today })
              }
              mode="date"
              minimumDate={filters.startDate ? new Date(filters.startDate) : undefined}
            />

            {/* Extra padding at bottom for scroll */}
            <View style={{ height: 10 }} />
          </ScrollView>

          {/* Buttons outside ScrollView - always visible */}
          <View
            className="mt-4 flex-row gap-3 border-t border-gray-200 pt-4"
            style={{ paddingBottom: insets.bottom || 16 }}>
            <Button variant="outline" onPress={clearFilters} className="flex-1">
              Clear
            </Button>
            <Button onPress={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </View>
        </View>
      </BottomSheet>
    </ScreenWrapper>
  );
}
