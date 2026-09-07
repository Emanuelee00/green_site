import { addPoint, type Cloud } from "../shared";

export function addDepth(cloud: Cloud) {
  for (let row = 0; row < 34; row++) for (let col = 0; col < 20; col++) {
    const z = -2.6 + row / 33 * 4.8, width = 0.9 + (z + 2.6) * 0.16;
    addPoint(cloud, (col / 19 - 0.5) * width * 2, -0.11, z, [0.02, 0.18, 0.38]);
  }
}
