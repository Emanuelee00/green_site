import { box, type Cloud, type RGB } from "../../geometry";

const LIGHT: RGB = [0.9, 0.87, 0.78];

export function addWalls(cloud: Cloud) {
  box(cloud, [0, 0.72, -0.15], [2.75, 1.32, 2.65], LIGHT, 0.1);
}
