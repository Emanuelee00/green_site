import { useState } from "react";
import type { AllZonesHistory } from "../../types";

const YEARS = Array.from({ length: 25 }, (_, i) => 2000 + i);

const ZONE_LABELS: Record<string, string> = {
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

const ZONES = Object.keys(ZONE_LABELS);

function anomalyColor(norm: number): string {
  const t = Math.max(0, Math.min(1, (norm + 1) / 2));
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(59  + (255 - 59)  * s);
    g = Math.round(130 + (255 - 130) * s);
    b = Math.round(246 + (255 - 246) * s);
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(255 + (239 - 255) * s);
    g = Math.round(255 + (68  - 255) * s);
    b = Math.round(255 + (68  - 255) * s);
  }
  return `rgb(${r},${g},${b})`;
}

// A zone has no usable data if all its anomaly_norm values are ~0
function zoneHasData(data: AllZonesHistory, zone: string): boolean {
  const vals = YEARS.map((y) => Math.abs(data[zone]?.[y]?.anomaly_norm ?? 0));
  return vals.some((v) => v > 0.01);
}

interface Props { data: AllZonesHistory }

export function AnomalyMatrix({ data }: Props) {
  const [hovered, setHovered] = useState<{ zone: string; year: number } | null>(null);

  const hoveredVal = hovered ? data[hovered.zone]?.[hovered.year] : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Hover info bar */}
      <div className="h-7 flex items-center gap-3 text-xs">
        {hovered && hoveredVal ? (
          <>
            <span className="text-white font-bold">{ZONE_LABELS[hovered.zone]} · {hovered.year}</span>
            <span className="text-gray-500">
              LST <span className="text-white font-semibold">
                {hoveredVal.lst != null ? `${hoveredVal.lst.toFixed(1)}°C` : "—"}
              </span>
            </span>
            <span className={`font-semibold ${hoveredVal.anomaly > 0 ? "text-red-400" : "text-blue-400"}`}>
              {hoveredVal.anomaly > 0 ? "▲" : "▼"} {Math.abs(hoveredVal.anomaly).toFixed(2)}°C vs baseline
            </span>
          </>
        ) : (
          <span className="text-gray-600 italic text-[11px]">Hover a cell to see exact LST and anomaly</span>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 640 }}>
          {/* Year labels */}
          <div className="flex mb-1" style={{ paddingLeft: 92 }}>
            {YEARS.map((y) => (
              <div key={y} className="flex-1 text-center text-[9px] text-gray-700 font-mono">
                {y % 5 === 0 ? y : ""}
              </div>
            ))}
          </div>

          {/* Rows */}
          {ZONES.map((zone) => {
            const hasData = zoneHasData(data, zone);
            return (
              <div key={zone} className="flex items-center mb-0.5 gap-1">
                <div className="text-[10px] text-right shrink-0 flex items-center justify-end gap-1.5" style={{ width: 88 }}>
                  {!hasData && (
                    <span className="text-[8px] text-gray-700 border border-white/10 rounded px-1">N/D</span>
                  )}
                  <span className={hasData ? "text-gray-400" : "text-gray-700"}>{ZONE_LABELS[zone]}</span>
                </div>
                <div className="flex flex-1 gap-px">
                  {YEARS.map((y) => {
                    const v = data[zone]?.[y];
                    const norm = v?.anomaly_norm ?? 0;
                    const isHovered = hovered?.zone === zone && hovered?.year === y;
                    return (
                      <div
                        key={y}
                        className="flex-1 rounded-[2px] cursor-default transition-all duration-75"
                        style={{
                          height: 22,
                          background: !hasData
                            ? "repeating-linear-gradient(45deg,#1a1a2e,#1a1a2e 2px,#1f2937 2px,#1f2937 4px)"
                            : (v ? anomalyColor(norm) : "#1f2937"),
                          outline: isHovered ? "2px solid rgba(255,255,255,0.8)" : "none",
                          outlineOffset: -1,
                        }}
                        onMouseEnter={() => hasData && setHovered({ zone, year: y })}
                        onMouseLeave={() => setHovered(null)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm"
                style={{ background: "repeating-linear-gradient(45deg,#1a1a2e,#1a1a2e 2px,#1f2937 2px,#1f2937 4px)" }} />
              <span>No data</span>
            </div>
            <div className="flex-1" />
            <span>Cooler ←</span>
            <div className="h-2 w-28 rounded-full"
              style={{ background: "linear-gradient(90deg, rgb(59,130,246), white, rgb(239,68,68))" }} />
            <span>→ Hotter</span>
            <span className="text-gray-700 ml-1">vs 2000–2010 baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
