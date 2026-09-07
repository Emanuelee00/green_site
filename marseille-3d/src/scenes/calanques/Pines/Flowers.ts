import { addPoint, rnd, type Cloud } from "../shared";

export function addFlowers(cloud: Cloud) {
  for (let i = 0; i < 90; i++) {
    const side = i % 2 ? -1 : 1;
    addPoint(cloud, side * rnd(1.5, 2.5), rnd(0.45, 0.82), rnd(-2.4, 2.4), i % 2 ? [0.72, 0.48, 0.7] : [0.92, 0.76, 0.3]);
  }
}
