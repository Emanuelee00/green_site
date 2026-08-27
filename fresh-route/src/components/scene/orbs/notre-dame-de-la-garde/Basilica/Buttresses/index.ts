import { point, type Cloud, type RGB } from "../../geometry";

const DARK: RGB = [0.3, 0.34, 0.32];

export function addButtresses(cloud: Cloud) {
  for (let band = 0; band < 5; band++) for (let z = -1.4; z <= 1.2; z += 0.09) {
    point(cloud, -1.39, 0.84 + band * 0.24, z, DARK);
    point(cloud, 1.39, 0.84 + band * 0.24, z, DARK);
  }
}
