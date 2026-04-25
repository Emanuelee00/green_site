import os
import osmnx as ox
from pyproj import Transformer

ox.settings.use_cache = True
ox.settings.cache_folder = os.path.join(os.path.dirname(__file__), "..", "cache")
ox.settings.log_console = False

_cache: dict = {
    "G": None,
    "key": None,
    "to_wgs84": None,
}


def build(center_lat: float, center_lon: float, dist_m: int = 3333):
    """
    Download (or restore from disk cache) the OSM walk graph.
    Mutates every edge adding green_weight via green_score.apply().
    Call once at server startup — subsequent calls return instantly.
    """
    from . import green_score  # avoid circular import at module level

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

    green_score.apply(G)

    _cache["G"] = G
    _cache["key"] = key
    return G


def get():
    """Return the cached graph (None if build() was never called)."""
    return _cache["G"]


def to_wgs84() -> Transformer:
    """Return the projected → WGS84 transformer."""
    return _cache["to_wgs84"]
