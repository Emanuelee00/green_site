import { addPoint, type Cloud } from "../shared";

export function addRipples(cloud: Cloud) {
  for (let ring = 0; ring < 5; ring++) for (let i = 0; i < 32; i++) {
    const angle = i / 32 * Math.PI * 2, radius = 0.12 + ring * 0.07;
    addPoint(cloud, -0.45 + Math.cos(angle) * radius, 0.03, 0.3 + Math.sin(angle) * radius * 0.45, [0.35, 0.75, 0.86]);
  }
}
