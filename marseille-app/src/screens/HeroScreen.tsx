import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

const CalanqueScene = lazy(() => import("../components/CalanqueScene"));

interface Props {
  onExplore: () => void;
}

export default function HeroScreen({ onExplore }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "#0a1628" }}>

      {/* 3D Scene — full background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full" style={{ background: "#0a1628" }} />}>
          <CalanqueScene />
        </Suspense>
      </div>

      {/* Gradient overlay — bottom fade to content */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #0d1f0f 70%, #0d1f0f 100%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ color: "#00b4d8", fontFamily: "Inter", fontWeight: 700, fontSize: 13, letterSpacing: 3 }}
        >
          MARSEILLE
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span style={{ color: "#94a3b8", fontSize: 12 }}>Live data</span>
        </motion.div>
      </div>

      {/* Hero text + CTA — bottom */}
      <div className="relative z-10 mt-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p style={{ color: "#e9c46a", fontFamily: "Inter", fontWeight: 600, fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>
            BEAT THE HEAT
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: 48,
            lineHeight: 1.05,
            color: "#f1f5f9",
            marginBottom: 16,
          }}>
            Find your<br />
            <span style={{ color: "#22c55e" }}>coolest</span><br />
            route
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginBottom: 36, maxWidth: 280 }}>
            AI-powered pedestrian routing that minimises heat exposure in Marseille.
          </p>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onExplore}
            style={{
              width: "100%",
              padding: "17px 0",
              borderRadius: 16,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.35)",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Explore routes</span>
            <span style={{ color: "#86efac", fontSize: 20 }}>→</span>
          </motion.button>

          <button
            onClick={onExplore}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "15px 0",
              borderRadius: 16,
              background: "transparent",
              border: "1.5px solid #2a2d3a",
              cursor: "pointer",
              color: "#94a3b8",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            View heat map
          </button>
        </motion.div>
      </div>
    </div>
  );
}
