import { View, Text, StyleSheet } from "react-native";
import { heat } from "../../theme";
import type { HeatLabel } from "../../types";

interface Props {
  label: HeatLabel;
  size?: "sm" | "md";
}

export function HeatBadge({ label, size = "md" }: Props) {
  const h = heat[label];
  const small = size === "sm";

  return (
    <View style={[
      styles.badge,
      { backgroundColor: h.bg, borderColor: h.color },
      small && styles.small,
    ]}>
      <Text style={[styles.text, { color: h.color }, small && styles.textSm]}>
        {h.emoji} {h.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  small:  { paddingHorizontal: 8, paddingVertical: 3 },
  text:   { fontSize: 12, fontWeight: "700" },
  textSm: { fontSize: 11 },
});
