import { useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import type { LatLng } from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

const MARSEILLE: [number, number] = [43.2965, 5.3698];
const API = "";  // proxy Vite → Flask :5000

type RouteData = {
  green?: GeoJSON.FeatureCollection;
  km_green?: number;
  took_s?: number;
  error?: string;
};

const ClickHandler = ({
  step,
  onPick,
}: {
  step: "start" | "end" | null;
  onPick: (ll: LatLng) => void;
}) => {
  useMapEvents({
    click(e) {
      if (step) onPick(e.latlng);
    },
  });
  return null;
};

export const MapSection = () => {
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [step, setStep] = useState<"start" | "end" | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePick = useCallback(
    (ll: LatLng) => {
      if (step === "start") { setStart(ll); setStep("end"); }
      else if (step === "end") { setEnd(ll); setStep(null); }
    },
    [step]
  );

  const calcRoute = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const url = `${API}/route?slat=${start.lat}&slon=${start.lng}&elat=${end.lat}&elon=${end.lng}`;
      const res = await fetch(url);
      setRoute(await res.json());
    } catch {
      setRoute({ error: "Backend non raggiungibile. Avvia il server Flask." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStart(null); setEnd(null); setStep(null); setRoute(null); };

  return (
    <section
      id="map"
      className="relative z-10 min-h-screen flex flex-col items-center justify-start px-6 py-24"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-2 text-4xl md:text-5xl font-bold text-white text-center"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Trova il percorso verde
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-8 text-sm text-white/40 text-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Clicca sulla mappa per scegliere partenza e destinazione
      </motion.p>

      {/* controlli */}
      <div
        className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3"
        style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <StatusPill
          active={step === "start"}
          done={!!start}
          onClick={() => setStep("start")}
          label={start ? `Start ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}` : "Scegli partenza"}
        />
        <span className="text-white/20">→</span>
        <StatusPill
          active={step === "end"}
          done={!!end}
          onClick={() => setStep("end")}
          label={end ? `End ${end.lat.toFixed(4)}, ${end.lng.toFixed(4)}` : "Scegli destinazione"}
        />
        <button
          onClick={calcRoute}
          disabled={!start || !end || loading}
          className="rounded-full bg-green-500/20 border border-green-500/40 px-4 py-1.5 text-xs font-semibold text-green-300 transition hover:bg-green-500/30 disabled:opacity-30"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {loading ? "Calcolo..." : "Calcola →"}
        </button>
        <button
          onClick={reset}
          className="text-xs text-white/30 hover:text-white/60 transition"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Reset
        </button>

        {route?.km_green && (
          <span className="ml-2 text-xs text-green-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            {route.km_green} km · {route.took_s}s
          </span>
        )}
        {route?.error && (
          <span className="ml-2 text-xs text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            {route.error}
          </span>
        )}
      </div>

      {/* mappa */}
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl"
        style={{
          height: "60vh",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 60px rgba(0,0,0,0.6)",
        }}
      >
        <MapContainer
          center={MARSEILLE}
          zoom={14}
          style={{ height: "100%", width: "100%", background: "#0a0f0a" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <ClickHandler step={step} onPick={handlePick} />
          {route?.green && (
            <GeoJSON
              key={JSON.stringify(route.green)}
              data={route.green}
              style={{ color: "#4ade80", weight: 4, opacity: 0.85 }}
            />
          )}
        </MapContainer>
      </div>

      {step && (
        <p
          className="mt-3 text-xs text-green-400/60 animate-pulse"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {step === "start" ? "Clicca sulla mappa per la partenza" : "Clicca sulla mappa per la destinazione"}
        </p>
      )}
    </section>
  );
};

const StatusPill = ({
  active, done, onClick, label,
}: {
  active: boolean; done: boolean; onClick: () => void; label: string;
}) => (
  <button
    onClick={onClick}
    className="rounded-full px-3 py-1.5 text-xs transition"
    style={{
      fontFamily: "'Inter', sans-serif",
      background: active
        ? "rgba(74,222,128,0.15)"
        : done
        ? "rgba(255,255,255,0.06)"
        : "transparent",
      border: active
        ? "1px solid rgba(74,222,128,0.4)"
        : "1px solid rgba(255,255,255,0.1)",
      color: active ? "#4ade80" : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
    }}
  >
    {done ? "✓ " : ""}{label}
  </button>
);
