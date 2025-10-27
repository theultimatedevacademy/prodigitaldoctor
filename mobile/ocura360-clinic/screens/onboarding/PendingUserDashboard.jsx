import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building2, Mail } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getPendingInvitations } from '../../utils/mockData';

export default function PendingUserDashboard() {
  const navigation = useNavigation();
  const pendingInvitations = getPendingInvitations();

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1 p-4">
        {/* Welcome */}
        <View className="mb-6 mt-4">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome to Ocura360!
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Get started by creating your clinic or accepting an invitation
          </Text>
        </View>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Pending Invitations</CardTitle>
                <Badge variant="primary">{pendingInvitations.length}</Badge>
              </View>
            </CardHeader>
            <CardContent>
              {pendingInvitations.map((invitation) => (
                <View
                  key={invitation._id}
                  className="bg-blue-50 p-4 rounded-lg mb-3 last:mb-0"
                >
                  <View className="flex-row items-start mb-2">
                    <Mail size={20} color="#2563EB" className="mr-3 mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {invitation.data.clinicName}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        Invited as {invitation.data.role}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        by {invitation.data.invitedBy}
                      </Text>
                    </View>
                  </View>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => navigation.navigate('Notifications')}
                  >
                    View Invitation
                  </Button>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Create Clinic Option */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <View className="items-center">
              <View className="bg-blue-100 p-4 rounded-full mb-4">
                <Building2 size={32} color="#2563EB" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                Create Your Clinic
              </Text>
              <Text className="text-sm text-gray-600 mb-4 text-center">
                Start managing your clinic with a 30-day free trial
              </Text>
              <Button
                variant="primary"
                onPress={() => navigation.navigate('StartTrial')}
              >
                Start Free Trial
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardContent className="p-6">
            <Text className="text-base text-gray-900 text-center mb-4">
              Need help getting started?
            </Text>
            <Button
              variant="outline"
              onPress={() => {
                // TODO: Open help/support
              }}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
