// =====================
// TRANSLATIONS
// =====================
const translations = {
  it: {
    title: "Green Map",
    subtitle:"Scopri i luoghi sostenibili vicino a te",
    filtersTitle:"Filtri",
    layer_quartiers: "Quartieri",
    layer_green_osm: "Aree verdi (OSM)",
    layer_fountains_osm: "Fontane (OSM)",
    layer_hot_zones: "Zone calde (proxy)",
    layer_ndvi: "NDVI (Copernicus, estate 2024)",
    myLocation: "La mia posizione",
    routeTitle: "Percorso",
    routeBtn: "Calcola percorsi green",
    routeHint: "Clicca sulla mappa per scegliere la destinazione.",
    startLabel: "Start",
    endLabel: "End"
  },

  en: {
    title:"Green Map",
    subtitle:"Discover sustainable places near you",
    filtersTitle:"Filters",
    layer_quartiers: "Districts",
    layer_green_osm: "Green areas (OSM)",
    layer_fountains_osm: "Fountains (OSM)",
    layer_hot_zones: "Hot zones (proxy)",
    layer_ndvi: "NDVI (Copernicus, summer 2024)",
    myLocation: "My location",
    routeTitle: "Route",
    routeBtn: "Calculate green routes",
    routeHint: "Click on the map to choose the destination.",
    startLabel: "Start",
    endLabel: "End",
  },

  fr: {
    title: "Carte Verte",
    subtitle:"Découvrez les lieux durables près de chez vous",
    filtersTitle:"Filtres",
    layer_quartiers: "Quartiers",
    layer_green_osm: "Zones vertes (OSM)",
    layer_fountains_osm: "Fontaines (OSM)",
    layer_hot_zones: "Zones chaudes (proxy)",
    layer_ndvi: "NDVI (Copernicus, été 2024)",
    myLocation: "Ma position",
    routeTitle: "Itinéraire",
    routeBtn: "Calculer les itinéraires verts",
    routeHint: "Clique sur la carte pour choisir la destination.",
    startLabel: "Départ",
    endLabel: "Arrivée",
  },

  es: {
    title:"Mapa Verde",
    subtitle:"Descubre lugares sostenibles cerca de ti",
    filtersTitle:"Filtros",
    layer_quartiers: "Barrios",
    layer_green_osm: "Zonas verdes (OSM)",
    layer_fountains_osm: "Fuentes (OSM)",
    layer_hot_zones: "Zonas cálidas (proxy)",
    layer_ndvi: "NDVI (Copernicus, verano 2024)",  // ✅ virgola qui
    myLocation: "Mi ubicación",
    routeTitle: "Ruta",
    routeBtn: "Calcular rutas verdes",
    routeHint: "Haz clic en el mapa para elegir el destino.",
    startLabel: "Inicio",
    endLabel: "Destino",
  },

  ar: {
    title:"الخريطة الخضراء",
    subtitle:"اكتشف الأماكن المستدامة القريبة منك",
    filtersTitle:"الفلاتر",
    layer_quartiers: "الأحياء",
    layer_green_osm: "مناطق خضراء (OSM)",
    layer_fountains_osm: "نوافير (OSM)",
    layer_hot_zones: "مناطق حارة (تقريبي)",
    layer_ndvi: "NDVI (كوبرنيكوس، صيف 2024)",
    myLocation: "موقعي",
    routeTitle: "المسار",
    routeBtn: "احسب المسارات الخضراء",
    routeHint: "انقر على الخريطة لاختيار الوجهة.",
    startLabel: "البداية",
    endLabel: "الوجهة"
  }
};



// =====================
// THEME SYSTEM (plant)
// =====================
const THEMES = [
  { key: "theme-forest", icon: "🌿", label: "Forest" },
  { key: "theme-ocean",  icon: "🌊", label: "Ocean" },
  { key: "theme-sunset", icon: "🌸", label: "Sunset" },
  { key: "theme-night",  icon: "🍃", label: "Night" }
];

