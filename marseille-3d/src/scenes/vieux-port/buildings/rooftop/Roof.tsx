/**
 * Roof — tetto mansardato haussmanniano.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import type { BuildingSpec } from "../shared";

const SLATE:  [number,number,number] = [0.28, 0.30, 0.34]; // ardesia
const ZINC:   [number,number,number] = [0.52, 0.55, 0.55]; // zinco

function buildRoofs(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const topY  = 0.08 + s.height;
    const mansardH = s.height * 0.22;
    const steps = Math.max(5, Math.round(s.width / 0.06));
    const dSteps = Math.max(2, Math.round(Math.abs(s.depth) / 0.06));

    // piastra orizzontale sommità
    for (let iz = 0; iz <= steps; iz++)
    for (let ix = 0; ix <= dSteps; ix++) {
      const pz = s.facadeZ - s.width/2 + (iz/steps)*s.width;
      const px = s.facadeX + (ix/dSteps)*s.depth;
      pts.push(px, topY + 0.008, pz);
      cls.push(...ZINC);
    }

    // faccia mansardina (inclinata verso la facciata)
    const mansardSteps = 7;
    for (let im = 0; im <= mansardSteps; im++) {
      const t  = im / mansardSteps;
      const py = topY + t * mansardH;
      // la mansarda si restringe verso l'alto
      const shrink = t * 0.28;
      for (let iz = 0; iz <= steps; iz++) {
        const pz = s.facadeZ - s.width/2 + (iz/steps)*s.width;
        // fronte mansarda
        pts.push(s.facadeX - s.side * shrink * Math.abs(s.depth), py, pz);
        const bright = 0.82 + t * 0.14;
        cls.push(SLATE[0]*bright, SLATE[1]*bright, SLATE[2]*bright);
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Roof({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildRoofs(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.030} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
