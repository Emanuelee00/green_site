import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, GestureResponderEvent } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { DemoRoute } from "@/types";
import { colors } from "@/theme";
import Route3DPin from "./Route3DPin";

interface RouteMapProps {
  routes: DemoRoute[];
  currentRouteIndex: number;
  onRouteSelect: (route: DemoRoute) => void;
}

export default function RouteMap({ routes, currentRouteIndex, onRouteSelect }: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const currentRoute = routes[currentRouteIndex];
  const [selectedPointType, setSelectedPointType] = useState<"from" | "to" | null>(null);

  // Generate polyline coordinates (straight line for now, can be enhanced)
  const polylineCoords = [
    {
      latitude: currentRoute.from.lat,
      longitude: currentRoute.from.lon,
    },
    {
      latitude: currentRoute.to.lat,
      longitude: currentRoute.to.lon,
    },
  ];

  // Color based on badge
  const routeColor = 
    currentRoute.badge === "cool" ? colors.primary :
    currentRoute.badge === "warm" ? colors.warm :
    colors.hot;

  // Focus map on route
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(polylineCoords, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [currentRoute]);

  const handleFromPress = () => {
    setSelectedPointType("from");
    onRouteSelect(currentRoute);
  };

  const handleToPress = () => {
    setSelectedPointType("to");
    onRouteSelect(currentRoute);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 43.295,
          longitude: 5.375,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Route polyline */}
        <Polyline
          coordinates={polylineCoords}
          strokeColor={routeColor}
          strokeWidth={3}
          lineDashPattern={[5]}
        />

        {/* Start point (FROM) */}
        <Marker
          coordinate={{
            latitude: currentRoute.from.lat,
            longitude: currentRoute.from.lon,
          }}
          title={currentRoute.from.label}
          onPress={handleFromPress}
        >
          <View style={[styles.markerContainer, { opacity: selectedPointType === "from" ? 1 : 0.7 }]}>
            <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />
          </View>
        </Marker>

        {/* End point (TO) */}
        <Marker
          coordinate={{
            latitude: currentRoute.to.lat,
            longitude: currentRoute.to.lon,
          }}
          title={currentRoute.to.label}
          onPress={handleToPress}
        >
          <View style={[styles.markerContainer, { opacity: selectedPointType === "to" ? 1 : 0.7 }]}>
            <View style={[styles.markerDot, { backgroundColor: routeColor }]} />
          </View>
        </Marker>
      </MapView>

      {/* 3D Pins overlay */}
      <View style={styles.pinsOverlay} pointerEvents="none">
        <Route3DPin
          route={currentRoute}
          isSelected={selectedPointType === "from"}
          pointType="from"
          onPress={handleFromPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0a1628",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  pinsOverlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
});
