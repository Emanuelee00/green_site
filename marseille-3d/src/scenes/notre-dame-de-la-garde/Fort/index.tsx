import { useMemo } from "react";
import * as THREE from "three";
import { addRamparts } from "./Ramparts";
import { addTowers } from "./Towers";
import { addSteps } from "./Steps";
import type { Cloud } from "../geometry";

export function Fort({ texture }: { texture: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addRamparts(cloud); addTowers(cloud); addSteps(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);

  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={texture} alphaTest={0.1} size={0.06} vertexColors transparent depthWrite={false} /></points>;
}
