import folium

zones_coords = {
    'centre_ville':    (43.2965, 5.3698),
    'nord_urbain':     (43.3317, 5.3706),
    'sud_urbain':      (43.2700, 5.3800),
    'rural_est':       (43.3000, 5.5500),
    'rural_nord':      (43.4500, 5.3000),
}

couleurs = {
    'centre_ville':    'red',
    'nord_urbain':     'red',
    'sud_urbain':      'red',
    'rural_est':       'green',
    'rural_nord':      'green',
}

categories = {
    'centre_ville':    'Urbain',
    'nord_urbain':     'Urbain',
    'sud_urbain':      'Urbain',
    'rural_est':       'Rural',
    'rural_nord':      'Rural',
}

m = folium.Map(location=[43.3000, 5.3500], zoom_start=10, tiles='CartoDB positron')

for zone, coords in zones_coords.items():
    folium.CircleMarker(
        location=coords,
        radius=10,
        color=couleurs[zone],
        fill=True,
        fill_color=couleurs[zone],
        fill_opacity=0.8,
        popup=folium.Popup(f"<b>{zone}</b><br>Catégorie : {categories[zone]}<br>Lat: {coords[0]}<br>Lon: {coords[1]}", max_width=200),
        tooltip=zone,
    ).add_to(m)

# Légende
legend_html = """
<div style="position: fixed; bottom: 30px; left: 30px; z-index:1000;
     background-color: white; padding: 15px; border-radius: 8px;
     border: 2px solid grey; font-size: 14px;">
  <b>Zones de mesure</b><br><br>
  <span style="color:red;">●</span> Urbain<br>
  <span style="color:green;">●</span> Rural<br>
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

m.save('zones_marseille.html')
print("Carte sauvegardée : zones_marseille.html")
