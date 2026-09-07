import { addPoint, type Cloud } from "../shared";
export function addPath(cloud: Cloud) {
  for (let row = 0; row < 32; row++) for (let col = 0; col < 5; col++) addPoint(cloud, 0.62 + col * 0.055, 0.1 + row * 0.025, 2.95 - row * 0.08, [0.72, 0.67, 0.56]);
}
