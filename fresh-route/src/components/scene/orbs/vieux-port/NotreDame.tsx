/**
 * NotreDame — silhouette Notre-Dame de la Garde come nuvola di punti dorati.
 * Colle + basilica + campanile + cupola + Madonna.
 */
import { useMemo } from "react";
import { BufferGeometry, BufferAttribute } from "three";

const STONE : [number,number,number] = [0.83, 0.78, 0.66];
const GOLD  : [number,number,number] = [0.83, 0.63, 0.26];

function cone(cx: number, cz: number, baseY: number, radius: number, height: number, rings: number, color: [number,number,number]) {
  const pts: number[] = [], cls: number[] = [];
  for (let r = 0; r <= rings; r++) {
    const y = baseY + (r / rings) * height;
    const rr = radius * (1 - r / rings);
    const steps = Math.max(4, Math.round(rr * 40));
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      pts.push(cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr);
      cls.push(...color);
    }
  }
  return { pts, cls };
}

function column(cx: number, cz: number, baseY: number, height: number, steps: number, color: [number,number,number]) {
  const pts: number[] = [], cls: number[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(cx, baseY + (i / steps) * height, cz);
    cls.push(...color);
  }
  return { pts, cls };
}

function sphere(cx: number, cy: number, cz: number, radius: number, color: [number,number,number]) {
  const pts: number[] = [], cls: number[] = [];
  for (let i = 0; i < 12; i++) {
    const phi = (i / 12) * Math.PI;
    for (let j = 0; j < 8; j++) {
      const theta = (j / 8) * Math.PI * 2;
      pts.push(
        cx + radius * Math.sin(phi) * Math.cos(theta),
        cy + radius * Math.cos(phi),
        cz + radius * Math.sin(phi) * Math.sin(theta),
      );
      cls.push(...color);
    }
  }
  return { pts, cls };
}

function generateNotreDame() {
  const allPts: number[] = [], allCls: number[] = [];
  const add = ({ pts, cls }: { pts: number[]; cls: number[] }) => { allPts.push(...pts); allCls.push(...cls); };

  const BASE = [1.8, 1.6] as [number, number]; // [x, z] posizione sul colle
  const [bx, bz] = BASE;

  // colle
  add(cone(bx, bz, 0.0, 0.28, 0.24, 5, [0.54, 0.48, 0.36]));
  // corpo basilica
  add(cone(bx, bz, 0.24, 0.11, 0.14, 4, STONE));
  // campanile
  add(column(bx, bz - 0.06, 0.30, 0.30, 10, STONE));
  // tamburo cupola
  add(column(bx, bz - 0.06, 0.60, 0.06, 3, STONE));
  // cupola dorata
  add(sphere(bx, 0.74, bz - 0.06, 0.035, GOLD));
  // statua Madonna
  add(column(bx, bz - 0.06, 0.775, 0.055, 4, GOLD));

  return {
    positions: new Float32Array(allPts),
    colors:    new Float32Array(allCls),
  };
}

export function NotreDame() {
  const { positions, colors } = useMemo(generateNotreDame, []);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.05} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
