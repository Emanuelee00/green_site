import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WebGLRasterLayer, type RasterIndex } from "./WebGLRasterLayer";
import type { QuartierCollection, QuartierFeature } from "../../types";

const MARSEILLE: L.LatLngTuple = [43.2965, 5.3698];

function uhiColor(score: number) {
  if (score > 0.7) return "#e05252";
  if (score > 0.5) return "#d4914a";
  if (score > 0.3) return "#d4b84a";
  return "#4daa74";
}

export type MapLayer = "raster" | "quartiers" | "both";

interface Props {
  data: QuartierCollection | null;
  mode: "uhi" | "risk";
  layer: MapLayer;
  rasterIndex: RasterIndex;
  selectedName: string | null;
  timelineYear: number;
  onSelect: (q: QuartierFeature) => void;
  availableIndices: Record<string, boolean>;
}

export function UHIMap({ data, mode, layer, rasterIndex, selectedName, timelineYear, onSelect, availableIndices }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const geoLayerRef   = useRef<L.GeoJSON | null>(null);
  const webglLayerRef = useRef<WebGLRasterLayer | null>(null);

  // Init map + raster layer once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(MARSEILLE, 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    const wgl = new WebGLRasterLayer();
    wgl.addTo(map);
    webglLayerRef.current = wgl;
    wgl.loadData().catch(console.error);
  }, []);

  // Year update
  useEffect(() => {
    webglLayerRef.current?.setYear(timelineYear);
  }, [timelineYear]);

  // Index switch
  useEffect(() => {
    webglLayerRef.current?.setIndex(rasterIndex).catch(console.error);
  }, [rasterIndex]);

  // Raster visibility toggle
  useEffect(() => {
    webglLayerRef.current?.setVisible(layer !== "quartiers");
  }, [layer]);

  // GeoJSON districts layer
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
          ? (p?.risk_level === "high" ? "#e05252" : p?.risk_level === "medium" ? "#d4914a" : "#4daa74")
          : uhiColor(p?.uhi_score ?? 0);
        return {
          fillColor: color,
          color: isSelected ? "#ffffff" : "#060d14",
          weight: isSelected ? 2.5 : isRasterBelow ? 1.5 : 0.8,
          fillOpacity: isRasterBelow && !isSelected ? 0 : isSelected ? 0.5 : 0.75,
          opacity: 1,
        };
      },
      onEachFeature: (feature, lyr) => {
        const p = feature.properties;
        lyr.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:12px;padding:2px 0">
            <b style="color:#d4e0ec">${p.NOM_QUA}</b><br/>
            <span style="color:#4a6a88">UHI ${((p.uhi_score ?? 0) * 100).toFixed(0)}% · Rank #${p.rank}</span>
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

  // Legend items per index
  const legendItems: { color: string; label: string }[] = rasterIndex === "ndvi"
    ? [{ color: "#4daa74", label: "Dense végétation" }, { color: "#d4b84a", label: "Sol mixte" }, { color: "#a04830", label: "Sol nu / bâti" }]
    : rasterIndex === "ndwi"
    ? [{ color: "#1e64c8", label: "Eau / humide" }, { color: "#d0d0d0", label: "Modéré" }, { color: "#8c6430", label: "Sec" }]
    : rasterIndex === "swir"
    ? [{ color: "#3c6e3c", label: "Humide" }, { color: "#8cb87a", label: "Modéré" }, { color: "#c8c07a", label: "Sec" }]
    : rasterIndex === "urban"
    ? [{ color: "#28783c", label: "Végétation" }, { color: "#c87832", label: "Mixte" }, { color: "#b43228", label: "Imperméable" }]
    : [{ color: "#4daa74", label: "Cool" }, { color: "#d4914a", label: "Warm" }, { color: "#e05252", label: "Hot" }];

  // Warning if index TIF not available
  const indexUnavailable = rasterIndex !== "uhi" && availableIndices[rasterIndex] === false;

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Year badge (only for UHI — other indices are static) */}
      {rasterIndex === "uhi" && (
        <div className="absolute top-3 left-3 rounded-lg px-3 py-2 pointer-events-none"
          style={{ background: "rgba(6,13,20,0.85)", backdropFilter: "blur(4px)" }}>
          <div className="text-xl font-black tabular-nums" style={{ color: "#d4e0ec" }}>{timelineYear}</div>
          <div className="text-[9px] mt-0.5" style={{ color: "#4a6a88" }}>vs 2000–2010 baseline</div>
        </div>
      )}

      {/* Unavailable warning */}
      {indexUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-lg px-5 py-4 text-center max-w-xs"
            style={{ background: "rgba(6,13,20,0.92)", border: "1px solid #18304a" }}>
            <div className="text-sm font-bold mb-1" style={{ color: "#d4914a" }}>Index not available</div>
            <div className="text-[11px]" style={{ color: "#4a6a88" }}>
              Run <code className="font-mono text-[10px] px-1 rounded" style={{ background: "#18304a" }}>
                scripts/download_s2_indices.py
              </code> to download Sentinel-2 bands.
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-10 left-3 rounded-lg p-2.5 pointer-events-none"
        style={{ background: "rgba(6,13,20,0.82)", backdropFilter: "blur(4px)" }}>
        {legendItems.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-[10px] mb-1 last:mb-0" style={{ color: "#8aa0b8" }}>
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
