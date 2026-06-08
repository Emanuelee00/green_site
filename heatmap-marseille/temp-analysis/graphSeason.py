import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

# =============================================
# CHARGEMENT DES DONNÉES
# =============================================
data = pd.read_csv("marseille_complet.csv", parse_dates=["DATE"])
data["TN"] = pd.to_numeric(data["TN"], errors="coerce")
data["TX"] = pd.to_numeric(data["TX"], errors="coerce")
data["TMOY"] = (data["TN"] + data["TX"]) / 2
data = data[["DATE", "TN", "TX", "TMOY"]].dropna().sort_values("DATE")
data["YEAR"] = data["DATE"].dt.year
data["DOY"] = data["DATE"].dt.dayofyear

# =============================================
# FONCTIONS UTILITAIRES
# =============================================
def doy_to_date_str(doy):
    """Convertit un jour de l'année en date lisible (ex: 75 → '16 mars')"""
    try:
        import datetime
        return datetime.date(2001, 1, 1).replace(day=1) and \
               (pd.Timestamp("2001-01-01") + pd.Timedelta(days=int(doy)-1)).strftime("%d %b")
    except:
        return f"DOY {doy:.0f}"

def calculer_tendance(serie):
    """Régression linéaire simple sur une série annuelle"""
    serie = serie.dropna()
    x = serie.index.to_numpy(dtype=float)
    y = serie.values
    slope, intercept, r, p, _ = stats.linregress(x, y)
    trend = slope * x + intercept
    return {
        "slope_decade": slope * 10,
        "p_value": p,
        "r2": r**2,
        "trend_y": trend,
        "trend_x": serie.index
    }

def sauvegarder(fig, nom):
    fig.tight_layout()
    fig.savefig(f"./graph_output/{nom}.png", dpi=300, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"✅ Sauvegardé : {nom}.png")

# =============================================
# MÉTHODE 1 — SEUIL 5°C (6 jours consécutifs)
# =============================================
spring_seuil = {}
for year, group in data.groupby("YEAR"):
    g = group[(group["DOY"] >= 30) & (group["DOY"] <= 181)].sort_values("DOY")
    above = (g["TMOY"] >= 5.0).astype(int)
    rolling = above.rolling(window=6).sum()
    valid = rolling[rolling >= 6]
    if not valid.empty:
        doy = g.loc[valid.index[0], "DOY"] - 5
        spring_seuil[year] = max(doy, 30)

serie1 = pd.Series(spring_seuil).dropna()
t1 = calculer_tendance(serie1)

fig, ax = plt.subplots(figsize=(13, 5))
ax.bar(serie1.index, serie1.values, color="#4caf50", alpha=0.4, width=0.8, label="DOY annuel")
ax.plot(serie1.index, serie1.rolling(10, center=True).mean(),
        color="#4caf50", linewidth=2.5, label="Moyenne mobile 10 ans")
ax.plot(t1["trend_x"], t1["trend_y"],
        color="black", linewidth=2, linestyle="--",
        label=f"Tendance : {t1['slope_decade']:.1f} j/décennie (p={t1['p_value']:.2e})")
ax.set_title("Début du printemps — Seuil 5°C pendant 6 jours consécutifs", fontsize=13, fontweight="bold")
ax.set_ylabel("Jour de l'année (DOY)")
ax.set_xlabel("Année")
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3, linestyle="--")
ax.set_axisbelow(True)
# Axe Y en dates lisibles
yticks = ax.get_yticks()
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_date_str(d) if 1 <= d <= 365 else "" for d in yticks])
sauvegarder(fig, "printemps_1_seuil_5C")

# =============================================
# MÉTHODE 2 — GDD 150 degrés-jours cumulés
# =============================================
spring_gdd = {}
for year, group in data.groupby("YEAR"):
    g = group[group["DOY"] <= 181].sort_values("DOY")
    g = g.copy()
    g["GDD"] = (g["TMOY"] - 5.0).clip(lower=0)
    g["GDD_cum"] = g["GDD"].cumsum()
    valid = g[g["GDD_cum"] >= 150]
    if not valid.empty:
        spring_gdd[year] = valid.iloc[0]["DOY"]

serie2 = pd.Series(spring_gdd).dropna()
t2 = calculer_tendance(serie2)

fig, ax = plt.subplots(figsize=(13, 5))
ax.bar(serie2.index, serie2.values, color="#ff9800", alpha=0.4, width=0.8, label="DOY annuel")
ax.plot(serie2.index, serie2.rolling(10, center=True).mean(),
        color="#ff9800", linewidth=2.5, label="Moyenne mobile 10 ans")
ax.plot(t2["trend_x"], t2["trend_y"],
        color="black", linewidth=2, linestyle="--",
        label=f"Tendance : {t2['slope_decade']:.1f} j/décennie (p={t2['p_value']:.2e})")
