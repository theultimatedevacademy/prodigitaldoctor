import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Appointments() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">
              Appointments
            </Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg px-4 py-2">
              <Text className="text-white font-semibold">+ New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="bg-white px-6 py-3 border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity className="bg-primary-600 rounded-full px-4 py-2 mr-2">
              <Text className="text-white font-semibold">Today</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-2 mr-2">
              <Text className="text-gray-700 font-semibold">Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-2 mr-2">
              <Text className="text-gray-700 font-semibold">Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 rounded-full px-4 py-2">
              <Text className="text-gray-700 font-semibold">Cancelled</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Appointments List */}
        <ScrollView className="flex-1 px-6 py-4">
          <AppointmentCard
            patientName="John Doe"
            time="10:00 AM"
            duration="30 min"
            type="Regular Checkup"
            status="scheduled"
          />
          <AppointmentCard
            patientName="Jane Smith"
            time="11:00 AM"
            duration="45 min"
            type="Follow-up Visit"
            status="scheduled"
          />
          <AppointmentCard
            patientName="Robert Johnson"
            time="2:00 PM"
            duration="30 min"
            type="Consultation"
            status="scheduled"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function AppointmentCard({ patientName, time, duration, type, status }) {
  return (
    <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {patientName}
          </Text>
          <Text className="text-gray-600">{type}</Text>
        </View>
        <View className="bg-green-100 rounded-full px-3 py-1">
          <Text className="text-green-700 text-xs font-semibold capitalize">
            {status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-2">
          {time} • {duration}
        </Text>
      </View>

      <View className="flex-row mt-3 pt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-1 bg-primary-50 rounded-lg py-2 mr-2">
          <Text className="text-primary-600 font-semibold text-center">
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg py-2 ml-2">
          <Text className="text-gray-700 font-semibold text-center">
            Reschedule
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
