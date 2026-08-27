import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { HeatBadge } from "../ui/HeatBadge";
import { FreshScoreBar } from "../ui/FreshScoreBar";
import { colors, heat } from "../../theme";
import type { DemoRoute } from "../../types";

interface Props {
  route: DemoRoute;
  loading: boolean;
  onPress: (route: DemoRoute) => void;
}

export function RouteCard({ route, loading, onPress }: Props) {
  const h = heat[route.badge];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(route)}
      disabled={loading}
      activeOpacity={0.85}
    >
      {/* Accent top bar */}
      <View style={[styles.accentBar, { backgroundColor: h.color }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <HeatBadge label={route.badge} size="sm" />
          <Text style={styles.distance}>{route.distance}</Text>
        </View>

        {/* Name + description */}
        <Text style={styles.name}>{route.name}</Text>
        <Text style={styles.desc}>{route.description}</Text>

        {/* Score bar */}
        <FreshScoreBar score={route.freshScore} heatLabel={route.badge} color={h.color} />

        {/* Highlights */}
        <View style={styles.tagsRow}>
          {route.highlights.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={h.color} size="large" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    position: "relative",
  },
  accentBar: { height: 3 },
  body: { padding: 18, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  distance: { fontSize: 13, color: colors.textSub, fontWeight: "600" },
  name:  { fontSize: 17, fontWeight: "700", color: colors.text, lineHeight: 22 },
  desc:  { fontSize: 13, color: colors.textDim, lineHeight: 18 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag:  { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 11, color: colors.textDim },
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
