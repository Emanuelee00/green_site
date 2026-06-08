import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatCard } from "@/components/ui/StatCard";
import { HeatBadge } from "@/components/ui/HeatBadge";
import { FreshScoreBar } from "@/components/ui/FreshScoreBar";
import { colors, heat } from "@/theme";
import type { RouteResponse } from "@/types";

export default function RouteDetailScreen() {
  const router = useRouter();
  const { data, name } = useLocalSearchParams<{ data: string; name: string }>();
  const route: RouteResponse = JSON.parse(data ?? "{}");

  const label = route.label ?? "warm";
  const h = heat[label];
  const freshPct  = Math.round((route.fresh_score ?? 0) * 100);
  const distKm    = (route.distance_m / 1000).toFixed(2);
  const walkMin   = Math.round(route.distance_m / 80);
  const coords    = route.geometry?.coordinates ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero band */}
        <View style={[styles.heroBand, { backgroundColor: h.bg }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Routes</Text>
          </TouchableOpacity>
          <HeatBadge label={label} />
          <Text style={styles.routeName}>{name}</Text>
          <Text style={styles.routeDesc}>
            {label === "cool" ? "Low heat exposure — ideal for summer walks."
             : label === "warm" ? "Moderate heat — carry water."
             : "High heat exposure — avoid midday."}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard label="Distance" value={`${distKm} km`} sub={`~${walkMin} min walk`} />
            <StatCard label="Fresh" value={`${freshPct}%`} sub="vs city avg" valueColor={h.color} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              label="Heat index"
              value={`${Math.round((route.uhi_avg ?? 0) * 100)}%`}
              sub="UHI exposure"
              valueColor={(route.uhi_avg ?? 0) > 0.6 ? colors.hot : (route.uhi_avg ?? 0) > 0.35 ? colors.warm : colors.primary}
            />
            <StatCard label="Algorithm" value="A★" sub="green-weighted" />
          </View>

          {/* Score bar */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Heat exposure along route</Text>
            <FreshScoreBar score={route.fresh_score ?? 0} heatLabel={label} color={h.color} />
            <View style={styles.barLegend}>
              <Text style={styles.barLegendText}>🔥 Hot</Text>
              <Text style={styles.barLegendText}>🌿 Fresh</Text>
            </View>
          </View>

          {/* Route path preview */}
          {coords.length > 1 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Route path  ({coords.length} points)</Text>
              <RoutePathSVG coords={coords} color={h.color} />
              <View style={styles.barLegend}>
                <Text style={styles.barLegendText}>Start</Text>
                <Text style={styles.barLegendText}>End</Text>
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: h.color, shadowColor: h.color }]}
            onPress={() => Alert.alert("Inizia Percorso", "Navigation feature coming soon!")}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>Inizia Percorso  →</Text>
          </TouchableOpacity>
          {route.took_s > 0 && (
            <Text style={styles.calcNote}>Calculated in {route.took_s}s · A★ algorithm</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Mini SVG path preview ────────────────────────────────────────────────────
function RoutePathSVG({ coords, color }: { coords: [number, number][]; color: string }) {
  const sample = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 40)) === 0);
  const lons = sample.map((c) => c[0]);
  const lats = sample.map((c) => c[1]);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const W = 280, H = 70;

  const pts = sample.map((c) => {
    const x = maxLon === minLon ? W / 2 : ((c[0] - minLon) / (maxLon - minLon)) * (W - 20) + 10;
    const y = maxLat === minLat ? H / 2 : (H - 10) - ((c[1] - minLat) / (maxLat - minLat)) * (H - 20);
    return `${x},${y}`;
  }).join(" ");

  // react-native-svg not installed — use a simple View-based bar chart as fallback
  return (
    <View style={{ height: 70, justifyContent: "center", alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 60 }}>
        {sample.slice(0, 30).map((c, i) => {
          const lat = maxLat === minLat ? 0.5 : (c[1] - minLat) / (maxLat - minLat);
          const h = 8 + lat * 44;
          return (
            <View key={i} style={{
              width: 6, height: h, borderRadius: 3,
              backgroundColor: color,
              opacity: 0.4 + lat * 0.6,
            }} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  heroBand:  { padding: 24, paddingTop: 20, gap: 10 },
  backBtn:   { marginBottom: 6 },
  backText:  { color: colors.textSub, fontSize: 14 },
  routeName: { fontSize: 26, fontWeight: "800", color: colors.text, lineHeight: 30 },
  routeDesc: { fontSize: 14, color: colors.textSub, lineHeight: 20 },

  content:   { padding: 16, gap: 12 },
  statsGrid: { flexDirection: "row", gap: 12 },

  card: {
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 16, gap: 12,
  },
  cardLabel: { fontSize: 12, color: colors.textDim, textTransform: "uppercase", letterSpacing: 0.8 },
  barLegend: { flexDirection: "row", justifyContent: "space-between" },
  barLegendText: { fontSize: 11, color: colors.textDim },

  ctaWrap: { padding: 16, gap: 10, paddingBottom: 32 },
  ctaBtn: {
    borderRadius: 16, padding: 17, alignItems: "center",
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  calcNote:   { color: colors.textMuted, fontSize: 11, textAlign: "center" },
});
