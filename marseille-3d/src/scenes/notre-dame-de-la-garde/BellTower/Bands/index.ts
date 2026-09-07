import { point, type Cloud, type RGB } from "../../geometry";

const DARK: RGB = [0.27, 0.31, 0.3];

export function addBands(cloud: Cloud) {
  for (let band = 0; band < 7; band++) for (let x = -0.43; x <= 0.43; x += 0.085) {
    point(cloud, 0.72 + x, 1.65 + band * 0.32, 1.29, DARK);
  }
}
