import { useState } from "react";
import type { HistoryResponse, RouteResponse, View } from "../types";
import { fetchHistory, fetchRoute, fetchRisk } from "../api/engine";
import type { QuartierCollection } from "../types";

const ZONES = [
  "centre_ville", "nord_urbain", "sud_urbain",
  "periurbain_est", "periurbain_nord",
  "rural_est", "rural_nord", "rural_ouest", "rural_sud",
];

interface Props {
  view: View;
  setView: (v: View) => void;
  onRisk: (data: QuartierCollection) => void;
  onRoute: (r: RouteResponse) => void;
}

export default function Sidebar({ view, setView, onRisk, onRoute }: Props) {
  return (
    <aside className="w-80 bg-white shadow-lg flex flex-col overflow-y-auto">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Marseille Climate</h1>
        <p className="text-xs text-gray-500 mt-1">Urban heat island explorer</p>
      </div>

      <nav className="flex border-b">
        {(["map", "route", "history"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors
              ${view === v ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            {v}
          </button>
        ))}
      </nav>

      <div className="flex-1 p-4">
        {view === "map"  && <RiskPanel onRisk={onRisk} />}
        {view === "route" && <RoutePanel onRoute={onRoute} />}
        {view === "history" && <HistoryPanel />}
      </div>
    </aside>
  );
}

// ── Risk panel ────────────────────────────────────────────────────────────────

function RiskPanel({ onRisk }: { onRisk: (d: QuartierCollection) => void }) {
  const [month, setMonth] = useState(7);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { onRisk(await fetchRisk(month)); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        View heat risk per district for a given month.
      </p>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
        <input type="range" min={1} max={12} value={month}
          onChange={(e) => setMonth(+e.target.value)} className="w-full" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Jan</span><span>{monthName(month)}</span><span>Dec</span>
        </div>
      </div>
      <button onClick={load} disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
        {loading ? "Loading…" : "Show risk map"}
      </button>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 space-y-1">
      {[["#ef4444", "High risk"], ["#f97316", "Medium risk"], ["#22c55e", "Low risk"]].map(([c, l]) => (
        <div key={l} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
          {l}
        </div>
      ))}
    </div>
  );
}

// ── Route panel ───────────────────────────────────────────────────────────────

function RoutePanel({ onRoute }: { onRoute: (r: RouteResponse) => void }) {
  const [from, setFrom] = useState("43.2965, 5.3698");
  const [to, setTo] = useState("43.290, 5.380");
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calc = async () => {
    setLoading(true); setError("");
    try {
      const [fLat, fLon] = from.split(",").map(Number);
      const [tLat, tLon] = to.split(",").map(Number);
      const r = await fetchRoute(fLat, fLon, tLat, tLon);
      setResult(r);
      onRoute(r);
    } catch (e) {
      setError("Route not found. Try closer coordinates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Find the coolest pedestrian route.</p>
      {[["From", from, setFrom], ["To", to, setTo]].map(([label, val, set]) => (
        <div key={label as string}>
          <label className="block text-xs font-medium text-gray-700 mb-1">{label as string} (lat, lon)</label>
          <input value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>
      ))}
      <button onClick={calc} disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
        {loading ? "Calculating…" : "Find fresh route"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {result && (
        <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
          <Stat label="Distance" value={`${(result.distance_m / 1000).toFixed(2)} km`} />
          <Stat label="UHI avg" value={result.uhi_avg !== null ? `${(result.uhi_avg * 100).toFixed(0)}%` : "—"} />
          <Stat label="Fresh score" value={result.fresh_score !== null ? `${(result.fresh_score * 100).toFixed(0)}%` : "—"} />
          <Stat label="Label" value={result.label ?? "—"} />
          <Stat label="Calc time" value={`${result.took_s}s`} />
        </div>
      )}
    </div>
  );
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel() {
  const [zone, setZone] = useState("centre_ville");
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await fetchHistory(zone)); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">LST trend 2000–2024 by MODIS zone.</p>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
        <select value={zone} onChange={(e) => setZone(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm">
          {ZONES.map((z) => <option key={z} value={z}>{z.replace("_", " ")}</option>)}
        </select>
      </div>
      <button onClick={load} disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
        {loading ? "Loading…" : "Load history"}
      </button>
      {data && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Trend: <b className={data.trend_per_decade > 0 ? "text-red-500" : "text-green-600"}>
              {data.trend_per_decade > 0 ? "+" : ""}{data.trend_per_decade}°C/decade
            </b>
          </p>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-1">Year</th>
                  <th className="text-right">Day °C</th>
                  <th className="text-right">Night °C</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((d) => (
                  <tr key={d.year} className="border-b border-gray-100">
                    <td className="py-1">{d.year}</td>
                    <td className="text-right">{d.lst_day?.toFixed(1) ?? "—"}</td>
                    <td className="text-right">{d.lst_night?.toFixed(1) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function monthName(m: number) {
  return new Date(2000, m - 1).toLocaleString("en", { month: "short" });
}
