import { useState } from "react";
import { fetchRoute } from "../api/engine";
import type { RouteResponse, DemoRoute } from "../types";

export function useRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (
    fromLat: number, fromLon: number,
    toLat: number, toLon: number,
  ): Promise<RouteResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchRoute(fromLat, fromLon, toLat, toLon);
    } catch {
      setError("Engine unreachable. Make sure marseille-engine is running.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateFromDemo = async (demo: DemoRoute): Promise<RouteResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await fetchRoute(demo.from.lat, demo.from.lon, demo.to.lat, demo.to.lon);
    } catch {
      // Offline fallback — use demo data directly
      return {
        geometry: { type: "LineString", coordinates: [] },
        distance_m: parseFloat(demo.distance) * 1000,
        uhi_avg: 1 - demo.freshScore,
        fresh_score: demo.freshScore,
        label: demo.badge,
        took_s: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, calculate, calculateFromDemo };
}
