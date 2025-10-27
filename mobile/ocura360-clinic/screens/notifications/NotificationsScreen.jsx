import React, { useState } from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, Mail, AlertCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { EmptyState } from '../../components/ui/EmptyState';
import { InvitationCard } from '../../components/notifications/InvitationCard';
import { usePendingInvitations } from '../../api/hooks/useClinics';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { data: invitationsData, isLoading, error, refetch } = usePendingInvitations();
  const [refreshing, setRefreshing] = useState(false);

  const invitations = invitationsData?.invitations || [];
  const total = invitationsData?.total || 0;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Notifications" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading notifications...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper>
        <Header title="Notifications" />
        <EmptyState
          icon={AlertCircle}
          title="Error loading notifications"
          description={error.message || 'Failed to load notifications'}
          actionLabel="Retry"
          onAction={refetch}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title="Notifications"
        subtitle={total > 0 ? `${total} pending invitation${total !== 1 ? 's' : ''}` : 'No pending invitations'}
      />

      <FlatList
        data={invitations}
        renderItem={({ item }) => <InvitationCard invitation={item} />}
        keyExtractor={(item) => item._id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Mail}
            title="No Pending Invitations"
            description="You don't have any pending clinic invitations at the moment. When someone invites you to join their clinic, it will appear here."
          />
        }
      />
    </ScreenWrapper>
  );
}
