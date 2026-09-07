import { ring, type Cloud, type RGB } from "../../geometry";

const GOLD: RGB = [1, 0.76, 0.12], PALE: RGB = [1, 0.92, 0.42];

export function addRobe(cloud: Cloud) {
  for (let level = 0; level <= 8; level++) {
    ring(cloud, [0.72, 4.18 + level * 0.075, 1.05], 0.2 - level * 0.015, level % 2 ? GOLD : PALE, 12);
  }
}
