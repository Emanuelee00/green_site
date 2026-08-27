import { useMemo } from "react";
import * as THREE from "three";
import { addSand } from "./Sand";
import { addPebbles } from "./Pebbles";
import { addWaterline } from "./Waterline";
import { addDriftwood } from "./Driftwood";
import { addPath } from "./Path";
import type { Cloud } from "../shared";

export function Shore({ circleTex }: { circleTex: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addSand(cloud); addPebbles(cloud); addWaterline(cloud); addDriftwood(cloud); addPath(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.052} vertexColors transparent depthWrite={false} /></points>;
}
