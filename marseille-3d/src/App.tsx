import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Stars, Html } from "@react-three/drei";
import DemoBanner from "./components/DemoBanner";

import { VieuxPortOrb } from "./scenes/vieux-port";
import { NotreDameDeLaGardeOrb } from "./scenes/notre-dame-de-la-garde";
import { CalanquesOrb } from "./scenes/calanques";
import { CornicheOrb } from "./scenes/corniche";

type SceneKey = "vieux-port" | "notre-dame" | "calanques" | "corniche";

const SCENES: { key: SceneKey; label: string; Orb: React.ComponentType<{ isActive: boolean }> }[] = [
  { key: "vieux-port", label: "Vieux-Port", Orb: VieuxPortOrb },
  { key: "notre-dame", label: "Notre-Dame de la Garde", Orb: NotreDameDeLaGardeOrb },
  { key: "calanques", label: "Calanques", Orb: CalanquesOrb },
  { key: "corniche", label: "Corniche", Orb: CornicheOrb },
];

export default function App() {
  const [active, setActive] = useState<SceneKey>("vieux-port");
  const current = SCENES.find((s) => s.key === active)!;
  const Orb = current.Orb;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#0a1628"]} />
        <fog attach="fog" args={["#0a1628", 16, 40]} />

        <ambientLight intensity={0.6} color="#ffe6c4" />
        <directionalLight position={[6, 9, 4]} intensity={1.8} color="#ffd9a0" />
        <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#9cc7ff" />
        <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.4} />

        <Suspense
          fallback={
            <Html center style={{ color: "#94a3b8", font: "13px Inter, sans-serif" }}>
              Loading…
            </Html>
          }
        >
          <Bounds key={active} fit clip observe margin={1.25}>
            <Orb isActive />
          </Bounds>
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={3}
          maxDistance={22}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.05}
          rotateSpeed={0.6}
        />
      </Canvas>

      {/* Title */}
      <div style={{ position: "fixed", top: 18, left: 20, zIndex: 20, pointerEvents: "none" }}>
        <p
          style={{
            color: "#00b4d8",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 3,
            marginBottom: 4,
          }}
        >
          MARSEILLE · FRESH ROUTE
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: 26,
            color: "#f1f5f9",
            lineHeight: 1.1,
          }}
        >
          {current.label}
        </h1>
      </div>

      {/* Scene switcher */}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 16,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "flex-end",
        }}
      >
        {SCENES.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "1px solid",
              borderColor: s.key === active ? "#22c55e" : "#2a3a2a",
              background: s.key === active ? "rgba(34,197,94,0.18)" : "rgba(10,22,40,0.6)",
              color: s.key === active ? "#86efac" : "#94a3b8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p
        style={{
          position: "fixed",
          bottom: 68,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          color: "#475569",
          fontSize: 11,
          pointerEvents: "none",
        }}
      >
        drag to orbit · scroll to zoom
      </p>

      <DemoBanner />
    </div>
  );
}
