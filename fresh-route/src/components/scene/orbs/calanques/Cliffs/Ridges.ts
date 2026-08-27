import { addPoint, type Cloud } from "../shared";

export function addRidges(cloud: Cloud) {
  for (const side of [-1, 1]) for (let i = 0; i <= 55; i++) {
    const z = -2.8 + i / 55 * 5.6, height = 1.35 + Math.abs(Math.sin(z * 0.8)) * 0.85;
    addPoint(cloud, side * (1.7 + (z + 2.8) * 0.2), height, z, [0.95, 0.91, 0.8]);
  }
}
