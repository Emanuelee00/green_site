import { motion } from "framer-motion";

const links = [
  { label: "Mappa", href: "#map" },
  { label: "Funzionalità", href: "#features" },
  { label: "Comuni", href: "#b2g" },
  { label: "API", href: "#cta" },
];

export const Navbar = () => (
  <motion.header
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.8 }}
    className="fixed top-0 left-0 right-0 z-50"
  >
    <div
      className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      style={{
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <a href="#" className="flex items-center gap-2">
        <span className="text-2xl">🌿</span>
        <span
          className="text-lg font-bold text-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Green Map
        </span>
      </a>

      <nav className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-sm text-white/50 transition-colors hover:text-green-400"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <a
        href="#map"
        className="rounded-full bg-green-500/15 border border-green-500/30 px-5 py-2 text-sm font-semibold text-green-300 transition-all hover:bg-green-500/25"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Inizia gratis
      </a>
    </div>
  </motion.header>
);
