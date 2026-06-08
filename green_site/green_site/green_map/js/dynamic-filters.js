console.log("✅ dynamic-filters.js caricato");

setTimeout(() => {
  console.log("➡️ TEST: invio GM_REQUEST_LAYERS");
  document.getElementById("mapFrame")?.contentWindow?.postMessage({type:"GM_REQUEST_LAYERS"}, "*");
}, 1500);


(() => {
  const iframe = document.getElementById("mapFrame");
  const box = document.getElementById("dynamicFilters");
  if (!iframe || !box) return;

  const LS_KEY = "gm_layers_enabled_v1";
  let enabled = {};
  try { enabled = JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch { enabled = {}; }

  const send = (msg) => iframe.contentWindow?.postMessage(msg, "*");
  const toggle = (name, on) => send({ type:"GM_TOGGLE_LAYER", layerName:name, enabled:!!on });

  function render(layers){
    box.innerHTML = "";
    const sorted = [...layers].sort((a,b)=>a.localeCompare(b));
    sorted.forEach(name => {
      const lab = document.createElement("label");
      lab.className = "filter";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.layer = name;

      // ✅ OFF di default
      const isOn = (name in enabled) ? !!enabled[name] : false;
      input.checked = isOn;

      const span = document.createElement("span");
      span.textContent = name;

      input.addEventListener("change", () => {
        enabled[name] = input.checked;
        localStorage.setItem(LS_KEY, JSON.stringify(enabled));
        toggle(name, input.checked);
      });

      lab.appendChild(input);
      lab.appendChild(span);
      box.appendChild(lab);

      // applica stato iniziale (OFF)
      toggle(name, isOn);
    });
  }

  const slider = document.getElementById("layerOpacity");
if (slider) {
  slider.addEventListener("input", () => {
    const alpha = Number(slider.value) / 100; // 0..1
    // manda al frame: "set opacity" per i layer accesi
    iframe.contentWindow?.postMessage({ type:"GM_SET_OPACITY", alpha }, "*");
  });
}


  function requestLayers(){
    send({ type:"GM_REQUEST_LAYERS" });
  }

  // chiedi layer quando iframe carica
  iframe.addEventListener("load", () => setTimeout(requestLayers, 300));

  // ascolta risposte iframe
  window.addEventListener("message", (ev) => {
    const msg = ev.data;
    if (!msg || !msg.type) return;

    if (msg.type === "GM_IFRAME_READY") setTimeout(requestLayers, 100);

    if (msg.type === "GM_LAYERS_LIST") {
  const layers = Array.isArray(msg.layers) ? msg.layers : [];
  if (layers.length === 0) {
    box.innerHTML = `<div style="opacity:.8">Nessun layer trovato nell’iframe (lista vuota).</div>`;
    return;
  }
  render(layers);
}
  });

  // fallback
  setTimeout(requestLayers, 1000);
})();
