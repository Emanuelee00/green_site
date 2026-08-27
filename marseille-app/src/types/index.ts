export interface QuartierFeature {
  type: "Feature";
  properties: {
    NOM_QUA: string;
    NOM_CO: string;
    uhi_mean: number;
    uhi_score: number;
    rank: number;
    // risk endpoint adds these
    risk_level?: "low" | "medium" | "high";
  };
  geometry: GeoJSON.Geometry;
}

export interface QuartierCollection {
  type: "FeatureCollection";
  features: QuartierFeature[];
}

export interface HistoryPoint {
  year: number;
  lst_day: number | null;
  lst_night: number | null;
  amplitude: number | null;
}

export interface HistoryResponse {
  zone: string;
  from_year: number;
  to_year: number;
  data: HistoryPoint[];
  trend_per_decade: number;
}

export interface RouteResponse {
  geometry: GeoJSON.LineString;
  distance_m: number;
  uhi_avg: number | null;
  fresh_score: number | null;
  label: "cool" | "warm" | "hot" | null;
  took_s: number;
}

export type View = "map" | "history" | "route";
