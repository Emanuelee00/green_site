import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

# ── Chargement ────────────────────────────────────────────────────────────────
df = pd.read_csv('MODIS_marseille_2000_2024.csv')
df['date'] = pd.to_datetime(df['date'])
df.replace(-9999.0, pd.NA, inplace=True)
df['LST_jour_C'] = pd.to_numeric(df['LST_jour_C'])
df['LST_nuit_C'] = pd.to_numeric(df['LST_nuit_C'])

zones_urbaines = ['centre_ville', 'nord_urbain', 'sud_urbain']
zones_rurales  = ['rural_est', 'rural_nord']
df['type'] = df['zone'].apply(
    lambda z: 'urbain' if z in zones_urbaines else ('rural' if z in zones_rurales else 'periurbain')
)

saisons_map = {12:'Hiver',1:'Hiver',2:'Hiver',
               3:'Printemps',4:'Printemps',5:'Printemps',
               6:'Été',7:'Été',8:'Été',
               9:'Automne',10:'Automne',11:'Automne'}
ordre_saisons = ['Hiver','Printemps','Été','Automne']
couleurs = {'Hiver':'#5b9bd5','Printemps':'#70ad47','Été':'#e74c3c','Automne':'#e67e22'}

df['saison'] = df['mois'].map(saisons_map)

monthly = df.groupby(['type','annee','mois','saison'])[['LST_jour_C','LST_nuit_C']].mean().reset_index()
urb = monthly[monthly['type']=='urbain']
rur = monthly[monthly['type']=='rural']
merged = urb.merge(rur, on=['annee','mois','saison'], suffixes=('_urb','_rur'))
merged['ICU_jour'] = merged['LST_jour_C_urb'] - merged['LST_jour_C_rur']
merged['ICU_nuit'] = merged['LST_nuit_C_urb'] - merged['LST_nuit_C_rur']

icu = merged.groupby(['annee','saison'])[['ICU_jour','ICU_nuit']].mean().reset_index()

# ── Figure ────────────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(16, 10), facecolor='white')
fig.subplots_adjust(top=0.85, bottom=0.25, left=0.07, right=0.97, hspace=0.3, wspace=0.1)

ax_box = fig.add_subplot(1, 1, 1)

# ─────────────────────────────────────────────────────────────────────────────
# PANNEAU — boxplots jour vs nuit par saison
# ─────────────────────────────────────────────────────────────────────────────
positions_jour = [1, 4, 7, 10]
positions_nuit = [2, 5, 8, 11]

for i, saison in enumerate(ordre_saisons):
    data = icu[icu['saison'] == saison]
    jour_vals = data['ICU_jour'].dropna().values
    nuit_vals = data['ICU_nuit'].dropna().values

    # ── Boxplot jour (plein) ──────────────────────────────────────────────────
    bp_jour = ax_box.boxplot(jour_vals, positions=[positions_jour[i]],
                             widths=0.6, patch_artist=True,
                             showfliers=False, whis=(5, 95),
                             medianprops=dict(color='black', linewidth=2.5))  # on masque la ligne médiane par défaut

    # ── Boxplot nuit (hachuré) ────────────────────────────────────────────────
    bp_nuit = ax_box.boxplot(nuit_vals, positions=[positions_nuit[i]],
                             widths=0.6, patch_artist=True,
                             showfliers=False, whis=(5, 95),
                             medianprops=dict(color='black', linewidth=2.5))  # idem

    # ── Couleurs des boîtes ───────────────────────────────────────────────────
    for box in bp_jour['boxes']:
        box.set_facecolor(couleurs[saison])
        box.set_alpha(0.85)

    for box in bp_nuit['boxes']:
        box.set_facecolor(couleurs[saison])
        box.set_alpha(0.35)
        box.set_hatch('///')

    # ── Calcul des médianes ───────────────────────────────────────────────────
    med_jour = np.median(jour_vals)
    med_nuit = np.median(nuit_vals)

    # ── Annotation DANS la boîte jour ────────────────────────────────────────
    ax_box.text(
        positions_jour[i], med_jour,
        f"{med_jour:.1f}°C",
        ha='center', va='center',
        fontsize=9, fontweight='bold', color='white',
        bbox=dict(
            boxstyle='round,pad=0.25',
            facecolor='black',
            # alpha=0.55,
            edgecolor='none'
        )
    )

    # ── Annotation DANS la boîte nuit ────────────────────────────────────────
    ax_box.text(
        positions_nuit[i], med_nuit,
        f"{med_nuit:.1f}°C",
        ha='center', va='center',
        fontsize=9, fontweight='bold', color='white',
        bbox=dict(
            boxstyle='round,pad=0.25',
            facecolor='black',
            # alpha=0.55,
            edgecolor='none'
        )
    )

# ── Labels saisons sous les paires de boîtes ─────────────────────────────────
for i, saison in enumerate(ordre_saisons):
    centre = (positions_jour[i] + positions_nuit[i]) / 2
    ax_box.text(centre, ax_box.get_ylim()[0] - 0.15, saison,
                ha='center', va='top', fontsize=11, fontweight='bold')

ax_box.axhline(0, color='black', linewidth=0.8, linestyle=':', alpha=0.5)
ax_box.set_xticks([])                          # on retire les xticks bruts
ax_box.set_xlabel('Saison', fontsize=12)
ax_box.set_ylabel('ICU (°C)', fontsize=12)
ax_box.spines[['top','right']].set_visible(False)
ax_box.grid(axis='y', linestyle=':', alpha=0.4)
ax_box.set_facecolor('#f9f9f9')
ax_box.tick_params(labelsize=10)

# ─────────────────────────────────────────────────────────────────────────────
# LÉGENDE GLOBALE EN BAS
# ─────────────────────────────────────────────────────────────────────────────
legend_elements = []
for s in ordre_saisons:
    legend_elements.append(mpatches.Patch(facecolor=couleurs[s], alpha=0.8, label=s))

legend_elements += [
    mlines.Line2D([], [], color='grey', lw=0, label=''),
    mpatches.Patch(facecolor='grey', alpha=0.8, label='Jour (boîte pleine)'),
    mpatches.Patch(facecolor='grey', alpha=0.35, hatch='///', label='Nuit (boîte hachurée)'),
    mlines.Line2D([], [], color='grey', lw=0, label=''),
    mlines.Line2D([0],[0], color='black', lw=1.5, linestyle='--', alpha=0.6, label='ICU = 0°C (référence)'),
    mlines.Line2D([0],[0], color='black', lw=2, label='Médiane (valeur annotée)'),
]

fig.legend(handles=legend_elements, loc='lower center', ncol=5,
           fontsize=10, frameon=True, framealpha=0.95,
           edgecolor='#cccccc', bbox_to_anchor=(0.5, 0.01),
           title='Légende — ICU saisonnier Marseille 2000–2024 · Source : MODIS LST Terra MOD11A1',
           title_fontsize=9)

fig.suptitle('Îlot de Chaleur Urbain saisonnier — Marseille 2000–2024\n'
             'Écart de température de surface (LST) : zones urbaines − zones rurales',
             fontsize=14, fontweight='bold', y=0.97)

plt.savefig('ICU_saisonnier_boxplots.png', dpi=150, facecolor='white', bbox_inches='tight')
print("Sauvegardé → ICU_saisonnier_boxplots.png")
