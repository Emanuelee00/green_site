import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { fetchHistory } from "../../api/engine";
import type { HistoryResponse } from "../../types";
import { ZONES, type Zone } from "../../types";

const ZONE_LABELS: Record<Zone, string> = {
  centre_ville:   "Centre-Ville",
  nord_urbain:    "Nord Urbain",
  sud_urbain:     "Sud Urbain",
  periurbain_est:  "Péri. Est",
  periurbain_nord: "Péri. Nord",
  rural_est:      "Rural Est",
  rural_nord:     "Rural Nord",
  rural_ouest:    "Rural Ouest",
  rural_sud:      "Rural Sud",
};

const PALETTE = ["#22c55e", "#f59e0b", "#60a5fa", "#f472b6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const valid = payload.filter((p: any) => p.value != null);
  if (!valid.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 text-xs shadow-2xl min-w-[170px]">
      <div className="text-gray-500 font-bold mb-2">{label}</div>
      {valid.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-gray-300">{ZONE_LABELS[p.dataKey as Zone]}</span>
          </div>
          <span className="text-white font-bold">{p.value}°C</span>
        </div>
      ))}
    </div>
  );
};

export function MultiZoneChart() {
  const [selected, setSelected] = useState<Zone[]>(["centre_ville", "rural_est"]);
  const [histories, setHistories] = useState<Partial<Record<Zone, HistoryResponse>>>({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      selected.map((z) => fetchHistory(z).then((h) => [z, h] as [Zone, HistoryResponse]))
    ).then((results) => {
      const map: Partial<Record<Zone, HistoryResponse>> = {};
      results.forEach(([z, h]) => { map[z] = h; });
      setHistories(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selected]);

  const years = Array.from({ length: 25 }, (_, i) => 2000 + i);
  const merged = years.map((year) => {
    const row: Record<string, number | null | string> = { year };
    selected.forEach((z) => {
      const pt = histories[z]?.data.find((d) => d.year === year);
      row[z] = pt?.lst_day ?? null;
    });
    return row;
  });

  const toggleZone = (z: Zone) => {
    if (selected.includes(z)) {
      if (selected.length > 1) setSelected(selected.filter((s) => s !== z));
    } else if (selected.length < 4) {
      setSelected([...selected, z]);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Zone selector — clear toggle buttons */}
      <div>
        <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
          Select zones to compare <span className="text-gray-700 normal-case">(click to add/remove · max 4)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ZONES.map((z) => {
            const selIdx = selected.indexOf(z);
            const isSelected = selIdx !== -1;
            const color = PALETTE[selIdx];
            return (
              <button
                key={z}
                onClick={() => toggleZone(z)}
                disabled={!isSelected && selected.length >= 4}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                style={isSelected
                  ? { borderColor: color, background: `${color}18`, color }
                  : { borderColor: "rgba(255,255,255,0.1)", color: "#6b7280" }
                }
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                )}
                {ZONE_LABELS[z]}
                {isSelected && <span className="text-[9px] opacity-60 ml-0.5">✕</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active legend */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {selected.map((z, i) => (
            <div key={z} className="flex items-center gap-2 text-xs">
              <div className="w-6 h-0.5 rounded-full" style={{ background: PALETTE[i] }} />
              <span style={{ color: PALETTE[i] }} className="font-semibold">{ZONE_LABELS[z]}</span>
              {histories[z] && (
                <span className="text-gray-600">
                  +{histories[z]!.trend_per_decade.toFixed(2)}°C/decade
                </span>
              )}
            </div>
          ))}
          <span className="text-gray-700 text-[10px] ml-auto italic">Day LST · MODIS 2000–2024</span>
        </div>
      )}

      {loading && <div className="text-center text-gray-600 text-sm py-8">Loading…</div>}

      {!loading && (
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={merged} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="year" tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false}
              interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false} axisLine={false}
              unit="°" width={32} />
            <Tooltip content={<CustomTooltip />} />
            {/* 2003 heatwave marker */}
            <ReferenceLine x={2003} stroke="#ef444430" strokeWidth={8}
              label={{ value: "2003", position: "top", fill: "#ef4444", fontSize: 9 }} />
            {selected.map((z, i) => (
              <Line
                key={z}
                dataKey={z}
                stroke={PALETTE[i]}
                strokeWidth={2.5}
                dot={false}
                connectNulls
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
