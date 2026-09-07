import { point, type Cloud, type RGB } from "../../geometry";

const LIGHT: RGB = [0.91, 0.88, 0.79];

export function addSpire(cloud: Cloud) {
  for (const corner of [-1, 1]) for (let level = 0; level < 7; level++) {
    point(cloud, 0.72 + corner * 0.54, 4.08 + level * 0.08, 1.24, LIGHT);
  }
}
