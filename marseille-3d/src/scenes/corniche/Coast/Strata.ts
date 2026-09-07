import { addPoint, type Cloud } from "../shared";
export function addStrata(cloud: Cloud) {
  for(let band=0;band<5;band++) for(let i=0;i<70;i++){ const z=-2.9+i/69*5.8; addPoint(cloud,1.3+band*0.12+Math.sin(z*1.5)*0.2,0.13+band*0.15,z,[0.5,0.47,0.4]); }
}
