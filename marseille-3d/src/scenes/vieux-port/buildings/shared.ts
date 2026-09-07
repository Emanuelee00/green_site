export type RGB = [number, number, number];

export function rnd(a: number, b: number) { return a + Math.random() * (b - a); }
export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Palette facciate haussmanniane marsigliesi
export const FACADE_PALETTE: RGB[] = [
  [0.84, 0.60, 0.42], // terracotta
  [0.80, 0.68, 0.48], // ocra chiara
  [0.74, 0.58, 0.36], // ocra scura
  [0.88, 0.74, 0.58], // salmone
  [0.92, 0.80, 0.64], // crema
  [0.78, 0.67, 0.52], // sabbia
  [0.70, 0.56, 0.43], // terracotta scura
];

export const SHUTTER_COLORS: RGB[] = [
  [0.18, 0.36, 0.22], // verde persiana tipico
  [0.14, 0.28, 0.42], // blu notte
  [0.38, 0.20, 0.14], // bordeaux
  [0.22, 0.32, 0.18], // verde scuro
];

/** Specifica di un edificio */
export interface BuildingSpec {
  facadeX: number;   // X della facciata (lato acqua)
  facadeZ: number;   // centro Z
  width: number;     // larghezza lungo Z (parallela al molo)
  depth: number;     // profondità verso l'esterno (con segno: ±)
  height: number;    // altezza totale
  floors: number;    // numero di piani
  bays: number;      // campate di finestre per piano
  colorIdx: number;
  shutterIdx: number;
  hasBalcony: boolean;
  hasArcade: boolean; // arcate al piano terra
  side: 1 | -1;
}

export function generateLayout(): BuildingSpec[] {
  const specs: BuildingSpec[] = [];

  function addRow(
    faceX: number, side: 1 | -1,
    zList: number[],
    depthR: [number, number],
    widthR: [number, number],
    heightR: [number, number],
    floorsR: [number, number],
  ) {
    for (const z of zList) {
      const h = rnd(...heightR);
      const fl = Math.round(rnd(...floorsR));
      const w = rnd(...widthR);
      specs.push({
        facadeX: faceX,
        facadeZ: z,
        width: w,
        depth: rnd(...depthR) * side,
        height: h,
        floors: fl,
        bays: Math.max(2, Math.round(w / 0.085)),
        colorIdx: Math.floor(Math.random() * FACADE_PALETTE.length),
        shutterIdx: Math.floor(Math.random() * SHUTTER_COLORS.length),
        hasBalcony: Math.random() > 0.35,
        hasArcade: Math.random() > 0.55,
        side,
      });
    }
  }

  // Prima fila — direttamente sul molo (facciata rivolta all'acqua)
  addRow(-1.52, -1, [-1.7,-1.1,-0.5, 0.1, 0.7, 1.3, 1.8], [0.22,0.34], [0.22,0.38], [0.30,0.58], [3,6]);
  addRow( 1.52,  1, [-1.5,-0.9,-0.3, 0.3, 0.9, 1.5, 1.9], [0.20,0.32], [0.20,0.36], [0.28,0.54], [3,6]);

  // Seconda fila — un isolato più indietro
  addRow(-1.90, -1, [-1.5,-0.8,-0.1, 0.5, 1.1, 1.7], [0.16,0.26], [0.18,0.32], [0.22,0.44], [2,5]);
  addRow( 1.90,  1, [-1.3,-0.6, 0.1, 0.7, 1.3, 1.8], [0.14,0.24], [0.16,0.30], [0.20,0.40], [2,5]);

  return specs;
}
