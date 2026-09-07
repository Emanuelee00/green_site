/**
 * Windows — finestre con luce interna che sfarfalla (notte/giorno).
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute, Points } from "three";
import type { BuildingSpec } from "../shared";

const WIN_LIT:  [number,number,number] = [1.0, 0.92, 0.60]; // luce calda accesa
const WIN_OFF:  [number,number,number] = [0.12, 0.16, 0.22]; // vetro scuro
const WIN_SKY:  [number,number,number] = [0.62, 0.80, 0.96]; // cielo riflesso

interface WinInfo { bufIdx: number; isLit: boolean; flickerPhase: number }

function buildWindows(specs: BuildingSpec[]) {
  const pts: number[] = [], cls: number[] = [];
  const infos: WinInfo[] = [];

  for (const s of specs) {
    const floorH = s.height / s.floors;
    const bayW   = s.width / s.bays;
    const winW   = bayW * 0.40;
    const winH   = floorH * 0.44;

    for (let f = 1; f < s.floors; f++) {
      const yCen = 0.08 + f * floorH + floorH * 0.50;
      for (let b = 0; b < s.bays; b++) {
        const cz   = s.facadeZ - s.width / 2 + (b + 0.5) * bayW;
        const isLit = Math.random() > 0.38;
        const phase = Math.random() * Math.PI * 2;
        const col   = isLit ? WIN_LIT : (Math.random() > 0.5 ? WIN_SKY : WIN_OFF);

        // 3×3 griglia di punti per finestra
        const startIdx = pts.length / 3;
        for (let iy = 0; iy <= 2; iy++)
        for (let iz = 0; iz <= 2; iz++) {
          pts.push(
            s.facadeX,
            yCen - winH/2 + (iy/2)*winH,
            cz - winW/2 + (iz/2)*winW,
          );
          cls.push(...col);
        }
        if (isLit) infos.push({ bufIdx: startIdx, isLit, flickerPhase: phase });
      }
    }
  }

  return {
    positions: new Float32Array(pts),
    colors:    new Float32Array(cls),
    infos,
  };
}

export function Windows({ specs, circleTex }: { specs: BuildingSpec[]; circleTex: THREE.Texture }) {
  const { positions, colors, infos } = useMemo(() => buildWindows(specs), [specs]);
  const pointsRef = useRef<Points>(null!);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors.slice(), 3));
    return g;
  }, [positions, colors]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t    = clock.elapsedTime;
    const attr = pointsRef.current.geometry.attributes.color as BufferAttribute;
    const arr  = attr.array as Float32Array;

    for (const w of infos) {
      const flicker = 0.78 + 0.22 * Math.sin(t * 3.1 + w.flickerPhase)
                           + 0.06 * Math.sin(t * 11.7 + w.flickerPhase);
      const base = w.bufIdx * 3;
      for (let i = 0; i < 9; i++) { // 9 punti per finestra
        arr[(base + i)*3 + 0] = WIN_LIT[0] * flicker;
        arr[(base + i)*3 + 1] = WIN_LIT[1] * flicker * 0.97;
        arr[(base + i)*3 + 2] = WIN_LIT[2] * flicker * 0.72;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.028} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
