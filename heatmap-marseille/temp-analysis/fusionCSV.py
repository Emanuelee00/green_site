import pandas as pd
import glob

# Charger tous les fichiers CSV
files = glob.glob("./data_output/marseille_*.csv")
dfs = []
for f in files:
    df = pd.read_csv(f, sep=";", decimal=",", low_memory=False)
    dfs.append(df)

data = pd.concat(dfs, ignore_index=True)

# Parser la date
data["DATE"] = pd.to_datetime(data["DATE"], format="%Y%m%d")

# Garder uniquement les colonnes utiles
cols = ["DATE", "TN", "TX", "TM", "TAMPLI"]
data = data[cols].copy()

# Convertir en numérique (au cas où)
for col in ["TN", "TX", "TM", "TAMPLI"]:
    data[col] = pd.to_numeric(data[col], errors="coerce")

# Trier par date
data = data.sort_values("DATE").reset_index(drop=True)

print(data.head(10))
print(f"\n{len(data)} jours au total")
print(f"Période : {data['DATE'].min()} → {data['DATE'].max()}")
print(f"\nAmplitude moyenne jour/nuit : {data['TAMPLI'].mean():.1f} °C")
print(f"TX moyenne : {data['TX'].mean():.1f} °C")
print(f"TN moyenne : {data['TN'].mean():.1f} °C")

# Export propre
data.to_csv("marseille_complet.csv", index=False)
print("\nExporté : marseille_complet.csv")