import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Building2, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useClinics } from '../../api/hooks/useClinics';
import { useMe } from '../../api/hooks/useAuth';

export default function ClinicsListScreen() {
  const navigation = useNavigation();
  const { selectedClinicId, switchClinic } = useClinicContext();
  const { data: clinics, isLoading, error, refetch } = useClinics();
  const { data: user } = useMe();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Check subscription limits
  const canCreateClinic = user?.subscription?.plan !== 'free' || 
    (clinics?.length || 0) < (user?.subscription?.maxClinics || 1);

  const handleClinicPress = (clinic) => {
    navigation.navigate('ClinicDetail', { id: clinic._id });
  };

  const handleSwitchClinic = async (clinic) => {
    await switchClinic(clinic);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'clinic_owner':
        return 'success';
      case 'doctor':
        return 'primary';
      case 'staff':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    return role.replace('_', ' ').split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.pincode,
      ].filter(Boolean);
      return parts.join(', ') || 'No address';
    }
    return 'No address';
  };

  const formatPhone = (contact) => {
    if (typeof contact === 'string') return contact;
    if (typeof contact === 'object' && contact !== null) {
      return contact.phone || 'No phone';
    }
    return 'No phone';
  };

  const renderClinic = useCallback(({ item }) => {
    const isSelected = item._id === selectedClinicId;

    return (
      <Card
        className={`mx-4 mb-3 ${isSelected ? 'border-2 border-blue-600' : ''}`}
        onPress={() => handleClinicPress(item)}
      >
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
                {isSelected && (
                  <Badge variant="success" size="sm">Active</Badge>
                )}
              </View>
              <Text className="text-sm text-gray-600 mt-1">{formatAddress(item.address)}</Text>
              <Text className="text-sm text-gray-600">{formatPhone(item.contact || item.phone)}</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <Badge variant={getRoleBadgeVariant(item.userRole)}>
              {getRoleLabel(item.userRole)}
            </Badge>
            {!isSelected && (
              <Text
                className="text-sm font-semibold text-blue-600"
                onPress={() => handleSwitchClinic(item)}
              >
                Switch to this clinic
              </Text>
            )}
          </View>
        </CardContent>
      </Card>
    );
  }, [selectedClinicId, handleClinicPress, handleSwitchClinic]);

  // Loading state
  if (isLoading && !clinics) {
    return (
      <ScreenWrapper>
        <Header title="My Clinics" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading clinics...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error && !clinics) {
    return (
      <ScreenWrapper>
        <Header title="My Clinics" />
        <EmptyState
          icon={AlertCircle}
          title="Error loading clinics"
          description={error.message || 'Failed to load clinics. Please try again.'}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title="My Clinics"
        subtitle={`${clinics?.length || 0} clinic${clinics?.length !== 1 ? 's' : ''}`}
      />

      <FlatList
        data={clinics || []}
        renderItem={renderClinic}
        keyExtractor={(item) => item._id}
        contentContainerClassName="pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Building2}
            title="No clinics"
            description="Create your first clinic to get started"
            actionLabel="Create Clinic"
            onAction={() => navigation.navigate('NewClinic')}
          />
        }
      />

      {canCreateClinic ? (
        <FloatingActionButton
          onPress={() => navigation.navigate('NewClinic')}
          icon={Plus}
        />
      ) : (
        <View className="absolute bottom-6 right-6 bg-gray-100 rounded-full p-4">
          <Text className="text-xs text-gray-600 text-center max-w-[200px]">
            Upgrade to create more clinics
          </Text>
        </View>
      )}
    </ScreenWrapper>
  );
}
