import { point, type Cloud, type RGB } from "../../geometry";

const COLORS: RGB[] = [[0.27, 0.38, 0.19], [0.42, 0.47, 0.25], [0.55, 0.5, 0.36]];

export function addSlope(cloud: Cloud) {
  for (let ring = 0; ring <= 34; ring++) for (let i = 0; i < 54; i++) {
    const radius = ring / 34 * 3.7, angle = i / 54 * Math.PI * 2;
    const y = 0.85 * Math.exp(-radius * radius / 7) - 0.72;
    point(cloud, Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.68, COLORS[(ring + i) % 3]);
  }
}
