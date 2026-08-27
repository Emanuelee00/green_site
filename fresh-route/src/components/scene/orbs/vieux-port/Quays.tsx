import * as THREE from "three";
/**
 * Quays — i moli del Vieux-Port come linee di punti in pietra calcarea.
 * Quai du Port (nord), Quai de Rive Neuve (sud), Quai des Belges (est).
 */
import { useMemo } from "react";
import { BufferGeometry, BufferAttribute } from "three";

const STONE: [number, number, number] = [0.78, 0.72, 0.60];
const EDGE : [number, number, number] = [0.66, 0.60, 0.48];

function line(x0: number, z0: number, x1: number, z1: number, y: number, steps: number, color: [number,number,number]) {
  const pts: number[] = [], cls: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(x0 + (x1-x0)*t, y, z0 + (z1-z0)*t);
    cls.push(...color);
  }
  return { pts, cls };
}

function generateQuays() {
  const allPts: number[] = [], allCls: number[] = [];
  const add = ({ pts, cls }: { pts: number[]; cls: number[] }) => { allPts.push(...pts); allCls.push(...cls); };

  // Quai du Port — bordo interno nord (due livelli: piano e ciglio)
  add(line(-1.5, -2.2, -1.5,  2.0, 0.08, 40, STONE));
  add(line(-1.5, -2.2, -1.5,  2.0, 0.14, 40, EDGE));

  // Quai de Rive Neuve — bordo interno sud
  add(line( 1.5, -2.2,  1.5,  2.0, 0.08, 40, STONE));
  add(line( 1.5, -2.2,  1.5,  2.0, 0.14, 40, EDGE));

  // Quai des Belges — chiusura est
  add(line(-1.5,  2.0,  1.5,  2.0, 0.08, 30, STONE));
  add(line(-1.5,  2.0,  1.5,  2.0, 0.14, 30, EDGE));

  // Ombrière (Norman Foster) — lastra riflettente Quai des Belges
  add(line( 0.1,  1.72,  0.7,  1.72, 0.16, 12, [0.82, 0.88, 0.92]));

  return {
    positions: new Float32Array(allPts),
    colors:    new Float32Array(allCls),
  };
}

export function Quays({ circleTex }: { circleTex: THREE.Texture }) {
  const { positions, colors } = useMemo(generateQuays, []);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color",    new BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  return (
    <points geometry={geo}>
      <pointsMaterial map={circleTex} alphaTest={0.1} size={0.048} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}
