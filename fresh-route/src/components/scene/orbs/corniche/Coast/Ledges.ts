import { addPoint, type Cloud } from "../shared";
export function addLedges(cloud: Cloud) {
  for(let ledge=0;ledge<7;ledge++) for(let i=0;i<28;i++){ const z=-2.7+ledge*0.86+i/27*0.42; addPoint(cloud,1.12+i/27*0.55,0.18+ledge%3*0.16,z,[0.83,0.77,0.64]); }
}
