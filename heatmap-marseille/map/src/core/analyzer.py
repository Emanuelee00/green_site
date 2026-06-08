import geopandas as gpd
import numpy as np
from scipy import stats

class Analyzer:
    """Effectue des analyses statistiques sur les quartiers."""

    @staticmethod
    def get_summary_stats(quartiers: gpd.GeoDataFrame) -> Dict[str, float]:
        """Calcule les stats descriptives (moyenne, médiane, écart-type)."""
        return {
            "moyenne": quartiers["uhi_mean"].mean(),
            "médiane": quartiers["uhi_mean"].median(),
            "écart-type": quartiers["uhi_mean"].std(),
            "min": quartiers["uhi_mean"].min(),
            "max": quartiers["uhi_mean"].max(),
        }

    @staticmethod
    def correlation_with_arrondissements(quartiers: gpd.GeoDataFrame) -> float:
        """Calcule la corrélation entre UHI et arrondissement."""
        # Exemple: On suppose que "NOM_CO" contient l'arrondissement
        return quartiers["uhi_mean"].corr(quartiers["NOM_CO"].astype("category").cat.codes)
