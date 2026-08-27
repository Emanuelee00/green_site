import type { DemoRoute, HeatLabel } from "../types";

type Destination = [string, number, number, string, HeatLabel, number, string[]];

function makeOptions(id: string, from: DemoRoute["from"], destinations: Destination[]): DemoRoute[] {
  return destinations.map(([label, lat, lon, distance, badge, score, highlights], index) => ({
    id: `${id}-${index + 1}`, name: `${from.label} → ${label}`,
    description: highlights.join(" · "), from, to: { lat, lon, label },
    badge, distance, freshScore: score, highlights,
  }));
}

export const DEMO_ROUTES: DemoRoute[] = [
  { id:"1", name:"Vieux-Port", description:"Quais historiques et départs en bord de mer", from:{lat:43.2951,lon:5.3749,label:"Vieux-Port"}, to:{lat:43.2918,lon:5.3691,label:"Pharo"}, badge:"warm", distance:"0.7 km", freshScore:.43, highlights:["Mer","Quais"] },
  { id:"2", name:"Notre-Dame de la Garde", description:"Panoramas, escaliers et rues historiques", from:{lat:43.2841,lon:5.3712,label:"Notre-Dame"}, to:{lat:43.2890,lon:5.3705,label:"Parc Pierre Puget"}, badge:"warm", distance:"0.7 km", freshScore:.42, highlights:["Panorama","Patrimoine"] },
  { id:"3", name:"Les Calanques", description:"Sentiers minéraux entre pins et Méditerranée", from:{lat:43.2142,lon:5.4295,label:"Luminy"}, to:{lat:43.2101,lon:5.4428,label:"Sugiton"}, badge:"warm", distance:"1.3 km", freshScore:.44, highlights:["Pins","Baignade"] },
  { id:"4", name:"La Corniche", description:"Promenade panoramique face aux îles du Frioul", from:{lat:43.2826,lon:5.3508,label:"Corniche Kennedy"}, to:{lat:43.2851,lon:5.3508,label:"Vallon des Auffes"}, badge:"hot", distance:"0.5 km", freshScore:.34, highlights:["Brise marine","Panorama"] },
];

// Toutes les distances et scores ci-dessous sont calculés par marseille-engine
// (routing réel A★/Dijkstra + UHI raster) — pas des estimations à la louche,
// pour rester cohérent avec ce qu'affiche l'écran de détail après calcul.
export const ROUTE_OPTIONS: Record<string, DemoRoute[]> = {
  "1": makeOptions("1", DEMO_ROUTES[0].from, [
    ["Palais du Pharo",43.2918,5.3691,"0.7 km","warm",.43,["Quais ombragés","Vue mer"]],
    ["Fort Saint-Jean",43.2967,5.3613,"1.5 km","hot",.35,["Mucem","Passerelle"]],
    ["Catalans",43.2908,5.3544,"2.0 km","warm",.47,["Bord de mer","Baignade"]],
    ["Rond-point du Prado",43.2679,5.3823,"4.0 km","warm",.50,["Avenue","Statue David"]],
    ["Parc Borély",43.2607,5.3738,"5.2 km","warm",.52,["Jardin","Arbres"]],
    ["Madrague de Montredon",43.2280,5.3736,"10.1 km","warm",.51,["Port","Départ Calanques"]],
    ["Callelongue",43.2131,5.3844,"12.5 km","warm",.59,["Bout du monde","Sentier"]],
  ]),
  "2": makeOptions("2", DEMO_ROUTES[1].from, [
    ["Parc Pierre Puget",43.2890,5.3705,"0.7 km","warm",.42,["Jardin","Ombre"]],
    ["Abbaye Saint-Victor",43.2895,5.3758,"1.2 km","warm",.46,["Escaliers","Patrimoine"]],
    ["Castellane",43.2854,5.3831,"1.6 km","warm",.44,["Rues calmes","Commerces"]],
    ["Parc Longchamp",43.3044,5.3945,"3.8 km","warm",.53,["Boulevards","Jardins"]],
    ["Pointe Rouge",43.2469,5.3667,"6.1 km","warm",.41,["Plage","Voile"]],
    ["Madrague de Montredon",43.2280,5.3736,"8.3 km","warm",.46,["Port","Départ Calanques"]],
    ["Callelongue",43.2131,5.3844,"11.2 km","warm",.49,["Bout du monde","Sentier"]],
  ]),
  "3": makeOptions("3", DEMO_ROUTES[2].from, [
    ["Calanque de Sugiton",43.2101,5.4428,"1.3 km","warm",.44,["Baignade","Falaises"]],
    ["Calanque de Sormiou",43.2140,5.4180,"2.4 km","warm",.53,["Cabanons","Baignade"]],
    ["Belvédère de Sugiton",43.2120,5.4480,"2.4 km","warm",.47,["Panorama","Pins"]],
    ["Mont Puget",43.2205,5.4524,"4.2 km","warm",.59,["Nature","Altitude"]],
    ["Callelongue",43.2131,5.3844,"5.2 km","warm",.52,["Bout du monde","Sentier"]],
    ["Périer",43.2745,5.3939,"9.7 km","warm",.65,["Résidentiel","Calme"]],
    ["Rond-point du Prado",43.2679,5.3823,"10.0 km","warm",.66,["Avenue","Statue David"]],
  ]),
  "4": makeOptions("4", DEMO_ROUTES[3].from, [
    ["Vallon des Auffes",43.2851,5.3508,"0.5 km","hot",.34,["Port","Brise marine"]],
    ["Malmousque",43.2805,5.3473,"0.5 km","warm",.43,["Criques","Ruelles"]],
    ["Plage du Prophète",43.2736,5.3570,"1.2 km","warm",.50,["Plage","Promenade"]],
    ["Parc Longchamp",43.3044,5.3945,"5.1 km","warm",.52,["Boulevards","Jardins"]],
    ["Périer",43.2745,5.3939,"5.3 km","warm",.56,["Résidentiel","Calme"]],
    ["Saint-Loup",43.2778,5.4302,"9.1 km","warm",.53,["Colline","Vue"]],
    ["Callelongue",43.2131,5.3844,"11.4 km","warm",.50,["Bout du monde","Sentier"]],
  ]),
};
