import { COLORS } from "./shared";
import type { AddPoint, BoatShape } from "./types";

export function addMast(shape: BoatShape, add: AddPoint) {
  const base = shape.height * 0.52;
  for (let level = 0; level <= 16; level++) {
    add(0, base + level / 16 * shape.mastHeight, shape.mastZ, COLORS.mast);
  }
  for (let col = 0; col <= 6; col++) {
    const x = (col / 6 - 0.5) * shape.length * 0.56;
    add(x, base + shape.mastHeight * 0.85, shape.mastZ, COLORS.mast);
  }
}
