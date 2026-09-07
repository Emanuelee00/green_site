import { ring, type Cloud, type RGB } from "../../geometry";

const LIGHT: RGB = [0.9, 0.87, 0.78], DARK: RGB = [0.3, 0.34, 0.32];

export function addDome(cloud: Cloud) {
  for (let level = 0; level <= 12; level++) {
    ring(cloud, [-0.55, 2.02 + level * 0.065, -0.55], 0.5 * Math.cos(level / 12 * Math.PI / 2), level % 3 ? LIGHT : DARK, 18);
  }
}
