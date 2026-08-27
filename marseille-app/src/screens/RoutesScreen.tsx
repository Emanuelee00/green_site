import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRoute } from "../api/engine";
import { DEMO_ROUTES, type DemoRoute } from "../data/demoRoutes";
import type { RouteResponse } from "../types";

const BADGE = {
  cool: { color: "#22c55e", bg: "#052e16", label: "🌿 Fresh",   bar: "#22c55e" },
  warm: { color: "#f59e0b", bg: "#2d1a04", label: "☀️ Warm",    bar: "#f59e0b" },
  hot:  { color: "#ef4444", bg: "#2d0707", label: "🔥 Hot zone", bar: "#ef4444" },
};

interface Props {
  onBack: () => void;
  onRouteDetail: (route: RouteResponse, name: string) => void;
}

export default function RoutesScreen({ onBack, onRouteDetail }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoute = async (demo: DemoRoute) => {
    setLoading(demo.id);
    try {
      const route = await fetchRoute(demo.from.lat, demo.from.lon, demo.to.lat, demo.to.lon);
      onRouteDetail(route, demo.name);
    } catch {
      // Offline fallback
      const mock: RouteResponse = {
        geometry: { type: "LineString", coordinates: [] },
        distance_m: parseFloat(demo.distance) * 1000,
        uhi_avg: 1 - demo.freshScore,
        fresh_score: demo.freshScore,
        label: demo.badge,
        took_s: 0,
      };
      onRouteDetail(mock, demo.name);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ background: "#0d1f0f", minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "52px 24px 20px", position: "sticky", top: 0, background: "#0d1f0f", zIndex: 10 }}>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back
        </motion.button>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1 }}
        >
          Popular routes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}
        >
          Tap a route to calculate the freshest path
        </motion.p>
      </div>

      {/* Cards */}
      <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <AnimatePresence>
          {DEMO_ROUTES.map((demo, i) => {
            const b = BADGE[demo.badge];
            const isLoading = loading === demo.id;

            return (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleRoute(demo)}
                style={{
                  background: "linear-gradient(135deg, #1a3a2a 0%, #0d2018 100%)",
                  borderRadius: 20,
                  border: "1px solid #2a3a2a",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {/* Gradient accent top */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${b.color}, transparent)`,
                }} />

                <div style={{ padding: "20px 20px 16px" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{
                      background: b.bg, color: b.color, border: `1px solid ${b.color}`,
                      borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700,
                    }}>
                      {b.label}
                    </span>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{demo.distance}</span>
                  </div>

                  {/* Route name */}
                  <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                    {demo.name}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
                    {demo.description}
                  </p>

                  {/* Fresh score bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#475569", fontSize: 12 }}>Fresh score</span>
                      <span style={{ color: b.color, fontSize: 12, fontWeight: 700 }}>
                        {Math.round(demo.freshScore * 100)}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#1e3a2a", borderRadius: 3, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${demo.freshScore * 100}%` }}
                        transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", background: b.bar, borderRadius: 3 }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {demo.highlights.map((h) => (
                      <span key={h} style={{
                        background: "#0d2018", color: "#475569", border: "1px solid #1e3a2a",
                        borderRadius: 20, padding: "3px 10px", fontSize: 11,
                      }}>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 20,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: `3px solid ${b.color}`,
                      borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                    }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
