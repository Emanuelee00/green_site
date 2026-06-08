import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.patches as mpatches
import numpy as np

# ── Chargement et préparation des données ────────────────────────────────────
df = pd.read_csv('MODIS_marseille_2000_2024.csv')
df['date'] = pd.to_datetime(df['date'])
df.replace(-9999.0, pd.NA, inplace=True)
for col in ['LST_jour_C', 'LST_nuit_C', 'amplitude_C']:
    df[col] = pd.to_numeric(df[col])

# ── Zones ────────────────────────────────────────────────────────────────────
zones_urbaines = ['centre_ville', 'nord_urbain', 'sud_urbain']
zones_rurales  = ['rural_est', 'rural_nord']

df['type'] = df['zone'].apply(
    lambda z: 'urbain' if z in zones_urbaines else
              ('rural'  if z in zones_rurales  else 'periurbain')
)

# ── Moyennes mensuelles par type ─────────────────────────────────────────────
monthly = (df.groupby(['type', 'annee', 'mois'])[['LST_jour_C', 'LST_nuit_C', 'amplitude_C']]
             .mean().reset_index())
monthly['date_approx'] = pd.to_datetime(
    monthly['annee'].astype(str) + '-' + monthly['mois'].astype(str) + '-15')

def get_series(type_zone, col):
    return (monthly[monthly['type'] == type_zone]
            .set_index('date_approx')[col]
            .sort_index())

urb_jour  = get_series('urbain', 'LST_jour_C')
rur_jour  = get_series('rural',  'LST_jour_C')
urb_nuit  = get_series('urbain', 'LST_nuit_C')
rur_nuit  = get_series('rural',  'LST_nuit_C')

# ── Détection pics de chaleur (percentile 90) ────────────────────────────────
seuil_canicule = urb_jour.quantile(0.90)
vagues = urb_jour[urb_jour > seuil_canicule]

# ── Lissage 12 mois ──────────────────────────────────────────────────────────
def smooth(s, w=12):
    return s.rolling(w, center=True, min_periods=6).mean()

# ════════════════════════════════════════════════════════════════════════════
# FIGURE UNIQUE
# ════════════════════════════════════════════════════════════════════════════
plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'font.size': 9,
    'axes.linewidth': 0.8,
    'xtick.direction': 'out',
    'ytick.direction': 'out',
})

fig = plt.figure(figsize=(10, 6), facecolor='white')

C_URB      = '#c0392b'   # rouge sombre
C_RUR      = '#2980b9'   # bleu
C_VAGUE    = '#f39c12'   # ambre

def style_ax(ax, title, ylabel):
    ax.set_facecolor('white')
    ax.grid(color='#dddddd', linewidth=0.6, linestyle='--', zorder=0)
    ax.tick_params(colors='black', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#aaaaaa')
        spine.set_linewidth(0.8)
    ax.set_title(title, loc='left',
                 color='black', fontsize=10, fontweight='bold', pad=8)
    ax.set_ylabel(ylabel, fontsize=9, color='#333333')

# ── Graphique unique : LST jour + nuit ───────────────────────────────────────
ax = fig.add_subplot(111)
style_ax(ax, 'Température de surface LST: Urbain vs Rural', 'LST (°C)')

# Fond vagues de chaleur
for d in vagues.index:
    ax.axvline(d, color=C_VAGUE, alpha=0.5, linewidth=1.2, zorder=1)

ax.fill_between(urb_jour.index,
                 rur_jour.reindex(urb_jour.index),
                 urb_jour,
                 alpha=0.1, color=C_URB, zorder=2)

ax.plot(urb_jour.index, smooth(urb_jour), color=C_URB,
         lw=2, label='Urbain — jour', zorder=4)
ax.plot(rur_jour.index, smooth(rur_jour), color=C_RUR,
         lw=2, label='Rural — jour', zorder=4)
ax.plot(urb_nuit.index, smooth(urb_nuit), color=C_URB,
         lw=1.4, linestyle='--', label='Urbain — nuit', zorder=3)
ax.plot(rur_nuit.index, smooth(rur_nuit), color=C_RUR,
         lw=1.4, linestyle='--', label='Rural — nuit', zorder=3)

patch_v = mpatches.Patch(color=C_VAGUE, alpha=0.5,
                         label=f'Pic chaleur (LST > {seuil_canicule:.1f} °C, p90)')
handles, labels = ax.get_legend_handles_labels()
ax.legend(handles + [patch_v], labels + [patch_v.get_label()],
           frameon=True, framealpha=0.9, edgecolor='#cccccc',
           fontsize=8, ncol=3, loc='upper left')

# ── Titre global ─────────────────────────────────────────────────────────────
fig.suptitle('Températures de surface à Marseille (2000–2024)\n'
             'Source : MODIS LST Terra MOD11A1',
             color='black', fontsize=12, fontweight='bold', y=0.95)

plt.tight_layout()
plt.savefig('LST_urbain_rural.png', dpi=150, facecolor='white', bbox_inches='tight')
print("Sauvegardé → LST_urbain_rural.png")
