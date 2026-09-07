import { addPoint, type Cloud } from "../shared";
export const roadCurve=(z:number)=>2+Math.sin(z*1.1)*0.28;
export function addAsphalt(cloud:Cloud){for(let row=0;row<=76;row++){const z=-3+row/76*6,curve=roadCurve(z);for(let lane=0;lane<=12;lane++)addPoint(cloud,curve+lane/12*0.72,0.86,z,[0.25,0.27,0.27]);}}
