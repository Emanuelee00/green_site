import type { BoatDef } from "../../vieux-port/boats/types";

const RED: [number, number, number] = [0.85, 0.28, 0.14];

export const CALANQUES_BOATS: BoatDef[] = [
  { x: 0, z: -0.6, angle: Math.PI / 2, length: 0.3, hullColor: RED, hasCabin: false, hasSail: true },
];
