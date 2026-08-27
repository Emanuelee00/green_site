import { addPoint, type Cloud } from "../shared";
export function addRipples(cloud: Cloud) {
  for (let ring = 0; ring < 6; ring++) for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, r = 0.12 + ring * 0.08; addPoint(cloud, -1.4 + Math.cos(a) * r, 0.03, 0.5 + Math.sin(a) * r * 0.45, [0.3, 0.68, 0.84]); }
}
