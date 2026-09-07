import { sphere, type Cloud, type RGB } from "../../geometry";

const PALE: RGB = [1, 0.92, 0.42];

export function addHead(cloud: Cloud) {
  sphere(cloud, [0.72, 4.91, 1.05], 0.11, PALE);
}
