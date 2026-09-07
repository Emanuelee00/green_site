import { useMemo } from "react";
import * as THREE from "three";
import { addWalls } from "./Walls";
import { addButtresses } from "./Buttresses";
import { addWindows } from "./Windows";
import { addDome } from "./Dome";
import type { Cloud } from "../geometry";

export function Basilica({ texture }: { texture: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addWalls(cloud); addButtresses(cloud); addWindows(cloud); addDome(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);

  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={texture} alphaTest={0.1} size={0.052} vertexColors transparent depthWrite={false} /></points>;
}
