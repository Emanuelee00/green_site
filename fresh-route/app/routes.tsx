import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteCard } from "@/components/routes/RouteCard";
import { useRoute } from "@/hooks/useRoute";
import { DEMO_ROUTES } from "@/data/demoRoutes";
import { colors } from "@/theme";
import type { DemoRoute } from "@/types";

export default function RoutesScreen() {
  const router = useRouter();
  const { loading, calculateFromDemo } = useRoute();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePress = async (demo: DemoRoute) => {
    setLoadingId(demo.id);
    const route = await calculateFromDemo(demo);
    setLoadingId(null);
    router.push({
      pathname: "/route-detail",
      params: { data: JSON.stringify(route), name: demo.name },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Popular routes</Text>
        <Text style={styles.subtitle}>Tap to calculate the freshest path</Text>
      </View>

      {/* Route cards */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {DEMO_ROUTES.map((demo) => (
          <RouteCard
            key={demo.id}
            route={demo}
            loading={loadingId === demo.id}
            onPress={handlePress}
          />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg },
  header:   { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, gap: 4 },
  backBtn:  { marginBottom: 12 },
  backText: { color: colors.textSub, fontSize: 14 },
  title:    { fontSize: 32, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textDim },
  list:     { paddingHorizontal: 16, gap: 14 },
});
