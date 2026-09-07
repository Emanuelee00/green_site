/**
 * Ground — solo le banchine del Vieux-Port (strisce tra acqua e edifici)
 * + alberelli lungo i moli + riflessi lampioni.
 * Nessun suolo esteso: solo l'area waterfront reale.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute } from "three";

type RGB = [number, number, number];
function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

function buildGround() {
  const pts: number[] = [], cls: number[] = [];
  function add(px: number, py: number, pz: number, c: RGB) {
    pts.push(px, py, pz); cls.push(...c);
  }

  const STONE: RGB  = [0.75, 0.70, 0.60];
  const STONE2: RGB = [0.68, 0.63, 0.53];
  const WET: RGB    = [0.48, 0.56, 0.64];

  // ── Banchine — striscia stretta tra acqua (X=±1.42) e edifici (X=±1.52) ──
  // Solo questa zona: larghezza ~0.2 per lato, lungo tutto il porto (Z -2.1…2.0)
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const pz = -2.1 + (i / steps) * 4.1 + rnd(-0.015, 0.015);

    // banchina nord (tra X=-1.52 e X=-1.42 acqua)
    for (let d = 0; d < 6; d++) {
      const px = -(1.42 + d * 0.018) + rnd(-0.008, 0.008);
      const c: RGB = d < 2 ? WET : d % 2 === 0 ? STONE : STONE2;
      add(px, 0.005 + rnd(0, 0.004), pz, c);
    }

    // banchina sud
    for (let d = 0; d < 6; d++) {
      const px = (1.42 + d * 0.018) + rnd(-0.008, 0.008);
      const c: RGB = d < 2 ? WET : d % 2 === 0 ? STONE : STONE2;
      add(px, 0.005 + rnd(0, 0.004), pz, c);
    }
  }

  // ── Quai des Belges — chiusura est (Z≈2.0, tra X=-1.42 e +1.42) ──
  const bSteps = 55;
  for (let i = 0; i <= bSteps; i++) {
    const px = -1.42 + (i / bSteps) * 2.84 + rnd(-0.01, 0.01);
    for (let d = 0; d < 5; d++) {
      const pz = 1.92 + d * 0.018 + rnd(-0.006, 0.006);
      const c: RGB = d < 2 ? WET : STONE;
      add(px, 0.005 + rnd(0, 0.003), pz, c);
    }
  }

  // ── Alberelli lungo le banchine ──
  const TREE_POS: [number, number][] = [
    [-1.65,-1.6],[-1.65,-0.5],[-1.65, 0.6],[-1.65, 1.5],
    [ 1.65,-1.4],[ 1.65,-0.3],[ 1.65, 0.7],[ 1.65, 1.6],
    [-0.7, 1.94],[ 0.0, 1.94],[ 0.7, 1.94],
  ];
  for (const [tx, tz] of TREE_POS) {
    // tronco
    for (let h = 0; h <= 6; h++)
      add(tx, h * 0.022, tz, [0.30, 0.22, 0.14]);
    // chioma
    for (let l = 0; l < 22; l++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.8;
      const r     = 0.04 + Math.random() * 0.055;
      add(
        tx + r * Math.sin(phi) * Math.cos(theta),
        0.14 + r * Math.cos(phi) * 0.55,
        tz  + r * Math.sin(phi) * Math.sin(theta),
        [0.20 + Math.random()*0.10, 0.38 + Math.random()*0.14, 0.16] as RGB,
      );
    }
  }

  // ── Riflessi lampioni sul pavé bagnato ──
  for (let r = 0; r < 80; r++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const px   = side * (1.44 + Math.random() * 0.08);
    const pz   = rnd(-1.9, 1.9);
    const c: RGB = Math.random() < 0.6
      ? [0.70, 0.52, 0.24]
      : [0.36, 0.52, 0.70];
    add(px, 0.006, pz, c);
  }

  return { positions: new Float32Array(pts), colors: new Float32Array(cls) };
}

export function Ground({ circleTex }: { circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(buildGround, []);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        map={circleTex}
        alphaTest={0.1}
        size={0.034}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
