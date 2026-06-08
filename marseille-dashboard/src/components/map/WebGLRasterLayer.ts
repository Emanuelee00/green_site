import L from "leaflet";
import type { AllZonesHistory } from "../../types";

const ZONES = [
  "centre_ville","nord_urbain","sud_urbain",
  "periurbain_est","periurbain_nord",
  "rural_est","rural_nord","rural_ouest","rural_sud",
];

export type RasterIndex = "uhi" | "ndvi" | "ndwi" | "swir" | "urban";

type RGB = [number, number, number];

function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }

function ramp(stops: RGB[], t: number): RGB {
  t = Math.max(0, Math.min(1, t));
  const n = stops.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const s = t * n - i;
  return [lerp(stops[i][0], stops[i+1][0], s), lerp(stops[i][1], stops[i+1][1], s), lerp(stops[i][2], stops[i+1][2], s)];
}

const COLORMAPS: Record<RasterIndex, (t: number) => RGB> = {
  uhi:   (t) => ramp([[33,197,94],[135,240,171],[252,224,71],[250,145,61],[186,28,28]], t),
  ndvi:  (t) => ramp([[180,80,40],[210,160,80],[240,230,150],[140,200,80],[30,140,50]], t),
  ndwi:  (t) => ramp([[140,100,50],[200,180,140],[240,240,240],[120,180,220],[30,100,200]], t),
  swir:  (t) => ramp([[20,50,20],[60,110,60],[140,180,100],[210,200,140],[230,200,160]], t),
  urban: (t) => ramp([[40,120,60],[160,200,100],[220,200,80],[210,120,50],[180,50,40]], t),
};

const INDEX_URLS: Record<RasterIndex, string> = {
  uhi:   "/api/uhi/raster/raw?scale=0.3",
  ndvi:  "/api/indices/ndvi/raw?scale=0.3",
  ndwi:  "/api/indices/ndwi/raw?scale=0.3",
  swir:  "/api/indices/swir/raw?scale=0.3",
  urban: "/api/indices/urban/raw?scale=0.3",
};

// Raster geo bounds (EPSG:4326)
const GEO = { south: 43.19994755263194, west: 5.249940079052022, north: 43.42001637152874, east: 5.5268096923828125 };

interface RasterData { rows: number; cols: number; min: number; max: number; f32: Float32Array }

export interface PixelProbe {
  lat: number;
  lon: number;
  value: number;      // raw float32
  normalized: number; // 0-1
  index: RasterIndex;
}

export class WebGLRasterLayer extends L.Layer {
  private _overlay: L.ImageOverlay | null = null;
  private _cache   = new Map<RasterIndex, RasterData>();
  private _history: AllZonesHistory | null = null;
  private _year    = 2023;
  private _index: RasterIndex = "uhi";
  private _visible = true;

  onLoadingChange?: (loading: boolean) => void;
  onProbe?: (probe: PixelProbe | null) => void;

  private readonly _bounds = L.latLngBounds([GEO.south, GEO.west], [GEO.north, GEO.east]);

  onAdd(map: L.Map): this {
    if (this._cache.has(this._index)) this._render(map);
    map.on("mousemove", this._onMouseMove, this);
    map.on("mouseout",  this._onMouseOut,  this);
    return this;
  }

  onRemove(map: L.Map): this {
    map.off("mousemove", this._onMouseMove, this);
    map.off("mouseout",  this._onMouseOut,  this);
    this._overlay?.remove();
    this._overlay = null;
    return this;
  }

  setVisible(visible: boolean): void {
    this._visible = visible;
    const el = this._overlay?.getElement();
    if (el) el.style.display = visible ? "" : "none";
  }

  async loadData(): Promise<void> {
    this.onLoadingChange?.(true);
    await this._fetchIndex("uhi");
    const histRes = await fetch("/api/uhi/raster/all-zones-history");
    this._history = await histRes.json();
    this.onLoadingChange?.(false);
    this._render(this._map as L.Map);
  }

  async setIndex(index: RasterIndex): Promise<void> {
    this._index = index;
    if (!this._cache.has(index)) {
      this.onLoadingChange?.(true);
      await this._fetchIndex(index);
      this.onLoadingChange?.(false);
    }
    this._render(this._map as L.Map);
  }

  setYear(year: number): void {
    this._year = year;
    if (this._cache.has(this._index)) this._render(this._map as L.Map);
  }

  // Returns raw value at lat/lon or null if outside/nodata
  getValue(lat: number, lon: number): PixelProbe | null {
    const raster = this._cache.get(this._index);
    if (!raster) return null;
    if (lat < GEO.south || lat > GEO.north || lon < GEO.west || lon > GEO.east) return null;

    const { rows, cols, min, max, f32 } = raster;
    const col = Math.round((lon - GEO.west)  / (GEO.east  - GEO.west)  * (cols - 1));
    const row = Math.round((GEO.north - lat) / (GEO.north - GEO.south) * (rows - 1));
    const idx = row * cols + col;
    if (idx < 0 || idx >= f32.length) return null;

    const value = f32[idx];
    if (isNaN(value)) return null;

    const range = max - min || 1;
    const normalized = Math.max(0, Math.min(1, (value - min) / range + this._yearShift()));
    return { lat, lon, value, normalized, index: this._index };
  }

  private _onMouseMove(e: L.LeafletMouseEvent): void {
    if (!this._visible) { this.onProbe?.(null); return; }
    this.onProbe?.(this.getValue(e.latlng.lat, e.latlng.lng));
  }

  private _onMouseOut(): void {
    this.onProbe?.(null);
  }

  private async _fetchIndex(index: RasterIndex): Promise<void> {
    const res = await fetch(INDEX_URLS[index]);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${index}`);
    this._cache.set(index, {
      rows: parseInt(res.headers.get("X-Raster-Rows") ?? "0"),
      cols: parseInt(res.headers.get("X-Raster-Cols") ?? "0"),
      min:  parseFloat(res.headers.get("X-Raster-Min") ?? "0"),
      max:  parseFloat(res.headers.get("X-Raster-Max") ?? "1"),
      f32:  new Float32Array(await res.arrayBuffer()),
    });
  }

  private _yearShift(): number {
    if (!this._history || this._index !== "uhi") return 0;
    const shifts = ZONES.map((z) => (this._history![z]?.[this._year]?.anomaly_norm ?? 0));
    return (shifts.reduce((a, b) => a + b, 0) / shifts.length) * 0.15;
  }

  private _render(map: L.Map): void {
    if (!map) return;
    const raster = this._cache.get(this._index);
    if (!raster) return;

    const { rows, cols, min, max, f32 } = raster;
    const range = max - min || 1;
    const shift = this._yearShift();
    const cmap  = COLORMAPS[this._index];

    const canvas = document.createElement("canvas");
    canvas.width = cols; canvas.height = rows;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(cols, rows);
    const px  = img.data;

    for (let i = 0; i < f32.length; i++) {
      const v = f32[i];
      if (isNaN(v)) { px[i*4+3] = 0; continue; }
      const t = Math.max(0, Math.min(1, (v - min) / range + shift));
      const [r, g, b] = cmap(t);
      px[i*4] = r; px[i*4+1] = g; px[i*4+2] = b; px[i*4+3] = 210;
    }

    ctx.putImageData(img, 0, 0);
    this._overlay?.remove();
    this._overlay = L.imageOverlay(canvas.toDataURL("image/png"), this._bounds, { opacity: 1, interactive: false }).addTo(map);
    if (!this._visible) {
      const el = this._overlay.getElement();
      if (el) el.style.display = "none";
    }
  }
}
