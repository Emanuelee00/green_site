import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroScreen from "./screens/HeroScreen";
import RoutesScreen from "./screens/RoutesScreen";
import RouteDetailScreen from "./screens/RouteDetailScreen";
import type { RouteResponse } from "./types";

type Screen = "hero" | "routes" | "detail";

export default function App() {
  const [screen, setScreen] = useState<Screen>("hero");
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [activeRouteName, setActiveRouteName] = useState("");

  const goDetail = (route: RouteResponse, name: string) => {
    setActiveRoute(route);
    setActiveRouteName(name);
    setScreen("detail");
  };

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        {screen === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <HeroScreen onExplore={() => setScreen("routes")} />
          </motion.div>
        )}

        {screen === "routes" && (
          <motion.div
            key="routes"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, overflowY: "auto" }}
          >
            <RoutesScreen
              onBack={() => setScreen("hero")}
              onRouteDetail={goDetail}
            />
          </motion.div>
        )}

        {screen === "detail" && activeRoute && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, overflowY: "auto" }}
          >
            <RouteDetailScreen
              route={activeRoute}
              name={activeRouteName}
              onBack={() => setScreen("routes")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
