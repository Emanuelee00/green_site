import type { HeatLabel } from "../types";

export const colors = {
  bg:          "#0d1f0f",
  bgDeep:      "#080f08",
  card:        "#1a3a2a",
  cardBorder:  "#2a3a2a",
  surface:     "#0d2018",
  primary:     "#22c55e",
  primaryDark: "#16a34a",
  turquoise:   "#00b4d8",
  sand:        "#e9c46a",
  text:        "#f1f5f9",
  textSub:     "#94a3b8",
  textDim:     "#475569",
  textMuted:   "#334155",
  warm:        "#f59e0b",
  hot:         "#ef4444",
  border:      "#1e3a2a",
} as const;

export const heat: Record<HeatLabel, { color: string; bg: string; emoji: string; label: string }> = {
  cool: { color: "#22c55e", bg: "#052e16", emoji: "🌿", label: "Itinéraire frais" },
  warm: { color: "#f59e0b", bg: "#2d1a04", emoji: "☀️",  label: "Itinéraire tempéré" },
  hot:  { color: "#ef4444", bg: "#2d0707", emoji: "🔥", label: "Itinéraire chaud"   },
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 24 } as const;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;
