import { addPoint, rnd, type Cloud, type RGB } from "../shared";
const ROCK: RGB[] = [[0.78,0.72,0.59],[0.65,0.59,0.48],[0.9,0.84,0.7]];
export const coastEdge = (z: number) => 1.15 + Math.sin(z * 1.45) * 0.25;
export function addFace(cloud: Cloud) {
  for (let row=0;row<=64;row++) { const z=-3+row/64*6, edge=coastEdge(z); for(let level=0;level<=18;level++){ const y=level/18*(0.72+Math.cos(z*1.2)*0.15); addPoint(cloud,edge+y*0.48+rnd(-0.03,0.03),y,z,ROCK[(row+level)%3]); } }
}
