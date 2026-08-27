import os

import osmnx as ox
from pyproj import Transformer

ox.settings.use_cache = True
ox.settings.cache_folder = os.path.join(os.path.dirname(__file__), "..", "cache")
ox.settings.log_console = False

_cache: dict = {"G": None, "key": None, "to_wgs84": None}


def build(center_lat: float, center_lon: float, dist_m: int = 3333, raster_data=None, raster_transform=None):
    from core import green_score

    key = (center_lat, center_lon, dist_m)
    if _cache["G"] is not None and _cache["key"] == key:
        return _cache["G"]

    G = ox.graph_from_point(
        (center_lat, center_lon),
        dist=dist_m,
        network_type="walk",
        simplify=True,
    )
    G = ox.project_graph(G)

    crs = G.graph["crs"]
    _cache["to_wgs84"] = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)

    green_score.apply(G, raster_data=raster_data, raster_transform=raster_transform,
                      to_wgs84=_cache["to_wgs84"])

    _cache["G"] = G
    _cache["key"] = key
    return G


def get():
    return _cache["G"]


def to_wgs84() -> Transformer:
    return _cache["to_wgs84"]
