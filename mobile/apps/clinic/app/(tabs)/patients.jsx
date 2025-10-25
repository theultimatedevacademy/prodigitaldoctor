import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900">Patients</Text>
            <TouchableOpacity className="bg-primary-600 rounded-lg px-4 py-2">
              <Text className="text-white font-semibold">+ Add</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <PatientCard
            name="John Doe"
            age="45"
            gender="M"
            lastVisit="2 days ago"
          />
          <PatientCard
            name="Jane Smith"
            age="32"
            gender="F"
            lastVisit="1 week ago"
          />
          <PatientCard
            name="Robert Johnson"
            age="58"
            gender="M"
            lastVisit="3 weeks ago"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function PatientCard({ name, age, gender, lastVisit }) {
  return (
    <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="bg-primary-100 rounded-full w-12 h-12 items-center justify-center mr-3">
          <Text className="text-primary-600 font-bold text-lg">
            {name.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{name}</Text>
          <Text className="text-gray-600">
            {age} years • {gender === "M" ? "Male" : "Female"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
      <View className="flex-row items-center">
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text className="text-gray-600 ml-2">Last visit: {lastVisit}</Text>
      </View>
    </TouchableOpacity>
  );
}
