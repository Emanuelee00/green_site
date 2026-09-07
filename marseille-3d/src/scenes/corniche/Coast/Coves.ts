import { addPoint, type Cloud } from "../shared";
export function addCoves(cloud: Cloud) {
  for(let cove=0;cove<4;cove++) for(let i=0;i<=20;i++){ const a=i/20*Math.PI; addPoint(cloud,1.24+Math.sin(a)*0.2,0.1+Math.sin(a)*0.18,-2+cove*1.3+Math.cos(a)*0.2,[0.15,0.2,0.21]); }
}
