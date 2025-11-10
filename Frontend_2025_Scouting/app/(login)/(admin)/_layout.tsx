import { Stack, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Alert } from "react-native";

/**
 * Layout for admin routes
 * Requires admin privileges to access
 */
export default function AdminLayout() {
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check if user is admin
    if (!userProfile?.is_admin) {
      Alert.alert(
        'Access Denied',
        'You need admin privileges to access this page.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(login)/home')
          }
        ]
      );
    }
  }, [userProfile, loading]);

  // Don't render anything if not admin
  if (!loading && !userProfile?.is_admin) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Admin Dashboard"
        }}
      />
      <Stack.Screen
        name="competitions"
        options={{
          headerShown: false,
          title: "Competition Management"
        }}
      />
    </Stack>
  );
}
