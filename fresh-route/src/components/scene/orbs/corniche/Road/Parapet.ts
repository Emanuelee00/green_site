import { addPoint, rnd, type Cloud, type RGB } from "../shared"; import { roadCurve } from "./Asphalt";
const STONE: RGB[] = [[0.82, 0.79, 0.7], [0.76, 0.73, 0.63], [0.87, 0.84, 0.76]];
const CAP: RGB = [0.9, 0.87, 0.79];
export function addParapet(cloud: Cloud) {
  for (let row = 0; row <= 76; row++) {
    const z = -3 + row / 76 * 6, x = roadCurve(z) - 0.08;
    for (let level = 0; level <= 4; level++) addPoint(cloud, x + rnd(-0.01, 0.01), 0.9 + level * 0.055, z, STONE[(row + level) % 3]);
    addPoint(cloud, x - 0.02, 1.14, z, CAP); addPoint(cloud, x + 0.03, 1.14, z, CAP);
  }
  for (let pier = 0; pier <= 12; pier++) {
    const z = -3 + pier / 12 * 6, x = roadCurve(z) - 0.08;
    for (let h = 0; h <= 6; h++) addPoint(cloud, x, 0.88 + h * 0.06, z, CAP);
  }
}
