import { addPoint, type Cloud } from "../shared";
export function addWaterline(cloud: Cloud) {
  for (let i = 0; i < 90; i++) { const x = -1.15 + i / 89 * 2.3; addPoint(cloud, x, 0.045, 2.31 + Math.sin(x * 7) * 0.025, [0.62, 0.88, 0.84]); }
}
