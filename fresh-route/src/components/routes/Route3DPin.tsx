import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View, StyleSheet } from "react-native";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DemoRoute } from "@/types";
import { colors } from "@/theme";

interface Route3DPinProps {
  route: DemoRoute;
  isSelected: boolean;
  pointType: "from" | "to";
  onPress: () => void;
}

function PinGeometry({ route, isSelected, pointType }: { route: DemoRoute; isSelected: boolean; pointType: "from" | "to" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const point = pointType === "from" ? route.from : route.to;
  const color = pointType === "from" ? colors.primary : (
    route.badge === "cool" ? colors.primary :
    route.badge === "warm" ? colors.warm :
    colors.hot
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.set(
        isSelected ? 1.5 : 1.0,
        isSelected ? 1.5 : 1.0,
        isSelected ? 1.5 : 1.0
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[0.3, 2]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.8 : 0.3}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Route3DPin({ route, isSelected, pointType, onPress }: Route3DPinProps) {
  return (
    <View style={[styles.container, pointType === "from" ? styles.fromPosition : styles.toPosition]}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        style={styles.canvas}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <PinGeometry route={route} isSelected={isSelected} pointType={pointType} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  fromPosition: {
    top: 80,
    left: 20,
  },
  toPosition: {
    top: 80,
    right: 20,
  },
  canvas: {
    flex: 1,
  },
});
