import { COLORS } from "./shared";
import type { BoatDef } from "./types";

export const BOATS: BoatDef[] = [
  { x:-1.14, z:-1.0, angle:0, length:0.38, hullColor:COLORS.hull, hasCabin:true, hasSail:false },
  { x:-1.14, z:-0.5, angle:Math.PI, length:0.30, hullColor:COLORS.hull2, hasCabin:false, hasSail:true },
  { x:-1.14, z:0, angle:0, length:0.34, hullColor:COLORS.hull3, hasCabin:true, hasSail:false },
  { x:-1.14, z:0.5, angle:Math.PI, length:0.26, hullColor:COLORS.hull, hasCabin:false, hasSail:true },
  { x:-1.14, z:1, angle:0, length:0.36, hullColor:COLORS.hull2, hasCabin:true, hasSail:false },
  { x:-1.14, z:1.4, angle:Math.PI, length:0.28, hullColor:COLORS.hull3, hasCabin:false, hasSail:false },
  { x:-1.14, z:-1.5, angle:0, length:0.32, hullColor:COLORS.hull, hasCabin:false, hasSail:true },
  { x:1.14, z:-0.8, angle:0, length:0.36, hullColor:COLORS.hull2, hasCabin:true, hasSail:false },
  { x:1.14, z:-0.3, angle:Math.PI, length:0.28, hullColor:COLORS.hull, hasCabin:false, hasSail:true },
  { x:1.14, z:0.2, angle:0, length:0.32, hullColor:COLORS.hull3, hasCabin:true, hasSail:false },
  { x:1.14, z:0.7, angle:Math.PI, length:0.26, hullColor:COLORS.hull2, hasCabin:false, hasSail:true },
  { x:1.14, z:1.2, angle:0, length:0.34, hullColor:COLORS.hull, hasCabin:true, hasSail:false },
  { x:1.14, z:-1.3, angle:Math.PI, length:0.30, hullColor:COLORS.hull3, hasCabin:false, hasSail:true },
];
