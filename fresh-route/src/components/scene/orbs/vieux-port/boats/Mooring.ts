import { COLORS } from "./shared";
import type { AddPoint, BoatShape } from "./types";

export function addMooring(shape: BoatShape, add: AddPoint) {
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    add(-shape.width * 0.3, shape.height * (0.4 - t * 0.3), shape.length * (-0.45 + t * 0.1), COLORS.rope);
    add(shape.width * 0.3, shape.height * (0.4 - t * 0.3), shape.length * (-0.45 + t * 0.1), COLORS.rope);
  }
}
