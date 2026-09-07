import { addPoint, type Cloud } from "../shared";
export function addBuoys(cloud: Cloud) {
  for (let buoy = 0; buoy < 6; buoy++) for (let i = 0; i < 10; i++) { const angle = i / 10 * Math.PI * 2; addPoint(cloud, -0.9 + buoy * 0.35 + Math.cos(angle) * 0.04, 0.08, 1.45 + Math.sin(angle) * 0.04, buoy % 2 ? [0.95, 0.75, 0.12] : [0.9, 0.2, 0.12]); }
}
