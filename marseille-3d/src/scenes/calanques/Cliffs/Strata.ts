import { addPoint, type Cloud, type RGB } from "../shared";

const BAND: RGB[] = [[0.6, 0.56, 0.47], [0.4, 0.38, 0.33]];

export function addStrata(cloud: Cloud) {
  for (const side of [-1, 1]) for (let band = 0; band < 5; band++) for (let row = 0; row < 42; row++) {
    const z = -2.6 + row / 41 * 5.1, edge = 1.25 + (z + 2.7) * 0.2;
    addPoint(cloud, side * (edge + band * 0.08), 0.35 + band * 0.31, z, BAND[band % 2]);
  }
}
