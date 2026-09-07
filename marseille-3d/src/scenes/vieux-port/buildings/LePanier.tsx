/**
 * LePanier — quartiere storico sul colle nord-ovest del Vieux-Port.
 * Edifici più alti, più fitti, colori più scuri (ombra del colle).
 * Include: corpo edifici, finestre, profilo colle, gradini stradali.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute, Points, PointsMaterial } from "three";

const PALETTE_PANIER: [number,number,number][] = [
  [0.62, 0.44, 0.30], // terracotta scura
  [0.70, 0.55, 0.38], // ocra invecchiata
  [0.58, 0.48, 0.36], // grigio-beige
  [0.75, 0.60, 0.42], // salmone sbiadito
  [0.55, 0.45, 0.34], // ombra colle
];

interface Block { x: number; z: number; w: number; d: number; h: number; ci: number }

const BLOCKS: Block[] = [
  { x:-2.18, z:-2.00, w:0.30, d:0.25, h:0.68, ci:0 },
  { x:-2.05, z:-1.72, w:0.26, d:0.22, h:0.55, ci:1 },
  { x:-2.35, z:-1.88, w:0.28, d:0.20, h:0.72, ci:2 },
  { x:-1.90, z:-1.95, w:0.22, d:0.20, h:0.48, ci:3 },
  { x:-2.20, z:-1.52, w:0.24, d:0.22, h:0.60, ci:4 },
  { x:-2.42, z:-2.15, w:0.20, d:0.18, h:0.78, ci:0 },
  { x:-2.00, z:-2.20, w:0.25, d:0.20, h:0.52, ci:2 },
  { x:-1.85, z:-1.65, w:0.20, d:0.18, h:0.44, ci:1 },
  { x:-2.30, z:-1.30, w:0.22, d:0.20, h:0.56, ci:3 },
];

function buildLePanier() {
  const pts: number[] = [], cls: number[] = [];

  for (const b of BLOCKS) {
    const col = PALETTE_PANIER[b.ci];
    const nx = Math.max(3, Math.round(b.d / 0.06));
    const nz = Math.max(3, Math.round(b.w / 0.06));
    const ny = Math.max(5, Math.round(b.h / 0.06));

    // volume edificio
    for (let ix = 0; ix <= nx; ix++)
    for (let iz = 0; iz <= nz; iz++)
    for (let iy = 0; iy <= ny; iy++) {
      const px = b.x + (ix/nx)*b.d;
      const py = 0.08 + (iy/ny)*b.h;
      const pz = b.z - b.w/2 + (iz/nz)*b.w;
      pts.push(px, py, pz);
      const bright = iy === ny ? 0.95 : ix === 0 ? 0.88 : 0.70;
      cls.push(col[0]*bright, col[1]*bright, col[2]*bright);
    }

    // finestre — giallo caldo
    const nWin = Math.round(b.w * b.h * 18);
    for (let i = 0; i < nWin; i++) {
      pts.push(
        b.x + 0.01,
        0.12 + Math.random()*b.h*0.85,
        b.z - b.w/2 + Math.random()*b.w,
      );
      cls.push(0.96, 0.82, 0.44);
    }
  }

  // colle — piano inclinato con punti verdi/marroni
  const hillPts = 120;
  for (let i = 0; i < hillPts; i++) {
    const px = -2.5 + Math.random() * 0.8;
    const pz = -2.4 + Math.random() * 1.2;
    const py = 0.02 + (-px - 1.8) * 0.08 + Math.random() * 0.04;
    pts.push(px, py, pz);
    const g = 0.28 + Math.random() * 0.15;
    cls.push(g*0.5, g, g*0.4); // verde scuro colle
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function LePanier({ circleTex }: { circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(buildLePanier, []);
  const pointsRef = useRef<Points>(null!);

  useFrame(({ clock }) => {
    if (pointsRef.current)
      (pointsRef.current.material as PointsMaterial).opacity =
        0.88 + Math.sin(clock.elapsedTime * 1.9) * 0.04;
  });

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.042} vertexColors sizeAttenuation transparent opacity={0.90} depthWrite={false} />
    </points>
  );
}
