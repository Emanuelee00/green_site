import { addPoint, type Cloud } from "../shared";
export function addCabanons(cloud: Cloud) {
  for (let cabin = 0; cabin < 3; cabin++) for (let x = 0; x <= 7; x++) for (let y = 0; y <= 6; y++) addPoint(cloud, -0.9 + cabin * 0.7 + x * 0.055, 0.16 + y * 0.06, 2.98, x % 4 === 2 ? [0.2, 0.42, 0.48] : [0.86, 0.72, 0.54]);
}