ax.set_title("Début du printemps — 150 degrés-jours cumulés (base 5°C)", fontsize=13, fontweight="bold")
ax.set_ylabel("Jour de l'année (DOY)")
ax.set_xlabel("Année")
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3, linestyle="--")
ax.set_axisbelow(True)
yticks = ax.get_yticks()
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_date_str(d) if 1 <= d <= 365 else "" for d in yticks])
sauvegarder(fig, "printemps_2_GDD_150")

# =============================================
# MÉTHODE 3 — TX > 15°C pendant 5 jours consécutifs
# =============================================
spring_tx = {}
for year, group in data.groupby("YEAR"):
    g = group[(group["DOY"] >= 30) & (group["DOY"] <= 181)].sort_values("DOY")
    above = (g["TX"] >= 15.0).astype(int)
    rolling = above.rolling(window=5).sum()
    valid = rolling[rolling >= 5]
    if not valid.empty:
        doy = g.loc[valid.index[0], "DOY"] - 4
        spring_tx[year] = max(doy, 30)

serie3 = pd.Series(spring_tx).dropna()
t3 = calculer_tendance(serie3)

fig, ax = plt.subplots(figsize=(13, 5))
ax.bar(serie3.index, serie3.values, color="#e91e63", alpha=0.4, width=0.8, label="DOY annuel")
ax.plot(serie3.index, serie3.rolling(10, center=True).mean(),
        color="#e91e63", linewidth=2.5, label="Moyenne mobile 10 ans")
ax.plot(t3["trend_x"], t3["trend_y"],
        color="black", linewidth=2, linestyle="--",
        label=f"Tendance : {t3['slope_decade']:.1f} j/décennie (p={t3['p_value']:.2e})")
ax.set_title("Début du printemps — TX > 15°C pendant 5 jours consécutifs", fontsize=13, fontweight="bold")
ax.set_ylabel("Jour de l'année (DOY)")
ax.set_xlabel("Année")
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3, linestyle="--")
ax.set_axisbelow(True)
yticks = ax.get_yticks()
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_date_str(d) if 1 <= d <= 365 else "" for d in yticks])
sauvegarder(fig, "printemps_3_TX_15C")

# =============================================
# MÉTHODE 4 — DERNIÈRE NUIT DE GEL (TN < 0°C)
# =============================================
spring_gel = {}
for year, group in data.groupby("YEAR"):
    g = group[group["DOY"] <= 181].sort_values("DOY")
    gels = g[g["TN"] < 0.0]
    if not gels.empty:
        spring_gel[year] = gels.iloc[-1]["DOY"] + 1
    else:
        spring_gel[year] = 1  # Pas de gel = hiver très doux

serie4 = pd.Series(spring_gel).dropna()
t4 = calculer_tendance(serie4)

fig, ax = plt.subplots(figsize=(13, 5))
ax.bar(serie4.index, serie4.values, color="#2196f3", alpha=0.4, width=0.8, label="DOY annuel")
ax.plot(serie4.index, serie4.rolling(10, center=True).mean(),
        color="#2196f3", linewidth=2.5, label="Moyenne mobile 10 ans")
ax.plot(t4["trend_x"], t4["trend_y"],
        color="black", linewidth=2, linestyle="--",
        label=f"Tendance : {t4['slope_decade']:.1f} j/décennie (p={t4['p_value']:.2e})")
ax.set_title("Fin du risque de gel — Dernière nuit avec TN < 0°C", fontsize=13, fontweight="bold")
ax.set_ylabel("Jour de l'année (DOY)")
ax.set_xlabel("Année")
ax.legend(fontsize=10)
ax.grid(axis="y", alpha=0.3, linestyle="--")
ax.set_axisbelow(True)
yticks = ax.get_yticks()
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_date_str(d) if 1 <= d <= 365 else "" for d in yticks])
sauvegarder(fig, "printemps_4_derniere_gelee")

# =============================================
# RÉSUMÉ CONSOLE
# =============================================
print("\n" + "="*55)
print("📊 RÉSUMÉ DES TENDANCES")
print("="*55)
methodes = [
    ("Seuil 5°C / 6 jours",  serie1, t1),
    ("GDD 150",               serie2, t2),
    ("TX > 15°C / 5 jours",  serie3, t3),
    ("Dernière gelée",        serie4, t4),
]
for label, serie, t in methodes:
    sig = "***" if t["p_value"] < 0.001 else \
          "**"  if t["p_value"] < 0.01  else \
          "*"   if t["p_value"] < 0.05  else "ns"
    print(f"\n🌿 {label}")
    print(f"   Date moyenne : {doy_to_date_str(serie.mean())} (DOY {serie.mean():.0f})")
    print(f"   Tendance     : {t['slope_decade']:.2f} jours/décennie {sig}")
    print(f"   R²           : {t['r2']:.3f}")
