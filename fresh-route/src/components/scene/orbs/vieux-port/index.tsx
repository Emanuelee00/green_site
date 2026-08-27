import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Water }     from "./Water";
import { Quays }     from "./Quays";
import { Buildings } from "./buildings";
import { Forts }     from "./Forts";
import { Boats }     from "./boats";
import { Ground }    from "./Ground";
import { Lighting }  from "./Lighting";

interface VieuxPortOrbProps {
  isActive: boolean;
  onTap?: () => void;
  color?: string;
}

// Texture circolare per i punti — evita il look "quadrato" di gl_POINTS
function makeCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0,   "rgba(255,255,255,1)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.8)");
  grad.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export function VieuxPortOrb({ isActive, onTap }: VieuxPortOrbProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const scaleRef = useRef(isActive ? 1.0 : 0.55);

  // texture condivisa fra tutti i <pointsMaterial> figli
  const circleTex = useMemo(makeCircleTexture, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (isActive ? 0.10 : 0.06);
    const target = isActive ? 1.0 : 0.52;
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 5);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    // La scena interna usa coordinate reali (-2.5 … 2.5)
    // Il gruppo esterno la scala alla dimensione dell'orb nel carousel
    <group
      ref={groupRef}
      // vista isometrica leggera: roll avanti 20°, nessun tilt laterale
      rotation={[0.35, 0.2, 0]}
      position={[0, 0.1, 0]}
      scale={[0.30, 0.30, 0.30]}
      onClick={onTap}
    >
      {/* Inietta la texture circolare nel context per i figli */}
      <Lighting />
      <Water circleTex={circleTex} />
      <Quays  circleTex={circleTex} />
      <Buildings circleTex={circleTex} />
      <Forts  circleTex={circleTex} />
      <Boats  circleTex={circleTex} />
      <Ground circleTex={circleTex} />
    </group>
  );
}
