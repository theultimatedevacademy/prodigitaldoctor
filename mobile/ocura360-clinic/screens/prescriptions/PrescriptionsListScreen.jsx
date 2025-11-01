import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, FileText, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { usePrescriptions } from '../../api/hooks/usePrescriptions';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useMe } from '../../api/hooks/useAuth';
import { useClinicDoctors } from '../../api/hooks/useClinics';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PrescriptionsListScreen() {
  const navigation = useNavigation();
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { data: user } = useMe();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const today = getTodayDate();

  const [filters, setFilters] = useState({
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

    // Doctors only see their own prescriptions
    if (userClinicRole === 'doctor') {
      baseFilters.doctorId = user._id;
    }

    // Apply user-selected filters
    if (filters.doctorId && userClinicRole !== 'doctor') {
      baseFilters.doctorId = filters.doctorId;
    }

    return baseFilters;
  }, [selectedClinicId, userClinicRole, user, filters, debouncedSearch]);

  // Fetch prescriptions
  const {
    data: prescriptionsResponse,
    isLoading,
    error,
    refetch,
  } = usePrescriptions(apiFilters, {
    enabled: !!selectedClinicId,
  });

  // Extract prescriptions array from response (search is now server-side)
  const prescriptions = prescriptionsResponse?.data || [];

  // Refetch prescriptions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedClinicId) {
        refetch();
      }
    }, [selectedClinicId, refetch])
  );

  // Generate subtitle message based on filters and results (memoized for performance)
  const subtitle = useMemo(() => {
    const count = prescriptions.length;
    const isToday = filters.startDate === today && filters.endDate === today;
    const hasDateFilter = filters.startDate || filters.endDate;
    
    if (searchQuery) {
      return `${count} prescription${count !== 1 ? 's' : ''} found`;
    }
    
    if (isToday) {
      return count === 0 ? 'No prescriptions today' : `${count} prescription${count !== 1 ? 's' : ''} today`;
    }
    
    if (hasDateFilter) {
      return `${count} prescription${count !== 1 ? 's' : ''} in selected range`;
    }
    
    return `${count} prescription${count !== 1 ? 's' : ''}`;
  }, [prescriptions.length, filters.startDate, filters.endDate, today, searchQuery]);

  // Generate empty state message
  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return 'Try a different search term';
    }
    
    const isToday = filters.startDate === today && filters.endDate === today;
    if (isToday) {
      return 'No prescriptions created today. Prescriptions are created from appointments.';
    }
    
    return 'No prescriptions found in the selected date range. Prescriptions are created from appointments.';
  };

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
      doctorId: '',
      startDate: today,
      endDate: today,
    });
  };

  const renderPrescription = useCallback(({ item }) => {
    const patientCode =
      item.patient?.patientCodes?.find(
        (pc) => pc.clinic?._id === selectedClinicId || pc.clinic === selectedClinicId
      )?.code || 'N/A';
    const patientName = item.patient?.name || 'Unknown Patient';
    const doctorName = item.doctor?.name || 'Unknown Doctor';
    const medsCount = item.meds?.length || 0;
    const patientInfo = `${patientCode} • ${formatDate(item.createdAt)}`;

    return (
      <Card
        className="mx-4 mb-3"
        onPress={() => navigation.navigate('PrescriptionDetail', { id: item._id })}
      >
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {patientName}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {patientInfo}
              </Text>
            </View>
            <Badge variant="primary">{medsCount} meds</Badge>
          </View>
          <View className="flex-row items-center mt-2">
            <FileText size={16} color="#6B7280" className="mr-2" />
            <Text className="text-sm text-gray-600">
              {doctorName}
            </Text>
          </View>
          {item.diagnosis && item.diagnosis.length > 0 && (
            <Text className="text-sm text-gray-700 mt-2" numberOfLines={1}>
              {item.diagnosis.join(', ')}
            </Text>
          )}
        </CardContent>
      </Card>
    );
  }, [navigation, selectedClinicId]);

  // Show loading state
  if (isLoading && !prescriptions.length) {
    return (
      <ScreenWrapper>
        <Header title="Prescriptions" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading prescriptions...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <ScreenWrapper>
        <Header title="Prescriptions" />
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Error Loading Prescriptions</Text>
          <Text className="text-gray-600 text-center mt-2">{error.message}</Text>
          <Button onPress={refetch} className="mt-4">
            Try Again
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title="Prescriptions"
        subtitle={subtitle}
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#1F2937" />
          </Button>
        }
      />

      <View className="p-4 pb-0">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by patient name or patient code..."
        />
      </View>

      <FlatList
        data={prescriptions}
        renderItem={renderPrescription}
        keyExtractor={(item) => item._id}
        contentContainerClassName="pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={15}
        ListEmptyComponent={
          <EmptyState
            icon={FileText}
            title="No prescriptions found"
            description={getEmptyStateMessage()}
          />
        }
      />

      {/* Filters Bottom Sheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Prescriptions">
        <View style={{ maxHeight: 500 }}>
          <ScrollView
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}>
            {/* Only show doctor filter for clinic owners/staff */}
            {userClinicRole !== 'doctor' && (
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
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setFilters({ ...filters, startDate: `${year}-${month}-${day}` });
                }
              }}
              mode="date"
            />

            <DatePicker
              label="End Date"
              value={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setFilters({ ...filters, endDate: `${year}-${month}-${day}` });
                }
              }}
              mode="date"
              minimumDate={filters.startDate ? new Date(filters.startDate) : null}
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
