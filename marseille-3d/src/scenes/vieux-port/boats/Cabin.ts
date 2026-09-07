import { COLORS } from "./shared";
import type { AddPoint, BoatDef, BoatShape } from "./types";

export function addCabin(boat: BoatDef, shape: BoatShape, add: AddPoint) {
  if (!boat.hasCabin) return;
  const length = shape.length * 0.3, width = shape.width * 0.5;
  const height = shape.height * 0.65, centerZ = shape.length * 0.05;
  for (let row = 0; row <= 5; row++) for (let col = 0; col <= 5; col++) {
    const x = (col / 5 - 0.5) * width, z = centerZ + (row / 5 - 0.5) * length;
    add(x, shape.height * 0.52, z, COLORS.cabin);
    add(x, shape.height * 0.52 + height, z, COLORS.cabin);
  }
  for (let level = 0; level <= 4; level++) {
    const y = shape.height * 0.52 + level / 4 * height;
    add(-width / 2, y, centerZ - length / 2, COLORS.cabin);
    add(width / 2, y, centerZ + length / 2, COLORS.cabin);
  }
}
