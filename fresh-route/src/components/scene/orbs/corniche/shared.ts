import * as THREE from "three";

export type RGB = [number, number, number];
export type Cloud = { points: number[]; colors: number[] };
export const rnd = (min: number, max: number) => min + Math.random() * (max - min);

export function addPoint(cloud: Cloud, x: number, y: number, z: number, color: RGB) {
  cloud.points.push(x, y, z);
  cloud.colors.push(...color);
}

export function makeCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.62, "rgba(255,255,255,.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}
