import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
import matplotlib.lines as mlines
import matplotlib.patches as mpatches

# =============================================
# 1. CHARGEMENT
# =============================================

df_raw = pd.read_csv("MODIS_marseille_2000_2024.csv", parse_dates=["date"])
df_raw["LST_jour_C"] = pd.to_numeric(df_raw["LST_jour_C"], errors="coerce")
df_raw["LST_jour_C"] = df_raw["LST_jour_C"].replace(-9999, np.nan)
df_raw["DOY"] = df_raw["date"].dt.dayofyear
df_raw["YEAR"] = df_raw["date"].dt.year

data = df_raw.groupby(["date", "DOY", "YEAR"])["LST_jour_C"].mean().reset_index()

SEUIL = 20

# =============================================
# 2. FONCTIONS
# =============================================

def calc_printemps(data):
    res = {}
    for year, group in data.groupby("YEAR"):
        group = group[(group["DOY"] >= 30) & (group["DOY"] <= 181)].sort_values("DOY").reset_index(drop=True)
        found = False
        for i in range(len(group) - 6):
            if (group.iloc[i:i+6]["LST_jour_C"] > SEUIL).all():
                res[year] = group.iloc[i]["DOY"]
                found = True
                break
        if not found:
            res[year] = np.nan
    return pd.Series(res)

def calc_automne(data):
    res = {}
    for year, group in data.groupby("YEAR"):
        group = group[group["DOY"] > 180].sort_values("DOY").reset_index(drop=True)
        found = False
        for i in range(len(group) - 6):
            if (group.iloc[i:i+6]["LST_jour_C"] < SEUIL).all():
                res[year] = group.iloc[i]["DOY"]
                found = True
                break
        if not found:
            res[year] = np.nan
    return pd.Series(res)

def doy_to_label(doy):
    try:
        dt = pd.Timestamp("2001-01-01") + pd.Timedelta(days=int(doy) - 1)
        return dt.strftime("%d %b")
    except:
        return ""

# =============================================
# 3. CALCUL
# =============================================

sp = calc_printemps(data).dropna()
au = calc_automne(data).dropna()

years = np.array(sorted(set(sp.index) & set(au.index)))
sp = sp[years]
au = au[years]

sl_sp, ic_sp, _, _, _ = stats.linregress(years, sp.values)
sl_au, ic_au, _, _, _ = stats.linregress(years, au.values)
sl10_sp = sl_sp * 10
sl10_au = sl_au * 10

# =============================================
# 4. COULEURS
# =============================================

C = {
    "sp":      "#2ecc71",
    "sp_dark": "#27ae60",
    "au":      "#e67e22",
    "au_dark": "#d35400",
}

# =============================================
# 5. FIGURE
# =============================================

fig, ax = plt.subplots(figsize=(15, 8))

# --- Points ---
ax.scatter(years, sp.values, color=C["sp"], s=50, zorder=5, alpha=0.8)
ax.scatter(years, au.values, color=C["au"], s=50, zorder=5, alpha=0.8)

# --- Tendances ---
trend_sp = sl_sp * years + ic_sp
trend_au = sl_au * years + ic_au

ax.plot(years, trend_sp, color=C["sp_dark"], linewidth=2.5, linestyle="--", zorder=4)
ax.plot(years, trend_au, color=C["au_dark"], linewidth=2.5, linestyle="--", zorder=4)

# --- Zone saison chaude ---
ax.fill_between(years, trend_sp, trend_au, color="#f39c12", alpha=0.2, zorder=1)

# =============================================
# 6. AXES ET MISE EN FORME
# =============================================

yticks = np.arange(30, 340, 20)
ax.set_yticks(yticks)
ax.set_yticklabels([doy_to_label(d) for d in yticks], fontsize=9)

ax.set_ylabel("Date", fontsize=12)
ax.set_xlabel("Année", fontsize=12)
ax.set_title("Phénologie thermique – Marseille 2000–2024\n(toutes zones confondues)",
             fontsize=13, fontweight="bold")
ax.grid(axis="y", alpha=0.3)
ax.set_xlim(years.min() - 1, years.max() + 1)

# =============================================
# 7. LEGENDE + BILAN SOUS LE GRAPHIQUE
# =============================================

h_sp_pts = mlines.Line2D([], [], color=C["sp"], marker="o", linestyle="None", markersize=7, alpha=0.8,
    label=f"Début saison chaude : 1er jour d'une série de 6 jours consécutifs avec LST > {SEUIL}°C")

h_au_pts = mlines.Line2D([], [], color=C["au"], marker="o", linestyle="None", markersize=7, alpha=0.8,
    label=f"Fin de saison chaude : 1er jour d'une série de 6 jours consécutifs avec LST < {SEUIL}°C")

h_sp_trend = mlines.Line2D([], [], color=C["sp_dark"], linewidth=2.5, linestyle="--",
    label=f"Tendance printemps  {sl10_sp:+.1f} j/décennie")

h_au_trend = mlines.Line2D([], [], color=C["au_dark"], linewidth=2.5, linestyle="--",
    label=f"Tendance automne  {sl10_au:+.1f} j/décennie")

h_zone = mpatches.Patch(facecolor="#f39c12", alpha=0.2,
    label="Durée de la saison chaude (entre les deux tendances)")

ax.legend(handles=[h_sp_pts, h_au_pts, h_sp_trend, h_au_trend, h_zone],
          fontsize=9.5, loc="upper center",
          bbox_to_anchor=(0.5, -0.12),
          ncol=2,
          framealpha=0.95,
          title="Légende", title_fontsize=10)

# --- Encadré bilan sous le graphique (via fig.text) ---
duree_debut = (sl_au * years.min() + ic_au) - (sl_sp * years.min() + ic_sp)
duree_fin   = (sl_au * years.max() + ic_au) - (sl_sp * years.max() + ic_sp)
gain = duree_fin - duree_debut
bilan = (
    f"Saison chaude (LST > {SEUIL}°C)   |   "
    f"Début période : ~{duree_debut:.0f} jours   |   "
    f"Fin période : ~{duree_fin:.0f} jours   |   "
    f"Gain total : +{gain:.0f} jours"
)
fig.text(0.5, 0.01, bilan,
         ha="center", va="bottom", fontsize=9,
         bbox=dict(boxstyle="round", facecolor="#ecf0f1", alpha=0.92),
         family="monospace")

# =============================================
# 8. SAUVEGARDE
# =============================================

plt.tight_layout()
plt.subplots_adjust(bottom=0.30)
plt.savefig("phenologie_MODIS_marseille.png", dpi=150, bbox_inches="tight", facecolor="white")
plt.close()
print("Sauvegardé : phenologie_MODIS_marseille.png")
