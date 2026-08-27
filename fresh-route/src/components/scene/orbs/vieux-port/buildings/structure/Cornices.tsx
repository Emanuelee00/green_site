/**
 * Cornices — cornicioni orizzontali tra i piani e alla sommità.
 * Caratteristica essenziale dell'architettura haussmanniana.
 * Colore pietra più chiaro della facciata.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import type { BuildingSpec } from "../shared";

const CORNICE: [number,number,number] = [0.90, 0.86, 0.76]; // pietra chiara

function buildCornices(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const floorH = s.height / s.floors;
    const steps  = Math.max(8, Math.round(s.width / 0.045));

    // cornicione a ogni piano + sommità
    for (let f = 1; f <= s.floors; f++) {
      const y = 0.08 + f * floorH;
      const isTop = f === s.floors;
      const thickness = isTop ? 3 : 2; // sommità più spessa

      for (let t = 0; t <= thickness; t++) {
        const py = y + t * 0.012;
        for (let iz = 0; iz <= steps; iz++) {
          const pz = s.facadeZ - s.width / 2 + (iz / steps) * s.width;
          // sporgenza del cornicione sulla facciata
          pts.push(s.facadeX - s.side * 0.01 * t, py, pz);
          const bright = isTop ? 1.05 : 0.95;
          cls.push(CORNICE[0]*bright, CORNICE[1]*bright, CORNICE[2]*bright);
        }
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Cornices({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildCornices(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.028} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
