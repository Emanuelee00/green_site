// Example data used when the app runs without marseille-engine (e.g. the free
// GitHub Pages demo). Shapes match what the engine returns so every screen
// behaves exactly as it did online — only the numbers are pre-baked instead of
// computed by the routing/UHI engine.

import type {
  DemoRoute,
  RouteResponse,
  RiskCollection,
  RiskFeature,
  HeatLabel,
} from "../types";

// Small seeded RNG so a given route always draws the same path.
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Build a plausible walking path (GeoJSON [lon, lat]) between two points. */
function tracePath(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  seed: number,
): [number, number][] {
  const rnd = seeded(seed);
  const steps = 16;
  const dLat = to.lat - from.lat;
  const dLon = to.lon - from.lon;
  const len = Math.hypot(dLat, dLon) || 1e-6;
  // unit vector perpendicular to the straight line
  const perpLat = -dLon / len;
  const perpLon = dLat / len;
  const amp = len * 0.12 + 0.0004;

  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wobble =
      Math.sin(t * Math.PI * 2.3) * amp +
      (rnd() - 0.5) * amp * 0.5 * Math.sin(t * Math.PI); // 0 at the ends
    const lat = from.lat + dLat * t + perpLat * wobble;
    const lon = from.lon + dLon * t + perpLon * wobble;
    pts.push([lon, lat]);
  }
  return pts;
}

export function exampleRoute(demo: DemoRoute): RouteResponse {
  const seed = [...demo.id].reduce((a, c) => a + c.charCodeAt(0), 7);
  return {
    geometry: {
      type: "LineString",
      coordinates: tracePath(demo.from, demo.to, seed),
    },
    distance_m: (parseFloat(demo.distance) || 1) * 1000,
    uhi_avg: Number((1 - demo.freshScore).toFixed(2)),
    fresh_score: demo.freshScore,
    label: demo.badge,
    took_s: 0,
  };
}

// ── Heatmap: Marseille districts ranked by urban-heat-island exposure ────────
type Zone = [name: string, baseUhi: number];

const ZONES: Zone[] = [
  ["Belle de Mai", 0.86],
  ["Saint-Mauront", 0.83],
  ["La Joliette", 0.8],
  ["Noailles", 0.79],
  ["Le Panier", 0.74],
  ["Belsunce", 0.77],
  ["Saint-Charles", 0.72],
  ["La Plaine", 0.7],
  ["Castellane", 0.66],
  ["Vieux-Port", 0.63],
  ["Le Camas", 0.61],
  ["Baille", 0.58],
  ["Notre-Dame du Mont", 0.56],
  ["Saint-Victor", 0.5],
  ["Endoume", 0.44],
  ["Le Pharo", 0.4],
  ["Périer", 0.36],
  ["Bompard", 0.31],
  ["Roucas-Blanc", 0.27],
  ["Les Goudes", 0.19],
  ["Callelongue", 0.16],
  ["Parc Borély", 0.23],
];

// heatmap.tsx keys its style map by "high" | "medium" | "low" (what the engine
// actually returns), even though the type is loosely HeatLabel.
function riskLevel(score: number): HeatLabel {
  if (score >= 0.62) return "high" as HeatLabel;
  if (score >= 0.4) return "medium" as HeatLabel;
  return "low" as HeatLabel;
}

export function exampleRisk(month: number): RiskCollection {
  // seasonal swing: coolest in Jan, hottest in Jul/Aug
  const seasonal = -Math.cos(((month - 1) / 12) * Math.PI * 2) * 0.09;

  const features: RiskFeature[] = ZONES.map(([name, base], i): RiskFeature => {
    const uhi_score = Math.max(0.05, Math.min(0.98, base + seasonal));
    return {
      type: "Feature",
      properties: {
        name,
        uhi_score: Number(uhi_score.toFixed(3)),
        risk_level: riskLevel(uhi_score),
        rank: i + 1,
      },
      geometry: {},
    };
  }).sort((a, b) => b.properties.uhi_score - a.properties.uhi_score);

  features.forEach((f, i) => (f.properties.rank = i + 1));
  return { type: "FeatureCollection", features };
}
