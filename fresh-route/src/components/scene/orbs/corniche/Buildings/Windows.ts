import { addPoint,type Cloud } from "../shared";
export function addWindows(cloud:Cloud){for(let h=0;h<7;h++)for(let floor=0;floor<2;floor++)for(let col=0;col<3;col++)for(let i=0;i<8;i++)addPoint(cloud,3.05+col*.18+(i%2)*.035,1.15+floor*.32+Math.floor(i/2)*.035,-2.705+h*.88,[.12,.25,.32]);}
