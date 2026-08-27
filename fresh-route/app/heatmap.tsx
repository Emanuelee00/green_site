import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchRisk } from "@/api/engine";
import { colors } from "@/theme";
import type { RiskFeature } from "@/types";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

const RISK_STYLE: Record<string, { color: string; emoji: string; label: string }> = {
  high:   { color: colors.hot,     emoji: "🔥", label: "Élevé"  },
  medium: { color: colors.warm,    emoji: "☀️", label: "Moyen"  },
  low:    { color: colors.primary, emoji: "🌿", label: "Faible" },
};

export default function HeatmapScreen() {
  const router = useRouter();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [features, setFeatures] = useState<RiskFeature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchRisk(month, ctrl.signal)
      .then((d) => {
        const sorted = [...d.features].sort(
          (a, b) => b.properties.uhi_score - a.properties.uhi_score
        );
        setFeatures(sorted);
      })
      .catch((e) => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [month]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.shell}>

      {/* Month selector */}
      <View style={styles.monthBar}>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => setMonth((m) => Math.max(1, m - 1))} hitSlop={10}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month - 1]}</Text>
          <TouchableOpacity onPress={() => setMonth((m) => Math.min(12, m + 1))} hitSlop={10}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.subtitle}>Zones classées par exposition à l’îlot de chaleur urbain</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={features}
          keyExtractor={(item) => item.properties.name}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const { color, emoji, label } = RISK_STYLE[item.properties.risk_level];
            return (
              <View style={styles.row}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.properties.name}</Text>
                  <Text style={styles.score}>
                    ICU {(item.properties.uhi_score * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={[styles.pill, { backgroundColor: color }]}>
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  shell:     { flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  monthBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 20, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  monthPicker: { flexDirection: "row", alignItems: "center", gap: 16 },
  backBtn:  { marginRight: 8 },
  backText: { fontSize: 14, color: colors.textSub },
  arrow: { fontSize: 28, color: colors.primary, fontWeight: "300" },
  monthLabel: { fontSize: 16, fontWeight: "700", color: colors.text, width: 44, textAlign: "center" },
  subtitle: { fontSize: 12, color: colors.textDim, paddingHorizontal: 20, paddingTop: 12 },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  rank: { width: 26, fontSize: 12, color: colors.textDim, textAlign: "right" },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: colors.text },
  score: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: "#0a1810", fontSize: 11, fontWeight: "700" },
});
