import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Hill } from "./Hill";
import { Fort } from "./Fort";
import { Basilica } from "./Basilica";
import { BellTower } from "./BellTower";
import { Madonna } from "./Madonna";
import { circleTexture } from "./geometry";

interface Props { isActive: boolean; onTap?: () => void; color?: string }

export function NotreDameDeLaGardeOrb({ isActive, onTap }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const scaleRef = useRef(isActive ? 0.42 : 0.23);
  const texture = useMemo(circleTexture, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (isActive ? 0.075 : 0.04);
    const target = isActive ? 0.42 : 0.23;
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 5);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef} rotation={[0.24, -0.28, 0]} position={[0, -0.45, 0]} onClick={onTap}>
      <ambientLight intensity={0.55} color="#c9dcf0" />
      <pointLight position={[-3, 6, 4]} intensity={1.1} color="#ffe2a8" />
      <Hill texture={texture} />
      <Fort texture={texture} />
      <Basilica texture={texture} />
      <BellTower texture={texture} />
      <Madonna texture={texture} />
    </group>
  );
}