function applyTheme(themeKey) {
  // pulisci classi tema
  THEMES.forEach(t => {
    document.body.classList.remove(t.key);
    document.documentElement.classList.remove(t.key); // ✅ anche html
  });

  // applica tema
  document.body.classList.add(themeKey);
  document.documentElement.classList.add(themeKey);   // ✅ anche html

  localStorage.setItem("gm_theme", themeKey);

  const found = THEMES.find(t => t.key === themeKey) || THEMES[0];
  const plantIcon = document.getElementById("plantIcon");
  if (plantIcon) plantIcon.textContent = found.icon;
}


function getNextThemeKey() {
  const current = THEMES.find(t => document.body.classList.contains(t.key))?.key || THEMES[0].key;
  const idx = THEMES.findIndex(t => t.key === current);
  return THEMES[(idx + 1) % THEMES.length].key;
}

// =====================
// LANGUAGE
// =====================
function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  // traduce TUTTO quello che ha data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });

  // RTL arabo
  document.body.classList.toggle("rtl", lang === "ar");
  document.documentElement.lang = lang;

  localStorage.setItem("gm_lang", lang);
}


// =====================
// LEAFLET MAP (CLEAN + FIX FULLSCREEN)
// =====================
let map = null;

function fixMapSize(delay = 200) {
  if (!map) return;
  window.setTimeout(() => {
    try { map.invalidateSize(); } catch (_) {}
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  const mapWrap = document.getElementById("mapWrap");
  const fsBtn = document.getElementById("fs-btn");

  if (!mapWrap || !fsBtn) return;

  const isFs = () => !!document.fullscreenElement;

  fsBtn.addEventListener("click", async () => {
    try {
      if (isFs()) await document.exitFullscreen();
      else await mapWrap.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen non disponibile:", e);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    mapWrap.classList.toggle("is-fullscreen", isFs());
    fsBtn.textContent = isFs() ? "🗗" : "⛶";
  });
});


// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("language");
  const savedLang = localStorage.getItem("gm_lang") || "it";

  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", () => {
      setLanguage(langSelect.value);
    });
  }

  // ✅ IMPORTANTISSIMO: chiamala una volta subito
  setLanguage(savedLang);

  // plant -> next theme
  const plantBtn = document.getElementById("plantBtn");
  if (plantBtn) {
    plantBtn.addEventListener("click", () => {
      plantBtn.classList.remove("bounce");
      void plantBtn.offsetWidth;
      plantBtn.classList.add("bounce");
      applyTheme(getNextThemeKey());
    });
  }

/*   initMap();
  document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("gm_lang") || "it";
  const langSelect = document.getElementById("language");

  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener("change", () => setLanguage(langSelect.value));
  }

  setLanguage(savedLang); // ✅ qui traduce anche i filtri
}); */
});
document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("mapFrame");

  const btnAdd = document.getElementById("btnAddPin");
  const btnClear = document.getElementById("btnClearPins");
  const cat = document.getElementById("pinCategory");
  const title = document.getElementById("pinTitle");
  const desc = document.getElementById("pinDesc");

  // stato: quando è true, il prossimo click sulla mappa crea un pin
  let addMode = false;

  function postToMap(msg) {
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(msg, "*");
  }

  btnAdd?.addEventListener("click", () => {
    // attivo modalità “aggiunta pin”
    addMode = true;

    // testo in francese
    btnAdd.textContent = "🟢 Maintenant clique sur la carte…";

    // invio all’iframe la modalità + dati pin
    postToMap({
      type: "GM_PIN_ADD_MODE",
      enabled: true,
      payload: {
        category: cat.value,
        title: title.value.trim(),
        description: desc.value.trim()
      }
    });
  });

  btnClear?.addEventListener("click", () => {
    // cancella tutti i pin salvati
    postToMap({ type: "GM_PINS_CLEAR" });
  });

  window.addEventListener("message", (ev) => {
    // quando l’iframe conferma che il pin è stato aggiunto, esco dalla modalità
    if (ev.data?.type === "GM_PIN_ADDED") {
      addMode = false;

      // testo in francese
      btnAdd.textContent = "📌 Ajouter un pin (clique sur la carte)";

      console.log("Pin ajouté :", ev.data.pin);
    }
  });
});
