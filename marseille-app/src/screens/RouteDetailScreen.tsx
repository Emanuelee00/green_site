import { motion } from "framer-motion";
import type { RouteResponse } from "../types";

const LABEL = {
  cool: { color: "#22c55e", bg: "#052e16", emoji: "🌿", text: "Fresh route", desc: "Low heat exposure — ideal for summer." },
  warm: { color: "#f59e0b", bg: "#2d1a04", emoji: "☀️", text: "Warm route",  desc: "Moderate heat — carry water." },
  hot:  { color: "#ef4444", bg: "#2d0707", emoji: "🔥", text: "Hot route",   desc: "High heat exposure — avoid midday." },
};

interface Props {
  route: RouteResponse;
  name: string;
  onBack: () => void;
}

export default function RouteDetailScreen({ route, name, onBack }: Props) {
  const lbl = LABEL[route.label ?? "warm"];
  const freshPct = Math.round((route.fresh_score ?? 0) * 100);
  const uhiPct   = Math.round((route.uhi_avg ?? 0) * 100);
  const distKm   = (route.distance_m / 1000).toFixed(2);
  const walkMin  = Math.round(route.distance_m / 80); // ~80m/min walk

  // Mini elevation profile (simulated from waypoints)
  const coords = route.geometry?.coordinates ?? [];
  const profilePoints = coords.length > 1
    ? coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 40)) === 0)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "#0d1f0f", minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Hero band */}
      <div style={{
        background: `linear-gradient(160deg, ${lbl.bg} 0%, #0d1f0f 100%)`,
        padding: "52px 24px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circle */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: lbl.color, opacity: 0.06,
        }} />

        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to routes
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span style={{
            background: lbl.bg, color: lbl.color, border: `1px solid ${lbl.color}`,
            borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700,
          }}>
            {lbl.emoji} {lbl.text}
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800,
            color: "#f1f5f9", marginTop: 14, lineHeight: 1.2,
          }}>
            {name}
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>{lbl.desc}</p>
        </motion.div>
      </div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, padding: "0 16px", marginTop: -8,
        }}
      >
        {[
          { label: "Distance",   value: `${distKm} km`,    sub: `~${walkMin} min walk` },
          { label: "Fresh score",value: `${freshPct}%`,    sub: "vs city avg",         color: lbl.color },
          { label: "Heat index", value: `${uhiPct}%`,      sub: "UHI exposure",        color: uhiPct > 60 ? "#ef4444" : uhiPct > 35 ? "#f59e0b" : "#22c55e" },
          { label: "Algorithm",  value: "A★",              sub: "green-weighted" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#1a3a2a", border: "1px solid #2a3a2a",
            borderRadius: 16, padding: "16px 14px",
          }}>
            <p style={{ color: "#475569", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</p>
            <p style={{ color: s.color ?? "#f1f5f9", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Fresh score bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: "20px 16px 0" }}
      >
        <div style={{
          background: "#1a3a2a", border: "1px solid #2a3a2a",
          borderRadius: 16, padding: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Heat exposure along route</span>
            <span style={{ color: lbl.color, fontSize: 13, fontWeight: 700 }}>{freshPct}% fresh</span>
          </div>
          <div style={{ height: 10, background: "#0d2018", borderRadius: 5, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freshPct}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${lbl.color}, #86efac)`, borderRadius: 5 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ color: "#475569", fontSize: 11 }}>🔥 Hot</span>
            <span style={{ color: "#475569", fontSize: 11 }}>🌿 Fresh</span>
          </div>
        </div>
      </motion.div>

      {/* Route preview / waypoints */}
      {profilePoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ padding: "14px 16px 0" }}
        >
          <div style={{
            background: "#1a3a2a", border: "1px solid #2a3a2a",
            borderRadius: 16, padding: 16,
          }}>
            <p style={{ color: "#475569", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Route path ({coords.length} points)</p>
            {/* Mini polyline preview */}
            <svg
              viewBox={`0 0 300 80`}
              style={{ width: "100%", height: 80, overflow: "visible" }}
            >
              <polyline
                points={profilePoints.map((c, _i) => {
                  const lons = profilePoints.map(p => p[0]);
                  const lats = profilePoints.map(p => p[1]);
                  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
                  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
                  const x = maxLon === minLon ? 150 : ((c[0] - minLon) / (maxLon - minLon)) * 280 + 10;
                  const y = maxLat === minLat ? 40  : 70 - ((c[1] - minLat) / (maxLat - minLat)) * 60;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke={lbl.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Start dot */}
              <circle cx={10} cy={70} r={4} fill="#22c55e" />
              {/* End dot */}
              <circle cx={290} cy={70} r={4} fill={lbl.color} />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "#475569", fontSize: 11 }}>Start</span>
              <span style={{ color: "#475569", fontSize: 11 }}>End</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <div style={{ padding: "20px 16px 40px", marginTop: "auto" }}>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", padding: "17px 0", borderRadius: 16,
            background: `linear-gradient(135deg, ${lbl.color}, #16a34a)`,
            border: "none", cursor: "pointer", color: "#fff",
            fontWeight: 700, fontSize: 17, letterSpacing: 0.3,
            boxShadow: `0 8px 24px ${lbl.color}44`,
          }}
        >
          Inizia Percorso →
        </motion.button>
        {route.took_s > 0 && (
          <p style={{ color: "#334155", fontSize: 11, textAlign: "center", marginTop: 10 }}>
            Calculated in {route.took_s}s using A★ algorithm
          </p>
        )}
      </div>
    </motion.div>
  );
}
