import { addPoint, type Cloud } from "../shared"; import { roadCurve } from "./Asphalt";
export function addMarkings(cloud:Cloud){for(let row=0;row<=76;row++){const z=-3+row/76*6,curve=roadCurve(z);for(const lane of [0,0.36,0.72])addPoint(cloud,curve+lane,0.875,z,lane===0.36?[0.94,0.86,0.55]:[0.88,0.88,0.84]);}}
