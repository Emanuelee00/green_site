
import json
import folium

# --- Charge le GeoJSON depuis un fichier ---
with open("quartiers.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

# --- Crée une carte centrée (fallback sur Marseille si on ne calcule pas les bounds) ---
m = folium.Map(location=[43.2965, 5.3698], zoom_start=12, tiles="OpenStreetMap")

# --- Ajoute le GeoJSON avec un style simple ---
gj = folium.GeoJson(
    data,
    name="Quartiers",
    style_function=lambda feature: {
        "fillColor": "#1f78b4",
        "color": "#0c4a6e",
        "weight": 2,
        "fillOpacity": 0.25,
    },
    highlight_function=lambda feature: {
        "weight": 3,
        "color": "#ff8800",
        "fillOpacity": 0.4,
    },
    tooltip=folium.GeoJsonTooltip(
        fields=["nom_qua", "nom_co"],
        aliases=["Quartier", "Arrondissement"],
        sticky=True,
    ),
)

gj.add_to(m)

# --- Ajuste automatiquement la vue aux polygones ---
try:
    m.fit_bounds(gj.get_bounds())
except Exception:
    pass  # si jamais les bounds ne sont pas récupérables, on garde le centre par défaut

folium.LayerControl().add_to(m)

# --- Exporte en HTML ---
m.save("map.html")
print("Carte générée -> map.html")
