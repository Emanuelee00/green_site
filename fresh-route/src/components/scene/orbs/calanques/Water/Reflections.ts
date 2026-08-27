import { addPoint, type Cloud } from "../shared";

export function addReflections(cloud: Cloud) {
  for (let i = 0; i < 180; i++) {
    const z = -2.5 + i / 179 * 4.8, x = Math.sin(i * 1.7) * (0.1 + (z + 2.5) * 0.08);
    addPoint(cloud, x, 0.025, z, [0.58, 0.9, 0.94]);
  }
}
