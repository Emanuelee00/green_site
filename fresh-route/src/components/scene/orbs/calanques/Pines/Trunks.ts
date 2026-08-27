import { addPoint, rnd, type Cloud, type RGB } from "../shared";

const BARK: RGB[] = [[0.3, 0.2, 0.12], [0.36, 0.25, 0.15]];

export function addTrunks(cloud: Cloud) {
  for (let tree = 0; tree < 38; tree++) {
    const side = tree % 2 ? -1 : 1, z = rnd(-2.5, 2.4), x = side * rnd(1.6, 2.5), base = rnd(0.65, 1.5);
    for (let level = 0; level < 8; level++) addPoint(cloud, x, base + level * 0.055, z, BARK[tree % 2]);
  }
}
