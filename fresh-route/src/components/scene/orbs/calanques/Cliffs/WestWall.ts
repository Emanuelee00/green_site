import { addPoint, rnd, type Cloud, type RGB } from "../shared";

const LIMESTONE: RGB[] = [[0.87, 0.82, 0.7], [0.8, 0.75, 0.62], [0.9, 0.86, 0.75], [0.72, 0.67, 0.54]];
const SHADOW: RGB = [0.5, 0.47, 0.4];

export function addWestWall(cloud: Cloud) {
  for (let row = 0; row <= 42; row++) for (let level = 0; level <= 23; level++) {
    const z = -2.8 + row / 42 * 5.6, mouth = 1.22 + (z + 2.8) * 0.2;
    const height = 0.75 + Math.pow(Math.abs(z - 0.2) / 3, 1.35) * 1.5, y = level / 23 * height;
    const color = level % 7 === 0 ? SHADOW : LIMESTONE[(row * 3 + level) % 4];
    addPoint(cloud, -mouth - y * 0.28 + rnd(-0.025, 0.025), y, z, color);
  }
}
