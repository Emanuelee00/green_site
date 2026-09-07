import { COLORS } from "./shared";
import type { AddPoint, BoatDef, BoatShape } from "./types";

export function addSails(boat: BoatDef, shape: BoatShape, add: AddPoint) {
  if (!boat.hasSail) return;
  const color = boat.x < 0 ? COLORS.sail : COLORS.sail2;
  const base = shape.height * 0.52 + shape.mastHeight * 0.08;
  const top = shape.height * 0.52 + shape.mastHeight * 0.92;
  for (let row = 0; row <= 14; row++) {
    const t = row / 14, y = base + t * (top - base);
    const end = shape.mastZ - shape.length * 0.42 * (1 - t);
    const steps = Math.max(2, Math.round((1 - t) * 8));
    for (let col = 0; col <= steps; col++) {
      const ratio = col / steps;
      add(Math.sin(ratio * Math.PI) * shape.width * 0.12, y, shape.mastZ + ratio * (end - shape.mastZ), color);
    }
  }
  for (let row = 0; row <= 8; row++) {
    const t = row / 8, steps = Math.max(1, Math.round((1 - t) * 5));
    for (let col = 0; col <= steps; col++) add(0, base + t * shape.mastHeight * 0.6, shape.mastZ + col / steps * shape.length * 0.35 * (1 - t), color);
  }
}
