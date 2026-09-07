import { addPoint, type Cloud } from "../shared";
export function addReflections(cloud: Cloud) {
  for (let stripe = 0; stripe < 6; stripe++) for (let i = 0; i < 70; i++) addPoint(cloud, -2.8 + stripe * 0.6 + Math.sin(i) * 0.04, 0.025, -2.5 + i / 69 * 5, [0.4, 0.76, 0.9]);
}
