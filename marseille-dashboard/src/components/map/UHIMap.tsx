import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WebGLRasterLayer } from "./WebGLRasterLayer";
import type { QuartierCollection, QuartierFeature } from "../../types";

const MARSEILLE: L.LatLngTuple = [43.2965, 5.3698];

function uhiColor(score: number) {
  if (score > 0.7) return "#ef4444";
  if (score > 0.5) return "#f97316";
  if (score > 0.3) return "#f59e0b";
  return "#22c55e";
}

export type MapLayer = "raster" | "quartiers" | "both";

interface Props {
  data: QuartierCollection | null;
  mode: "uhi" | "risk";
  layer: MapLayer;
  selectedName: string | null;
  timelineYear: number;
  onSelect: (q: QuartierFeature) => void;
}

export function UHIMap({ data, mode, layer, selectedName, timelineYear, onSelect }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const geoLayerRef   = useRef<L.GeoJSON | null>(null);
  const webglLayerRef = useRef<WebGLRasterLayer | null>(null);

  // Init map + WebGL layer once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView(MARSEILLE, 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    // Create WebGL raster layer and load data once
    const wgl = new WebGLRasterLayer();
    wgl.addTo(map);
    webglLayerRef.current = wgl;
    wgl.loadData().catch(console.error);
  }, []);

  // Update year on WebGL layer — zero network, GPU-only
  useEffect(() => {
    webglLayerRef.current?.setYear(timelineYear);
  }, [timelineYear]);

  // Show/hide WebGL layer based on mode selection
  useEffect(() => {
    const map = mapRef.current;
    const wgl = webglLayerRef.current;
    if (!map || !wgl) return;
    if (layer === "quartiers") {
      map.removeLayer(wgl as unknown as L.Layer);
    } else if (!map.hasLayer(wgl as unknown as L.Layer)) {
      wgl.addTo(map);
    }
  }, [layer]);

  // GeoJSON quartiers layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;
    geoLayerRef.current?.remove();
    geoLayerRef.current = null;
    if (layer === "raster") return;

    const isRasterBelow = layer === "both";

    geoLayerRef.current = L.geoJSON(data as GeoJSON.GeoJsonObject, {
      style: (f) => {
        const p = f?.properties;
        const isSelected = p?.NOM_QUA === selectedName;
        const color = mode === "risk"
          ? (p?.risk_level === "high" ? "#ef4444" : p?.risk_level === "medium" ? "#f97316" : "#22c55e")
          : uhiColor(p?.uhi_score ?? 0);
        return {
          fillColor: color,
          color: isSelected ? "#ffffff" : "#0d1117",
          weight: isSelected ? 3 : isRasterBelow ? 1.5 : 0.8,
          fillOpacity: isRasterBelow && !isSelected ? 0 : isSelected ? 0.55 : 0.75,
          opacity: 1,
        };
      },
      onEachFeature: (feature, lyr) => {
        const p = feature.properties;
        lyr.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:13px;padding:4px 2px">
            <b style="color:#f1f5f9">${p.NOM_QUA}</b><br/>
            <span style="color:#94a3b8">UHI: ${((p.uhi_score ?? 0) * 100).toFixed(0)}% · Rank #${p.rank}</span>
          </div>`,
          { sticky: true, className: "leaflet-tooltip-dark" }
        );
        lyr.on("click", () => onSelect(feature as QuartierFeature));
      },
    }).addTo(map);

    if (selectedName) {
      const sel = data.features.find((f) => f.properties.NOM_QUA === selectedName);
      if (sel) {
        const bounds = L.geoJSON(sel as GeoJSON.GeoJsonObject).getBounds();
        if (bounds.isValid()) map.flyToBounds(bounds, { padding: [80, 80], duration: 0.8 });
      }
    }
  }, [data, mode, layer, selectedName, onSelect]);

  const legendItems = [
    { color: "#22c55e", label: "Cool" },
    { color: "#f59e0b", label: "Warm" },
    { color: "#ef4444", label: "Hot" },
  ];

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Year badge */}
      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur rounded-xl px-4 py-2 pointer-events-none">
        <div className="text-white font-black text-2xl tabular-nums">{timelineYear}</div>
        <div className="text-gray-500 text-[10px] mt-0.5">vs 2000–2010 baseline</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-3 bg-black/70 backdrop-blur rounded-xl p-3 text-xs space-y-1.5 pointer-events-none">
        {legendItems.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-gray-300">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
