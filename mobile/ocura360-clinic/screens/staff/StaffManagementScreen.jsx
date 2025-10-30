import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, UserCog, Mail, Trash2, AlertCircle, Clock } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ListItem } from '../../components/ui/ListItem';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useClinic, useInviteStaff, useRemoveStaff, usePendingInvitations } from '../../api/hooks/useClinics';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

export default function StaffManagementScreen() {
  const navigation = useNavigation();
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { data: clinic, isLoading, error, refetch } = useClinic(selectedClinicId);
  const { data: pendingInvitations, refetch: refetchInvitations } = usePendingInvitations();
  const inviteStaff = useInviteStaff();
  const removeStaff = useRemoveStaff();
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'staff',
  });

  const isOwner = userClinicRole === 'clinic_owner';
  
  // Get accepted and pending staff members from clinic.staff array
  // Backend structure: clinic.staff = [{ user: ObjectId (populated), role: string, accepted: boolean }]
  const acceptedStaff = (clinic?.staff || []).filter(s => s.accepted);
  const pendingStaff = (clinic?.staff || []).filter(s => !s.accepted);
  
  const staff = acceptedStaff;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchInvitations()]);
    setRefreshing(false);
  }, [refetch, refetchInvitations]);

  const handleInvite = async () => {
    if (!inviteData.email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!inviteData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await inviteStaff.mutateAsync({
        clinicId: selectedClinicId,
        email: inviteData.email.trim(),
        role: inviteData.role,
      });

      // Success - close modal and reset form
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'staff' });
      
      Alert.alert(
        'Success',
        'Invitation sent successfully! The user will receive an email and can accept the invitation from their notifications.',
        [{ text: 'OK' }]
      );
      
      // Refresh data
      refetch();
      refetchInvitations();
    } catch (error) {
      // Specific error handling based on backend responses
      const errorData = error?.data;
      const errorStatus = error?.status;
      
      if (errorStatus === 404 || errorData?.error?.includes('not found')) {
        Alert.alert(
          'User Not Found',
          'The email address may be incorrect, or the user has not signed up on the platform yet. Please verify the email or ask them to create an account first.',
          [{ text: 'OK' }]
        );
      } else if (errorData?.error === 'Cannot invite clinic owner as staff') {
        Alert.alert(
          'Cannot Invite Owner',
          'You cannot invite the clinic owner as a staff member.',
          [{ text: 'OK' }]
        );
      } else if (errorData?.error === 'User already invited or is a staff member') {
        Alert.alert(
          'Already Invited',
          'This user has already been invited or is already a staff member.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          errorData?.error || error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleRemoveStaff = (member) => {
    // member.user is the populated User object
    const memberName = member.user?.name || 'this member';
    const userId = member.user?._id;
    
    Alert.alert(
      'Remove Staff Member',
      `Remove ${memberName} from the clinic?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStaff.mutateAsync({
                clinicId: selectedClinicId,
                userId: userId,
              });
              Alert.alert('Success', 'Staff member removed successfully');
            } catch (error) {
              Alert.alert(
                'Error',
                error?.message || 'Failed to remove staff member'
              );
            }
          }
        }
      ]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Staff Management" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading staff...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Permission check
  if (!isOwner) {
    return (
      <ScreenWrapper>
        <Header title="Staff Management" showBack />
        <EmptyState
          icon={UserCog}
          title="Access Denied"
          description="Only clinic owners can manage staff"
        />
      </ScreenWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper>
        <Header title="Staff Management" showBack />
        <EmptyState
          icon={AlertCircle}
          title="Error loading staff"
          description={error.message || 'Failed to load staff members'}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  const renderStaffMember = useCallback(({ item }) => {
    // Backend structure: { user: { _id, name, email, phone }, role: 'doctor'|'staff', accepted: true }
    const user = item.user;
    const name = user?.name || 'Unknown';
    const email = user?.email || 'No email';
    const phone = user?.phone || '';
    const role = item.role || 'staff';
    
    return (
      <Card className="mx-4 mb-3">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{name}</Text>
              <View className="flex-row items-center mt-1">
                <Mail size={14} color="#6B7280" className="mr-2" />
                <Text className="text-sm text-gray-600">{email}</Text>
              </View>
              {phone && (
                <View className="flex-row items-center mt-1">
                  <UserCog size={14} color="#6B7280" className="mr-2" />
                  <Text className="text-sm text-gray-600">{phone}</Text>
                </View>
              )}
            </View>
            <Badge variant={role === 'doctor' ? 'primary' : 'default'}>
              {role.toUpperCase()}
            </Badge>
          </View>
          <Button
            variant="danger"
            size="sm"
            onPress={() => handleRemoveStaff(item)}
            loading={removeStaff.isLoading}
            disabled={removeStaff.isLoading}
            className="mt-3"
          >
            <Trash2 size={14} color="#fff" />
            <Text className="ml-2">Remove</Text>
          </Button>
        </CardContent>
      </Card>
    );
  }, [handleRemoveStaff, removeStaff.isLoading]);

  return (
    <ScreenWrapper>
      <Header
        title="Staff Management"
        subtitle={`${staff.length} staff • ${pendingStaff.length} pending`}
        showBack
      />

      <FlatList
        data={staff}
        renderItem={renderStaffMember}
        keyExtractor={(item, index) => item.user?._id || `staff-${index}`}
        contentContainerClassName="pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          pendingStaff.length > 0 ? (
            <View className="mx-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">Pending Invitations</Text>
                <Badge variant="warning">{pendingStaff.length}</Badge>
              </View>
              {pendingStaff.map((member, index) => (
                <Card key={member.user?._id || index} className="mb-3 bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <View className="flex-row items-start">
                      <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                        <UserCog size={20} color="#D97706" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {member.user?.name || 'Unknown'}
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1">
                          {member.user?.email || 'No email'}
                        </Text>
                        <View className="flex-row items-center mt-2">
                          <Badge variant={member.role === 'doctor' ? 'primary' : 'default'} size="sm">
                            {member.role === 'doctor' ? 'Doctor' : 'Staff'}
                          </Badge>
                          <Text className="text-xs text-gray-500 ml-2">
                            • Invited {new Date(member.invitedAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                          <Clock size={14} color="#D97706" className="mr-1" />
                          <Text className="text-sm text-yellow-700 font-medium">Awaiting acceptance</Text>
                        </View>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
              <View className="h-4" />
              <Text className="text-lg font-semibold text-gray-900 mb-3">Active Staff</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={UserCog}
            title="No staff members"
            description="Invite staff members to help manage your clinic"
            actionLabel="Invite Staff"
            onAction={() => setShowInviteModal(true)}
          />
        }
      />

      <FloatingActionButton
        onPress={() => setShowInviteModal(true)}
        icon={Plus}
      />

      {/* Invite Staff Modal */}
      <Modal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Staff Member"
        size="medium"
      >
        <View className="p-4">
          <Input
            label="Email Address *"
            value={inviteData.email}
            onChangeText={(text) => setInviteData({ ...inviteData, email: text })}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Select
            label="Role *"
            value={inviteData.role}
            onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
            options={[
              { label: 'Staff', value: 'staff' },
              { label: 'Doctor', value: 'doctor' },
            ]}
          />

          <View className="flex-row gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onPress={handleInvite}
              loading={inviteStaff.isLoading}
              disabled={inviteStaff.isLoading}
            >
              Send Invite
            </Button>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
