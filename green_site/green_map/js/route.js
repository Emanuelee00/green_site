const API_BASE = "http://127.0.0.1:5000";
const iframe = document.getElementById("mapFrame");
let iframeReady = false;

let start = null; // {lat, lon}
let end = null;   // {lat, lon}

function $(sel){ return document.querySelector(sel); }
function fmt(p){ return `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`; }

function updateUI(){
  const s = $("#startLine");
  const e = $("#endLine");
  if (s) s.textContent = start ? `Start: ${fmt(start)}` : "Start: —";
  if (e) e.textContent = end ? `End: ${fmt(end)}` : "End: —";
}

function setStatus(text){
  const el = $("#routeStatus") || $("#routeStats"); // se hai uno dei due
  if (el) el.innerHTML = text;
}

// ✅ iframe pronto
window.addEventListener("message", (ev) => {
  if(ev.data?.type === "GM_IFRAME_READY"){
    console.log("✅ iframe pronto per disegnare");
    iframeReady = true;
  }
});

// ✅ end = click sulla mappa (arriva dall’iframe)
window.addEventListener("message", (ev) => {
  if(ev.data?.type === "GM_MAP_CLICK"){
    end = { lat: ev.data.lat, lon: ev.data.lon };
    console.log("✅ END aggiornato:", end);
    updateUI();
  }
});

// ✅ start = geolocalizzazione
function initMyLocation(){
  if(!navigator.geolocation){
    console.warn("Geolocalizzazione non supportata");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      start = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      console.log("✅ START:", start);
      updateUI();

      // manda posizione all’iframe (così vedi il marker “Sei qui”)
      iframe?.contentWindow?.postMessage({
        type: "GM_USER_LOCATION",
        lat: start.lat,
        lon: start.lon,
        accuracy: pos.coords.accuracy
      }, "*");
    },
    (err) => console.warn("Geoloc error:", err),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function calcGreenRoutes(){
  if(!start){
    console.warn("Start mancante");
    return;
  }
  if(!end){
    console.warn("End mancante: clicca sulla mappa");
    return;
  }

  if(!iframeReady){
    console.warn("Iframe non pronto, riprovo tra 800ms…");
    setTimeout(calcGreenRoutes, 800);
    return;
  }

  const url = `${API_BASE}/route?slat=${start.lat}&slon=${start.lon}&elat=${end.lat}&elon=${end.lon}`;
  console.log("FETCH:", url);

  const res = await fetch(url);
  if(!res.ok){
    console.error("API error", await res.text());
    return;
  }

  const data = await res.json();
  console.log("ROUTE:", data);

  // backend ti ritorna { green: FeatureCollection, km_green, ... }
  iframe.contentWindow.postMessage(
    { type:"GM_DRAW_ROUTE", kind:"green", geojson: data.green },
    "*"
  );

  // opzionale: mostra statistiche testuali
  setStatus(`✅ Percorso green: <b>${data.km_green}</b> km`);
}

function bindUI(){
  const btn = $("#btnRoute");
  if(!btn){
    console.warn("❌ bottone #btnRoute non trovato");
    return;
  }
  btn.addEventListener("click", calcGreenRoutes);
}

document.addEventListener("DOMContentLoaded", () => {
  initMyLocation();
  bindUI();
});
