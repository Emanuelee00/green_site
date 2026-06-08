// All lights for the Calanque scene — warm Mediterranean sun
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#ffddb3" />
      <directionalLight position={[6, 10, -2]} intensity={2.0} color="#ffcc77" castShadow />
      <directionalLight position={[-4, 3, 4]}  intensity={0.5} color="#90d0ff" />
      <pointLight position={[0, 4, 2]}         intensity={0.6} color="#00b4d8" />
    </>
  );
}
