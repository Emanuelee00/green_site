window.GM = window.GM || {};

GM.useMyLocation = function () {
  if (!navigator.geolocation) {
    alert("Geolocalizzazione non supportata");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      console.log("📍 My location:", lat, lon);

      // manda posizione dentro iframe (mappa)
      const iframe = document.getElementById("mapFrame");
      iframe?.contentWindow?.postMessage(
        { type: "GM_USER_LOCATION", lat, lon, accuracy },
        "*"
      );
    },
    (err) => {
      console.warn("Errore geoloc:", err);
      alert("Non posso leggere la posizione (permesso negato?)");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};
