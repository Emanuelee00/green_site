import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";
import type { HeatLabel } from "../../types";

interface Props {
  score: number;       // 0–1
  heatLabel: HeatLabel;
  color: string;
}

export function FreshScoreBar({ score, color }: Props) {
  const pct = Math.round(score * 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Fresh score</Text>
        <Text style={[styles.value, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  row:     { flexDirection: "row", justifyContent: "space-between" },
  label:   { fontSize: 12, color: colors.textDim },
  value:   { fontSize: 12, fontWeight: "700" },
  track:   { height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: "hidden" },
  fill:    { height: "100%", borderRadius: 3 },
});
