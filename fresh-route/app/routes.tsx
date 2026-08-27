import { useRef, useState } from "react";
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
  const { calculateFromDemo } = useRoute();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigatingRef = useRef(false);

  const handlePress = async (demo: DemoRoute) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setLoadingId(demo.id);
    try {
      const route = await calculateFromDemo(demo);
      router.push({
        pathname: "/route-detail",
        params: { data: JSON.stringify(route), name: demo.name },
      });
    } finally {
      setLoadingId(null);
      navigatingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Parcours populaires</Text>
        <Text style={styles.subtitle}>Touchez pour calculer le trajet le plus frais</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg },
  shell:    { flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  header:   { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, gap: 4 },
  backBtn:  { marginBottom: 12 },
  backText: { color: colors.textSub, fontSize: 14 },
  title:    { fontSize: 32, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textDim },
  list:     { paddingHorizontal: 16, gap: 14 },
});
