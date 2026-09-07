import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import { FACADE_PALETTE, type BuildingSpec } from "../shared";

const IRON: [number,number,number] = [0.22, 0.22, 0.22]; // ringhiera ferro

function buildBalconies(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    if (!s.hasBalcony) continue;
    const floorH = s.height / s.floors;
    const balW   = (s.width / s.bays) * 0.64;
    const balD   = 0.04; // sporgenza balcone
    const col    = FACADE_PALETTE[s.colorIdx];

  for (let f = 1; f < s.floors; f++) {
      const y = 0.08 + f * floorH + 0.01;

      for (let b = 0; b < s.bays; b++) {
        const cz = s.facadeZ - s.width / 2 + (b + 0.5) * (s.width / s.bays);
        const fx  = s.facadeX - s.side * balD; // sporgenza verso l'acqua

        // Lastra del balcone
        for (let iz = 0; iz <= 8; iz++) {
          const pz = cz - balW / 2 + (iz / 8) * balW;
          pts.push(fx, y, pz); cls.push(col[0]*1.05, col[1]*1.05, col[2]*0.95);
          pts.push(fx + s.side * balD, y, pz); cls.push(col[0]*0.90, col[1]*0.90, col[2]*0.82);
        }

        // Ringhiera — 3 righe di punti
        const railH = 0.055;
        for (let ir = 0; ir <= 3; ir++) {
          const ry = y + (ir / 3) * railH;
          for (let iz = 0; iz <= 8; iz++) {
            const pz = cz - balW / 2 + (iz / 8) * balW;
            pts.push(fx, ry, pz); cls.push(...IRON);
          }
        }
        // montanti verticali ringhiera
        const railSteps = 6;
        for (let iv = 0; iv <= railSteps; iv++) {
          const pz = cz - balW / 2 + (iv / railSteps) * balW;
          for (let ir = 0; ir <= 4; ir++) {
            pts.push(fx, y + (ir/4)*railH, pz); cls.push(...IRON);
          }
        }
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Balconies({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildBalconies(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.022} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
