import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

export default function StartTrialScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
  });

  const trialFeatures = [
    '30 days free trial',
    'Unlimited appointments',
    'Unlimited patients',
    'Digital prescriptions',
    'Staff management',
    'No credit card required',
  ];

  const handleStartTrial = async () => {
    if (!formData.clinicName || !formData.phone || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Trial started! Your clinic has been created.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    }, 1000);
  };

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="Start Free Trial" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Trial Benefits */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            {trialFeatures.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3 last:mb-0">
                <View className="bg-green-100 p-1 rounded-full mr-3">
                  <Check size={16} color="#16A34A" />
                </View>
                <Text className="text-base text-gray-900">{feature}</Text>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Clinic Setup Form */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Clinic Name *"
              value={formData.clinicName}
              onChangeText={(text) => setFormData({ ...formData, clinicName: text })}
              placeholder="Enter clinic name"
            />

            <Textarea
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter clinic address"
              numberOfLines={3}
            />

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </CardContent>
        </Card>

        {/* Terms */}
        <Text className="text-xs text-gray-600 text-center mb-4 px-4">
          By starting your trial, you agree to our Terms of Service and Privacy Policy.
          No credit card required. Cancel anytime.
        </Text>

        <Button
          variant="primary"
          size="lg"
          onPress={handleStartTrial}
          loading={loading}
          className="mb-8"
        >
          Start 30-Day Free Trial
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}
