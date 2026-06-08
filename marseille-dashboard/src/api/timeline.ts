export interface ZoneSnapshot {
  lst: number | null;
  anomaly: number;
  anomaly_norm: number;
}

export interface TimelineSnapshot {
  year: number;
  zones: Record<string, ZoneSnapshot>;
}

export async function fetchSnapshot(year: number): Promise<TimelineSnapshot> {
  const res = await fetch(`/api/timeline/snapshot?year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch snapshot");
  return res.json();
}

// Maps arrondissement name (NOM_CO) to the closest MODIS zone
const ARROND_TO_ZONE: Record<string, string> = {
  "1er Arrondissement":   "centre_ville",
  "2ème Arrondissement":  "centre_ville",
  "3ème Arrondissement":  "centre_ville",
  "4ème Arrondissement":  "periurbain_nord",
  "5ème Arrondissement":  "periurbain_nord",
  "6ème Arrondissement":  "centre_ville",
  "7ème Arrondissement":  "sud_urbain",
  "8ème Arrondissement":  "sud_urbain",
  "9ème Arrondissement":  "sud_urbain",
  "10ème Arrondissement": "periurbain_est",
  "11ème Arrondissement": "periurbain_est",
  "12ème Arrondissement": "periurbain_est",
  "13ème Arrondissement": "periurbain_est",
  "14ème Arrondissement": "nord_urbain",
  "15ème Arrondissement": "nord_urbain",
  "16ème Arrondissement": "nord_urbain",
};

export function zoneForArrond(nomCO: string): string {
  // Try exact match first, then partial
  if (ARROND_TO_ZONE[nomCO]) return ARROND_TO_ZONE[nomCO];
  for (const [key, zone] of Object.entries(ARROND_TO_ZONE)) {
    if (nomCO.includes(key.split(" ")[0])) return zone;
  }
  return "centre_ville";
}
