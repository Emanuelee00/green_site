import { useMemo } from "react";
import * as THREE from "three";

export function StarField({ count = 600 }: { count?: number }) {
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 90;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.07} sizeAttenuation transparent opacity={0.65} />
    </points>
  );
}
