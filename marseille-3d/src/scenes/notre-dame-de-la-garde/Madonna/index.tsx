import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { addRobe } from "./Robe";
import { addHead } from "./Head";
import { addArms } from "./Arms";
import { addChild } from "./Child";
import { addHalo } from "./Halo";
import type { Cloud } from "../geometry";

export function Madonna({ texture }: { texture: THREE.Texture }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addRobe(cloud); addHead(cloud); addArms(cloud); addChild(cloud); addHalo(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.88 + Math.sin(clock.elapsedTime * 1.4) * 0.1;
  });
  return <points ref={pointsRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={texture} alphaTest={0.1} size={0.06} vertexColors transparent depthWrite={false} /></points>;
}
