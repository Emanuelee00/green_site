import { box, type Cloud, type RGB } from "../../geometry";

const STONE: RGB = [0.7, 0.65, 0.54];

export function addRamparts(cloud: Cloud) {
  box(cloud, [0, 0, 0], [4.9, 0.72, 3.5], STONE, 0.13);
}
