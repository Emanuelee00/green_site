import { addPoint, rnd, type Cloud, type RGB } from "../shared";

const GREEN: RGB[] = [[0.12, 0.3, 0.14], [0.2, 0.42, 0.19], [0.32, 0.48, 0.2]];
export function addCrowns(cloud: Cloud) {
  for (let tree = 0; tree < 38; tree++) {
    const side = tree % 2 ? -1 : 1, z = -2.45 + tree / 37 * 4.8, x = side * (1.8 + tree % 4 * 0.16), base = 1.05 + tree % 5 * 0.09;
    for (let leaf = 0; leaf < 22; leaf++) {
      const angle = leaf / 22 * Math.PI * 2, radius = rnd(0.07, 0.22);
      addPoint(cloud, x + Math.cos(angle) * radius, base + rnd(-0.06, 0.16), z + Math.sin(angle) * radius, GREEN[leaf % 3]);
    }
  }
}
