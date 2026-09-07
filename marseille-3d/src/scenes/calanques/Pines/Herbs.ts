import { addPoint, rnd, type Cloud } from "../shared";

export function addHerbs(cloud: Cloud) {
  for (let plant = 0; plant < 70; plant++) {
    const side = plant % 2 ? -1 : 1, x = side * rnd(1.45, 2.55), z = rnd(-2.5, 2.5);
    for (let level = 0; level < 4; level++) addPoint(cloud, x + level * 0.015, 0.35 + level * 0.035, z, [0.48, 0.54, 0.25]);
  }
}
