import type { AddPoint, BoatDef, BoatShape } from "./types";

export function addHull(boat: BoatDef, shape: BoatShape, add: AddPoint) {
  for (let row = 0; row <= 12; row++) {
    const t = row / 12, z = (t - 0.5) * shape.length;
    const taper = Math.sin(t * Math.PI) * (t < 0.15 ? t / 0.15 : 1);
    const halfWidth = shape.width * 0.5 * taper;
    for (let col = 0; col <= 8; col++) {
      const x = (col / 8 - 0.5) * halfWidth * 2;
      add(x, shape.height * 0.5, z, boat.hullColor);
      for (let depth = 1; depth <= 5; depth++) {
        const ratio = depth / 5;
        add(x * (1 - ratio * 0.35), shape.height * (0.5 - ratio), z, boat.hullColor);
      }
    }
  }
}
