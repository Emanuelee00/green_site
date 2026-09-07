import { useState } from "react";
import type { RouteResponse, DemoRoute } from "../types";
import { exampleRoute } from "../data/exampleData";

// This build runs without marseille-engine: routes are pre-baked examples
// (see src/data/exampleData.ts) instead of engine-computed paths. A short
// delay keeps the "calcul en cours" UI feeling intact.
const FAKE_LATENCY_MS = 450;

function findDemo(fromLat: number, fromLon: number, toLat: number, toLon: number): DemoRoute {
  return {
    id: `${fromLat},${fromLon}-${toLat},${toLon}`,
    name: "Parcours",
    description: "",
    from: { lat: fromLat, lon: fromLon, label: "Départ" },
    to: { lat: toLat, lon: toLon, label: "Arrivée" },
    badge: "warm",
    distance: "1.0 km",
    freshScore: 0.5,
    highlights: [],
  };
}

export function useRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (
    fromLat: number, fromLon: number,
    toLat: number, toLon: number,
  ): Promise<RouteResponse | null> => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, FAKE_LATENCY_MS));
    setLoading(false);
    return exampleRoute(findDemo(fromLat, fromLon, toLat, toLon));
  };

  const calculateFromDemo = async (demo: DemoRoute): Promise<RouteResponse> => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, FAKE_LATENCY_MS));
    setLoading(false);
    return exampleRoute(demo);
  };

  return { loading, error, calculate, calculateFromDemo };
}
