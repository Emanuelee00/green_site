import { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import * as THREE from "three";

// ─── Hero principale ────────────────────────────────────────────────────────

export const GreenMapHero = () => {
  const textControls = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    textControls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08 + 1.2,
        duration: 1.1,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }));

    buttonControls.start({
      opacity: 1,
      transition: { delay: 2.4, duration: 1 },
    });

    return () => {
      document.head.removeChild(link);
    };
  }, [textControls, buttonControls]);

  const headline = "Green Map";

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
      <CityParticles />
      <HeroNav />

      <div className="relative z-10 text-center px-4">
        <h1
          className="text-7xl md:text-9xl text-white"
          style={{
            fontFamily: "'Playfair Display', serif",
            textShadow: "0 0 60px rgba(74, 222, 128, 0.4)",
          }}
        >
          {headline.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block">
              {word.split("").map((char, ci) => (
                <motion.span
                  key={ci}
                  custom={wi * 5 + ci}
                  initial={{ opacity: 0, y: 60 }}
                  animate={textControls}
                  style={{ display: "inline-block" }}
                >
                  {char}
                </motion.span>
              ))}
              {wi < headline.split(" ").length - 1 && (
                <span>&nbsp;</span>
              )}
            </span>
          ))}
        </h1>

        <motion.p
          custom={headline.length + 2}
          initial={{ opacity: 0, y: 30 }}
          animate={textControls}
          className="mx-auto mt-6 max-w-lg text-lg text-green-300/80"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Percorsi urbani che scelgono il verde. Analisi climatica reale da
          dati Sentinel-2.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={buttonControls}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            className="rounded-full border border-green-400/30 bg-green-500/10 px-8 py-3 font-semibold text-green-300 backdrop-blur-sm transition-all hover:bg-green-500/20 hover:border-green-400/60"
            style={{ fontFamily: "'Inter', sans-serif" }}
            onClick={() =>
              document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Esplora la mappa
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-8 py-3 font-semibold text-white/70 backdrop-blur-sm transition-all hover:bg-white/10"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Scopri il progetto
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={buttonControls}
          className="mt-14 flex justify-center gap-8 text-sm text-white/30"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <Stat value="50k+" label="Particelle" />
          <Stat value="NDVI" label="Dati Sentinel-2" />
          <Stat value="OSMnx" label="Routing verde" />
        </motion.div>
      </div>
    </div>
  );
};

// ─── Stats strip ────────────────────────────────────────────────────────────

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-green-400 font-semibold text-base">{value}</span>
    <span>{label}</span>
  </div>
);

// ─── Navigazione ────────────────────────────────────────────────────────────

const HeroNav = () => (
  <motion.nav
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { delay: 0.8, duration: 1 } }}
    className="absolute top-0 left-0 right-0 z-20 p-6"
  >
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌿</span>
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Green Map
        </span>
      </div>
      <div className="flex gap-6 text-sm text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <a href="#map-section" className="hover:text-green-400 transition-colors">
          Mappa
        </a>
        <a href="#" className="hover:text-green-400 transition-colors">
          API
        </a>
        <a href="#" className="hover:text-green-400 transition-colors">
          Comuni
        </a>
      </div>
    </div>
  </motion.nav>
);

// ─── Three.js: particelle a forma di sfera urbana ───────────────────────────

const CityParticles = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    // ── geometria base: sfera (simbolo della città/pianeta) ──
    const count = 40000;
    const positions = new Float32Array(count * 3);
    const originals = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    const sphere = new THREE.SphereGeometry(2, 128, 128);
    const torus = new THREE.TorusKnotGeometry(1.4, 0.4, 180, 32);

    for (let i = 0; i < count; i++) {
      const src = i < count / 2 ? sphere : torus;
      const vi = i % src.attributes.position.count;
      const x = src.attributes.position.getX(vi);
      const y = src.attributes.position.getY(vi);
      const z = src.attributes.position.getZ(vi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originals[i * 3] = x;
      originals[i * 3 + 1] = y;
      originals[i * 3 + 2] = z;

      // palette: verde → giallo-verde → bianco per i più vicini
      const color = new THREE.Color();
      const t = Math.random();
      if (t < 0.5) {
        color.setHSL(0.33, 0.9, 0.45 + Math.random() * 0.25); // verde
      } else if (t < 0.8) {
        color.setHSL(0.22, 0.7, 0.55); // giallo-verde
      } else {
        color.setHSL(0.0, 0.0, 0.85 + Math.random() * 0.15); // bianco
      }
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const mw = new THREE.Vector3(mouse.x * 3, mouse.y * 3, 0);

      for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;
        const cur = new THREE.Vector3(positions[ix], positions[iy], positions[iz]);
        const orig = new THREE.Vector3(originals[ix], originals[iy], originals[iz]);
        const vel = new THREE.Vector3(velocities[ix], velocities[iy], velocities[iz]);

        const dist = cur.distanceTo(mw);
        if (dist < 1.8) {
          const force = (1.8 - dist) * 0.012;
          vel.add(cur.clone().sub(mw).normalize().multiplyScalar(force));
        }

        vel.add(orig.clone().sub(cur).multiplyScalar(0.0015));
        vel.multiplyScalar(0.94);

        positions[ix] += vel.x;
        positions[iy] += vel.y;
        positions[iz] += vel.z;
        velocities[ix] = vel.x;
        velocities[iy] = vel.y;
        velocities[iz] = vel.z;
      }

      geo.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.06;
      points.rotation.x = Math.sin(t * 0.03) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};
