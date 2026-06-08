import type { QuartierCollection, HistoryResponse, RouteResponse } from "../types";

const BASE = "/api";

export async function fetchQuartiers(): Promise<QuartierCollection> {
  const res = await fetch(`${BASE}/uhi/quartiers`);
  if (!res.ok) throw new Error("Failed to fetch quartiers");
  return res.json();
}

export async function fetchRisk(month: number): Promise<QuartierCollection> {
  const res = await fetch(`${BASE}/risk/?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch risk map");
  return res.json();
}

export async function fetchHistory(zone: string, from = 2000, to = 2024): Promise<HistoryResponse> {
  const res = await fetch(`${BASE}/history/${zone}?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchRoute(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
): Promise<RouteResponse> {
  const res = await fetch(
    `${BASE}/route/?from_lat=${fromLat}&from_lon=${fromLon}&to_lat=${toLat}&to_lon=${toLon}`
  );
  if (!res.ok) throw new Error("No route found");
  return res.json();
}

export async function fetchZones(): Promise<string[]> {
  const res = await fetch(`${BASE}/history/zones`);
  if (!res.ok) throw new Error("Failed to fetch zones");
  const data = await res.json();
  return data.zones;
}
