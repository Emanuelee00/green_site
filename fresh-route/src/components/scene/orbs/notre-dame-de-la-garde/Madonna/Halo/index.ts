import { point, type Cloud, type RGB } from "../../geometry";

const PALE: RGB = [1, 0.92, 0.42];

export function addHalo(cloud: Cloud) {
  for (let ray = 0; ray < 8; ray++) {
    const angle = ray / 8 * Math.PI * 2;
    point(cloud, 0.72 + Math.cos(angle) * 0.19, 4.91 + Math.sin(angle) * 0.19, 1.04, PALE);
  }
}
