import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
import os

# =============================================
# 1. CHARGEMENT DES DONNÉES
# =============================================

data = pd.read_csv("marseille_complet.csv", parse_dates=["DATE"])
data["TN"] = pd.to_numeric(data["TN"], errors="coerce")
data["TX"] = pd.to_numeric(data["TX"], errors="coerce")
data["TMOY"] = (data["TN"] + data["TX"]) / 2
data = data[["DATE", "TN", "TX", "TMOY"]].dropna().sort_values("DATE")
data["YEAR"] = data["DATE"].dt.year
data["DOY"]  = data["DATE"].dt.dayofyear

# =============================================
# 2. CALCUL PRINTEMPS — T moy > 10°C (6 jours)
# =============================================

res_printemps = {}
for year, group in data.groupby("YEAR"):
    group = group[(group["DOY"] >= 30) & (group["DOY"] <= 181)].sort_values("DOY")
    found = False
    for i in range(len(group) - 6):
        if (group.iloc[i:i+6]["TMOY"] > 10.0).all():
            res_printemps[year] = group.iloc[i]["DOY"]
            found = True
            break
    if not found:
        res_printemps[year] = np.nan

# =============================================
# 3. CALCUL AUTOMNE — T moy < 10°C (6 jours)
# =============================================

res_automne = {}
for year, group in data.groupby("YEAR"):
    group = group[group["DOY"] > 180].sort_values("DOY")
    found = False
    for i in range(len(group) - 6):
        if (group.iloc[i:i+6]["TMOY"] < 10.0).all():
            res_automne[year] = group.iloc[i]["DOY"]
            found = True
            break
    if not found:
        res_automne[year] = np.nan

# =============================================
# 4. ASSEMBLAGE
# =============================================

df = pd.DataFrame({
    "printemps_10C": pd.Series(res_printemps),
    "automne_10C":   pd.Series(res_automne),
}).dropna()

def doy_to_label(doy):
    try:
        return (pd.Timestamp("2001-01-01") + pd.Timedelta(days=int(doy)-1)).strftime("%-d %b")
    except:
        return ""

def tendance(serie):
    s = serie.dropna()
    x = s.index.astype(float).to_numpy()
    slope, intercept, r, p, _ = stats.linregress(x, s.values)
    return slope, intercept, slope * 10, p, r**2

# =============================================
# 5. FIGURE UNIQUE
# =============================================

fig, ax = plt.subplots(figsize=(14, 6))

fig.suptitle(
    "Décalage phénologique — Marignane\n"
    "Début du printemps vs début de l'automne (seuil T moyenne 10°C)",
    fontsize=13, fontweight="bold"
)

years = df.index.to_numpy().astype(float)

# --- Printemps ---
sp = df["printemps_10C"]
sl_sp, ic_sp, sl10_sp, p_sp, r2_sp = tendance(sp)
x_sp = sp.index.astype(float).to_numpy()

ax.scatter(sp.index, sp.values, color="#2ecc71", s=35, alpha=0.7, zorder=3)
ax.plot(sp.index, sp.values, color="#2ecc71", alpha=0.25, linewidth=1)
ax.plot(sp.index, sl_sp * x_sp + ic_sp,
        color="#27ae60", linewidth=2.5, linestyle="--",
        label=f"Printemps  {sl10_sp:+.1f} j/décennie  (R²={r2_sp:.2f})")

# Moyenne mobile printemps
smooth_sp = sp.rolling(10, center=True).mean()
ax.plot(smooth_sp.index, smooth_sp.values,
        color="#27ae60", linewidth=2, alpha=0.6)

# --- Automne ---
au = df["automne_10C"]
sl_au, ic_au, sl10_au, p_au, r2_au = tendance(au)
x_au = au.index.astype(float).to_numpy()

ax.scatter(au.index, au.values, color="#e67e22", s=35, alpha=0.7, zorder=3)
ax.plot(au.index, au.values, color="#e67e22", alpha=0.25, linewidth=1)
ax.plot(au.index, sl_au * x_au + ic_au,
        color="#d35400", linewidth=2.5, linestyle="--",
        label=f"Automne  {sl10_au:+.1f} j/décennie  (R²={r2_au:.2f})")

# Moyenne mobile automne
smooth_au = au.rolling(10, center=True).mean()
ax.plot(smooth_au.index, smooth_au.values,
        color="#d35400", linewidth=2, alpha=0.6)

# --- Zone colorée entre les deux tendances ---
x_full = np.linspace(years.min(), years.max(), 300)
trend_sp_full = sl_sp * x_full + ic_sp
trend_au_full = sl_au * x_full + ic_au

ax.fill_between(x_full, trend_sp_full, trend_au_full,
                alpha=0.10, color="#f39c12",
                label="Saison de végétation (tendance)")

# --- Mise en forme axe Y ---
yticks = np.arange(60, 340, 20)
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_label(d) for d in yticks], fontsize=9)

# Ligne 1er juillet pour repère visuel
ax.axhline(y=182, color="gray", linewidth=0.8, linestyle=":", alpha=0.5)
ax.text(df.index.min(), 184, "1er juillet", fontsize=8, color="gray", alpha=0.7)

ax.set_ylabel("Date", fontsize=11)
ax.set_xlabel("Année", fontsize=11)
ax.legend(fontsize=10, loc="center left")
ax.grid(axis="y", alpha=0.3)
ax.set_xlim(df.index.min() - 1, df.index.max() + 1)

# --- Encadré bilan ---
duree_debut  = (sl_au * years.min() + ic_au) - (sl_sp * years.min() + ic_sp)
duree_fin    = (sl_au * years.max() + ic_au) - (sl_sp * years.max() + ic_sp)
gain = duree_fin - duree_debut

bilan = (
    f"Saison de végétation\n"
    f"Début période : ~{duree_debut:.0f} jours\n"
    f"Fin période   : ~{duree_fin:.0f} jours\n"
    f"Gain total    : +{gain:.0f} jours"
)
fig.text(0.98, 0.01, bilan,
         fontsize=9, verticalalignment="bottom", horizontalalignment="right",
         bbox=dict(boxstyle="round", facecolor="#ecf0f1", alpha=0.9),
         family="monospace")

plt.tight_layout()
plt.subplots_adjust(bottom=0.18)
os.makedirs("graph_output", exist_ok=True)
plt.savefig("graph_output/phenologie_saison_vegetation.png",
            dpi=150, bbox_inches="tight", facecolor="white")
plt.close()
print("✅ Sauvegardé : graph_output/phenologie_saison_vegetation.png")
