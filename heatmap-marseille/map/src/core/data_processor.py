import numpy as np
import pandas as pd
from typing import List, Dict

class DataProcessor:
    """Nettoie et enrichit les données pour l'analyse."""

    @staticmethod
    def clean_uhi_values(stats: List[Dict]) -> List[float]:
        """Remplace les valeurs aberrantes par NaN."""
        cleaned = []
        for s in stats:
            mean = s["properties"]["mean"]
            if mean is None or np.isinf(mean) or np.isnan(mean):
                cleaned.append(np.nan)
            else:
                cleaned.append(float(mean))
        return cleaned

    @staticmethod
    def add_analysis_columns(quartiers: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
        """Ajoute des colonnes pour l'analyse (ex: quartiles)."""
        quartiers["uhi_mean"] = quartiers["uhi_mean"].fillna(quartiers["uhi_mean"].mean())
        quartiers["uhi_quartile"] = pd.qcut(
            quartiers["uhi_mean"],
            q=4,
            labels=["Faible", "Moyen", "Élevé", "Très élevé"]
        )
        return quartiers
