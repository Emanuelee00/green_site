import { useMemo } from "react";
import * as THREE from "three";
import { addSlope } from "./Slope";
import type { Cloud } from "../geometry";

export function Hill({ texture }: { texture: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addSlope(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);

  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={texture} alphaTest={0.1} size={0.055} vertexColors transparent opacity={0.82} depthWrite={false} /></points>;
}
