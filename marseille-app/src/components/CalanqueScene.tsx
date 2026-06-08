import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// ── Animated water plane ────────────────────────────────────────────────────
function Water() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useRef<THREE.BufferGeometry>(null);

  const { positions, initial } = useMemo(() => {
    const seg = 60;
    const g = new THREE.PlaneGeometry(14, 10, seg, seg);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const init = new Float32Array(pos.array.length);
    init.set(pos.array as Float32Array);
    return { positions: pos, initial: init };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const arr = positions.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = initial[i], y = initial[i + 1];
      arr[i + 2] = Math.sin(x * 0.8 + t * 1.2) * 0.12
                 + Math.sin(y * 1.1 + t * 0.9) * 0.08
                 + Math.sin((x + y) * 0.5 + t * 0.6) * 0.05;
    }
    positions.needsUpdate = true;
    if (geo.current) geo.current.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <bufferGeometry ref={geo}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.array as Float32Array, 3]}
          count={(positions.array as Float32Array).length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial
        color="#00b4d8"
        roughness={0.05}
        metalness={0.4}
        transparent
        opacity={0.88}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Rocky cliff ─────────────────────────────────────────────────────────────
function Cliff({ position, scale, rotation }: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 2.5, 7, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i]     += (Math.random() - 0.5) * 0.35;
      arr[i + 1] += (Math.random() - 0.5) * 0.2;
      arr[i + 2] += (Math.random() - 0.5) * 0.35;
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={position} scale={scale} rotation={rotation ?? [0, 0, 0]}>
      <meshStandardMaterial color="#c4a882" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

// ── Scene ───────────────────────────────────────────────────────────────────
function Scene() {
  const cameraGroup = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cameraGroup.current) {
      const t = clock.getElapsedTime();
      cameraGroup.current.rotation.y = Math.sin(t * 0.08) * 0.06;
    }
  });

  return (
    <>
      {/* Sky */}
      <color attach="background" args={["#0a1628"]} />
      <fog attach="fog" args={["#0a1628", 12, 28]} />

      {/* Lighting: warm Mediterranean sun from the right */}
      <ambientLight intensity={0.35} color="#ffddb3" />
      <directionalLight
        position={[6, 8, -2]}
        intensity={2.2}
        color="#ffcc77"
        castShadow
      />
      <directionalLight position={[-4, 2, 4]} intensity={0.4} color="#90d0ff" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#00b4d8" />

      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0.3} />

      <group ref={cameraGroup}>
        {/* Cliffs — left side */}
        <Cliff position={[-4.5, 0.2, -3]} scale={[1.3, 2, 1.1]} rotation={[0, 0.3, 0.1]} />
        <Cliff position={[-3.5, -0.3, -1.5]} scale={[0.9, 1.5, 0.9]} />
        <Cliff position={[-5.2, -0.1, -1]} scale={[1, 1.8, 1]} rotation={[0, -0.2, 0.05]} />

        {/* Cliffs — right side */}
        <Cliff position={[4.2, 0.3, -3]} scale={[1.4, 2.2, 1.2]} rotation={[0, -0.4, -0.08]} />
        <Cliff position={[3.3, -0.2, -1.5]} scale={[1, 1.6, 0.9]} />
        <Cliff position={[5, -0.1, -0.8]} scale={[0.85, 1.4, 0.85]} rotation={[0, 0.2, 0.06]} />

        {/* Background cliffs */}
        <Cliff position={[-1.5, 1, -6]} scale={[1.8, 3.2, 1.5]} />
        <Cliff position={[1.2, 0.8, -6.5]} scale={[1.6, 2.8, 1.4]} rotation={[0, 0.15, 0]} />
        <Cliff position={[0, 0.5, -7]} scale={[1.2, 2, 1]} />

        {/* Floating island accent */}
        <Float speed={1.2} floatIntensity={0.15} rotationIntensity={0.05}>
          <mesh position={[0, 0.1, -4]}>
            <sphereGeometry args={[0.25, 8, 6]} />
            <meshStandardMaterial color="#e9c46a" roughness={0.9} />
          </mesh>
        </Float>

        {/* Water */}
        <Water />

        {/* Sandy floor / shore */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
          <planeGeometry args={[20, 18]} />
          <meshStandardMaterial color="#1a3a2a" roughness={1} />
        </mesh>
      </group>
    </>
  );
}

// ── Exported component ───────────────────────────────────────────────────────
export default function CalanqueScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 7], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
