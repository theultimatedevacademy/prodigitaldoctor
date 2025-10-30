import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import {
  User,
  Users,
  Building2,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Card, CardContent } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useMe } from '../../api/hooks/useAuth';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const { data: user } = useMe();
  const { selectedClinic, userClinicRole } = useClinicContext();
  const { unreadCount } = useNotificationContext();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-blue-600 px-6 py-8">
          <View className="flex-row items-center">
            <Avatar 
              name={user?.name || 'User'} 
              source={user?.profilePhotoUrl ? { uri: user.profilePhotoUrl } : null}
              size="xl" 
            />
            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-white">
                {user?.name || 'User'}
              </Text>
              {selectedClinic && (
                <>
                  <Text className="text-sm text-blue-100 mt-1">
                    {selectedClinic.name}
                  </Text>
                  <View className="mt-2">
                    <Badge variant="success" className="self-start">
                      {userClinicRole === 'clinic_owner' 
                        ? 'CLINIC OWNER' 
                        : userClinicRole === 'doctor'
                        ? 'DOCTOR'
                        : userClinicRole === 'staff'
                        ? 'STAFF'
                        : userClinicRole?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        <View className="p-4">
          {/* Account Section */}
          <Card className="mb-4">
            <CardContent className="p-2">
              <ListItem
                title="Profile"
                subtitle="Manage your profile information"
                leftIcon={User}
                showChevron
                onPress={() => navigation.navigate('Profile')}
              />
              <ListItem
                title="My Clinics"
                subtitle={selectedClinic?.name || 'No clinic selected'}
                leftIcon={Building2}
                showChevron
                onPress={() => navigation.navigate('Clinics')}
              />
            </CardContent>
          </Card>

          {/* Patients Section */}
          <Card className="mb-4">
            <CardContent className="p-2">
              <ListItem
                title="View All Patients"
                subtitle="Browse and manage patient records"
                leftIcon={Users}
                showChevron
                onPress={() => navigation.navigate('Patients')}
              />
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="mb-4">
            <CardContent className="p-2">
              <ListItem
                title="Notifications"
                subtitle="Manage notification preferences"
                leftIcon={Bell}
                rightContent={
                  unreadCount > 0 && (
                    <Badge variant="danger" size="sm">{unreadCount}</Badge>
                  )
                }
                showChevron
                onPress={() => navigation.navigate('Notifications')}
              />
            </CardContent>
          </Card>

          {/* Settings Section (Owner only) */}
          {userClinicRole === 'clinic_owner' && (
            <Card className="mb-4">
              <CardContent className="p-2">
                <ListItem
                  title="Clinic Settings"
                  subtitle="Manage clinic configuration"
                  leftIcon={Settings}
                  showChevron
                  onPress={() => navigation.navigate('ClinicSettings')}
                />
                <ListItem
                  title="Subscription"
                  subtitle="Manage your subscription"
                  leftIcon={FileText}
                  showChevron
                  onPress={() => navigation.navigate('Subscription')}
                />
              </CardContent>
            </Card>
          )}

          {/* Support Section */}
          <Card className="mb-4">
            <CardContent className="p-2">
              <ListItem
                title="Help & Support"
                subtitle="Get help and contact support"
                leftIcon={HelpCircle}
                showChevron
                onPress={() => Alert.alert('Help', 'Support feature coming soon')}
              />
              <ListItem
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                leftIcon={Shield}
                showChevron
                onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon')}
              />
              <ListItem
                title="Terms of Service"
                subtitle="Read our terms of service"
                leftIcon={FileText}
                showChevron
                onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
              />
            </CardContent>
          </Card>

          {/* App Info */}
          <View className="items-center mb-4">
            <Text className="text-sm text-gray-600">Version 1.0.0</Text>
            <Text className="text-xs text-gray-500 mt-1">© 2024 Ocura360</Text>
          </View>

          {/* Sign Out */}
          <Button
            variant="danger"
            onPress={handleSignOut}
            className="mb-8"
          >
            <LogOut size={20} color="#fff" />
            <Text className="ml-2">Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
