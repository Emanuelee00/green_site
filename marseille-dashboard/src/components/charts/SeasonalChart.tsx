import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { HistoryPoint } from "../../types";

interface Props { data: HistoryPoint[] }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function barColor(temp: number, min: number, max: number) {
  const t = (temp - min) / (max - min);
  if (t > 0.75) return "#ef4444";
  if (t > 0.55) return "#f97316";
  if (t > 0.35) return "#f59e0b";
  if (t > 0.15) return "#86efac";
  return "#60a5fa";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const temp = payload[0]?.value;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
      <div className="text-white font-bold">{label}</div>
      <div className="text-gray-400 mt-1">Estimated avg: <span className="text-white font-semibold">{temp}°C</span></div>
    </div>
  );
};

export function SeasonalChart({ data }: Props) {
  const allValues = data.filter((d) => d.lst_day !== null).map((d) => d.lst_day as number);
  const avg = allValues.reduce((s, v) => s + v, 0) / allValues.length;

  const seasonal = MONTHS.map((name, i) => {
    // Mediterranean sine: peak in July (i=6), trough in January (i=0)
    const offset = Math.sin(((i - 1) / 11) * Math.PI * 1.5) * 8;
    return { name, temp: parseFloat((avg + offset).toFixed(1)) };
  });

  const temps = seasonal.map((s) => s.temp);
  const minT = Math.min(...temps), maxT = Math.max(...temps);
  const peakIdx = temps.indexOf(maxT);

  return (
    <div className="flex flex-col gap-3">
      {/* Mini stats */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="text-gray-500">Peak: <span className="text-white font-semibold">{MONTHS[peakIdx]} {maxT}°C</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#60a5fa]" />
          <span className="text-gray-500">Low: <span className="text-white font-semibold">{MONTHS[temps.indexOf(minT)]} {minT}°C</span></span>
        </div>
        <div className="ml-auto text-gray-700 italic">Estimated · Mediterranean profile</div>
      </div>

      <ResponsiveContainer width="100%" height={185}>
        <BarChart data={seasonal} margin={{ top: 16, right: 4, left: -10, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} tickLine={false} axisLine={false}
            unit="°" domain={[Math.floor(minT) - 2, Math.ceil(maxT) + 2]} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
          <ReferenceLine y={avg} stroke="#ffffff15" strokeDasharray="4 3"
            label={{ value: `${avg.toFixed(0)}° avg`, position: "right", fill: "#4b5563", fontSize: 9 }} />
          <Bar dataKey="temp" radius={[5, 5, 0, 0]}
            label={false}>
            {seasonal.map((s, i) => (
              <Cell key={i} fill={barColor(s.temp, minT, maxT)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
