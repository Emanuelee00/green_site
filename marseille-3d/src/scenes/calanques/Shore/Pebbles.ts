import { addPoint, rnd, type Cloud } from "../shared";
export function addPebbles(cloud: Cloud) {
  for (let i = 0; i < 260; i++) addPoint(cloud, rnd(-1.05, 1.05), rnd(0.035, 0.075), rnd(2.35, 2.9), i % 3 ? [0.68, 0.65, 0.58] : [0.82, 0.79, 0.71]);
}
