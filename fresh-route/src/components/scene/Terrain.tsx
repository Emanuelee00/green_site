import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Animated sea water ────────────────────────────────────────────────────────
export function Water() {
  const geo = useMemo(() => new THREE.PlaneGeometry(24, 18, 60, 60), []);
  const initialPos = useMemo(() => {
    const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array;
    return new Float32Array(arr);
  }, [geo]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const attr = geo.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = initialPos[i], y = initialPos[i + 1];
      arr[i + 2] =
        Math.sin(x * 0.7 + t * 1.1) * 0.1 +
        Math.sin(y * 0.9 + t * 0.8) * 0.07 +
        Math.sin((x + y) * 0.4 + t * 0.6) * 0.04;
    }
    attr.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial
        color="#00b4d8" roughness={0.05} metalness={0.5}
        transparent opacity={0.82} side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Single cliff ──────────────────────────────────────────────────────────────
function Cliff({ position, scale, rotY = 0 }: {
  position: [number, number, number];
  scale: [number, number, number];
  rotY?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 2.5, 7, 1);
    const arr = (g.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i]     += (Math.random() - 0.5) * 0.4;
      arr[i + 1] += (Math.random() - 0.5) * 0.2;
      arr[i + 2] += (Math.random() - 0.5) * 0.4;
    }
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={position} scale={scale} rotation={[0, rotY, 0]}>
      <meshStandardMaterial color="#c4a882" roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

// ── Full terrain: sea + cliffs ────────────────────────────────────────────────
export function Terrain() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#1a3a2a" roughness={1} />
      </mesh>

      <Water />

      {/* Cliff clusters around the calanque area */}
      <Cliff position={[-7, 0.5, -4]} scale={[1.5, 2.5, 1.3]} rotY={0.3} />
      <Cliff position={[-5, 0.2, -2]} scale={[1,   1.8, 1]}   rotY={-0.2} />
      <Cliff position={[-8, 0.1, -1]} scale={[1.2, 2,   1.1]} rotY={0.5} />
      <Cliff position={[6,  0.4, -4]} scale={[1.4, 2.2, 1.2]} rotY={-0.4} />
      <Cliff position={[5,  0.1, -2]} scale={[1,   1.6, 0.9]} rotY={0.1} />
      <Cliff position={[7,  0.2, -0.5]} scale={[0.9,1.5, 0.9]} rotY={-0.6} />
      <Cliff position={[-2, 1,   -7]} scale={[2,   3.5, 1.8]} rotY={0.15} />
      <Cliff position={[2,  0.8, -7]} scale={[1.8, 3,   1.6]} rotY={-0.1} />
      <Cliff position={[0,  0.6, -8]} scale={[1.3, 2.2, 1.2]} />
    </>
  );
}
