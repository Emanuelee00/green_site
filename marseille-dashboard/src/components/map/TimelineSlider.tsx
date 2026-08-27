
interface Props {
  year: number;
  onChange: (year: number) => void;
  loading: boolean;
}

const KEY_YEARS: Record<number, string> = {
  2003: "Heatwave",
  2010: "Baseline end",
  2015: "Record summer",
  2023: "Latest data",
};

export function TimelineSlider({ year, onChange, loading }: Props) {
  const MIN = 2000, MAX = 2024;
  const pct = ((year - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider">Timeline</span>
        <div className="flex items-center gap-2">
          {loading && <div className="w-3 h-3 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />}
          <span className="text-white font-black text-lg tabular-nums">{year}</span>
          {KEY_YEARS[year] && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-semibold">
              {KEY_YEARS[year]}
            </span>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div className="relative h-8 flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/5" />
        {/* Fill */}
        <div className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 transition-all duration-150"
          style={{ width: `${pct}%` }} />

        {/* Key year markers */}
        {Object.keys(KEY_YEARS).map((y) => {
          const p = ((+y - MIN) / (MAX - MIN)) * 100;
          return (
            <div key={y} className="absolute flex flex-col items-center"
              style={{ left: `${p}%`, transform: "translateX(-50%)" }}>
              <div className="w-0.5 h-2 bg-white/20 rounded-full" />
            </div>
          );
        })}

        {/* Thumb */}
        <input
          type="range" min={MIN} max={MAX} value={year}
          onChange={(e) => onChange(+e.target.value)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-8"
          style={{ zIndex: 10 }}
        />
        <div className="absolute w-4 h-4 rounded-full bg-white shadow-lg shadow-black/50 border-2 border-green-400 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>

      {/* Year labels */}
      <div className="flex justify-between text-[10px] text-gray-700">
        <span>{MIN}</span>
        {[2005, 2010, 2015, 2020].map((y) => <span key={y}>{y}</span>)}
        <span>{MAX}</span>
      </div>
    </div>
  );
}
