import { addPoint, type Cloud } from "../shared";

export function addSurface(cloud: Cloud) {
  for (let row = 0; row < 58; row++) for (let col = 0; col < 42; col++) {
    const z = -2.7 + row / 57 * 5.2, width = 1.15 + (z + 2.7) * 0.2;
    const x = (col / 41 - 0.5) * width * 2, edge = Math.abs(col / 41 - 0.5) * 2;
    addPoint(cloud, x, 0, z, [0.02 + edge * 0.1, 0.38 + edge * 0.28, 0.58 + edge * 0.3]);
  }
}
