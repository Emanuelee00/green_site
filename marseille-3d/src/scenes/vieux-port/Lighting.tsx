/**
 * Lighting — illuminazione mediterranea del Vieux-Port.
 * Luce solare calda da sud-ovest, riflessi sull'acqua, ambience blu notte.
 */
export function Lighting() {
  return (
    <>
      {/* Cielo ambientale */}
      <ambientLight intensity={0.55} color="#b8d4f0" />

      {/* Sole mediterraneo — da sud-ovest, angolo basso pomeriggio */}
      <directionalLight
        position={[-3, 4, -2]}
        intensity={1.4}
        color="#ffe8b0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Fill light dal mare (riflesso acqua) */}
      <pointLight position={[0, 0.5, -1.5]} intensity={0.6} color="#4ab8d8" distance={6} />

      {/* Luce calda sulle facciate est */}
      <pointLight position={[2, 1.5, 1]} intensity={0.4} color="#ffcc88" distance={5} />

      {/* Notre-Dame in evidenza */}
      <pointLight position={[1.8, 1.2, 1.6]} intensity={0.5} color="#ffd06a" distance={2} />
    </>
  );
}
