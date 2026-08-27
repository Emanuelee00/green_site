import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import { SHUTTER_COLORS, type BuildingSpec } from "../shared";

function buildShutters(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const floorH = s.height / s.floors;
    const bayW   = s.width / s.bays;
    const winW   = bayW * 0.40;
    const winH   = floorH * 0.44;
    const sW     = winW * 0.30; // larghezza persiana
    const col    = SHUTTER_COLORS[s.shutterIdx];

    for (let f = 1; f < s.floors; f++) {
      const yCen = 0.08 + f * floorH + floorH * 0.50;
      for (let b = 0; b < s.bays; b++) {
        const cz = s.facadeZ - s.width / 2 + (b + 0.5) * bayW;
        const isOpen = Math.random() > 0.50;

        // Persiana sx
        for (let ir = 0; ir <= 5; ir++) {
          const py = yCen - winH/2 + (ir/5)*winH;
          const openAngle = isOpen ? Math.PI * 0.38 : 0;
          // lama aperta: ruota verso esterno
          for (let il = 0; il <= 3; il++) {
            const t   = il / 3;
            const dz  = isOpen ? -sW * Math.cos(openAngle) * t : 0;
            const dx  = isOpen ? sW * Math.sin(openAngle) * t : t * sW;
            pts.push(
              s.facadeX - s.side * dx,
              py,
              cz - winW/2 - dz,
            );
            cls.push(col[0]*(0.85+t*0.15), col[1]*(0.85+t*0.15), col[2]*(0.85+t*0.15));
          }
        }
        // Persiana dx
        for (let ir = 0; ir <= 5; ir++) {
          const py = yCen - winH/2 + (ir/5)*winH;
          const isOpenR = Math.random() > 0.50;
          const openAngle = isOpenR ? Math.PI * 0.38 : 0;
          for (let il = 0; il <= 3; il++) {
            const t   = il / 3;
            const dz  = isOpenR ? sW * Math.cos(openAngle) * t : 0;
            const dx  = isOpenR ? sW * Math.sin(openAngle) * t : t * sW;
            pts.push(
              s.facadeX - s.side * dx,
              py,
              cz + winW/2 + dz,
            );
            cls.push(col[0]*(0.85+t*0.15), col[1]*(0.85+t*0.15), col[2]*(0.85+t*0.15));
          }
        }
      }
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Shutters({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildShutters(specs), [specs]);
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
