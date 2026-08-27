import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { RouteMapViewProps } from "./RouteMapView.types";

// Corrige les icônes de marqueur cassées par le bundler
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export default function RouteMapView({ from, to, coords, color }: RouteMapViewProps) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const node = containerRef.current as unknown as HTMLDivElement | null;
    if (!node || mapRef.current) return;
    const map = L.map(node).setView([from.lat, from.lon], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
    map.getPane("tilePane")!.style.filter = "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)";
    mapRef.current = map;

    // The card's width isn't final yet when Leaflet mounts (flex layout settles
    // a tick later), so it caches the wrong pixel<->latlng mapping. Keep it in
    // sync with the container's real size.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(node);

    return () => { resizeObserver.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const points: L.LatLngTuple[] = coords.length > 1
      ? coords.map(([lon, lat]) => [lat, lon])
      : [[from.lat, from.lon], [to.lat, to.lon]];

    const line = L.polyline(points, { color, weight: 5, opacity: 0.9 }).addTo(map);
    const startMarker = L.marker([from.lat, from.lon]).addTo(map).bindTooltip(from.label);
    const endMarker = L.marker([to.lat, to.lon]).addTo(map).bindTooltip(to.label);
    map.invalidateSize();
    map.fitBounds(line.getBounds(), { padding: [40, 40] });

    return () => { map.removeLayer(line); map.removeLayer(startMarker); map.removeLayer(endMarker); };
  }, [coords, from, to, color]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 320, borderRadius: 16, overflow: "hidden" },
});
