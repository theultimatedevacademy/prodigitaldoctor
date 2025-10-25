import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>

        <View className="bg-white px-6 py-6 mb-4">
          <View className="items-center">
            <View className="bg-primary-100 rounded-full w-24 h-24 items-center justify-center mb-4">
              <Text className="text-primary-600 font-bold text-4xl">
                {user?.firstName?.charAt(0) || "U"}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-600 mt-1">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        <View className="bg-white mb-4">
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="business-outline"
            title="My Clinics"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => {}}
          />
          <MenuItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            onPress={() => {}}
          />
        </View>

        <View className="bg-white mb-4">
          <MenuItem
            icon="settings-outline"
            title="Settings"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            title="About"
            onPress={() => {}}
          />
        </View>

        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-red-600 rounded-lg py-4 items-center"
            onPress={handleSignOut}
          >
            <Text className="text-white font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 pb-6">
          <Text className="text-center text-gray-500 text-sm">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={24} color="#6b7280" />
        <Text className="text-gray-900 text-base ml-4">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
}
