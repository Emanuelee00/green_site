export interface RouteMapViewProps {
  from: { lat: number; lon: number; label: string };
  to: { lat: number; lon: number; label: string };
  coords: [number, number][]; // [lon, lat] real route geometry
  color: string;
}
