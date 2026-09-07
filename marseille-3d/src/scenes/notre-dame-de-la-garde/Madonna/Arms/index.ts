import { point, type Cloud, type RGB } from "../../geometry";

const GOLD: RGB = [1, 0.76, 0.12], PALE: RGB = [1, 0.92, 0.42];

export function addArms(cloud: Cloud) {
  for (let i = 0; i <= 8; i++) {
    point(cloud, 0.64 - i * 0.035, 4.72 + i * 0.035, 1.05, GOLD);
    point(cloud, 0.8 + i * 0.03, 4.73 + i * 0.02, 1.05, PALE);
  }
}
