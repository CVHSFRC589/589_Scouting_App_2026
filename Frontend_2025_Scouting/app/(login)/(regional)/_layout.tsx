import { Stack } from "expo-router";

/**
 * Layout for regional-specific routes
 * Handles scouting and team info screens
 */
export default function RegionalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(Scouting)"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="(TeamInfo)"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}
