import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "Doctor"}!
          </Text>
          <Text className="text-gray-600 mt-1">
            Here's what's happening today
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="calendar" size={24} color="#0ea5e9" />
                <Text className="text-2xl font-bold text-gray-900">12</Text>
              </View>
              <Text className="text-gray-600 text-sm">
                Today's Appointments
              </Text>
            </View>

            <View className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="people" size={24} color="#10b981" />
                <Text className="text-2xl font-bold text-gray-900">245</Text>
              </View>
              <Text className="text-gray-600 text-sm">Total Patients</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="document-text" size={24} color="#f59e0b" />
                <Text className="text-2xl font-bold text-gray-900">8</Text>
              </View>
              <Text className="text-gray-600 text-sm">Prescriptions Today</Text>
            </View>

            <View className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                <Text className="text-2xl font-bold text-gray-900">5</Text>
              </View>
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Upcoming Appointments
          </Text>

          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity className="p-4 border-b border-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    John Doe
                  </Text>
                  <Text className="text-gray-600 text-sm">Regular Checkup</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary-600 font-semibold">
                    10:00 AM
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">30 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    Jane Smith
                  </Text>
                  <Text className="text-gray-600 text-sm">Follow-up Visit</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary-600 font-semibold">
                    11:00 AM
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">45 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    Robert Johnson
                  </Text>
                  <Text className="text-gray-600 text-sm">Consultation</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary-600 font-semibold">
                    2:00 PM
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">30 min</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap">
            <TouchableOpacity className="bg-primary-600 rounded-lg p-4 mr-3 mb-3 flex-row items-center">
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                New Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-green-600 rounded-lg p-4 mb-3 flex-row items-center">
              <Ionicons name="person-add-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Add Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
