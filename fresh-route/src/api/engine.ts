import type { RouteResponse, UHIPoint, RiskCollection } from "../types";

const BASE = "http://localhost:8000";

export async function fetchRoute(
  fromLat: number, fromLon: number,
  toLat: number,   toLon: number,
): Promise<RouteResponse> {
  const res = await fetch(
    `${BASE}/route/?from_lat=${fromLat}&from_lon=${fromLon}&to_lat=${toLat}&to_lon=${toLon}`
  );
  if (!res.ok) throw new Error("Route not found");
  return res.json();
}

export async function fetchUHIPoint(lat: number, lon: number): Promise<UHIPoint> {
  const res = await fetch(`${BASE}/uhi/point?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Out of coverage");
  return res.json();
}

export async function fetchRisk(month: number): Promise<RiskCollection> {
  const res = await fetch(`${BASE}/risk/?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch risk");
  return res.json();
}
