import xarray as xr
import numpy as np

ds = xr.open_dataset("/home/hdavid/Projets/Data/marseille_centre.nc")
temp_k = ds["2t"]

# Juste afficher les coordonnées brutes
print("=== LATITUDES ===")
print(temp_k.lat.values)

print("\n=== LONGITUDES ===")
print(temp_k.lon.values)

print("\n=== 5 PREMIERES DATES ===")
print(temp_k.time.values[:5])

print("\n=== 5 DERNIERES DATES ===")
print(temp_k.time.values[-5:])

print("\n=== VALEURS AU PREMIER PAS DE TEMPS ===")
print(temp_k[0].values)  # grille 2x2 à t=0

print("\n=== VALEURS AU PREMIER PAS DE TEMPS EN °C ===")
print(temp_k[0].values - 273.15)
