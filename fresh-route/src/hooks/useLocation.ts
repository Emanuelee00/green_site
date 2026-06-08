import { useState, useEffect } from "react";
import * as Location from "expo-location";
import type { Coords } from "../types";

export function useLocation() {
  const [location, setLocation] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      setLoading(false);
    })();
  }, []);

  return { location, error, loading };
}
