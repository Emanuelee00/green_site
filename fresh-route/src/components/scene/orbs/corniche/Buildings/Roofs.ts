import { addPoint,type Cloud } from "../shared";
export function addRoofs(cloud:Cloud){for(let h=0;h<7;h++)for(let i=0;i<=14;i++)addPoint(cloud,2.88+i*.045,1.66+Math.sin(i/14*Math.PI)*.18,-2.7+h*.88,[.58,.25,.17]);}
