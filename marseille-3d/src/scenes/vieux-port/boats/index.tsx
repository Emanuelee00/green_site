import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { addHull } from "./Hull";
import { addDeck } from "./Deck";
import { addCabin } from "./Cabin";
import { addMast } from "./Mast";
import { addSails } from "./Sails";
import { addMooring } from "./Mooring";
import { BOATS } from "./layout";
import { boatPoint, boatShape } from "./shared";
import type { BoatCloud, BoatDef } from "./types";

function generateBoats(boats: BoatDef[]) {
  const cloud: BoatCloud = { points: [], colors: [] };
  for (const boat of boats) {
    const shape = boatShape(boat), add = boatPoint(boat, cloud);
    addHull(boat, shape, add);
    addDeck(shape, add);
    addCabin(boat, shape, add);
    addMast(shape, add);
    addSails(boat, shape, add);
    addMooring(shape, add);
  }
  return { positions: new Float32Array(cloud.points), colors: new Float32Array(cloud.colors) };
}

export function Boats({ circleTex, boats = BOATS }: { circleTex: THREE.Texture; boats?: BoatDef[] }) {
  const data = useMemo(() => generateBoats(boats), [boats]);
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.55) * 0.012;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.006;
    if (pointsRef.current) (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.9 + Math.sin(clock.elapsedTime * 2.2) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-color" args={[data.colors, 3]} /></bufferGeometry>
        <pointsMaterial map={circleTex} alphaTest={0.1} size={0.03} vertexColors transparent opacity={0.92} depthWrite={false} />
      </points>
    </group>
  );
}
