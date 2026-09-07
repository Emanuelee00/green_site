import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { addSurface } from "./Surface";
import { addDepth } from "./Depth";
import { addReflections } from "./Reflections";
import { addFoam } from "./Foam";
import { addRipples } from "./Ripples";
import type { Cloud } from "../shared";

export function CalanqueWater({ circleTex }: { circleTex: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null!);
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addSurface(cloud); addDepth(cloud); addReflections(cloud); addFoam(cloud); addRipples(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.018;
  });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.045} vertexColors transparent opacity={0.9} depthWrite={false} /></points>;
}
