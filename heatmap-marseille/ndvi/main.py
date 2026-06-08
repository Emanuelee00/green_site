import rasterio
import numpy as np
import matplotlib.pyplot as plt

# Chemin vers ton fichier NDVI
chemin_fichier = "../Browser_images/2023-08-22-00:00_2023-08-22-23:59_Sentinel-2_L2A_NDVI.tiff"

# Ouvrir le fichier NDVI
with rasterio.open(chemin_fichier) as src:
    ndvi = src.read(1)  # Lit la première bande (généralement la seule)
    profile = src.profile  # Récupère les métadonnées (résolution, système de coordonnées, etc.)
    data =np.clip(ndvi, 0, 1, out=ndvi)

    plt.figure(figsize=(10, 8))
    plt.imshow(data, cmap='RdYlGn')  # 'RdYlGn' est une bonne palette pour le NDVI
    plt.colorbar(label="Valeur de NDVI")
    plt.title("Carte NDVI (Marseille)")
    plt.show()  

# print(f"Forme du raster : {ndvi.shape} (lignes, colonnes)")
# print(f"Valeurs min/max : {np.nanmin(ndvi):.3f} / {np.nanmax(ndvi):.3f}")


# plt.figure(figsize=(10, 5))
# plt.hist(ndvi.flatten(), bins=50, color='green', alpha=0.7, edgecolor='black')
# plt.title("Histogramme des valeurs NDVI")
# plt.xlabel("Valeur NDVI")
# plt.ylabel("Nombre de pixels")
# plt.grid(True)
# plt.show()
