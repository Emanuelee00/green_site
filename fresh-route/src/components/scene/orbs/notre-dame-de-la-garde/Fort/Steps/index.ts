import { point, type Cloud } from "../../geometry";

export function addSteps(cloud: Cloud) {
  for (let step = 0; step < 18; step++) for (let x = 0; x <= 12; x++) {
    point(cloud, -0.7 + x / 12 * 1.4, -0.35 + step * 0.045, 2.7 - step * 0.08, [0.85, 0.81, 0.72]);
  }
}
