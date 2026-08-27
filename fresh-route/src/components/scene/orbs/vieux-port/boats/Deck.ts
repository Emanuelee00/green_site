import { COLORS } from "./shared";
import type { AddPoint, BoatShape } from "./types";

export function addDeck(shape: BoatShape, add: AddPoint) {
  for (let row = 0; row <= 10; row++) {
    const t = row / 10, z = (t - 0.5) * shape.length * 0.88;
    const halfWidth = shape.width * 0.42 * Math.sin(t * Math.PI);
    for (let col = 0; col <= 6; col++) {
      add((col / 6 - 0.5) * halfWidth * 2, shape.height * 0.52, z, COLORS.deck);
    }
  }
}
