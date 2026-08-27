import * as THREE from "three";

export type RGB = [number, number, number];
export type Cloud = { points: number[]; colors: number[] };

export function circleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(0.62, "rgba(255,255,255,.86)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function point(cloud: Cloud, x: number, y: number, z: number, color: RGB) {
  cloud.points.push(x, y, z);
  cloud.colors.push(...color);
}

export function box(cloud: Cloud, center: number[], size: number[], color: RGB, step = 0.11) {
  const [cx, cy, cz] = center, [w, h, d] = size;
  for (let x = -w / 2; x <= w / 2; x += step) for (let y = 0; y <= h; y += step) {
    point(cloud, cx + x, cy + y, cz - d / 2, color); point(cloud, cx + x, cy + y, cz + d / 2, color);
  }
  for (let z = -d / 2; z <= d / 2; z += step) for (let y = 0; y <= h; y += step) {
    point(cloud, cx - w / 2, cy + y, cz + z, color); point(cloud, cx + w / 2, cy + y, cz + z, color);
  }
}

export function ring(cloud: Cloud, center: number[], radius: number, color: RGB, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;
    point(cloud, center[0] + Math.cos(angle) * radius, center[1], center[2] + Math.sin(angle) * radius, color);
  }
}

export function sphere(cloud: Cloud, center: number[], radius: number, color: RGB) {
  for (let row = 1; row < 7; row++) {
    const phi = row / 7 * Math.PI, ringRadius = Math.sin(phi) * radius;
    for (let col = 0; col < 14; col++) {
      const angle = col / 14 * Math.PI * 2;
      point(cloud, center[0] + Math.cos(angle) * ringRadius, center[1] + Math.cos(phi) * radius, center[2] + Math.sin(angle) * ringRadius, color);
    }
  }
}
