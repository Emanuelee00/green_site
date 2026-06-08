import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { View, StyleSheet } from "react-native";
import { Terrain } from "./Terrain";
import { StarField } from "./StarField";
import { SceneLighting } from "./SceneLighting";
import { CalanqueMarkers } from "./CalanqueMarkers";
import type { Calanque } from "../../data/calanques";

export interface CalanqueSceneProps {
  onCalanqueSelect?: (calanque: Calanque) => void;
}

function Scene({ selectedId, onSelect }: {
  selectedId: string | null;
  onSelect: (c: Calanque) => void;
}) {
  return (
    <>
      <color attach="background" args={["#0a1628"]} />
      <fog attach="fog" args={["#0a1628", 14, 30]} />

      <SceneLighting />
      <StarField />
      <Terrain />
      <CalanqueMarkers selectedId={selectedId} onSelect={onSelect} />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function CalanqueScene({ onCalanqueSelect }: CalanqueSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (c: Calanque) => {
    setSelectedId(c.id);
    onCalanqueSelect?.(c);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 52 }}
        gl={{ antialias: true }}
        style={{ flex: 1 }}
      >
        <Suspense fallback={null}>
          <Scene selectedId={selectedId} onSelect={handleSelect} />
        </Suspense>
      </Canvas>
    </View>
  );
}
