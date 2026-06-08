import { useState, useEffect, useCallback, useMemo } from "react";
import { UHIMap, type MapLayer } from "../components/map/UHIMap";
import { DistributionPanel } from "../components/charts/DistributionPanel";
import { HistoryChart } from "../components/charts/HistoryChart";
import { SeasonalChart } from "../components/charts/SeasonalChart";
import { RankingChart } from "../components/charts/RankingChart";
import { TimelineSlider } from "../components/map/TimelineSlider";
import { fetchQuartiers, fetchRisk, fetchHistory } from "../api/engine";
import type { QuartierCollection, QuartierFeature, HistoryResponse, Zone } from "../types";
import { ZONES } from "../types";

type MapMode = "uhi" | "risk";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
        ${active ? "bg-white/10 text-white shadow-inner" : "text-gray-500 hover:text-gray-300"}`}>
      {children}
    </button>
  );
}

function KpiCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 flex flex-col gap-2">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}, transparent 70%)` }} />
      <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-widest font-semibold">
        <span>{icon}</span>{label}
      </div>
      <div className="text-[2rem] font-black leading-none" style={{ color: accent }}>{value}</div>
      <div className="text-gray-600 text-[11px]">{sub}</div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const pct = score * 100;
  const color = score > 0.65 ? "#ef4444" : score > 0.35 ? "#f59e0b" : "#22c55e";
  const label = score > 0.65 ? "Hot" : score > 0.35 ? "Warm" : "Cool";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>0% Cool</span><span>100% Hot</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${color})` }} />
        <div className="absolute inset-y-0 flex items-center" style={{ left: `${Math.min(pct, 92)}%` }}>
          <div className="w-0.5 h-full bg-white/60 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-600">UHI score</span>
        <span className="text-sm font-bold" style={{ color }}>{pct.toFixed(1)}% — {label}</span>
      </div>
    </div>
  );
}

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
  const color = s > 0.65 ? "#ef4444" : s > 0.35 ? "#f59e0b" : "#22c55e";
  const colorDim = s > 0.65 ? "#7f1d1d" : s > 0.35 ? "#78350f" : "#14532d";

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
      <div className="flex items-start justify-between px-6 py-5 border-b border-white/5"
        style={{ background: `linear-gradient(135deg, ${colorDim}55, transparent)` }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color, borderColor: `${color}55`, background: `${color}15` }}>
              Rank #{q.properties.rank} / 111
            </span>
            <span className="text-xs text-gray-500">{q.properties.NOM_CO}</span>
          </div>
          <h3 className="text-white text-xl font-black">{q.properties.NOM_QUA}</h3>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors text-lg mt-1">✕</button>
      </div>
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-1 flex flex-col gap-5">
          <ScoreGauge score={s} />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "vs city avg", value: `${vsAvgPositive ? "+" : ""}${vsAvg}%`, color: vsAvgPositive ? "#ef4444" : "#22c55e" },
              { label: "hotter than", value: `${percentile}%`, color: "#94a3b8", sub: "of districts" },
              { label: "city min",    value: `${(min * 100).toFixed(0)}%`, color: "#22c55e" },
              { label: "city max",    value: `${(max * 100).toFixed(0)}%`, color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{item.label}</div>
                <div className="text-lg font-black" style={{ color: item.color }}>{item.value}</div>
                {"sub" in item && <div className="text-[10px] text-gray-600">{item.sub}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly heat risk</div>
            <div className="text-[11px] text-gray-600">Peak: <span className="text-white font-semibold">{peakMonth.name} ({peakMonth.risk}%)</span></div>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {monthlyRisk.map(({ name, risk }) => {
              const c = risk > 65 ? "#ef4444" : risk > 40 ? "#f59e0b" : "#22c55e";
              return (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-md" style={{ height: `${Math.max(8, risk * 0.5)}px`, background: c, opacity: 0.3 + risk / 150 }} />
                  <span className="text-[9px] text-gray-600">{name[0]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-700 mt-1">
            <span>🌿 low</span><span>🔥 high</span>
          </div>
        </div>
        <div className="col-span-1">
          <DistributionPanel selected={q} all={all} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [quartiers,    setQuartiers]    = useState<QuartierCollection | null>(null);
  const [history,      setHistory]      = useState<HistoryResponse | null>(null);
  const [selected,     setSelected]     = useState<QuartierFeature | null>(null);
  const [mapMode,      setMapMode]      = useState<MapMode>("uhi");
  const [mapLayer,     setMapLayer]     = useState<MapLayer>("raster");
  const [month,        setMonth]        = useState(7);
  const [timelineYear, setTimelineYear] = useState(2023);
  const [zone,         setZone]         = useState<Zone>("centre_ville");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    fetchQuartiers().then((d) => { setQuartiers(d); setLoading(false); }).catch(console.error);
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

  return (
    <div className="min-h-screen bg-[#080c10] text-white" style={{ fontFamily: "Inter, sans-serif" }}>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080c10]/90 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm">🌿</div>
            <span className="font-black text-white tracking-tight">Marseille Climate</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-gray-500 text-xs">Urban Heat Island Dashboard</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-600">Sentinel-2 L2A · Aug 2023</span>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">Live data</span>
          </div>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-5">

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-3">
          <KpiCard icon="🌡️" label="City avg UHI"  value={`${avgUHI}%`} accent="#f59e0b" sub="111 districts · Aug 2023" />
          <KpiCard icon="🔥" label="Hot districts"  value={hotCount}     accent="#ef4444" sub="UHI score above 65%" />
          <KpiCard icon="🌿" label="Cool districts" value={coolCount}    accent="#22c55e" sub="UHI score below 35%" />
          <KpiCard icon="📈" label="Hottest zone"   value={maxQ?.properties.NOM_QUA ?? "—"} accent="#ef4444"
            sub={`score ${((maxQ?.properties.uhi_score ?? 0) * 100).toFixed(0)}%`} />
          <KpiCard icon="❄️" label="Coolest zone"   value={minQ?.properties.NOM_QUA ?? "—"} accent="#22c55e"
            sub={`score ${((minQ?.properties.uhi_score ?? 0) * 100).toFixed(0)}%`} />
        </div>

        {/* Map + ranking */}
        <div className="grid grid-cols-3 gap-4">

          {/* Map column */}
          <div className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">

            {/* Map controls */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 flex-wrap">
              <span className="text-white font-semibold text-sm">Heat map</span>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                  {([["raster","🛰 Pixel"],["quartiers","⬡ Districts"],["both","⊕ Both"]] as [MapLayer,string][]).map(([l,lbl]) => (
                    <Pill key={l} active={mapLayer === l} onClick={() => setMapLayer(l)}>{lbl}</Pill>
                  ))}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                  {(["uhi","risk"] as MapMode[]).map((m) => (
                    <Pill key={m} active={mapMode === m}
                      onClick={() => { setMapMode(m); if (m === "uhi") fetchQuartiers().then(setQuartiers); }}>
                      {m === "uhi" ? "UHI Score" : "Heat Risk"}
                    </Pill>
                  ))}
                </div>
                {mapMode === "risk" && (
                  <select value={month} onChange={(e) => loadRisk(+e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Map */}
            <div style={{ height: 420 }}>
              {loading
                ? <div className="flex items-center justify-center h-full text-gray-600 text-sm">Loading satellite data…</div>
                : <UHIMap
                    data={quartiers}
                    mode={mapMode}
                    layer={mapLayer}
                    selectedName={selected?.properties.NOM_QUA ?? null}
                    timelineYear={timelineYear}
                    onSelect={handleSelectQuartier}
                  />}
            </div>

            {/* Timeline slider — always visible below the map */}
            <div className="px-5 py-4 border-t border-white/5 bg-white/[0.01]">
              <TimelineSlider
                year={timelineYear}
                onChange={setTimelineYear}
                loading={false}
              />
            </div>
          </div>

          {/* Ranking */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden" style={{ height: 560 }}>
            <div className="px-4 py-2.5 border-b border-white/5 shrink-0">
              <div className="text-white font-semibold text-sm">All 111 districts</div>
              <div className="text-gray-600 text-[11px] mt-0.5">Ranked by heat · click to inspect</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {quartiers && (
                <RankingChart
                  quartiers={quartiers.features}
                  selected={selected?.properties.NOM_QUA ?? null}
                  onSelect={handleSelectQuartier}
                />
              )}
            </div>
          </div>
        </div>

        {/* Selected quartier detail */}
        {selected && (
          <QuartierDetail
            q={selected}
            all={quartiers?.features ?? []}
            onClose={() => setSelected(null)}
          />
        )}

        {/* History + Seasonal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-semibold text-sm">Temperature trend 2000–2024</div>
                <div className="text-gray-600 text-[11px] mt-0.5">MODIS Land Surface Temperature · daily mean</div>
              </div>
              <select value={zone} onChange={(e) => setZone(e.target.value as Zone)}
                className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                {ZONES.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            {history ? <HistoryChart history={history} /> : <div className="text-gray-600 text-sm text-center py-10">Loading…</div>}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="mb-4">
              <div className="text-white font-semibold text-sm">Seasonal profile</div>
              <div className="text-gray-600 text-[11px] mt-0.5">{zone.replace(/_/g," ")} · simulated from annual MODIS averages</div>
            </div>
            {history ? <SeasonalChart data={history.data} /> : <div className="text-gray-600 text-sm text-center py-10">Loading…</div>}
            <div className="mt-4 flex gap-4 text-[11px]">
              {[["#22c55e","Cool","< 35%"],["#f59e0b","Warm","35–65%"],["#ef4444","Hot","> 65%"]].map(([c,l,r]) => (
                <div key={l} className="flex items-center gap-1.5 text-gray-500">
                  <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span>{l}</span><span className="text-gray-700">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-800 text-[11px] pb-1">
          Sentinel-2 L2A · MODIS LST 2000–2024 · OSMnx · marseille-engine API
        </footer>
      </div>
    </div>
  );
}
