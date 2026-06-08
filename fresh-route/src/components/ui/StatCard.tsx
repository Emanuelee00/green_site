import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";

interface Props {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}

export function StatCard({ label, value, sub, valueColor }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card:  { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, padding: 14, flex: 1 },
  label: { fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  value: { fontSize: 26, fontWeight: "800", color: colors.text, lineHeight: 28 },
  sub:   { fontSize: 11, color: colors.textDim, marginTop: 4 },
});
