import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Appointments() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">
              My Appointments
            </Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg px-4 py-2">
              <Text className="text-white font-semibold">+ Book</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white px-6 py-3 border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity className="bg-primary-600 rounded-full px-4 py-2 mr-2">
              <Text className="text-white font-semibold">Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-2 mr-2">
              <Text className="text-gray-700 font-semibold">Past</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-2">
              <Text className="text-gray-700 font-semibold">Cancelled</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">
              No Appointments Yet
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Book your first appointment with a doctor
            </Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg px-6 py-3">
              <Text className="text-white font-semibold">Find a Doctor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
