import { useMemo } from "react";
import * as THREE from "three";
import { addTrunks } from "./Trunks";
import { addCrowns } from "./Crowns";
import { addShrubs } from "./Shrubs";
import { addHerbs } from "./Herbs";
import { addFlowers } from "./Flowers";
import type { Cloud } from "../shared";

export function Pines({ circleTex }: { circleTex: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addTrunks(cloud); addCrowns(cloud); addShrubs(cloud); addHerbs(cloud); addFlowers(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.065} vertexColors transparent depthWrite={false} /></points>;
}
