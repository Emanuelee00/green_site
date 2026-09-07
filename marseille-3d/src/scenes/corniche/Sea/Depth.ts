import { addPoint, type Cloud } from "../shared";
export function addDepth(cloud: Cloud) {
  for (let row = 0; row < 32; row++) for (let col = 0; col < 28; col++) addPoint(cloud, -3.25 + col / 27 * 4.1, -0.1, -2.65 + row / 31 * 5.3, [0.02, 0.16, 0.36]);
}
