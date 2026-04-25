import { motion } from "framer-motion";

const features = [
  {
    icon: "🧭",
    title: "Routing Verde",
    desc: "Percorsi pedonali ottimizzati per massimizzare parchi, alberi e zone fresche. Algoritmo OSMnx + green score per ogni edge del grafo.",
    tag: "OSMnx · NetworkX",
  },
  {
    icon: "🌡️",
    title: "Analisi Climatica",
    desc: "Indice UHI (Urban Heat Island) calcolato da dati Sentinel-2 reali: NDVI, SWIR, temperatura superficiale. Aggiornato stagionalmente.",
    tag: "NDVI · Sentinel-2",
  },
  {
    icon: "📊",
    title: "Analytics Urbano",
    desc: "Report per quartiere: zone calde, densità verde, accessibilità pedonale. Export PDF per comuni e piani urbanistici.",
    tag: "Heatmap · Report",
  },
];

const card = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] },
  }),
};

export const FeaturesSection = () => (
  <section
    id="features"
    className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-32"
  >
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mb-3 text-xs uppercase tracking-[0.25em] text-green-400/60"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Funzionalità
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="mb-16 text-center text-4xl md:text-5xl font-bold text-white"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      Il motore verde
    </motion.h2>

    <div className="grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          custom={i}
          variants={card}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          }}
        >
          <span className="text-4xl">{f.icon}</span>
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            {f.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
            {f.desc}
          </p>
          <span
            className="mt-auto inline-block rounded-full border border-green-500/20 bg-green-500/8 px-3 py-1 text-xs text-green-400/70"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {f.tag}
          </span>
        </motion.div>
      ))}
    </div>
  </section>
);
