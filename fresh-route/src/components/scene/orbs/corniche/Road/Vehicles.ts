import { addPoint, type Cloud } from "../shared"; import { roadCurve } from "./Asphalt";
export function addVehicles(cloud:Cloud){for(let car=0;car<5;car++){const z=-2.3+car*1.1,x=roadCurve(z)+0.18+(car%2)*0.35;for(let a=0;a<12;a++)addPoint(cloud,x+(a%4)*0.045,0.93+Math.floor(a/4)*0.035,z,[0.75-car*0.08,0.18+car*0.08,0.16]);}}
