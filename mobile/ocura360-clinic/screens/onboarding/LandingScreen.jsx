import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Activity, Users, Calendar, FileText } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export default function LandingScreen() {
  const navigation = useNavigation();

  const features = [
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'Schedule and manage patient appointments efficiently',
    },
    {
      icon: Users,
      title: 'Patient Records',
      description: 'Maintain comprehensive patient health records',
    },
    {
      icon: FileText,
      title: 'Prescriptions',
      description: 'Create and manage digital prescriptions',
    },
    {
      icon: Activity,
      title: 'Analytics',
      description: 'Track clinic performance and patient trends',
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-blue-600 px-6 py-12">
          <Text className="text-4xl font-bold text-white text-center mb-4">
            Ocura360 Clinic
          </Text>
          <Text className="text-lg text-blue-100 text-center">
            Complete healthcare management solution for modern clinics
          </Text>
        </View>

        {/* Features */}
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Everything you need
          </Text>

          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="mb-4">
                <CardContent className="p-4 flex-row items-start">
                  <View className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Icon size={24} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {feature.description}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>

        {/* CTA */}
        <View className="px-6 pb-8">
          <Button
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('SignUp')}
            className="mb-3"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => navigation.navigate('SignIn')}
          >
            Sign In
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
