import { addPoint,rnd,type Cloud } from "../shared";
export function addGardens(cloud:Cloud){for(let i=0;i<280;i++)addPoint(cloud,rnd(2.75,3.65),rnd(.78,1.08),rnd(-2.9,2.9),i%3?[.2,.4,.17]:[.42,.48,.2]);}
