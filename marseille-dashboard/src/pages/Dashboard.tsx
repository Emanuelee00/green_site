import { useState, useEffect, useCallback, useMemo } from "react";
import { UHIMap, type MapLayer } from "../components/map/UHIMap";
import type { RasterIndex } from "../components/map/WebGLRasterLayer";
import { DistributionPanel } from "../components/charts/DistributionPanel";
import { HistoryChart } from "../components/charts/HistoryChart";
import { SeasonalChart } from "../components/charts/SeasonalChart";
import { RankingChart } from "../components/charts/RankingChart";
import { AnomalyMatrix } from "../components/charts/AnomalyMatrix";
import { MultiZoneChart } from "../components/charts/MultiZoneChart";
import { TimelineSlider } from "../components/map/TimelineSlider";
import { fetchQuartiers, fetchRisk, fetchHistory, fetchAllZonesHistory } from "../api/engine";
import type { QuartierCollection, QuartierFeature, HistoryResponse, Zone, AllZonesHistory } from "../types";
import { ZONES } from "../types";

type MapMode = "uhi" | "risk";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  base:    "#060d14",
  panel:   "#0a1520",
  raised:  "#0f1f30",
  border:  "#18304a",
  borderSub: "#0f2035",
  text:    "#d4e0ec",
  muted:   "#4a6a88",
  dim:     "#1e3048",
  hot:     "#e05252",
  warm:    "#d4914a",
  cool:    "#4daa74",
  blue:    "#4a90c4",
};

