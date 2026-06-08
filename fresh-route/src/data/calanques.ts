// Real Calanques coordinates near Marseille
export interface Calanque {
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
  difficulty: "easy" | "medium" | "hard";
  distanceFromVieuxPort: string;
  highlights: string[];
}

export const CALANQUES: Calanque[] = [
  {
    id: "sormiou",
    name: "Sormiou",
    description: "The largest calanque — turquoise waters and sandy beach.",
    lat: 43.2093, lon: 5.4147,
    difficulty: "easy",
    distanceFromVieuxPort: "12 km",
    highlights: ["Sandy beach", "Restaurants", "Easy access"],
  },
  {
    id: "morgiou",
    name: "Morgiou",
    description: "Wild and preserved — a tiny fishing village inside.",
    lat: 43.2103, lon: 5.4399,
    difficulty: "medium",
    distanceFromVieuxPort: "14 km",
    highlights: ["Fishing village", "Wild nature", "Snorkeling"],
  },
  {
    id: "sugiton",
    name: "Sugiton",
    description: "Steep cliffs and crystalline water — a hiker's gem.",
    lat: 43.2142, lon: 5.4589,
    difficulty: "medium",
    distanceFromVieuxPort: "15 km",
    highlights: ["Steep cliffs", "Crystal water", "Scenic viewpoint"],
  },
  {
    id: "en-vau",
    name: "En-Vau",
    description: "The most spectacular — vertical white limestone walls.",
    lat: 43.1956, lon: 5.5048,
    difficulty: "hard",
    distanceFromVieuxPort: "20 km",
    highlights: ["Iconic cliffs", "Deep water", "Wild hiking"],
  },
  {
    id: "port-pin",
    name: "Port-Pin",
    description: "Pine forest meets the sea — peaceful and shaded.",
    lat: 43.2003, lon: 5.4872,
    difficulty: "medium",
    distanceFromVieuxPort: "18 km",
    highlights: ["Pine forest", "Peaceful", "Family-friendly"],
  },
  {
    id: "port-miou",
    name: "Port-Miou",
    description: "The first calanque from Cassis — long and navigable.",
    lat: 43.2150, lon: 5.5250,
    difficulty: "easy",
    distanceFromVieuxPort: "22 km",
    highlights: ["Marina", "Accessible", "Starting point"],
  },
];

// Geographic bounds for 3D mapping
export const BOUNDS = {
  minLat: 43.18, maxLat: 43.31,
  minLon: 5.36,  maxLon: 5.55,
};

// Convert lat/lon to 3D scene coordinates
export function toScene(lat: number, lon: number): [number, number] {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * 16 - 8;
  const z = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 12 - 3;
  return [x, z];
}
