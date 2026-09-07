import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sea } from "./Sea";
import { Coast } from "./Coast";
import { CornicheRoad } from "./Road";
import { Buildings } from "./Buildings";
import { Details } from "./Details";
import { makeCircleTexture } from "./shared";

interface Props { isActive: boolean; onTap?: () => void; color?: string }

export function CornicheOrb({ isActive, onTap }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const scaleRef = useRef(isActive ? 0.66 : 0.36);
  const circleTex = useMemo(makeCircleTexture, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (isActive ? 0.075 : 0.04);
    const target = isActive ? 0.66 : 0.36;
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 5);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef} rotation={[0.32, -0.35, 0]} position={[0, -0.25, 0]} onClick={onTap}>
      <Sea circleTex={circleTex} />
      <Coast circleTex={circleTex} />
      <CornicheRoad circleTex={circleTex} />
      <Buildings circleTex={circleTex} />
      <Details circleTex={circleTex} />
    </group>
  );
}
