import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Prescriptions() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            My Prescriptions
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">
              No Prescriptions Yet
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Your prescriptions will appear here after your appointments
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
