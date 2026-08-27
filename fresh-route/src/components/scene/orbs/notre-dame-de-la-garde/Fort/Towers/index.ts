import { box, type Cloud } from "../../geometry";

export function addTowers(cloud: Cloud) {
  box(cloud, [-1.85, 0.48, 1.25], [0.55, 0.55, 0.55], [0.58, 0.53, 0.44], 0.1);
  box(cloud, [1.85, 0.48, 1.25], [0.55, 0.55, 0.55], [0.58, 0.53, 0.44], 0.1);
}
