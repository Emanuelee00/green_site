import geopandas as gpd
import rasterio
from rasterstats import zonal_stats
import yaml
from pathlib import Path
from typing import Dict, Any
import numpy as np

class DataLoader:
    """Charge et valide les données géospatiales."""

    def __init__(self, config_path: str = "config/paths.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

    def load_quartiers(self) -> gpd.GeoDataFrame:
        """Charge les quartiers depuis GeoJSON."""
        return gpd.read_file(self.config["data"]["quartiers"])

    def load_raster(self) -> rasterio.DatasetReader:
        """Charge le raster UHI."""
        return rasterio.open(self.config["data"]["raster_uhi"])

    def compute_zonal_stats(self, quartiers: gpd.GeoDataFrame) -> Dict[str, Any]:
        """Calcule les stats zonales (UHI moyen, min, max)."""
        with self.load_raster() as src:
            nodata = src.nodata if src.nodata else -3.4e+38
            stats = zonal_stats(
                quartiers,
                src.name,
                stats=["mean", "min", "max"],
                band=1,
                nodata=nodata,
                geojson_out=True
            )
            return stats
