export interface QuartierFeature {
  type: "Feature";
  properties: {
    NOM_QUA: string;
    NOM_CO: string;
    uhi_mean: number;
    uhi_score: number;
    rank: number;
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

export type Season = "annual" | "summer" | "winter";

export const ZONES = [
  "centre_ville","nord_urbain","sud_urbain",
  "periurbain_est","periurbain_nord",
  "rural_est","rural_nord","rural_ouest","rural_sud",
] as const;
export type Zone = typeof ZONES[number];
