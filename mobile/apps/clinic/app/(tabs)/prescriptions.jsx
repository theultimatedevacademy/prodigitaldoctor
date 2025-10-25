import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Prescriptions() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">
              Prescriptions
            </Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg px-4 py-2">
              <Text className="text-white font-semibold">+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <PrescriptionCard
            patientName="John Doe"
            date="Today, 10:30 AM"
            medications={3}
            diagnosis="Common Cold"
          />
          <PrescriptionCard
            patientName="Jane Smith"
            date="Yesterday, 2:15 PM"
            medications={2}
            diagnosis="Hypertension"
          />
          <PrescriptionCard
            patientName="Robert Johnson"
            date="2 days ago"
            medications={4}
            diagnosis="Diabetes Management"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function PrescriptionCard({ patientName, date, medications, diagnosis }) {
  return (
    <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {patientName}
          </Text>
          <Text className="text-gray-600">{diagnosis}</Text>
        </View>
        <Ionicons name="document-text" size={24} color="#0ea5e9" />
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="medical-outline" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-2">
          {medications} medication{medications > 1 ? "s" : ""}
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-2">{date}</Text>
      </View>

      <View className="flex-row pt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-1 bg-primary-50 rounded-lg py-2 mr-2">
          <Text className="text-primary-600 font-semibold text-center">
            View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg py-2 ml-2">
          <Text className="text-gray-700 font-semibold text-center">
            Download
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
