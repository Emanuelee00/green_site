/**
 * GenericOrb — placeholder 3D per route non ancora modellate.
 * Sfera con anello orbitale colorata in base al badge.
 * Sostituire con un orb dedicato aggiungendo la cartella e aggiornando ORB_MAP.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GenericOrbProps {
  isActive: boolean;
  onTap?: () => void;
  color?: string;
}

export function GenericOrb({ isActive, onTap, color = "#22c55e" }: GenericOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta;
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t.current * 0.8) * 0.12;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
      ringRef.current.position.y = Math.sin(t.current * 0.8) * 0.12;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.9 + Math.sin(t.current * 1.4) * 0.1);
      glowRef.current.position.y = Math.sin(t.current * 0.8) * 0.12;
    }
  });

  const targetScale = isActive ? 1.0 : 0.55;

  return (
    <group scale={targetScale} onClick={onTap}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={isActive ? 0.18 : 0.06}
          transparent opacity={isActive ? 0.12 : 0.05}
          depthWrite={false} side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={isActive ? 0.55 : 0.2}
          metalness={0.3} roughness={0.35}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.55, isActive ? 0.055 : 0.035, 16, 80]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={isActive ? 0.9 : 0.3}
          metalness={0.6} roughness={0.2}
        />
      </mesh>
    </group>
  );
}
