import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, CreditCard } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useClinicContext } from '../../contexts/ClinicContext';
import { getClinicById } from '../../utils/mockData';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { selectedClinicId } = useClinicContext();
  const clinic = getClinicById(selectedClinicId);

  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      features: [
        'Up to 100 appointments/month',
        'Up to 50 patients',
        'Basic prescriptions',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      features: [
        'Unlimited appointments',
        'Unlimited patients',
        'Advanced prescriptions',
        'Staff management',
        'Priority support',
        'Analytics dashboard',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      features: [
        'Everything in Professional',
        'Multiple clinics',
        'Custom branding',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
    },
  ];

  const handleSelectPlan = (plan) => {
    Alert.alert(
      'Upgrade Plan',
      `Upgrade to ${plan.name} plan for ${plan.price}${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert('Success', 'Plan upgraded successfully!');
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Subscription" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Current Plan */}
        {clinic && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xl font-bold text-gray-900 capitalize">
                    {clinic.subscription.plan}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Expires: {new Date(clinic.subscription.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
                <Badge
                  variant={clinic.subscription.status === 'active' ? 'success' : 'danger'}
                >
                  {clinic.subscription.status}
                </Badge>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Available Plans
        </Text>

        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`mb-4 ${plan.popular ? 'border-2 border-blue-600' : ''}`}
          >
            <CardContent className="p-4">
              {plan.popular && (
                <Badge variant="primary" className="mb-3 self-start">
                  Most Popular
                </Badge>
              )}
              
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {plan.name}
              </Text>
              
              <View className="flex-row items-end mb-4">
                <Text className="text-4xl font-bold text-blue-600">{plan.price}</Text>
                <Text className="text-lg text-gray-600 mb-1">{plan.period}</Text>
              </View>

              <View className="space-y-3 mb-4">
                {plan.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-start">
                    <View className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                      <Check size={14} color="#16A34A" />
                    </View>
                    <Text className="text-sm text-gray-900 flex-1">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                onPress={() => handleSelectPlan(plan)}
              >
                {clinic?.subscription.plan === plan.name.toLowerCase()
                  ? 'Current Plan'
                  : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Billing Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center mb-3">
              <CreditCard size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-900">•••• •••• •••• 4242</Text>
            </View>
            <Button variant="outline" size="sm">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
