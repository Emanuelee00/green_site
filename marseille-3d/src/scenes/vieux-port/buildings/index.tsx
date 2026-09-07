/**
 * Buildings — assembla tutti i layer degli edifici del Vieux-Port.
 *
 * Struttura:
 *   structure/  Wall, Cornices, Arcade
 *   details/    Balconies, Windows, Shutters
 *   rooftop/    Roof, Chimneys, Dormers
 *   LePanier    quartiere storico nord
 */
import { useMemo } from "react";
import * as THREE from "three";
import { generateLayout } from "./shared";

import { Wall }      from "./structure/Wall";
import { Cornices }  from "./structure/Cornices";
import { Arcade }    from "./structure/Arcade";

import { Balconies } from "./details/Balconies";
import { Windows }   from "./details/Windows";
import { Shutters }  from "./details/Shutters";

import { Roof }      from "./rooftop/Roof";
import { Chimneys }  from "./rooftop/Chimneys";
import { Dormers }   from "./rooftop/Dormers";

import { LePanier }  from "./LePanier";

interface BuildingsProps { circleTex: THREE.Texture }

export function Buildings({ circleTex }: BuildingsProps) {
  const specs = useMemo(generateLayout, []);

  return (
    <group>
      {/* Struttura base */}
      <Wall      specs={specs} circleTex={circleTex} />
      <Cornices  specs={specs} circleTex={circleTex} />
      <Arcade    specs={specs} circleTex={circleTex} />

      {/* Dettagli facciata */}
      <Balconies specs={specs} circleTex={circleTex} />
      <Windows   specs={specs} circleTex={circleTex} />
      <Shutters  specs={specs} circleTex={circleTex} />

      {/* Coperture */}
      <Roof      specs={specs} circleTex={circleTex} />
      <Chimneys  specs={specs} circleTex={circleTex} />
      <Dormers   specs={specs} circleTex={circleTex} />

      {/* Quartiere Le Panier */}
      <LePanier circleTex={circleTex} />
    </group>
  );
}
