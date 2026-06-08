import { Stack } from "expo-router";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="routes" />
      <Stack.Screen name="route-detail" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="heatmap" options={{ animation: "slide_from_bottom" }} />
    </Stack>
  );
}
