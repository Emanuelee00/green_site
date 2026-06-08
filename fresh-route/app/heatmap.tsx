import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { fetchRisk } from "@/api/engine";
import type { RiskFeature } from "@/types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const RISK_STYLE: Record<string, { color: string; emoji: string }> = {
  high:   { color: "#ef4444", emoji: "🔥" },
  medium: { color: "#f97316", emoji: "☀️" },
  low:    { color: "#22c55e", emoji: "🌿" },
};

export default function HeatmapScreen() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [features, setFeatures] = useState<RiskFeature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRisk(month)
      .then((d) => {
        const sorted = [...d.features].sort(
          (a, b) => b.properties.uhi_score - a.properties.uhi_score
        );
        setFeatures(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <View style={styles.container}>

      {/* Month selector */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={() => setMonth((m) => Math.max(1, m - 1))}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month - 1]}</Text>
        <TouchableOpacity onPress={() => setMonth((m) => Math.min(12, m + 1))}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#16a34a" />
      ) : (
        <FlatList
          data={features}
          keyExtractor={(item) => item.properties.name}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const { color, emoji } = RISK_STYLE[item.properties.risk_level];
            return (
              <View style={styles.row}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.properties.name}</Text>
                  <Text style={styles.score}>
                    UHI {(item.properties.uhi_score * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={[styles.pill, { backgroundColor: color }]}>
                  <Text style={styles.pillText}>{item.properties.risk_level}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  monthBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 24, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#d1fae5",
  },
  arrow: { fontSize: 28, color: "#16a34a", fontWeight: "300" },
  monthLabel: { fontSize: 18, fontWeight: "700", color: "#166534", width: 50, textAlign: "center" },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  rank: { width: 28, fontSize: 12, color: "#9ca3af", textAlign: "right" },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  score: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
