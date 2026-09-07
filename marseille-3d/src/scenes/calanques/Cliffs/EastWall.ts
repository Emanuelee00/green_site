import { addPoint, rnd, type Cloud, type RGB } from "../shared";

const LIMESTONE: RGB[] = [[0.92, 0.88, 0.76], [0.85, 0.8, 0.66], [0.95, 0.92, 0.83], [0.78, 0.72, 0.58]];
const SHADOW: RGB = [0.55, 0.52, 0.44];

export function addEastWall(cloud: Cloud) {
  for (let row = 0; row <= 42; row++) for (let level = 0; level <= 23; level++) {
    const z = -2.8 + row / 42 * 5.6, mouth = 1.22 + (z + 2.8) * 0.2;
    const height = 0.78 + Math.pow(Math.abs(z + 0.15) / 3, 1.3) * 1.55, y = level / 23 * height;
    const color = level % 7 === 0 ? SHADOW : LIMESTONE[(row * 3 + level) % 4];
    addPoint(cloud, mouth + y * 0.3 + rnd(-0.025, 0.025), y, z, color);
  }
}
