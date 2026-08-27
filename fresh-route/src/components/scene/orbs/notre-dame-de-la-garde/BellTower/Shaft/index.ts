import { box, type Cloud, type RGB } from "../../geometry";

const LIGHT: RGB = [0.91, 0.88, 0.79];

export function addShaft(cloud: Cloud) {
  box(cloud, [0.72, 1.45, 0.82], [0.9, 2.65, 0.92], LIGHT, 0.085);
}
