import { useMemo } from "react"; import * as THREE from "three";
import { addFace } from "./Face"; import { addStrata } from "./Strata"; import { addLedges } from "./Ledges"; import { addCoves } from "./Coves"; import { addPlants } from "./Plants"; import type { Cloud } from "../shared";
export function Coast({circleTex}:{circleTex:THREE.Texture}) {
 const data=useMemo(()=>{const cloud:Cloud={points:[],colors:[]};addFace(cloud);addStrata(cloud);addLedges(cloud);addCoves(cloud);addPlants(cloud);return{positions:new Float32Array(cloud.points),colors:new Float32Array(cloud.colors)}},[]);
 return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions,3]}/><bufferAttribute attach="attributes-color" args={[data.colors,3]}/></bufferGeometry><pointsMaterial map={circleTex} alphaTest={0.1} size={0.058} vertexColors transparent depthWrite={false}/></points>;
}
