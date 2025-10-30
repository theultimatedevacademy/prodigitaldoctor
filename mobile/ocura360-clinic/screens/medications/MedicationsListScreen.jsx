import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Pill, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useSearchMedications } from '../../api/hooks/useMedications';
import { useClinicContext } from '../../contexts/ClinicContext';

export default function MedicationsListScreen() {
  const navigation = useNavigation();
  const { userClinicRole } = useClinicContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Check permission (only doctors and clinic owners can access)
  const canAccess = userClinicRole === 'doctor' || userClinicRole === 'clinic_owner';

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch medications based on debounced query
  const {
    data: medicationsResponse,
    isLoading,
    error,
    refetch,
  } = useSearchMedications(debouncedQuery, {
    enabled: debouncedQuery.length >= 2,
  });

  const medications = medicationsResponse?.medications || [];

  // Refetch on screen focus
  useFocusEffect(
    useCallback(() => {
      if (debouncedQuery.length >= 2) {
        refetch();
      }
    }, [debouncedQuery, refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!canAccess) {
    return (
      <ScreenWrapper>
        <Header title="Medications" />
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Access Denied</Text>
          <Text className="text-gray-600 text-center mt-2">
            Only doctors and clinic owners can access the medications database
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const renderMedication = useCallback(({ item }) => {
    const compositions = item.unique_composition?.map(c => c.name).join(', ') || item.exact_composition || 'N/A';
    
    return (
      <Card 
        className="mx-4 mb-3"
        onPress={() => navigation.navigate('MedicationDetail', { id: item._id })}
      >
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{item.brandName}</Text>
              {item.genericName && (
                <Text className="text-sm text-gray-600 mt-1">
                  Generic: {item.genericName}
                </Text>
              )}
              <Text className="text-sm text-gray-600 mt-1">
                {compositions}
              </Text>
            </View>
            {item.form && (
              <Badge variant="primary">{item.form}</Badge>
            )}
          </View>
          {item.manufacturer && (
            <Text className="text-xs text-gray-500 mt-2">
              {item.manufacturer}
            </Text>
          )}
        </CardContent>
      </Card>
    );
  }, [navigation]);

  // Helper to get subtitle
  const getSubtitle = () => {
    if (searchQuery.length === 0) {
      return 'Type to search medications';
    }
    if (searchQuery.length < 2) {
      return 'Type at least 2 characters';
    }
    if (isLoading) {
      return 'Searching...';
    }
    return `${medications.length} medication${medications.length !== 1 ? 's' : ''} found`;
  };

  return (
    <ScreenWrapper>
      <Header
        title="Medications Database"
        subtitle={getSubtitle()}
      />

      <View className="p-4 pb-0">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by brand, generic, or composition..."
        />
      </View>

      {searchQuery.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Search Medications"
          description="Start typing to search for medications by brand name, generic name, or composition"
        />
      ) : searchQuery.length < 2 ? (
        <EmptyState
          icon={Pill}
          title="Keep Typing"
          description="Enter at least 2 characters to search"
        />
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Error Loading Medications</Text>
          <Text className="text-gray-600 text-center mt-2">{error.message}</Text>
          <Button onPress={refetch} className="mt-4">
            Try Again
          </Button>
        </View>
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Searching medications...</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item._id}
          contentContainerClassName="pt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Pill}
              title="No medications found"
              description="Try a different search term"
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}
