import { sphere, type Cloud, type RGB } from "../../geometry";

const PALE: RGB = [1, 0.92, 0.42];

export function addChild(cloud: Cloud) {
  sphere(cloud, [1.02, 4.89, 1.05], 0.07, PALE);
}
