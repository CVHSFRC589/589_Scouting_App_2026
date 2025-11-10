import { Stack } from "expo-router";

/**
 * Layout for authenticated routes
 * All routes under (login) require authentication
 */
export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
          title: "Home"
        }}
      />
      <Stack.Screen
        name="projection"
        options={{
          headerShown: false,
          title: "Projection"
        }}
      />
      <Stack.Screen
        name="(regional)"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}
