import type { AddPoint, BoatCloud, BoatDef, BoatShape, RGB } from "./types";

export const COLORS = {
  hull: [0.18, 0.32, 0.52] as RGB,
  hull2: [0.28, 0.18, 0.12] as RGB,
  hull3: [0.15, 0.38, 0.28] as RGB,
  deck: [0.88, 0.82, 0.68] as RGB,
  cabin: [0.92, 0.9, 0.85] as RGB,
  mast: [0.72, 0.62, 0.44] as RGB,
  rope: [0.6, 0.56, 0.48] as RGB,
  sail: [0.96, 0.94, 0.88] as RGB,
  sail2: [0.85, 0.72, 0.55] as RGB,
};

export function boatShape(boat: BoatDef): BoatShape {
  const height = boat.length * 0.18;
  return {
    length: boat.length,
    width: boat.length * 0.28,
    height,
    mastHeight: boat.length * (boat.hasCabin ? 1.6 : 1.4),
    mastZ: boat.hasCabin ? boat.length * 0.12 : 0,
  };
}

export function boatPoint(boat: BoatDef, cloud: BoatCloud): AddPoint {
  const cos = Math.cos(boat.angle), sin = Math.sin(boat.angle);
  return (x, y, z, color) => {
    cloud.points.push(boat.x + cos * z + sin * x, y, boat.z - sin * z + cos * x);
    cloud.colors.push(...color);
  };
}
