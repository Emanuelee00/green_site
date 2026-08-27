import { point, type Cloud, type RGB } from "../../geometry";

const DARK: RGB = [0.27, 0.31, 0.3];

export function addBelfry(cloud: Cloud) {
  for (const face of [-1, 1]) for (let column = 0; column < 3; column++) for (let y = 0; y < 9; y++) {
    point(cloud, 0.49 + column * 0.23, 3.06 + y * 0.075, 0.82 + face * 0.47, DARK);
  }
}
