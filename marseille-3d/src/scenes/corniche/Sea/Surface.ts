import { addPoint, type Cloud } from "../shared";
import { coastEdge } from "../Coast/Face";
export function addSurface(cloud: Cloud) {
  for (let row = 0; row < 58; row++) for (let col = 0; col < 54; col++) {
    const z = -2.8 + row / 57 * 5.6, shore = col / 53;
    const x = -3.4 + shore * (coastEdge(z) + 3.4);
    addPoint(cloud, x, 0, z, [0.03 + shore * 0.1, 0.25 + shore * 0.38, 0.52 + shore * 0.32]);
  }
}
