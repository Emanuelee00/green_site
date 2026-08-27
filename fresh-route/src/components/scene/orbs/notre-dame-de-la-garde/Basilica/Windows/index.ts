import { point, type Cloud } from "../../geometry";

export function addWindows(cloud: Cloud) {
  for (const side of [-1, 1]) for (let window = 0; window < 4; window++) for (let i = 0; i < 12; i++) {
    const angle = i / 11 * Math.PI;
    point(cloud, side * 1.405, 1.35 + Math.sin(angle) * 0.18, -1 + window * 0.65 + Math.cos(angle) * 0.13, [0.12, 0.22, 0.25]);
  }
}
