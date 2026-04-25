import { motion } from "framer-motion";

export const CTASection = () => (
  <section
    id="cta"
    className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-6 py-32 text-center"
  >
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-3 text-xs uppercase tracking-[0.25em] text-green-400/60"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Inizia ora
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="mb-5 text-5xl md:text-6xl font-bold text-white"
      style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 0 80px rgba(74,222,128,0.2)" }}
    >
      Rendi la tua città<br />più verde
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="mb-10 max-w-sm text-sm text-white/40"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Demo gratuita per comuni. API disponibile per sviluppatori. MVP già funzionante su Marseille.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="flex flex-col sm:flex-row gap-4"
    >
      <button
        className="rounded-full bg-green-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-green-400"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Richiedi una demo
      </button>
      <button
        className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white/60 backdrop-blur-sm transition hover:bg-white/10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Documentazione API
      </button>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="mt-20 text-xs text-white/20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      Green Map · Progetto open source · 2025
    </motion.p>
  </section>
);
