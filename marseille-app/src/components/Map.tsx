import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { QuartierCollection } from "../types";

// Fix broken marker icons when bundled with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MARSEILLE: L.LatLngTuple = [43.2965, 5.3698];

const RISK_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
};

function uhiColor(score: number): string {
  if (score > 0.65) return "#ef4444";
  if (score > 0.35) return "#f97316";
  return "#22c55e";
}

interface Props {
  quartiers: QuartierCollection | null;
  route: GeoJSON.LineString | null;
  mode: "uhi" | "risk";
}

export default function Map({ quartiers, route, mode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView(MARSEILLE, 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(mapRef.current);
  }, []);

  // Redraw quartiers layer when data or mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !quartiers) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    const layer = L.geoJSON(quartiers as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const p = feature?.properties;
        const color =
          mode === "risk"
            ? RISK_COLOR[p?.risk_level ?? "low"]
            : uhiColor(p?.uhi_score ?? 0);
        return { fillColor: color, color: "#fff", weight: 1, fillOpacity: 0.65 };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(
          `<b>${p.NOM_QUA}</b><br/>` +
          (mode === "risk"
            ? `Risk: <b>${p.risk_level}</b>`
            : `UHI score: <b>${(p.uhi_score * 100).toFixed(0)}%</b> · rank #${p.rank}`),
          { sticky: true }
        );
      },
    }).addTo(map);

    layersRef.current.push(layer);
  }, [quartiers, mode]);

  // Draw route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous route layers
    layersRef.current
      .filter((l) => (l as L.Polyline).setStyle)
      .forEach((l) => map.removeLayer(l));

    if (!route) return;

    const coords = route.coordinates.map(([lon, lat]) => [lat, lon] as L.LatLngTuple);
    const line = L.polyline(coords, { color: "#3b82f6", weight: 5, opacity: 0.85 }).addTo(map);
    layersRef.current.push(line);
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
  }, [route]);

  return <div ref={containerRef} className="w-full h-full" />;
}
