import { addPoint, rnd, type Cloud } from "../shared";

export function addShrubs(cloud: Cloud) {
  for (let i = 0; i < 360; i++) {
    const side = i % 2 ? -1 : 1, z = rnd(-2.6, 2.5), x = side * rnd(1.55, 2.7);
    addPoint(cloud, x, rnd(0.45, 0.9), z, i % 3 ? [0.27, 0.42, 0.18] : [0.42, 0.5, 0.22]);
  }
}
