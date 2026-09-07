import { useMemo } from "react";
import * as THREE from "three";
import { addWestWall } from "./WestWall";
import { addEastWall } from "./EastWall";
import { addStrata } from "./Strata";
import { addCaves } from "./Caves";
import { addRidges } from "./Ridges";
import type { Cloud } from "../shared";

export function Cliffs({ circleTex }: { circleTex: THREE.Texture }) {
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addWestWall(cloud); addEastWall(cloud); addStrata(cloud); addCaves(cloud); addRidges(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.06} vertexColors transparent depthWrite={false} /></points>;
}
