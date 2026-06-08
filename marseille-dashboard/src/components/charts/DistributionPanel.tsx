import type { QuartierFeature } from "../../types";

interface Props {
  selected: QuartierFeature;
  all: QuartierFeature[];
}

export function DistributionPanel({ selected, all }: Props) {
  const scores = all.map((f) => f.properties.uhi_score).sort((a, b) => a - b);
  const sel    = selected.properties.uhi_score;
  const arrondissement = selected.properties.NOM_CO;

  // Build histogram: 20 buckets 0→1
  const N_BINS = 20;
  const bins = Array.from({ length: N_BINS }, (_, i) => ({
    lo: i / N_BINS, hi: (i + 1) / N_BINS, count: 0,
  }));
  scores.forEach((s) => {
    const idx = Math.min(Math.floor(s * N_BINS), N_BINS - 1);
    bins[idx].count++;
  });
  const maxCount = Math.max(...bins.map((b) => b.count));
  const selBin   = Math.min(Math.floor(sel * N_BINS), N_BINS - 1);

  // Arrondissement peers
  const peers = all.filter((f) => f.properties.NOM_CO === arrondissement);
  const peerAvg = peers.reduce((s, f) => s + f.properties.uhi_score, 0) / peers.length;
  const cityAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

  function binColor(lo: number) {
    if (lo > 0.65) return "#ef4444";
    if (lo > 0.5)  return "#f97316";
    if (lo > 0.35) return "#f59e0b";
    return "#22c55e";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[10px] text-gray-600 uppercase tracking-wider">City distribution</div>

      {/* Histogram */}
      <div>
        <div className="flex items-end gap-0.5 h-16">
          {bins.map((bin, i) => {
            const isSelected = i === selBin;
            const h = Math.max(4, (bin.count / maxCount) * 56);
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{
                    height: h,
                    background: isSelected ? "#fff" : binColor(bin.lo),
                    opacity: isSelected ? 1 : 0.45,
                    boxShadow: isSelected ? `0 0 8px #fff8` : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-gray-700 mt-1 px-0.5">
          <span>0% Cool</span>
          <span className="text-white text-[10px] font-bold">
            ↑ {selected.properties.NOM_QUA} ({(sel * 100).toFixed(0)}%)
          </span>
          <span>100% Hot</span>
        </div>
      </div>

      {/* Comparison table */}
      <div className="flex flex-col gap-1.5">
        {[
          { label: "This district",     value: sel,      highlight: true },
          { label: `${arrondissement} avg (${peers.length} districts)`, value: peerAvg, highlight: false },
          { label: "City average",      value: cityAvg,  highlight: false },
        ].map((row) => {
          const color = row.value > 0.65 ? "#ef4444" : row.value > 0.35 ? "#f59e0b" : "#22c55e";
          const diff  = row.highlight ? null : ((row.value - sel) * 100).toFixed(1);
          return (
            <div key={row.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${row.highlight ? "bg-white/[0.06] border border-white/10" : "bg-white/[0.02]"}`}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className={`text-xs flex-1 ${row.highlight ? "text-white font-semibold" : "text-gray-500"}`}>{row.label}</span>
              <span className="text-xs font-bold" style={{ color }}>{(row.value * 100).toFixed(1)}%</span>
              {diff !== null && (
                <span className={`text-[10px] font-semibold ${parseFloat(diff) > 0 ? "text-red-400" : "text-green-400"}`}>
                  {parseFloat(diff) > 0 ? `+${diff}%` : `${diff}%`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
