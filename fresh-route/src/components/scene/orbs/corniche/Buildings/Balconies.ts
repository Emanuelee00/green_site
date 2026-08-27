import { addPoint,type Cloud } from "../shared";
export function addBalconies(cloud:Cloud){for(let h=0;h<7;h++)for(let floor=0;floor<2;floor++)for(let i=0;i<12;i++){addPoint(cloud,2.92+i*.055,1.12+floor*.34,-2.78+h*.88,[.3,.28,.25]);if(i%3===0)addPoint(cloud,2.92+i*.055,1.25+floor*.34,-2.78+h*.88,[.3,.28,.25]);}}
