import { addPoint, type Cloud } from "../shared";

export function addCaves(cloud: Cloud) {
  for (const side of [-1, 1]) for (let cave = 0; cave < 3; cave++) for (let i = 0; i <= 18; i++) {
    const angle = i / 18 * Math.PI;
    addPoint(cloud, side * (1.48 + cave * 0.42), 0.16 + Math.sin(angle) * 0.2, -1.45 + cave * 1.2 + Math.cos(angle) * 0.16, [0.16, 0.2, 0.2]);
  }
}
