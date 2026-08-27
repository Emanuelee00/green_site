import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { RouteMapViewProps } from "./RouteMapView.types";

export default function RouteMapView({ from, to, coords, color }: RouteMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const points = coords.length > 1
    ? coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon }))
    : [{ latitude: from.lat, longitude: from.lon }, { latitude: to.lat, longitude: to.lon }];

  useEffect(() => {
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
      animated: true,
    });
  }, [coords]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{ latitude: from.lat, longitude: from.lon, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
    >
      <Polyline coordinates={points} strokeColor={color} strokeWidth={5} />
      <Marker coordinate={points[0]} title={from.label} pinColor={color} />
      <Marker coordinate={points[points.length - 1]} title={to.label} pinColor={color} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 320, borderRadius: 16, overflow: "hidden" },
});
