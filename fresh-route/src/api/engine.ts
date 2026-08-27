import type { RouteResponse, UHIPoint, RiskCollection } from "../types";

const BASE = process.env.EXPO_PUBLIC_ENGINE_URL ?? "https://marseille-engine.92-4-217-42.sslip.io";
const TIMEOUT_MS = 5000;

function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const ctrl = new AbortController();
  // Forward external abort signal
  signal?.addEventListener("abort", () => ctrl.abort());
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

export async function fetchRoute(
  fromLat: number, fromLon: number,
  toLat: number,   toLon: number,
  signal?: AbortSignal,
): Promise<RouteResponse> {
  const res = await fetchWithTimeout(
    `${BASE}/route/?from_lat=${fromLat}&from_lon=${fromLon}&to_lat=${toLat}&to_lon=${toLon}`,
    signal,
  );
  if (!res.ok) throw new Error("Route not found");
  return res.json();
}

export async function fetchUHIPoint(lat: number, lon: number, signal?: AbortSignal): Promise<UHIPoint> {
  const res = await fetchWithTimeout(`${BASE}/uhi/point?lat=${lat}&lon=${lon}`, signal);
  if (!res.ok) throw new Error("Out of coverage");
  return res.json();
}

export async function fetchRisk(month: number, signal?: AbortSignal): Promise<RiskCollection> {
  const res = await fetchWithTimeout(`${BASE}/risk/?month=${month}`, signal);
  if (!res.ok) throw new Error("Failed to fetch risk");
  return res.json();
}
