import type { QuartierFeature } from "../../types";

interface Props {
  quartiers: QuartierFeature[];
  onSelect: (q: QuartierFeature) => void;
  selected: string | null;
}

function uhiColor(score: number) {
  if (score > 0.7) return "#ef4444";
  if (score > 0.5) return "#f97316";
  if (score > 0.3) return "#f59e0b";
  return "#22c55e";
}

export function RankingChart({ quartiers, onSelect, selected }: Props) {
  const sorted = [...quartiers]
    .sort((a, b) => b.properties.uhi_score - a.properties.uhi_score);

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((q, i) => {
        const score = q.properties.uhi_score;
        const color = uhiColor(score);
        const isSelected = selected === q.properties.NOM_QUA;

        return (
          <button
            key={q.properties.NOM_QUA}
            onClick={() => onSelect(q)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
              ${isSelected ? "bg-[#1f2937]" : "hover:bg-[#1a2030]"}`}
          >
            <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-gray-200 text-sm font-medium truncate">{q.properties.NOM_QUA}</div>
              <div className="relative h-1.5 bg-[#1f2937] rounded mt-1">
                <div
                  className="absolute h-full rounded"
                  style={{ width: `${score * 100}%`, background: color }}
                />
              </div>
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color }}>
              {(score * 100).toFixed(0)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
