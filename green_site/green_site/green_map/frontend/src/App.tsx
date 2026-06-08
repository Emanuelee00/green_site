import "./index.css";
import { WorldCanvas } from "@/components/canvas/WorldCanvas";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { MapSection } from "@/components/sections/MapSection";
import { B2GSection } from "@/components/sections/B2GSection";
import { CTASection } from "@/components/sections/CTASection";

export default function App() {
  return (
    <>
      {/* canvas Three.js fisso in background — sempre visibile */}
      <WorldCanvas />

      {/* contenuto che scrolla sopra il canvas */}
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <MapSection />
      <B2GSection />
      <CTASection />
    </>
  );
}
