/**
 * Dormers — abbaini (lucarnes) sulla mansarda.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import type { BuildingSpec } from "../shared";

const DORMER_WALL: [number,number,number] = [0.80, 0.76, 0.65];
const DORMER_WIN:  [number,number,number] = [0.60, 0.80, 0.95];

function buildDormers(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const topY = 0.08 + s.height;
    const count = Math.max(1, Math.floor(s.width / 0.30));

    for (let id = 0; id < count; id++) {
      const cz = s.facadeZ - s.width*0.35 + id*(s.width*0.70/Math.max(1,count-1));
      const fx = s.facadeX - s.side * Math.abs(s.depth) * 0.18;
      const dH = 0.050, dW = 0.055;

      // pareti laterali abbaino
      for (let ih = 0; ih <= 5; ih++) {
        const py = topY + (ih/5)*dH;
        pts.push(fx, py, cz - dW/2); cls.push(...DORMER_WALL);
        pts.push(fx, py, cz + dW/2); cls.push(...DORMER_WALL);
      }
      // frontone triangolare
      for (let it = 0; it <= 4; it++) {
        const t  = it / 4;
        const py = topY + dH + t * dH * 0.45;
        const hw = (dW/2) * (1 - t);
        pts.push(fx, py, cz - hw); cls.push(...DORMER_WALL);
        pts.push(fx, py, cz + hw); cls.push(...DORMER_WALL);
      }
      // finestrino
      for (let iy = 0; iy <= 2; iy++)
      for (let iz = 0; iz <= 2; iz++) {
        pts.push(fx - s.side*0.002, topY + (iy/2)*dH*0.75 + dH*0.08, cz - dW*0.30 + (iz/2)*dW*0.60);
        cls.push(...DORMER_WIN);
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Dormers({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildDormers(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.018} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
