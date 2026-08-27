import * as THREE from "three";
/**
 * Forts — Fort Saint-Jean (nord) e Fort Saint-Nicolas (sud) + MuCEM.
 * Torri e masse come nuvole di punti in pietra calcarea.
 */
import { useMemo } from "react";
import { BufferGeometry, BufferAttribute } from "three";

function cylinder(cx: number, cz: number, baseY: number, radius: number, height: number, rings: number, color: [number,number,number]) {
  const pts: number[] = [];
  const cls: number[] = [];
  for (let r = 0; r <= rings; r++) {
    const y = baseY + (r / rings) * height;
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      pts.push(cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius);
      cls.push(...color);
    }
    // punto centrale ogni 3 ring per massa solida
    if (r % 3 === 0) { pts.push(cx, y, cz); cls.push(...color); }
  }
  return { pts, cls };
}

function block(cx: number, cz: number, baseY: number, w: number, d: number, h: number, color: [number,number,number]) {
  const pts: number[] = [];
  const cls: number[] = [];
  const gx = 4, gz = 4, gy = 3;
  for (let ix = 0; ix <= gx; ix++)
  for (let iz = 0; iz <= gz; iz++)
  for (let iy = 0; iy <= gy; iy++) {
    pts.push(cx - w/2 + (ix/gx)*w, baseY + (iy/gy)*h, cz - d/2 + (iz/gz)*d);
    cls.push(...color);
  }
  return { pts, cls };
}

const FORT  : [number,number,number] = [0.72, 0.66, 0.50];
const STONE : [number,number,number] = [0.66, 0.61, 0.47];
const MUCEM : [number,number,number] = [0.78, 0.78, 0.80];

function generateForts() {
  const allPts: number[] = [];
  const allCls: number[] = [];

  const add = ({ pts, cls }: { pts: number[]; cls: number[] }) => {
    allPts.push(...pts); allCls.push(...cls);
  };

  // Fort Saint-Jean (nord-ovest)
  add(cylinder(-1.28, -2.1, 0.12, 0.13, 0.38, 6, FORT));
  add(cylinder(-1.55, -2.0, 0.12, 0.09, 0.52, 8, STONE)); // Tour du Roi René
  add(block(-1.4, -1.9, 0.12, 0.28, 0.32, 0.22, FORT));

  // Fort Saint-Nicolas (sud-ovest)
  add(cylinder(1.28, -2.1, 0.12, 0.14, 0.36, 6, FORT));
  add(cylinder(1.50, -2.05, 0.12, 0.08, 0.45, 7, STONE));
  add(block(1.4, -1.85, 0.12, 0.30, 0.40, 0.20, FORT));

  // MuCEM — struttura a traforo (punti sparsi = effetto openwork)
  add(block(-1.1, -1.75, 0.12, 0.32, 0.32, 0.40, MUCEM));

  return {
    positions: new Float32Array(allPts),
    colors:    new Float32Array(allCls),
  };
}

export function Forts({ circleTex }: { circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(generateForts, []);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.045} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
