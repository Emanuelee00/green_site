import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RouteOrb } from "./RouteOrb";
import type { DemoRoute } from "../../types";

const ORB_SPACING = 4.2;

interface Props {
  routes: DemoRoute[];
  currentIndex: number;
  panOffsetRef: React.RefObject<number>;
  onTap: (route: DemoRoute) => void;
}

function CarouselGroup({ routes, currentIndex, panOffsetRef, onTap }: Props) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dragNDC = ((panOffsetRef.current ?? 0) / 300) * ORB_SPACING;
    const targetX = -currentIndex * ORB_SPACING + dragNDC;
    groupRef.current.position.x +=
      (targetX - groupRef.current.position.x) * Math.min(1, delta * 10);
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {routes.map((route, i) => (
        <RouteOrb
          key={route.id}
          position={[i * ORB_SPACING, 0, 0]}
          isActive={i === currentIndex}
          route={route}
          onTap={() => i === currentIndex && onTap(route)}
        />
      ))}
    </group>
  );
}

export function RouteCarouselScene(props: Props) {
  return (
    <>
      <color attach="background" args={["#080f08"]} />
      <fog attach="fog" args={["#080f08", 8, 22]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[0, 6, 4]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, -4, 2]} intensity={0.4} color="#0d2018" />
      <CarouselGroup {...props} />
    </>
  );
}
