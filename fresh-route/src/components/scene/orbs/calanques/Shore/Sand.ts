import { addPoint, rnd, type Cloud } from "../shared";
export function addSand(cloud: Cloud) {
  for (let row = 0; row < 18; row++) for (let col = 0; col < 34; col++) {
    const x = (col / 33 - 0.5) * (2.35 - row * 0.035);
    addPoint(cloud, x + rnd(-0.015, 0.015), 0.015 + row * 0.004, 2.3 + row * 0.045, [0.88, 0.84, 0.7]);
  }
}
