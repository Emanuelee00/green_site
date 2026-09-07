export type RGB = [number, number, number];
export type BoatCloud = { points: number[]; colors: number[] };

export interface BoatDef {
  x: number;
  z: number;
  angle: number;
  length: number;
  hullColor: RGB;
  hasCabin: boolean;
  hasSail: boolean;
}

export interface BoatShape {
  length: number;
  width: number;
  height: number;
  mastHeight: number;
  mastZ: number;
}

export type AddPoint = (x: number, y: number, z: number, color: RGB) => void;
