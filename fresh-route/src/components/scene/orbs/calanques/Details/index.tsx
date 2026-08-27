import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { addBuoys } from "./Buoys";
import { addCabanons } from "./Cabanons";
import { Boats } from "../../vieux-port/boats";
import { CALANQUES_BOATS } from "./boatsLayout";
import type { Cloud } from "../shared";

export function Details({ circleTex }: { circleTex: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null!);
  const data = useMemo(() => {
    const cloud: Cloud = { points: [], colors: [] };
    addBuoys(cloud); addCabanons(cloud);
    return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
  }, []);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.018; });
  return (
    <>
      <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.06} vertexColors transparent depthWrite={false} /></points>
      <Boats circleTex={circleTex} boats={CALANQUES_BOATS} />
    </>
  );
}
