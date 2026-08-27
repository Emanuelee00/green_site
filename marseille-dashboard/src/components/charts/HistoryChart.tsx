import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area,
} from "recharts";
import type { HistoryResponse } from "../../types";

interface Props { history: HistoryResponse }

// Linear regression to draw trend line
function trendLine(data: { year: number; day: number }[]) {
  const n = data.length;
  if (n < 2) return [];
  const sumX  = data.reduce((s, d) => s + d.year, 0);
  const sumY  = data.reduce((s, d) => s + d.day, 0);
  const sumXY = data.reduce((s, d) => s + d.year * d.day, 0);
  const sumX2 = data.reduce((s, d) => s + d.year ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;
  return data.map((d) => ({ year: d.year, trend: parseFloat((slope * d.year + intercept).toFixed(2)) }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
      <div className="text-white font-bold mb-2">{label}</div>
      {payload.map((p: any) => p.name !== "trend" && (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name === "day" ? "☀️ Day" : "🌙 Night"}</span>
          <span className="text-white font-semibold">{p.value}°C</span>
        </div>
      ))}
      {payload.find((p: any) => p.name === "trend") && (
        <div className="flex justify-between gap-4 mt-1 border-t border-white/10 pt-1">
          <span className="text-gray-500">Trend</span>
          <span className="text-white font-semibold">{payload.find((p: any) => p.name === "trend")?.value}°C</span>
        </div>
      )}
    </div>
  );
};

export function HistoryChart({ history }: Props) {
  const raw = history.data.filter((d) => d.lst_day !== null);
  const data = raw.map((d) => ({
    year: d.year,
    day:   parseFloat((d.lst_day  as number).toFixed(1)),
    night: d.lst_night !== null ? parseFloat((d.lst_night as number).toFixed(1)) : null,
  }));

  const trend = trendLine(data);
  const merged = data.map((d) => ({
    ...d,
    trend: trend.find((t) => t.year === d.year)?.trend,
  }));

  const trendVal = history.trend_per_decade;
  const trendUp  = trendVal > 0;
  const yValues  = data.map((d) => d.day);
  const yMin     = Math.floor(Math.min(...yValues)) - 1;
  const yMax     = Math.ceil(Math.max(...yValues))  + 1;
  const avg      = yValues.reduce((a, b) => a + b, 0) / yValues.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Annual avg (day)", value: `${avg.toFixed(1)}°C`,  color: "#f59e0b" },
          { label: "Trend / decade",   value: `${trendUp ? "+" : ""}${trendVal.toFixed(2)}°C`,
            color: trendUp ? "#ef4444" : "#22c55e" },
          { label: "Period",           value: "2000 – 2024", color: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider">{s.label}</div>
            <div className="text-base font-black mt-0.5" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#f59e0b] rounded" />☀️ Day LST</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#60a5fa] rounded opacity-60" style={{ borderTop: "1px dashed #60a5fa" }} />🌙 Night LST</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: trendUp ? "#ef4444" : "#22c55e" }} />↗ Trend</div>
        <span className="ml-auto text-gray-700 italic">Hover for values</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={merged} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="year" tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false}
            interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false} axisLine={false}
            unit="°" domain={[yMin, yMax]} width={30} />
          <Tooltip content={<CustomTooltip />} />

          {/* City average reference */}
          <ReferenceLine y={avg} stroke="#ffffff15" strokeDasharray="6 3"
            label={{ value: `avg ${avg.toFixed(1)}°`, position: "right", fill: "#4b5563", fontSize: 9 }} />
          {/* 2003 heatwave */}
          <ReferenceLine x={2003} stroke="#ef444430" strokeWidth={8}
            label={{ value: "2003", position: "top", fill: "#ef4444", fontSize: 9 }} />

          <Area dataKey="day" stroke="none" fill="url(#dayGrad)" />
          <Line dataKey="day"   stroke="#f59e0b" strokeWidth={2}   dot={false} name="day" />
          <Line dataKey="night" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="night" strokeDasharray="4 2" strokeOpacity={0.7} />
          <Line dataKey="trend" stroke={trendUp ? "#ef4444" : "#22c55e"} strokeWidth={1.5}
            dot={false} name="trend" strokeDasharray="6 3" strokeOpacity={0.85} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
