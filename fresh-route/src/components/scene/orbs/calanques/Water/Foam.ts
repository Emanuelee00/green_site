import { addPoint, rnd, type Cloud } from "../shared";

export function addFoam(cloud: Cloud) {
  for (let i = 0; i < 160; i++) {
    const x = rnd(-1.15, 1.15);
    addPoint(cloud, x, 0.035, 2.3 + Math.sin(x * 5) * 0.035 + rnd(-0.025, 0.025), [0.85, 0.96, 0.92]);
  }
}
