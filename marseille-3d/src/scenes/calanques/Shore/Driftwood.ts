import { addPoint, type Cloud } from "../shared";
export function addDriftwood(cloud: Cloud) {
  for (let branch = 0; branch < 5; branch++) for (let i = 0; i < 15; i++) addPoint(cloud, -0.8 + branch * 0.38 + i * 0.018, 0.1 + i * 0.003, 2.7 + branch % 2 * 0.12, [0.36, 0.25, 0.16]);
}
