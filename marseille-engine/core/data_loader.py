import os
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
import yaml
from rasterstats import zonal_stats


class DataLoader:
    def __init__(self, config_path: str = "config/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        # Env vars override config file paths (useful for Docker mounts)
        data = self.config["data"]
        data["quartiers"] = os.environ.get("DATA_QUARTIERS", data["quartiers"])
        data["raster_uhi"] = os.environ.get("DATA_RASTER_UHI", data["raster_uhi"])
        data["modis_csv"] = os.environ.get("DATA_MODIS_CSV", data["modis_csv"])

        self.quartiers: gpd.GeoDataFrame | None = None
        self.raster_data: np.ndarray | None = None
        self.raster_transform = None
        self.raster_nodata = None
        self.modis_df: pd.DataFrame | None = None

    def preload(self):
        self._load_raster()
        self._load_quartiers()
        self._load_modis()
        self._build_graph()

    def _build_graph(self):
        from core import graph_builder
        cfg = self.config["map"]
        graph_builder.build(
            center_lat=cfg["center_lat"],
            center_lon=cfg["center_lon"],
            dist_m=int(cfg["default_radius_km"] * 1000),
            raster_data=self.raster_data,
            raster_transform=self.raster_transform,
        )

    def _load_raster(self):
        path = self.config["data"]["raster_uhi"]
        with rasterio.open(path) as src:
            self.raster_transform = src.transform
            self.raster_crs = src.crs
            nodata = src.nodata if src.nodata is not None else -3.4e+38
            self.raster_nodata = nodata
            data = src.read(1).astype(float)
            data[data == nodata] = np.nan
            self.raster_data = data

    def _load_quartiers(self):
        path = self.config["data"]["quartiers"]
        raster_path = self.config["data"]["raster_uhi"]

        gdf = gpd.read_file(path).to_crs("EPSG:4326")

        stats = zonal_stats(
            gdf,
            raster_path,
            stats=["mean", "min", "max"],
            band=1,
            nodata=self.raster_nodata,
        )

        def safe(val):
            if val is None:
                return np.nan
            v = float(val)
            return np.nan if np.isinf(v) else v

        gdf["uhi_mean"] = [safe(s["mean"]) for s in stats]
        gdf["uhi_min"]  = [safe(s["min"])  for s in stats]
        gdf["uhi_max"]  = [safe(s["max"])  for s in stats]

        fill = gdf["uhi_mean"].mean()
        gdf["uhi_mean"] = gdf["uhi_mean"].fillna(fill)
        gdf["uhi_min"]  = gdf["uhi_min"].fillna(fill)
        gdf["uhi_max"]  = gdf["uhi_max"].fillna(fill)

        # Normalize 0-1 for scoring
        lo, hi = gdf["uhi_mean"].min(), gdf["uhi_mean"].max()
        gdf["uhi_score"] = (gdf["uhi_mean"] - lo) / (hi - lo) if hi > lo else 0.0

        # Rank (1 = hottest)
        gdf["rank"] = gdf["uhi_mean"].rank(ascending=False).astype(int)

        self.quartiers = gdf

    def _load_modis(self):
        path = self.config["data"]["modis_csv"]
        if Path(path).exists():
            self.modis_df = pd.read_csv(path)
