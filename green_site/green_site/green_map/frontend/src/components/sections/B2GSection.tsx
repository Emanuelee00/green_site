import { motion } from "framer-motion";

const stats = [
  { value: "50k+", label: "particelle 3D", sub: "Three.js WebGL" },
  { value: "NDVI", label: "indice vegetazione", sub: "Sentinel-2 reale" },
  { value: "OSMnx", label: "grafo stradale", sub: "OpenStreetMap" },
  { value: "B2G", label: "per comuni", sub: "report PDF incluso" },
];

const useCases = [
  { icon: "🏛️", title: "Comuni capoluogo", desc: "Dashboard per assessorati all'ambiente. Piano del verde urbano, report quartieri, aggiornamento stagionale." },
  { icon: "🌆", title: "Urbanisti", desc: "Analisi UHI per nuovi piani regolatori. Identifica zone critiche da rinaturalizzare." },
  { icon: "🤝", title: "Sviluppatori B2B", desc: "API commerciale. Integra il green score nelle tue app di mobilità urbana." },
];

export const B2GSection = () => (
  <section id="b2g" className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-32">
    {/* stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-20">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-3xl font-bold text-green-400" style={{ fontFamily: "'Playfair Display', serif" }}>
            {s.value}
          </div>
          <div className="mt-1 text-sm font-medium text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>
            {s.label}
          </div>
          <div className="mt-0.5 text-xs text-white/25" style={{ fontFamily: "'Inter', sans-serif" }}>
            {s.sub}
          </div>
        </motion.div>
      ))}
    </div>

    {/* use cases */}
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-3 text-xs uppercase tracking-[0.25em] text-green-400/60"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Chi lo usa
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="mb-14 text-4xl md:text-5xl font-bold text-white text-center"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      Tre mercati, un motore
    </motion.h2>

    <div className="grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {useCases.map((u, i) => (
        <motion.div
          key={u.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.7 }}
          whileHover={{ y: -5 }}
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="text-3xl mb-4">{u.icon}</div>
          <h3 className="text-base font-semibold text-white mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {u.title}
          </h3>
          <p className="text-sm text-white/45 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            {u.desc}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
);
