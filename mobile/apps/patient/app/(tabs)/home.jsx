import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="bg-primary-600 px-6 py-6">
          <Text className="text-white text-2xl font-bold mb-2">
            Hello, {user?.firstName || "Patient"}!
          </Text>
          <Text className="text-primary-100">How can we help you today?</Text>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row items-center bg-white rounded-lg px-4 py-3 shadow-sm">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search clinics, doctors..."
            />
          </View>
        </View>

        <View className="px-6 py-2">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap">
            <ActionCard
              icon="calendar"
              title="Book Appointment"
              color="#0ea5e9"
            />
            <ActionCard
              icon="document-text"
              title="My Prescriptions"
              color="#10b981"
            />
            <ActionCard icon="location" title="Find Clinics" color="#f59e0b" />
            <ActionCard icon="medkit" title="Health Records" color="#8b5cf6" />
          </View>
        </View>

        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Upcoming Appointments
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-600 text-center py-4">
              No upcoming appointments
            </Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg py-3">
              <Text className="text-white font-semibold text-center">
                Book an Appointment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 py-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Recent Prescriptions
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-600 text-center py-4">
              No prescriptions yet
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ icon, title, color }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mr-3 mb-3 shadow-sm"
      style={{ width: "45%" }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-gray-900 font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
