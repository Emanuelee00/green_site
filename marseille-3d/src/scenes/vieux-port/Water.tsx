/**
 * Water — superficie del porto come griglia densa di punti animati.
 * Le onde vengono calcolate su CPU ogni frame e aggiornano le posizioni Y.
 * Colori depth-based: turchese in superficie, blu notte in profondità.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BufferGeometry, BufferAttribute, Points, PointsMaterial } from "three";

const COLS = 48;   // punti orizzontali
const ROWS = 72;   // punti verticali (porto allungato)
const W    = 2.4;  // larghezza bacino
const D    = 3.6;  // profondità bacino

// colori precomputati per ogni punto — depth-based + variazione
function buildColors(): Float32Array {
  const cls = new Float32Array(COLS * ROWS * 3);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = (r * COLS + c) * 3;
      // distanza normalizzata dal centro → più scuro al centro (profondo)
      const dx = Math.abs(c / (COLS - 1) - 0.5) * 2;
      const dz = Math.abs(r / (ROWS - 1) - 0.5) * 2;
      const edge = Math.max(dx, dz);
      // blu profondo → turchese in superficie/bordi
      cls[i]   = 0.04 + edge * 0.10;  // R
      cls[i+1] = 0.20 + edge * 0.38;  // G
      cls[i+2] = 0.38 + edge * 0.32;  // B
    }
  }
  return cls;
}

// posizioni base (XZ fisse, Y verrà aggiornato ogni frame)
function buildBase(): Float32Array {
  const pos = new Float32Array(COLS * ROWS * 3);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = (r * COLS + c) * 3;
      pos[i]   = (c / (COLS - 1) - 0.5) * W;
      pos[i+1] = 0;
      pos[i+2] = (r / (ROWS - 1) - 0.5) * D + 0.1;
    }
  }
  return pos;
}

export function Water({ circleTex }: { circleTex?: THREE.Texture }) {
  const positions = useMemo(buildBase, []);
  const colors    = useMemo(buildColors, []);
  const pointsRef = useRef<Points>(null!);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t   = clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const cls = pointsRef.current.geometry.attributes.color.array as Float32Array;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i  = (r * COLS + c) * 3;
        const px = pos[i];
        const pz = pos[i + 2];

        // 4 onde sovrapposte con direzioni diverse
        const y = Math.sin(px * 2.8 + t * 1.1) * 0.045
                + Math.sin(pz * 3.5 - t * 0.8) * 0.028
                + Math.sin((px + pz) * 5.2 + t * 1.6) * 0.015
                + Math.sin((px - pz) * 7.0 + t * 2.1) * 0.008;

        pos[i + 1] = y;

        // shimmer colore: creste più chiare/turchesi
        const wave01 = (y + 0.09) / 0.18; // 0…1
        cls[i]   = 0.04 + wave01 * 0.22;
        cls[i+1] = 0.20 + wave01 * 0.45;
        cls[i+2] = 0.38 + wave01 * 0.40;

        // sparkle speculare su alcune creste
        const sparkle = Math.max(0,
          Math.sin(px * 22 + t * 2.8) * Math.sin(pz * 18 + t * 2.1)
        );
        if (sparkle > 0.7) {
          cls[i]   = 0.80 + sparkle * 0.18;
          cls[i+1] = 0.88 + sparkle * 0.10;
          cls[i+2] = 0.95;
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate    = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        map={circleTex}
        alphaTest={circleTex ? 0.1 : 0}
        size={0.038}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
      />
    </points>
  );
}
