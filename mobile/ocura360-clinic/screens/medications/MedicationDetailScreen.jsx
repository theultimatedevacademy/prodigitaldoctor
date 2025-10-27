import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Pill, FlaskConical, Building2, Package, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useMedication } from '../../api/hooks/useMedications';

export default function MedicationDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data: medication, isLoading, error } = useMedication(id);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Medication Details" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Loading medication...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !medication) {
    return (
      <ScreenWrapper>
        <Header title="Medication Not Found" showBack />
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">Medication Not Found</Text>
          <Text className="text-gray-600 text-center mt-2">
            {error?.message || "The medication you're looking for doesn't exist"}
          </Text>
          <Button onPress={() => navigation.goBack()} className="mt-4">
            Go Back
          </Button>
        </View>
      </ScreenWrapper>
    );
  }


  return (
    <ScreenWrapper>
      <Header title="Medication Details" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Header Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-lg bg-blue-100 items-center justify-center mr-4">
                <Pill size={32} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {medication.brandName}
                </Text>
                {medication.genericName && (
                  <Text className="text-base text-gray-600 mb-2">
                    Generic: {medication.genericName}
                  </Text>
                )}
                {medication.form && (
                  <Badge variant="primary" className="self-start">
                    {medication.form}
                  </Badge>
                )}
              </View>
            </View>

            {/* Composition */}
            {(medication.unique_composition && medication.unique_composition.length > 0) && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <View className="flex-row items-center mb-2">
                  <FlaskConical size={20} color="#6B7280" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    Composition
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {medication.unique_composition.map((comp, index) => (
                    <Badge key={index} variant="secondary">
                      {comp.name}
                    </Badge>
                  ))}
                </View>
              </View>
            )}
            {medication.exact_composition && (
              <View className="mt-2">
                <Text className="text-sm text-gray-600">
                  {medication.exact_composition}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Chemical and Therapeutic Classes */}
        {(medication.chemicalClass || medication.therapeuticClass || medication.actionClass) && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent>
              {medication.chemicalClass && (
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-gray-700">Chemical Class:</Text>
                  <Text className="text-base text-gray-900">{medication.chemicalClass}</Text>
                </View>
              )}
              {medication.therapeuticClass && (
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-gray-700">Therapeutic Class:</Text>
                  <Text className="text-base text-gray-900">{medication.therapeuticClass}</Text>
                </View>
              )}
              {medication.actionClass && (
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-gray-700">Action Class:</Text>
                  <Text className="text-base text-gray-900">{medication.actionClass}</Text>
                </View>
              )}
              {medication.habitForming && (
                <View className="mt-2 bg-yellow-50 p-3 rounded-lg flex-row items-center">
                  <AlertTriangle size={20} color="#F59E0B" />
                  <Text className="text-sm font-semibold text-yellow-900 ml-2">
                    Habit Forming
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manufacturer & Form */}
        {(medication.manufacturer || medication.form) && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              {medication.manufacturer && (
                <View className="flex-row items-center mb-3">
                  <Building2 size={20} color="#6B7280" className="mr-3" />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600">Manufacturer</Text>
                    <Text className="text-base text-gray-900">
                      {medication.manufacturer}
                    </Text>
                  </View>
                </View>
              )}
              {medication.form && (
                <View className="flex-row items-center">
                  <Package size={20} color="#6B7280" className="mr-3" />
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600">Form</Text>
                    <Text className="text-base text-gray-900">
                      {medication.form}
                    </Text>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage/Indications */}
        {medication.usage && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Therapeutic Usage / Indications</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-base text-gray-900 leading-6">
                {medication.usage}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Side Effects */}
        {medication.sideEffects && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Common Side Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-base text-gray-900 leading-6">
                {medication.sideEffects}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Substitutes */}
        {medication.substitutes && medication.substitutes.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Available Substitutes</CardTitle>
            </CardHeader>
            <CardContent>
              {medication.substitutes.map((sub, index) => (
                <View key={index}>
                  {index > 0 && <View className="h-px bg-gray-200 my-2" />}
                  <Text className="text-base text-gray-900">
                    {sub.brandName || sub.genericName || 'N/A'}
                  </Text>
                  {sub.manufacturer && (
                    <Text className="text-sm text-gray-600">
                      {sub.manufacturer}
                    </Text>
                  )}
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        <View className="mb-8" />
      </ScrollView>
    </ScreenWrapper>
  );
}
