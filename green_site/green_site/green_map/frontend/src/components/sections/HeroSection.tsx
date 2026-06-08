import { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

// ── Contenuto per ogni tab ─────────────────────────────────────────────────
const TABS = [
  {
    id: "b2c",
    icon: "🚶",
    label: "Percorsi",
    headline: "Cammina nel verde.",
    sub: "Percorsi pedonali che scelgono parchi, viali alberati e zone fresche. Zero caldo, zero asfalto.",
    cta: "Trova il tuo percorso",
    ctaHref: "#map",
  },
  {
    id: "b2g",
    icon: "🏛️",
    label: "Comuni",
    headline: "Governa il territorio.",
    sub: "Analisi UHI da Sentinel-2, mappa del verde quartiere per quartiere. Report PDF per assessorati.",
    cta: "Richiedi una demo",
    ctaHref: "#b2g",
  },
  {
    id: "b2b",
    icon: "⚡",
    label: "API",
    headline: "Build with green data.",
    sub: "REST API per integrare routing verde, green score e heatmap nelle tue applicazioni. Pay per call.",
    cta: "Esplora le API",
    ctaHref: "#cta",
  },
] as const;

export const HeroSection = () => {
  const [active, setActive] = useState<"b2c" | "b2g" | "b2b">("b2c");
  const tab = TABS.find((t) => t.id === active)!;

  const titleCtrl = useAnimation();
  const bodyCtrl  = useAnimation();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    titleCtrl.start((i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.06 + 0.8, duration: 1.0, ease: [0.2, 0.65, 0.3, 0.9] },
    }));
    bodyCtrl.start({ opacity: 1, transition: { delay: 1.8, duration: 0.9 } });

    return () => { document.head.removeChild(link); };
  }, [titleCtrl, bodyCtrl]);

  return (
    <section className="relative z-10 flex h-screen flex-col items-center justify-center text-center px-4">

      {/* ── Tab switcher ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="mb-10 flex items-center gap-1 rounded-2xl p-1"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: active === t.id ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          >
            {active === t.id && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.3)",
                  boxShadow: "0 0 20px rgba(74,222,128,0.1)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{t.icon}</span>
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Badge sopra il titolo ──────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-4 text-xs uppercase tracking-[0.22em] text-green-400/60"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Sentinel-2 · OSMnx · Green Score
      </motion.p>

      {/* ── Titolo principale ─────────────────────────────────────────────── */}
      <h1
        className="mb-4 text-7xl md:text-[8.5rem] leading-none text-white"
        style={{
          fontFamily: "'Playfair Display', serif",
          textShadow: "0 0 80px rgba(74,222,128,0.3)",
        }}
      >
        {"Green Map".split("").map((ch, i) => (
          <motion.span
            key={i}
            custom={i}
            initial={{ opacity: 0, y: 60 }}
            animate={titleCtrl}
            style={{ display: ch === " " ? "inline" : "inline-block" }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </h1>

      {/* ── Testo che cambia con il tab ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <p
            className="max-w-md text-base text-white/45 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {tab.sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pointer-events-auto">
            <a
              href={tab.ctaHref}
              className="rounded-full border border-green-400/40 bg-green-500/10 px-7 py-3 text-sm font-semibold text-green-300 backdrop-blur-sm transition-all hover:bg-green-500/20 hover:border-green-400/70"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {tab.cta} →
            </a>
            <a
              href="#features"
              className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white/50 backdrop-blur-sm transition hover:bg-white/8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Come funziona
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Scroll hint ───────────────────────────────────────────────────── */}
      <motion.div
        animate={bodyCtrl}
        initial={{ opacity: 0 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-xs text-white/20" style={{ fontFamily: "'Inter', sans-serif" }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          className="h-6 w-px bg-gradient-to-b from-white/25 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  );
};
