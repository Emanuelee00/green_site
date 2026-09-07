import { addPoint, rnd, type Cloud } from "../shared";
export function addPlants(cloud: Cloud) {
  for(let i=0;i<260;i++) addPoint(cloud,rnd(1.45,2.15),rnd(0.45,0.95),rnd(-2.8,2.8),i%3?[0.25,0.4,0.18]:[0.43,0.48,0.2]);
}
