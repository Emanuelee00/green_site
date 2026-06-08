import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

data = pd.read_csv("marseille_complet.csv", parse_dates=["DATE"])
for col in ["TN", "TX", "TM"]:
    data[col] = pd.to_numeric(data[col], errors="coerce")
data = data.sort_values("DATE")

annual_tn = data.groupby(data["DATE"].dt.year)["TN"].mean()
annual_tx = data.groupby(data["DATE"].dt.year)["TX"].mean()
annual_tm = data.groupby(data["DATE"].dt.year)["TM"].mean()

z = np.polyfit(annual_tm.index, annual_tm.values, 1)
p = np.poly1d(z)

fig, axes = plt.subplots(3, 1, figsize=(14, 10))
fig.suptitle("Évolution thermique — Marignane 1980→2024", fontsize=13, fontweight="bold")

axes[0].plot(annual_tn.index, annual_tn.values, color="#4a90d9", marker="o", markersize=3)
axes[0].set_title("Température minimale moyenne annuelle (nuits)")
axes[0].set_ylabel("°C")

axes[1].plot(annual_tx.index, annual_tx.values, color="#e05c2a", marker="o", markersize=3)
axes[1].set_title("Température maximale moyenne annuelle (jours)")
axes[1].set_ylabel("°C")

axes[2].plot(annual_tm.index, annual_tm.values, color="#444", marker="o", markersize=3)
axes[2].plot(annual_tm.index, p(annual_tm.index), color="red", linestyle="--", linewidth=1.5,
             label=f"Tendance : +{z[0]:.3f}°C/an")
axes[2].set_title("Température moyenne annuelle + tendance")
axes[2].set_ylabel("°C")
axes[2].legend()

for ax in axes:
    ax.grid(axis="y", alpha=0.3)
    ax.set_xlabel("Année")

plt.tight_layout()
plt.savefig("./graph_output/evolution_thermique.png", dpi=150, bbox_inches="tight")
plt.show()
print("Graphique sauvegardé : evolution_thermique.png")