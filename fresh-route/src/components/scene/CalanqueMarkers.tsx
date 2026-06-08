import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CALANQUES, toScene } from "../../data/calanques";
import type { Calanque } from "../../data/calanques";

const DIFF_COLOR: Record<string, string> = {
  easy:   "#22c55e",
  medium: "#f59e0b",
  hard:   "#ef4444",
};

// ── Single pulsing marker ─────────────────────────────────────────────────────
function Marker({
  calanque, selected, onClick,
}: {
  calanque: Calanque;
  selected: boolean;
  onClick: (c: Calanque) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [sx, sz] = toScene(calanque.lat, calanque.lon);

  const color = DIFF_COLOR[calanque.difficulty];

  useFrame(({ clock }) => {
    if (!meshRef.current || !ringRef.current) return;
    const t = clock.getElapsedTime();
    // Bob up/down
    meshRef.current.position.y = 0.3 + Math.sin(t * 1.5 + sx) * 0.08;
    // Pulse ring
    const pulse = 1 + Math.sin(t * 2) * 0.15;
    ringRef.current.scale.set(pulse, pulse, pulse);
    ringRef.current.rotation.y = t * 0.5;
  });

  return (
    <group position={[sx, 0, sz]}>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.22, 0.28, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.9 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Sphere marker */}
      <mesh
        ref={meshRef}
        position={[0, 0.3, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(calanque); }}
      >
        <sphereGeometry args={[hovered || selected ? 0.2 : 0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.8 : hovered ? 0.5 : 0.2}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

// ── Route line between Vieux-Port and selected calanque ───────────────────────
function RouteLine({ from, to }: { from: [number, number]; to: [number, number] }) {
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from[0] + (to[0] - from[0]) * t;
    const z = from[1] + (to[1] - from[1]) * t;
    const arc = Math.sin(t * Math.PI) * 0.6; // arc height
    points.push(new THREE.Vector3(x, 0.2 + arc, z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line>
      <primitive object={geo} attach="geometry" />
      <lineBasicMaterial color="#22c55e" linewidth={3} />
    </line>
  );
}

// ── All markers + route line ──────────────────────────────────────────────────
interface Props {
  selectedId: string | null;
  onSelect: (c: Calanque) => void;
}

const VIEUX_PORT = toScene(43.2951, 5.3749);

export function CalanqueMarkers({ selectedId, onSelect }: Props) {
  const selected = CALANQUES.find((c) => c.id === selectedId);

  return (
    <>
      {/* Vieux-Port origin marker */}
      <mesh position={[VIEUX_PORT[0], 0.25, VIEUX_PORT[1]]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#00b4d8" emissive="#00b4d8" emissiveIntensity={0.6} />
      </mesh>

      {/* Route arc to selected calanque */}
      {selected && (
        <RouteLine
          from={VIEUX_PORT}
          to={toScene(selected.lat, selected.lon)}
        />
      )}

      {/* Calanque markers */}
      {CALANQUES.map((c) => (
        <Marker
          key={c.id}
          calanque={c}
          selected={selectedId === c.id}
          onClick={onSelect}
        />
      ))}
    </>
  );
}
