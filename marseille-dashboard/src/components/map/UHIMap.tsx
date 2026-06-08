import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WebGLRasterLayer, type RasterIndex, type PixelProbe } from "./WebGLRasterLayer";
import type { QuartierCollection, QuartierFeature } from "../../types";

const MARSEILLE: L.LatLngTuple = [43.2965, 5.3698];

function uhiColor(score: number) {
  if (score > 0.7) return "#e05252";
  if (score > 0.5) return "#d4914a";
  if (score > 0.3) return "#d4b84a";
  return "#4daa74";
}

// Inline colormaps for the probe bar
function rampColor(stops: [number,number,number][], t: number): [number,number,number] {
  t = Math.max(0, Math.min(1, t));
  const n = stops.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const s = t * n - i;
  const l = (a: number, b: number) => Math.round(a + (b - a) * s);
  return [l(stops[i][0], stops[i+1][0]), l(stops[i][1], stops[i+1][1]), l(stops[i][2], stops[i+1][2])];
}

const PROBE_COLORS: Record<RasterIndex, (t: number) => [number,number,number]> = {
  uhi:   (t) => rampColor([[33,197,94],[135,240,171],[252,224,71],[250,145,61],[186,28,28]], t),
  ndvi:  (t) => rampColor([[180,80,40],[210,160,80],[240,230,150],[140,200,80],[30,140,50]], t),
  ndwi:  (t) => rampColor([[140,100,50],[200,180,140],[240,240,240],[120,180,220],[30,100,200]], t),
  swir:  (t) => rampColor([[20,50,20],[60,110,60],[140,180,100],[210,200,140],[230,200,160]], t),
  urban: (t) => rampColor([[40,120,60],[160,200,100],[220,200,80],[210,120,50],[180,50,40]], t),
};

const INDEX_META: Record<RasterIndex, { label: string; format: (v: number) => string }> = {
  uhi:   { label: "UHI index",   format: (v) => `${(v * 100).toFixed(1)}%` },
  ndvi:  { label: "NDVI",        format: (v) => v.toFixed(3) },
  ndwi:  { label: "NDWI",        format: (v) => v.toFixed(3) },
  swir:  { label: "SWIR",        format: (v) => v.toFixed(3) },
  urban: { label: "Urban index", format: (v) => v.toFixed(3) },
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const geoLayerRef  = useRef<L.GeoJSON | null>(null);
  const wglRef       = useRef<WebGLRasterLayer | null>(null);

  const [probe,   setProbe]   = useState<PixelProbe | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProbe   = useCallback((p: PixelProbe | null) => setProbe(p), []);
  const handleLoading = useCallback((v: boolean) => setLoading(v), []);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(MARSEILLE, 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    const wgl = new WebGLRasterLayer();
    wgl.onProbe = handleProbe;
    wgl.onLoadingChange = handleLoading;
    wgl.addTo(map);
    wglRef.current = wgl;
    wgl.loadData().catch(console.error);
  }, [handleProbe, handleLoading]);

  useEffect(() => { wglRef.current?.setYear(timelineYear); }, [timelineYear]);
  useEffect(() => { wglRef.current?.setIndex(rasterIndex).catch(console.error); }, [rasterIndex]);
  useEffect(() => { wglRef.current?.setVisible(layer !== "quartiers"); }, [layer]);

  // GeoJSON districts
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

  const legendItems = rasterIndex === "ndvi"
    ? [{ color: "#4daa74", label: "Végétation dense" }, { color: "#d4b84a", label: "Sol mixte" }, { color: "#a04830", label: "Sol nu / bâti" }]
    : rasterIndex === "ndwi"
    ? [{ color: "#1e64c8", label: "Eau / humide" }, { color: "#d0d0d0", label: "Modéré" }, { color: "#8c6430", label: "Sec" }]
    : rasterIndex === "swir"
    ? [{ color: "#3c6e3c", label: "Humide" }, { color: "#8cb87a", label: "Modéré" }, { color: "#c8c07a", label: "Sec" }]
    : rasterIndex === "urban"
    ? [{ color: "#28783c", label: "Végétation" }, { color: "#c87832", label: "Mixte" }, { color: "#b43228", label: "Imperméable" }]
    : [{ color: "#4daa74", label: "Cool" }, { color: "#d4914a", label: "Warm" }, { color: "#e05252", label: "Hot" }];

  const indexUnavailable = rasterIndex !== "uhi" && availableIndices[rasterIndex] === false;
  const meta = INDEX_META[rasterIndex];
  const probeColor = probe ? PROBE_COLORS[rasterIndex](probe.normalized) : null;

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(6,13,20,0.55)" }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{ borderColor: "#4a90c4", borderTopColor: "transparent" }} />
            <span className="text-[11px] font-medium" style={{ color: "#8aa0b8" }}>
              Loading {rasterIndex.toUpperCase()}…
            </span>
          </div>
        </div>
      )}

      {/* Pixel probe / year badge — top-left */}
      {!loading && (
        <div className="absolute top-3 left-3 rounded-lg pointer-events-none"
          style={{ background: "rgba(6,13,20,0.88)", border: "1px solid #18304a", backdropFilter: "blur(4px)", minWidth: 110 }}>
          {probe ? (
            <div className="px-3 py-2 flex flex-col gap-1">
              <div className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "#4a6a88" }}>
                {meta.label}
              </div>
              <div className="text-2xl font-black tabular-nums leading-none" style={{ color: "#d4e0ec" }}>
                {meta.format(probe.value)}
              </div>
              <div className="h-1 rounded-full mt-1" style={{ background: "#18304a", width: 90 }}>
                <div className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${probe.normalized * 100}%`, background: probeColor ? `rgb(${probeColor.join(",")})` : "#4a6a88" }} />
              </div>
              <div className="text-[9px] tabular-nums mt-0.5" style={{ color: "#2a3d52" }}>
                {probe.lat.toFixed(4)}°N · {probe.lon.toFixed(4)}°E
              </div>
            </div>
          ) : rasterIndex === "uhi" ? (
            <div className="px-3 py-2">
              <div className="text-xl font-black tabular-nums" style={{ color: "#d4e0ec" }}>{timelineYear}</div>
              <div className="text-[9px] mt-0.5" style={{ color: "#4a6a88" }}>vs 2000–2010 baseline</div>
            </div>
          ) : (
            <div className="px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest" style={{ color: "#4a6a88" }}>{meta.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: "#2a3d52" }}>Hover for value</div>
            </div>
          )}
        </div>
      )}

      {/* Unavailable warning */}
      {indexUnavailable && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-lg px-5 py-4 text-center max-w-xs"
            style={{ background: "rgba(6,13,20,0.92)", border: "1px solid #18304a" }}>
            <div className="text-sm font-bold mb-1" style={{ color: "#d4914a" }}>Index not available</div>
            <div className="text-[11px]" style={{ color: "#4a6a88" }}>
              Run <code className="font-mono text-[10px] px-1 rounded" style={{ background: "#18304a" }}>
                scripts/download_s2_indices.py
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && (
        <div className="absolute bottom-10 left-3 rounded-lg p-2.5 pointer-events-none"
          style={{ background: "rgba(6,13,20,0.82)", backdropFilter: "blur(4px)" }}>
          {legendItems.map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[10px] mb-1 last:mb-0" style={{ color: "#8aa0b8" }}>
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
