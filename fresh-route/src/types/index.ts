export type HeatLabel = "cool" | "warm" | "hot";

export interface RouteResponse {
  geometry: { type: "LineString"; coordinates: [number, number][] };
  distance_m: number;
  uhi_avg: number | null;
  fresh_score: number | null;
  label: HeatLabel | null;
  took_s: number;
}

export interface UHIPoint {
  lat: number;
  lon: number;
  uhi_score: number;
  label: HeatLabel;
}

export interface RiskFeature {
  type: "Feature";
  properties: {
    name: string;
    uhi_score: number;
    risk_level: HeatLabel;
    rank: number;
  };
  geometry: object;
}

export interface RiskCollection {
  type: "FeatureCollection";
  features: RiskFeature[];
}

export interface Coords {
  lat: number;
  lon: number;
}

export interface DemoRoute {
  id: string;
  name: string;
  description: string;
  from: Coords & { label: string };
  to: Coords & { label: string };
  badge: HeatLabel;
  distance: string;
  freshScore: number;
  highlights: string[];
}
