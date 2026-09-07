import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";
import type { BuildingSpec } from "../shared";

const BRICK:  [number,number,number] = [0.52, 0.30, 0.22];
const CAP:    [number,number,number] = [0.34, 0.34, 0.36];

function buildChimneys(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];

  for (const s of specs) {
    const topY  = 0.08 + s.height;
    const count = 1 + Math.floor(s.width / 0.25);

    for (let ic = 0; ic < count; ic++) {
      const cz = s.facadeZ - s.width * 0.4 + ic * (s.width * 0.8 / Math.max(1, count-1));
      const px = s.facadeX + s.depth * 0.55;
      const chimH = 0.06 + Math.random() * 0.05;

      for (let ih = 0; ih <= 8; ih++) {
        const py = topY + (ih/8)*chimH;
        pts.push(px, py, cz);        cls.push(...BRICK);
        pts.push(px + 0.018, py, cz);cls.push(...BRICK);
        pts.push(px, py, cz+0.018);  cls.push(...BRICK);
      }
      // cappello
      pts.push(px - 0.012, topY+chimH+0.008, cz - 0.012); cls.push(...CAP);
      pts.push(px + 0.030, topY+chimH+0.008, cz - 0.012); cls.push(...CAP);
      pts.push(px - 0.012, topY+chimH+0.008, cz + 0.030); cls.push(...CAP);
      pts.push(px + 0.030, topY+chimH+0.008, cz + 0.030); cls.push(...CAP);
    }
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Chimneys({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(() => buildChimneys(specs), [specs]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.020} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
