import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CalanqueScene, { type CalanqueSceneProps } from "@/components/scene/CalanqueScene";
import { colors } from "@/theme";
import { useRoute } from "@/hooks/useRoute";
import type { Calanque } from "@/data/calanques";

export default function HeroScreen() {
  const router = useRouter();
  const { loading, calculateFromDemo } = useRoute();
  const [selected, setSelected] = useState<Calanque | null>(null);

  const handleCalanqueSelect = (c: Calanque) => {
    setSelected(c);
  };

  const handleGoRoute = async () => {
    if (!selected) return;
    const demo = {
      id: selected.id,
      name: `Vieux-Port → ${selected.name}`,
      description: selected.description,
      from: { lat: 43.2951, lon: 5.3749, label: "Vieux-Port" },
      to:   { lat: selected.lat, lon: selected.lon, label: selected.name },
      badge: (selected.difficulty === "easy" ? "cool" : selected.difficulty === "medium" ? "warm" : "hot") as "cool" | "warm" | "hot",
      distance: selected.distanceFromVieuxPort,
      freshScore: selected.difficulty === "easy" ? 0.75 : selected.difficulty === "medium" ? 0.55 : 0.35,
      highlights: selected.highlights,
    };
    const route = await calculateFromDemo(demo);
    router.push({ pathname: "/route-detail", params: { data: JSON.stringify(route), name: demo.name } });
  };

  const diffColor = selected
    ? selected.difficulty === "easy" ? colors.primary
    : selected.difficulty === "medium" ? colors.warm : colors.hot
    : colors.primary;

  return (
    <View style={styles.container}>
      {/* 3D Scene */}
      <CalanqueScene onCalanqueSelect={handleCalanqueSelect} />

      {/* Bottom gradient overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      <SafeAreaView style={styles.safe} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.location}>📍 MARSEILLE</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live data</Text>
          </View>
        </View>

        {/* Hint when nothing selected */}
        {!selected && (
          <View style={styles.hintWrap} pointerEvents="none">
            <Text style={styles.hint}>Tap a marker to explore a calanque</Text>
          </View>
        )}

        {/* Info panel when a calanque is selected */}
        {selected && (
          <View style={styles.infoPanel}>
            {/* Difficulty badge */}
            <View style={[styles.diffBadge, { borderColor: diffColor }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {selected.difficulty === "easy" ? "🌿 Easy"
                  : selected.difficulty === "medium" ? "☀️ Medium" : "🔥 Hard"}
              </Text>
            </View>

            <Text style={styles.calName}>{selected.name}</Text>
            <Text style={styles.calDesc}>{selected.description}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selected.distanceFromVieuxPort}</Text>
                <Text style={styles.statLabel}>from Vieux-Port</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selected.highlights.length}</Text>
                <Text style={styles.statLabel}>highlights</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {selected.highlights.map((h) => (
                <View key={h} style={styles.tag}>
                  <Text style={styles.tagText}>{h}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.routeBtn, { backgroundColor: diffColor }]}
              onPress={handleGoRoute}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.routeBtnText}>Calculate route  →</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelected(null)} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>← Back to map</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom nav when nothing selected */}
        {!selected && (
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/routes")} activeOpacity={0.88}>
              <Text style={styles.primaryBtnText}>All routes  →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/heatmap")} activeOpacity={0.88}>
              <Text style={styles.secondaryBtnText}>Heat map</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "transparent",
  },
  safe: { flex: 1 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "web" ? 16 : 8,
  },
  location: { color: colors.turquoise, fontWeight: "700", fontSize: 12, letterSpacing: 2 },
  liveRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  liveText: { color: colors.textSub, fontSize: 12 },

  hintWrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 180 },
  hint: { color: colors.textDim, fontSize: 13, letterSpacing: 0.5 },

  // ── Info panel ──────────────────────────────────────────────────────────────
  infoPanel: {
    marginTop: "auto",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  diffBadge: {
    alignSelf: "flex-start",
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  diffText:  { fontSize: 12, fontWeight: "700" },
  calName:   { fontSize: 24, fontWeight: "800", color: colors.text },
  calDesc:   { fontSize: 13, color: colors.textSub, lineHeight: 18 },

  statsRow:    { flexDirection: "row", alignItems: "center", gap: 16 },
  statItem:    { alignItems: "center" },
  statValue:   { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel:   { fontSize: 11, color: colors.textDim, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.cardBorder },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag:     { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 11, color: colors.textDim },

  routeBtn: {
    borderRadius: 14, padding: 15, alignItems: "center",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  routeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  dismissBtn:   { alignItems: "center" },
  dismissText:  { color: colors.textDim, fontSize: 13 },

  // ── Bottom nav ──────────────────────────────────────────────────────────────
  bottomNav: {
    marginTop: "auto",
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: 16, padding: 17, alignItems: "center",
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  primaryBtnText:   { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn:     { borderWidth: 1.5, borderColor: colors.cardBorder, borderRadius: 16, padding: 15, alignItems: "center" },
  secondaryBtnText: { color: colors.textSub, fontWeight: "500", fontSize: 15 },
});
