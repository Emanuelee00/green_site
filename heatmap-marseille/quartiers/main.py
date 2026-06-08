import geopandas as gpd
import rasterio
import numpy as np
import folium
from branca.colormap import LinearColormap
from rasterstats import zonal_stats

# --- CHEMINS ---
shp_path = "quartiers.geojson"
tif_path = "../marseille_uhi.tif"

# --- LECTURE DES DONNÉES ---
quartiers = gpd.read_file(shp_path)

# --- TRAITEMENT DU RASTER ---
with rasterio.open(tif_path) as src:
    print(f"Bandes disponibles: {src.count}")
    print(f"Plage de valeurs: min={src.read(1).min()}, max={src.read(1).max()}")
    print(f"Valeur NoData: {src.nodata}")

    # Lire les données et corriger la valeur NoData extrême
    data = src.read(1)
    nodata_val = src.nodata if src.nodata is not None else -3.4e+38
    data = np.where(data == nodata_val, np.nan, data)
    print(f"Plage après correction: min={np.nanmin(data)}, max={np.nanmax(data)}")

# --- CALCUL DES STATISTIQUES ZONALES ---
stats = zonal_stats(
    quartiers,
    tif_path,
    stats=['mean'],
    band=1,
    nodata=nodata_val,
    geojson_out=True
)

# --- TRAITEMENT DES RÉSULTATS ---
def safe_value(val):
    """Convertit les valeurs en float et gère les cas problématiques"""
    if val is None:
        return np.nan
    try:
        val_float = float(val)
        return val_float if not np.isinf(val_float) else np.nan
    except:
        return np.nan

# Ajout des résultats avec gestion des NaN
quartiers['uhi_mean'] = [safe_value(s['properties']['mean']) for s in stats]

# Remplacement des NaN par une valeur par défaut (moyenne)
uhi_mean_default = quartiers['uhi_mean'].mean()
quartiers['uhi_mean'] = quartiers['uhi_mean'].fillna(uhi_mean_default)

print("\nStatistiques UHI par quartier (après nettoyage):")
print(quartiers[['NOM_QUA', 'uhi_mean']].sort_values('uhi_mean', ascending=False))

# --- CRÉATION DE LA CARTE INTERACTIVE ---
center = [43.2965, 5.3698]

# Création de la carte
m = folium.Map(location=center, zoom_start=12, tiles='CartoDB positron')

# Normalisation des valeurs UHI entre 0 et 1 pour la colormap
uhi_min = float(quartiers['uhi_mean'].min())
uhi_max = float(quartiers['uhi_mean'].max())

# Création d'une colormap simple et robuste
colormap = LinearColormap(
    colors=['green', 'lightgreen', 'yellow', 'orange', 'red'],
    vmin=uhi_min,
    vmax=uhi_max,
    caption='UHI (Indice d\'Effet de Îlot de Chaleur)'
)

# Style des quartiers avec gestion des NaN
def style_function(feature):
    uhi = feature['properties']['uhi_mean']
    if np.isnan(uhi):
        return {
            'fillColor': 'gray',
            'color': 'black',
            'weight': 1,
            'fillOpacity': 0.7
        }
    return {
        'fillColor': colormap(uhi),
        'color': 'black',
        'weight': 1,
        'fillOpacity': 0.7
    }

# Ajout des quartiers avec tooltip
folium.GeoJson(
    quartiers,
    style_function=style_function,
    tooltip=folium.GeoJsonTooltip(
        fields=['NOM_QUA', 'NOM_CO', 'uhi_mean'],
        aliases=['Quartier:', 'Arrondissement:', 'UHI moyen:'],
        localize=True,
        sticky=True,
        style="background-color: white; color: black; font-family: arial; font-size: 12px; padding: 10px;"
    )
).add_to(m)

# Ajouter la légende
m.add_child(colormap)

# Titre
title_html = '''
     <h3 align="center" style="font-size:18px"><b>Carte des quartiers de Marseille - UHI 2023</b></h3>
     <p align="center" style="font-size:12px">(UHI moyen par quartier, calculé à partir d'images Sentinel-2)</p>
'''
m.get_root().html.add_child(folium.Element(title_html))

# Sauvegarde avec gestion d'erreur
try:
    m.save('carte_uhi_marseille.html')
    print("\nCarte sauvegardée avec succès: carte_uhi_marseille.html")
except Exception as e:
    print(f"\nErreur lors de la sauvegarde: {e}")
    print("Veuillez vérifier que toutes les dépendances sont installées.")
