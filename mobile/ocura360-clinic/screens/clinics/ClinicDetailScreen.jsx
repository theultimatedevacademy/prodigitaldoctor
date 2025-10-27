import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Building2, Phone, Mail, MapPin, Users, UserCog, Edit2, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ListItem } from '../../components/ui/ListItem';
import { EmptyState } from '../../components/ui/EmptyState';
import { useClinic, useClinics } from '../../api/hooks/useClinics';
import { useMe } from '../../api/hooks/useAuth';

export default function ClinicDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { data: clinic, isLoading, error, refetch } = useClinic(id);
  const { data: clinics } = useClinics(); // Get all clinics to find userRole
  const { data: user } = useMe();
  const [refreshing, setRefreshing] = React.useState(false);

  // Get userRole from clinics list if not in clinic detail
  const userRole = clinic?.userRole || clinics?.find(c => c._id === id)?.userRole || null;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Clinic Details" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading clinic details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error || !clinic) {
    return (
      <ScreenWrapper>
        <Header title="Clinic Details" showBack />
        <EmptyState
          icon={AlertCircle}
          title={error ? "Error loading clinic" : "Clinic not found"}
          description={error?.message || "The clinic you're looking for doesn't exist"}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  const isOwner = userRole === 'clinic_owner';
  
  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'MEMBER';
    return role.replace('_', ' ').toUpperCase();
  };

  // Format address for display
  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.pincode,
        address.country,
      ].filter(Boolean);
      return parts.join(', ') || 'No address';
    }
    return 'No address';
  };

  // Get phone from contact object or direct property
  const phone = clinic.contact?.phone || clinic.phone || '';
  const email = clinic.contact?.email || clinic.email || '';

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = () => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Clinic Details"
        showBack
        rightContent={
          isOwner && (
            <TouchableOpacity onPress={() => navigation.navigate('ClinicSettings')}>
              <Edit2 size={24} color="#1F2937" />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Clinic Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">{clinic.name}</Text>
                {userRole && (
                  <Badge variant="success" className="mt-2 self-start">
                    {formatRole(userRole)}
                  </Badge>
                )}
              </View>
              <Building2 size={32} color="#2563EB" />
            </View>

            <View className="space-y-3 mt-4">
              <View className="flex-row items-center">
                <MapPin size={20} color="#6B7280" className="mr-3" />
                <Text className="text-base text-gray-900 flex-1">{formatAddress(clinic.address)}</Text>
              </View>

              {phone && (
                <View className="flex-row items-center">
                  <Phone size={20} color="#6B7280" className="mr-3" />
                  <TouchableOpacity onPress={handleCall} className="flex-1">
                    <Text className="text-base text-blue-600">{phone}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {email && (
                <View className="flex-row items-center">
                  <Mail size={20} color="#6B7280" className="mr-3" />
                  <TouchableOpacity onPress={handleEmail} className="flex-1">
                    <Text className="text-base text-blue-600">{email}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Subscription Info - Show user's subscription */}
        {user?.subscription && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-semibold text-gray-900 capitalize">
                    {user.subscription.plan} Plan
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Max Clinics: {user.subscription.maxClinics || 'Unlimited'}
                  </Text>
                </View>
                <Badge
                  variant={user.subscription.status === 'active' ? 'success' : 'danger'}
                >
                  {user.subscription.status}
                </Badge>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Doctors - from clinic.staff where role='doctor' and accepted=true */}
        {clinic.staff && clinic.staff.filter(s => s.role === 'doctor' && s.accepted).length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Doctors</CardTitle>
                <Badge variant="primary">{clinic.staff.filter(s => s.role === 'doctor' && s.accepted).length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {clinic.staff.filter(s => s.role === 'doctor' && s.accepted).map((doctor, index) => (
                <ListItem
                  key={doctor.user?._id || `doctor-${index}`}
                  title={doctor.user?.name || 'Unknown'}
                  subtitle="Doctor"
                  leftIcon={Users}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Staff (Only visible to owners) - from clinic.staff where role='staff' and accepted=true */}
        {isOwner && clinic.staff && clinic.staff.filter(s => s.role === 'staff' && s.accepted).length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Staff</CardTitle>
                <Badge variant="default">{clinic.staff.filter(s => s.role === 'staff' && s.accepted).length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {clinic.staff.filter(s => s.role === 'staff' && s.accepted).map((member, index) => (
                <ListItem
                  key={member.user?._id || `staff-${index}`}
                  title={member.user?.name || 'Unknown'}
                  subtitle={member.user?.email || 'No email'}
                  leftIcon={UserCog}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {isOwner && (
          <View className="space-y-3 mb-8">
            <Button
              variant="primary"
              onPress={() => navigation.navigate('ClinicSettings')}
            >
              Manage Clinic Settings
            </Button>
            <Button
              variant="outline"
              onPress={() => navigation.navigate('Staff')}
            >
              Manage Staff
            </Button>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
