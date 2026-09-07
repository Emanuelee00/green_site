import { addPoint, rnd, type Cloud } from "../shared";
import { coastEdge } from "../Coast/Face";
export function addFoam(cloud: Cloud) {
  for (let i = 0; i < 220; i++) { const z = rnd(-2.7, 2.7); addPoint(cloud, coastEdge(z) - 0.07 + rnd(-0.04, 0.04), 0.04, z, [0.82, 0.94, 0.91]); }
}
