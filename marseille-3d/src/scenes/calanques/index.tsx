import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CalanqueWater } from "./Water";
import { Cliffs } from "./Cliffs";
import { Pines } from "./Pines";
import { Shore } from "./Shore";
import { Details } from "./Details";
import { makeCircleTexture } from "./shared";

interface Props { isActive: boolean; onTap?: () => void; color?: string }

export function CalanquesOrb({ isActive, onTap }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const scaleRef = useRef(isActive ? 0.64 : 0.35);
  const circleTex = useMemo(makeCircleTexture, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (isActive ? 0.08 : 0.045);
    const target = isActive ? 0.64 : 0.35;
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 5);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef} rotation={[0.32, -0.2, 0]} position={[0, -0.25, 0]} onClick={onTap}>
      <CalanqueWater circleTex={circleTex} />
      <Cliffs circleTex={circleTex} />
      <Pines circleTex={circleTex} />
      <Shore circleTex={circleTex} />
      <Details circleTex={circleTex} />
    </group>
  );
}
