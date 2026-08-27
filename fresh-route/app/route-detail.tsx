import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatCard } from "@/components/ui/StatCard";
import { HeatBadge } from "@/components/ui/HeatBadge";
import { FreshScoreBar } from "@/components/ui/FreshScoreBar";
import RouteMapView from "@/components/routes/RouteMapView";
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
  const [fromLabel, toLabel] = (name ?? "").split(" → ");
  const first = coords[0], last = coords[coords.length - 1];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero band */}
        <View style={[styles.heroBand, { backgroundColor: h.bg }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Parcours</Text>
          </TouchableOpacity>
          <HeatBadge label={label} />
          <Text style={styles.routeName}>{name}</Text>
          <Text style={styles.routeDesc}>
            {label === "cool" ? "Faible exposition à la chaleur — idéal pour les balades d’été."
             : label === "warm" ? "Exposition modérée — prévoyez de l’eau."
             : "Forte exposition à la chaleur — évitez le milieu de journée."}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCell}><StatCard label="Distance" value={`${distKm} km`} sub={`~${walkMin} min à pied`} /></View>
            <View style={styles.statCell}><StatCard label="Fraîcheur" value={`${freshPct}%`} sub="vs moyenne ville" valueColor={h.color} /></View>
            <View style={styles.statCell}>
              <StatCard
                label="Indice de chaleur"
                value={`${Math.round((route.uhi_avg ?? 0) * 100)}%`}
                sub="exposition ICU"
                valueColor={(route.uhi_avg ?? 0) > 0.6 ? colors.hot : (route.uhi_avg ?? 0) > 0.35 ? colors.warm : colors.primary}
              />
            </View>
            <View style={styles.statCell}><StatCard label="Algorithme" value="Dijkstra" sub="pondéré végétation" /></View>
          </View>

          {/* Score bar */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Exposition à la chaleur sur le trajet</Text>
            <FreshScoreBar score={route.fresh_score ?? 0} heatLabel={label} color={h.color} />
            <View style={styles.barLegend}>
              <Text style={styles.barLegendText}>🔥 Chaud</Text>
              <Text style={styles.barLegendText}>🌿 Frais</Text>
            </View>
          </View>

          {/* Real map */}
          {coords.length > 1 && first && last && (
            <View style={[styles.card, styles.mapCard]}>
              <Text style={styles.cardLabel}>Tracé du parcours  ({coords.length} points)</Text>
              <RouteMapView
                from={{ lat: first[1], lon: first[0], label: fromLabel || "Départ" }}
                to={{ lat: last[1], lon: last[0], label: toLabel || "Arrivée" }}
                coords={coords}
                color={h.color}
              />
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: h.color, shadowColor: h.color }]}
            onPress={() => Alert.alert("Navigation pas à pas", "Le guidage en temps réel arrive bientôt.")}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>Démarrer l’itinéraire  →</Text>
          </TouchableOpacity>
          {route.took_s > 0 && (
            <Text style={styles.calcNote}>Calculé en {route.took_s}s · algorithme Dijkstra</Text>
          )}
        </View>

      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  shell:     { flex: 1, width: "100%", maxWidth: 860, alignSelf: "center" },
  heroBand:  { padding: 24, paddingTop: 20, gap: 10 },
  backBtn:   { marginBottom: 6 },
  backText:  { color: colors.textSub, fontSize: 14 },
  routeName: { fontSize: 26, fontWeight: "800", color: colors.text, lineHeight: 30 },
  routeDesc: { fontSize: 14, color: colors.textSub, lineHeight: 20 },

  content:   { padding: 16, gap: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCell:  { flexGrow: 1, flexBasis: 140, minWidth: 140 },

  card: {
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 16, gap: 12,
  },
  mapCard: { height: 380, padding: 12 },
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
