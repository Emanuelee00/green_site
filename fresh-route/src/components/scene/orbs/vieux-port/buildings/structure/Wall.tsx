/**
 * Wall — muro principale per piano: punti densi con variazione textura.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import { FACADE_PALETTE, type BuildingSpec } from "../shared";

function buildWalls(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const col = FACADE_PALETTE[s.colorIdx];
    const floorH = s.height / s.floors;
    const nx = Math.max(2, Math.round(Math.abs(s.depth) / 0.08));
    const nz = Math.max(3, Math.round(s.width / 0.07));

    for (let f = 0; f < s.floors; f++) {
      const yBase = 0.08 + f * floorH;
      const ny = Math.max(2, Math.round(floorH / 0.07));

      for (let ix = 0; ix <= nx; ix++)
      for (let iz = 0; iz <= nz; iz++)
      for (let iy = 0; iy < ny; iy++) {
        const px = s.facadeX + (ix / nx) * s.depth;
        const py = yBase + (iy / ny) * floorH;
        const pz = s.facadeZ - s.width / 2 + (iz / nz) * s.width;
        // facciata più chiara, piani alti leggermente più scuri (ombra)
        const depthFade = 1 - (ix / nx) * 0.22;
        const floorFade = 1 - f * 0.04;
        const b = depthFade * floorFade;
        pts.push(px, py, pz);
        cls.push(col[0]*b, col[1]*b, col[2]*b);
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Wall({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildWalls(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.040} vertexColors sizeAttenuation transparent opacity={0.92} depthWrite={false} />
    </points>
  );
}