// ── Primitives ─────────────────────────────────────────────────────────────────

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-md overflow-hidden border" style={{ borderColor: C.border, background: C.base }}>
      {options.map(({ value: v, label }, i) => (
        <button key={v} onClick={() => onChange(v)}
          className="px-3 py-1.5 text-[11px] font-semibold transition-colors duration-100 relative"
          style={{
            color: v === value ? C.text : C.muted,
            background: v === value ? C.raised : "transparent",
            borderRight: i < options.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-lg border ${className}`}
      style={{ background: C.panel, borderColor: C.border, ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: C.borderSub }}>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.muted }}>{title}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: C.dim }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, sub, accentColor }: {
  label: string; value: string | number; sub: string; accentColor: string;
}) {
  return (
    <div className="rounded-lg border flex flex-col gap-3 px-5 py-4 relative overflow-hidden"
      style={{ background: C.panel, borderColor: C.border, borderTopColor: accentColor, borderTopWidth: 2 }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.muted }}>
        {label}
      </div>
      <div className="text-[1.9rem] font-black leading-none tabular-nums" style={{ color: C.text }}>
        {value}
      </div>
      <div className="text-[11px]" style={{ color: C.dim }}>{sub}</div>
    </div>
  );
}

// ── Score gauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const pct = score * 100;
  const color = score > 0.65 ? C.hot : score > 0.35 ? C.warm : C.cool;
  const label = score > 0.65 ? "Hot" : score > 0.35 ? "Warm" : "Cool";
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: C.dim }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.cool}, ${color})` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>UHI Score</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {pct.toFixed(1)}% — {label}
        </span>
      </div>
    </div>
  );
}

// ── Quartier detail ────────────────────────────────────────────────────────────

function QuartierDetail({ q, all, onClose }: { q: QuartierFeature; all: QuartierFeature[]; onClose: () => void }) {
  const scores = all.map((f) => f.properties.uhi_score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const s = q.properties.uhi_score;
  const vsAvg = ((s - avg) * 100).toFixed(1);
  const vsAvgPositive = s > avg;
  const percentile = Math.round((all.filter((f) => f.properties.uhi_score <= s).length / all.length) * 100);
  const monthlyRisk = MONTHS.map((name, i) => {
    const seasonal = Math.sin(((i - 1) / 11) * Math.PI * 1.5);
    return { name, risk: Math.round(Math.min(s * (0.6 + seasonal * 0.4), 1) * 100) };
  });
  const peakMonth = monthlyRisk.reduce((a, b) => a.risk > b.risk ? a : b);
  const color = s > 0.65 ? C.hot : s > 0.35 ? C.warm : C.cool;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.borderSub }}>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
              {q.properties.NOM_CO}
            </span>
            <h3 className="text-lg font-black leading-tight" style={{ color: C.text }}>
              {q.properties.NOM_QUA}
            </h3>
          </div>
          <div className="px-2.5 py-0.5 rounded text-xs font-bold border" style={{
            color, borderColor: `${color}44`, background: `${color}12`
          }}>
            Rank #{q.properties.rank} / 111
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-sm transition-colors"
          style={{ color: C.muted, background: C.raised }}>
          ✕
        </button>
      </div>

      <div className="p-5 grid grid-cols-3 gap-6">
        {/* Col 1: score + stats */}
        <div className="flex flex-col gap-5">
          <ScoreGauge score={s} />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "vs city avg", value: `${vsAvgPositive ? "+" : ""}${vsAvg}%`, color: vsAvgPositive ? C.hot : C.cool },
              { label: "hotter than", value: `${percentile}%`, color: C.muted, sub: "of districts" },
              { label: "city min",    value: `${(min * 100).toFixed(0)}%`, color: C.cool },
              { label: "city max",    value: `${(max * 100).toFixed(0)}%`, color: C.hot },
            ].map((item) => (
              <div key={item.label} className="rounded border p-3"
                style={{ background: C.raised, borderColor: C.borderSub }}>
                <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: C.dim }}>{item.label}</div>
                <div className="text-base font-black tabular-nums" style={{ color: item.color }}>{item.value}</div>
                {"sub" in item && <div className="text-[9px] mt-0.5" style={{ color: C.dim }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: monthly risk */}
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>
              Monthly heat risk
            </div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              Peak: <span style={{ color: C.text }} className="font-semibold">
                {peakMonth.name} ({peakMonth.risk}%)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1 flex-1">
            {monthlyRisk.map(({ name, risk }) => {
              const c = risk > 65 ? C.hot : risk > 40 ? C.warm : C.cool;
              return (
                <div key={name} className="flex flex-col items-center gap-1 justify-end" style={{ height: 64 }}>
                  <div className="w-full rounded-sm"
                    style={{ height: `${Math.max(4, risk * 0.56)}px`, background: c, opacity: 0.4 + risk / 170 }} />
                  <span className="text-[8px]" style={{ color: C.dim }}>{name[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: distribution */}
        <div>
          <DistributionPanel selected={q} all={all} />
        </div>
      </div>
    </Card>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

function downloadCSV(features: QuartierFeature[]) {
  const header = "rank,nom_quartier,arrondissement,uhi_score_pct,heat_label";
  const rows = features.slice().sort((a, b) => a.properties.rank - b.properties.rank).map((f) => {
    const p = f.properties;
    const label = p.uhi_score > 0.65 ? "hot" : p.uhi_score > 0.35 ? "warm" : "cool";
    return `${p.rank},"${p.NOM_QUA}","${p.NOM_CO}",${(p.uhi_score * 100).toFixed(2)},${label}`;
  });
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "marseille_uhi_quartiers.csv"; a.click(); URL.revokeObjectURL(a.href);
}

function downloadGeoJSON(features: QuartierFeature[]) {
  const blob = new Blob(
    [JSON.stringify({ type: "FeatureCollection", features }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "marseille_uhi_quartiers.geojson"; a.click(); URL.revokeObjectURL(a.href);
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [quartiers,    setQuartiers]    = useState<QuartierCollection | null>(null);
  const [history,      setHistory]      = useState<HistoryResponse | null>(null);
  const [allHistory,   setAllHistory]   = useState<AllZonesHistory | null>(null);
  const [selected,     setSelected]     = useState<QuartierFeature | null>(null);
  const [mapMode,          setMapMode]          = useState<MapMode>("uhi");
  const [mapLayer,         setMapLayer]         = useState<MapLayer>("raster");
  const [rasterIndex,      setRasterIndex]      = useState<RasterIndex>("uhi");
  const [availableIndices, setAvailableIndices] = useState<Record<string, boolean>>({});
  const [month,            setMonth]            = useState(7);
  const [timelineYear,     setTimelineYear]     = useState(2023);
  const [zone,             setZone]             = useState<Zone>("centre_ville");
  const [loading,          setLoading]          = useState(true);
  const [threshold,        setThreshold]        = useState(0);

  useEffect(() => {
    fetchQuartiers().then((d) => { setQuartiers(d); setLoading(false); }).catch(console.error);
    fetchAllZonesHistory().then(setAllHistory).catch(console.error);
    fetch("/api/indices/available").then((r) => r.json()).then(setAvailableIndices).catch(() => {});
  }, []);

  useEffect(() => {
    fetchHistory(zone).then(setHistory).catch(console.error);
  }, [zone]);

  const loadRisk = async (m: number) => {
    setMonth(m);
    setMapMode("risk");
    const d = await fetchRisk(m).catch(() => null);
    if (d) setQuartiers(d);
  };

  const handleSelectQuartier = useCallback((q: QuartierFeature) => setSelected(q), []);

  const { avgUHI, hotCount, coolCount, maxQ, minQ } = useMemo(() => {
    const features = quartiers?.features ?? [];
    const scores = features.map((f) => f.properties.uhi_score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return {
      avgUHI:   (avg * 100).toFixed(1),
      hotCount:  scores.filter((s) => s > 0.65).length,
      coolCount: scores.filter((s) => s < 0.35).length,
      maxQ: features.reduce<QuartierFeature | null>((a, b) => !a || b.properties.uhi_score > a.properties.uhi_score ? b : a, null),
      minQ: features.reduce<QuartierFeature | null>((a, b) => !a || b.properties.uhi_score < a.properties.uhi_score ? b : a, null),
    };
  }, [quartiers]);

  const filteredFeatures = useMemo(() =>
    (quartiers?.features ?? []).filter((f) => f.properties.uhi_score * 100 >= threshold),
    [quartiers, threshold]
  );

  const thresholdStats = useMemo(() => {
    if (!threshold || !filteredFeatures.length) return null;
    const scores = filteredFeatures.map((f) => f.properties.uhi_score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const arrCount = new Set(filteredFeatures.map((f) => f.properties.NOM_CO)).size;
    return { count: filteredFeatures.length, avg: (avg * 100).toFixed(1), arrCount };
  }, [filteredFeatures, threshold]);

  return (
    <div className="min-h-screen" style={{ background: C.base, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b px-6 h-12 flex items-center justify-between"
        style={{ background: C.panel, borderColor: C.border }}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[11px] font-black"
              style={{ background: C.cool, color: "#060d14" }}>
              M
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: C.text }}>
              Marseille <span style={{ color: C.muted }} className="font-normal">Climate</span>
            </span>
          </div>
          <div className="w-px h-4" style={{ background: C.border }} />
          <span className="text-[11px]" style={{ color: C.muted }}>Urban Heat Island · Professional Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          {quartiers && (
            <>
              <button onClick={() => downloadCSV(quartiers.features)}
                className="text-[11px] px-3 py-1 rounded border font-medium transition-colors"
                style={{ color: C.muted, borderColor: C.border, background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget.style.color = C.text); (e.currentTarget.style.borderColor = C.muted); }}
                onMouseLeave={(e) => { (e.currentTarget.style.color = C.muted); (e.currentTarget.style.borderColor = C.border); }}>
                Export CSV
              </button>
              <button onClick={() => downloadGeoJSON(quartiers.features)}
                className="text-[11px] px-3 py-1 rounded border font-medium transition-colors"
                style={{ color: C.muted, borderColor: C.border, background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget.style.color = C.text); (e.currentTarget.style.borderColor = C.muted); }}
                onMouseLeave={(e) => { (e.currentTarget.style.color = C.muted); (e.currentTarget.style.borderColor = C.border); }}>
                Export GeoJSON
              </button>
            </>
          )}
          <div className="w-px h-4" style={{ background: C.border }} />
          <span className="text-[11px]" style={{ color: C.dim }}>Sentinel-2 L2A · Aug 2023</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.cool }} />
            <span className="text-[11px] font-medium" style={{ color: C.cool }}>Live</span>
          </div>
        </div>
      </header>

      <div className="p-5 flex flex-col gap-4">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-5 gap-3">
          <KpiCard label="City avg UHI"  value={`${avgUHI}%`}    accentColor={C.warm} sub="111 districts · Aug 2023" />
          <KpiCard label="Hot districts" value={hotCount}         accentColor={C.hot}  sub="UHI score above 65%" />
          <KpiCard label="Cool districts" value={coolCount}       accentColor={C.cool} sub="UHI score below 35%" />
          <KpiCard label="Hottest district" accentColor={C.hot}
            value={maxQ?.properties.NOM_QUA ?? "—"}
            sub={`score ${((maxQ?.properties.uhi_score ?? 0) * 100).toFixed(0)}%`} />
          <KpiCard label="Coolest district" accentColor={C.cool}
            value={minQ?.properties.NOM_QUA ?? "—"}
            sub={`score ${((minQ?.properties.uhi_score ?? 0) * 100).toFixed(0)}%`} />
        </div>

        {/* ── Map + ranking ── */}
        <div className="grid grid-cols-3 gap-3">

          {/* Map */}
          <Card className="col-span-2 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.borderSub }}>
              <span className="text-[11px] font-semibold" style={{ color: C.text }}>Heat Map</span>
              <div className="flex-1" />
              <SegmentedControl
                options={[
                  { value: "raster",    label: "Pixel" },
                  { value: "quartiers", label: "Districts" },
                  { value: "both",      label: "Both" },
                ]}
                value={mapLayer}
                onChange={(v) => setMapLayer(v as MapLayer)}
              />
              <div className="w-px h-4" style={{ background: C.border }} />
              {/* Satellite index selector */}
              <SegmentedControl
                options={([
                  { value: "uhi",   label: "UHI" },
                  { value: "ndvi",  label: "NDVI" },
                  { value: "ndwi",  label: "NDWI" },
                  { value: "swir",  label: "SWIR" },
                  { value: "urban", label: "Urban" },
                ] as { value: RasterIndex; label: string }[]).map((o) => ({
                  ...o,
                  label: o.value === "uhi" || availableIndices[o.value]
                    ? o.label
                    : `${o.label} ↓`,
                }))}
                value={rasterIndex}
                onChange={(v) => {
                  setRasterIndex(v as RasterIndex);
                  if (v !== "uhi") setMapLayer("raster");
                }}
              />
              <div className="w-px h-4" style={{ background: C.border }} />
              <SegmentedControl
                options={[
                  { value: "uhi",  label: "UHI Score" },
                  { value: "risk", label: "Heat Risk" },
                ]}
                value={mapMode}
                onChange={(v) => {
                  setMapMode(v as MapMode);
                  if (v === "uhi") fetchQuartiers().then(setQuartiers);
                }}
              />
              {mapMode === "risk" && (
                <select value={month} onChange={(e) => loadRisk(+e.target.value)}
                  className="text-[11px] px-2 py-1 rounded border outline-none"
                  style={{ background: C.raised, borderColor: C.border, color: C.text }}>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              )}
            </div>

            {/* Map canvas */}
            <div style={{ height: 420 }}>
              {loading
                ? <div className="flex items-center justify-center h-full text-sm" style={{ color: C.muted }}>
                    Loading satellite data…
                  </div>
                : <UHIMap data={quartiers} mode={mapMode} layer={mapLayer}
                    rasterIndex={rasterIndex} availableIndices={availableIndices}
                    selectedName={selected?.properties.NOM_QUA ?? null}
                    timelineYear={timelineYear} onSelect={handleSelectQuartier} />}
            </div>

            {/* Timeline */}
            <div className="px-5 py-4 border-t" style={{ borderColor: C.borderSub, background: C.base }}>
              <TimelineSlider year={timelineYear} onChange={setTimelineYear} loading={false} allHistory={allHistory} />
            </div>
          </Card>

          {/* Ranking */}
          <Card className="flex flex-col overflow-hidden" style={{ height: 556 }}>
            <CardHeader title="Districts" sub={
              threshold > 0 && thresholdStats
                ? `${thresholdStats.count} districts ≥ ${threshold}% · avg ${thresholdStats.avg}%`
                : "All 111 · ranked by heat score"
            } action={
              threshold > 0
                ? <button onClick={() => setThreshold(0)} className="text-[10px] px-2 py-0.5 rounded border transition-colors"
                    style={{ color: C.muted, borderColor: C.border }}>
                    Clear
                  </button>
                : undefined
            } />

            {/* Threshold filter */}
            <div className="px-4 py-3 border-b" style={{ borderColor: C.borderSub }}>
              <div className="flex justify-between mb-2 text-[10px]" style={{ color: C.muted }}>
                <span>Threshold filter</span>
                <span className="font-semibold tabular-nums" style={{ color: threshold > 0 ? C.warm : C.muted }}>
                  {threshold > 0 ? `≥ ${threshold}%` : "off"}
                </span>
              </div>
              <div className="relative h-2 rounded-full" style={{ background: C.dim }}>
                <div className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${threshold / 90 * 100}%`, background: threshold > 0 ? C.warm : C.dim, transition: "width 0.1s" }} />
                <input type="range" min={0} max={90} step={5} value={threshold}
                  onChange={(e) => setThreshold(+e.target.value)}
                  className="absolute inset-0 w-full h-2 cursor-pointer"
                  style={{ opacity: 0, zIndex: 10 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {quartiers && (
                <RankingChart
                  quartiers={filteredFeatures}
                  selected={selected?.properties.NOM_QUA ?? null}
                  onSelect={handleSelectQuartier}
                />
              )}
            </div>
          </Card>
        </div>

        {/* ── Selected quartier ── */}
        {selected && (
          <QuartierDetail q={selected} all={quartiers?.features ?? []} onClose={() => setSelected(null)} />
        )}

        {/* ── History + Seasonal ── */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader title="Temperature trend 2000–2024" sub="MODIS Land Surface Temperature · daily mean"
              action={
                <select value={zone} onChange={(e) => setZone(e.target.value as Zone)}
                  className="text-[11px] px-2 py-1 rounded border outline-none"
                  style={{ background: C.raised, borderColor: C.border, color: C.text }}>
                  {ZONES.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
                </select>
              }
            />
            <div className="p-5">
              {history
                ? <HistoryChart history={history} />
                : <div className="text-sm text-center py-10" style={{ color: C.muted }}>Loading…</div>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Seasonal profile"
              sub={`${zone.replace(/_/g," ")} · estimated Mediterranean profile`} />
            <div className="p-5">
              {history
                ? <SeasonalChart data={history.data} />
                : <div className="text-sm text-center py-10" style={{ color: C.muted }}>Loading…</div>}
              <div className="mt-4 flex gap-5 text-[11px]">
                {([[C.cool,"Cool","< 35%"],[C.warm,"Warm","35–65%"],[C.hot,"Hot","> 65%"]] as const).map(([c,l,r]) => (
                  <div key={l} className="flex items-center gap-1.5" style={{ color: C.muted }}>
                    <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    <span>{l}</span>
                    <span style={{ color: C.dim }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Analysis tools divider ── */}
        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1" style={{ background: C.border }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: C.muted }}>
            Analysis Tools
          </span>
          <div className="h-px flex-1" style={{ background: C.border }} />
        </div>

        {/* Anomaly matrix */}
        <Card>
          <CardHeader
            title="Zone × Year Anomaly Matrix"
            sub="LST deviation from 2000–2010 baseline · 9 MODIS zones · hover for exact values"
          />
          <div className="p-5">
            {allHistory
              ? <AnomalyMatrix data={allHistory} />
              : <div className="text-sm text-center py-10" style={{ color: C.muted }}>Loading…</div>}
          </div>
        </Card>

        {/* Multi-zone comparison */}
        <Card>
          <CardHeader
            title="Multi-zone LST Comparison"
            sub="Overlay up to 4 zones on the same chart · MODIS daily mean 2000–2024"
          />
          <div className="p-5">
            <MultiZoneChart />
          </div>
        </Card>

        {/* ── Satellite indices divider ── */}
        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1" style={{ background: C.border }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: C.muted }}>
            Satellite Indices
          </span>
          <div className="h-px flex-1" style={{ background: C.border }} />
        </div>

        {/* Sentinel-2 indices overview */}
        <Card>
          <CardHeader
            title="Sentinel-2 L2A · Indices · Marseille · août 2023"
            sub="NDVI (végétation) · NDWI (humidité) · Urban (imperméabilisation) · SWIR (infrarouge courtes ondes)"
          />
          <div className="p-5 flex flex-col gap-4">
            <img
              src="/marseille_overview.png"
              alt="Sentinel-2 indices — NDVI, NDWI, Urban, SWIR — Marseille août 2023"
              className="w-full rounded"
              style={{ border: `1px solid ${C.borderSub}` }}
            />
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: "NDVI", label: "Végétation", desc: "Densité du couvert végétal. Valeurs hautes = forte végétation (forêt, parcs). Valeurs basses = sol nu, bitume.", color: "#4daa74" },
                { key: "NDWI", label: "Eau & Humidité", desc: "Teneur en eau de surface. Bleu intense = mer/eau libre. Valeurs moyennes = humidité du sol.", color: "#4a90c4" },
                { key: "Urban", label: "Imperméabilisation", desc: "Surfaces artificialisées. Rouge/brun = zones bâties denses. Vert foncé = végétation ou eau.", color: C.warm },
                { key: "SWIR", label: "Infrarouge courtes ondes", desc: "Humidité sol & végétation. Vert clair = humide. Vert foncé = sec. Permet de détecter le stress hydrique.", color: "#7ab87a" },
              ].map(({ key, label, desc, color }) => (
                <div key={key} className="rounded border p-3 flex flex-col gap-2"
                  style={{ background: C.raised, borderColor: C.borderSub, borderTopColor: color, borderTopWidth: 2 }}>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{key}</div>
                    <div className="text-[11px] font-semibold mt-0.5" style={{ color: C.text }}>{label}</div>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-right" style={{ color: C.dim }}>
              Source: Sentinel Hub · Sentinel-2 L2A · 22 août 2023
            </div>
          </div>
        </Card>

        <div className="text-center py-2 text-[10px]" style={{ color: C.dim }}>
          Sentinel-2 L2A · MODIS LST 2000–2024 · OSMnx · marseille-engine API
        </div>
      </div>
    </div>
  );
}
