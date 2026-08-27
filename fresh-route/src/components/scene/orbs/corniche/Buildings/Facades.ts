import { addPoint,type Cloud,type RGB } from "../shared"; const C:RGB[]=[[.92,.72,.54],[.88,.84,.73],[.8,.66,.54]];
export function addFacades(cloud:Cloud){for(let h=0;h<7;h++)for(let x=0;x<=9;x++)for(let y=0;y<=9;y++)addPoint(cloud,2.95+x*.055,.95+y*.075,-2.7+h*.88,C[h%3]);}
