/**
 * Arcade — arcate al piano terra (tipico dei portici marsigliesi).
 * Archi semicircolari sulla facciata, colore pietra chiara.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import type { BuildingSpec } from "../shared";

const ARCH: [number,number,number]  = [0.88, 0.83, 0.72];
const SHADOW: [number,number,number] = [0.28, 0.24, 0.20];

function buildArcades(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    if (!s.hasArcade) continue;
    const floorH = s.height / s.floors;
    const archH  = floorH * 0.78;
    const archW  = s.width / s.bays;
    const archR  = Math.min(archW * 0.38, archH * 0.45);
    const baseY  = 0.08;

    for (let b = 0; b < s.bays; b++) {
      const cz = s.facadeZ - s.width / 2 + (b + 0.5) * archW;

      // piedritti laterali
      for (let ih = 0; ih <= 6; ih++) {
        const py = baseY + (ih / 6) * (archH - archR);
        pts.push(s.facadeX, py, cz - archW * 0.30); cls.push(...ARCH);
        pts.push(s.facadeX, py, cz + archW * 0.30); cls.push(...ARCH);
      }

      // arco semicircolare (8 punti)
      const arcSteps = 10;
      for (let ia = 0; ia <= arcSteps; ia++) {
        const angle = (ia / arcSteps) * Math.PI;
        const az = cz + Math.cos(angle) * archR * 0.75;
        const ay = baseY + (archH - archR) + Math.sin(angle) * archR;
        pts.push(s.facadeX, ay, az); cls.push(...ARCH);
      }

      // ombra interna dell'arco (profondità)
      for (let id = 1; id <= 3; id++) {
        const px = s.facadeX + (id / 3) * s.depth * 0.3;
        for (let ia = 0; ia <= 6; ia++) {
          const angle = (ia / 6) * Math.PI;
          const az = cz + Math.cos(angle) * archR * 0.75 * (1 - id*0.1);
          const ay = baseY + (archH - archR) + Math.sin(angle) * archR * (1 - id*0.08);
          pts.push(px, ay, az); cls.push(...SHADOW);
        }
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Arcade({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildArcades(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.026} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
