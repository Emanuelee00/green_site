import { useMemo } from "react";
import * as THREE from "three";
import { addShaft } from "./Shaft";
import { addBands } from "./Bands";
import { addBelfry } from "./Belfry";
import { addSpire } from "./Spire";
import type { Cloud } from "../geometry";

export function BellTower({ texture }: { texture: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addShaft(cloud); addBands(cloud); addBelfry(cloud); addSpire(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);

  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={texture} alphaTest={0.1} size={0.052} vertexColors transparent depthWrite={false} /></points>;
}
