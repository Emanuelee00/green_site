import type { AllZonesHistory } from "../../types";

interface Props {
  year: number;
  onChange: (year: number) => void;
  loading: boolean;
  allHistory?: AllZonesHistory | null;
}

const KEY_YEARS: Record<number, { label: string; color: string }> = {
  2003: { label: "European heatwave",  color: "#ef4444" },
  2010: { label: "Baseline period end", color: "#94a3b8" },
  2015: { label: "Record summer",      color: "#f97316" },
  2019: { label: "2nd hottest year",   color: "#f59e0b" },
  2023: { label: "Latest satellite",   color: "#22c55e" },
};

// Data notes per year range
function dataNote(year: number): string {
  if (year < 2000) return "No data";
  if (year <= 2010) return "MODIS LST · Baseline period";
  if (year === 2023) return "MODIS LST + Sentinel-2 L2A raster · Aug 2023";
  if (year > 2023)  return "MODIS LST · Projected from trend";
  return "MODIS LST · Post-baseline anomaly";
}

// Compute city-wide mean anomaly for this year from all zones
function cityAnomaly(allHistory: AllZonesHistory, year: number): number | null {
  const zones = Object.keys(allHistory);
  const vals = zones
    .map((z) => allHistory[z]?.[year]?.anomaly)
    .filter((v): v is number => v != null && v !== 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function TimelineSlider({ year, onChange, loading, allHistory }: Props) {
  const MIN = 2000, MAX = 2024;
  const pct = ((year - MIN) / (MAX - MIN)) * 100;
  const keyInfo = KEY_YEARS[year];
  const anomaly = allHistory ? cityAnomaly(allHistory, year) : null;

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* Top row: label + year + badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">Timeline</span>
          {loading && (
            <div className="w-3 h-3 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {keyInfo && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{
                color: keyInfo.color,
                borderColor: `${keyInfo.color}44`,
                background: `${keyInfo.color}12`,
              }}>
              {keyInfo.label}
            </span>
          )}
          <span className="text-white font-black text-2xl tabular-nums leading-none">{year}</span>
        </div>
      </div>

      {/* Data source + anomaly line */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-700 italic">{dataNote(year)}</span>
        {anomaly != null && (
          <span className={`font-semibold tabular-nums ${anomaly > 0 ? "text-red-400" : "text-blue-400"}`}>
            {anomaly > 0 ? "▲ +" : "▼ "}{anomaly.toFixed(2)}°C city avg vs baseline
          </span>
        )}
      </div>

      {/* Slider track */}
      <div className="relative h-7 flex items-center mt-0.5">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/5" />
        <div
          className="absolute left-0 h-1.5 rounded-full transition-all duration-100"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #3b82f6, #facc15, #ef4444)",
          }}
        />

        {/* Key year tick marks */}
        {Object.keys(KEY_YEARS).map((y) => {
          const p = ((+y - MIN) / (MAX - MIN)) * 100;
          const c = KEY_YEARS[+y].color;
          return (
            <div key={y} className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: `${p}%`, transform: "translateX(-50%)" }}>
              <div className="w-0.5 h-3 rounded-full" style={{ background: `${c}60` }} />
            </div>
          );
        })}

        <input
          type="range" min={MIN} max={MAX} value={year}
          onChange={(e) => onChange(+e.target.value)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-7"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-lg shadow-black/50 border-2 border-green-400 pointer-events-none transition-all duration-100"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      {/* Year axis labels */}
      <div className="flex justify-between text-[9px] text-gray-700">
        <span>{MIN}</span>
        {[2005, 2010, 2015, 2020].map((y) => <span key={y}>{y}</span>)}
        <span>{MAX}</span>
      </div>
    </div>
  );
}
