import numpy as np
from core.raster_query import sample_point

_PEDESTRIAN = {"footway", "path", "pedestrian", "cycleway"}
_PEDESTRIAN_DISCOUNT = 0.35
_COOL_DISCOUNT = 0.30     # extra discount for edges in cool UHI zones
_HOT_PENALTY = 0.40       # extra weight for edges in hot UHI zones
_UHI_HOT_THRESHOLD = 0.65
_UHI_COOL_THRESHOLD = 0.35


def apply(G, raster_data=None, raster_transform=None, to_wgs84=None) -> None:
    """Add green_weight to every edge. Lower weight = preferred by router."""
    for u, v, _, data in G.edges(keys=True, data=True):
        length = float(data.get("length", 1.0))
        highway = data.get("highway", "")

        is_pedestrian = isinstance(highway, str) and highway in _PEDESTRIAN
        discount = _PEDESTRIAN_DISCOUNT if is_pedestrian else 0.0

        # Sample UHI at edge midpoint if raster is available
        if raster_data is not None and raster_transform is not None and to_wgs84 is not None:
            mx = (G.nodes[u]["x"] + G.nodes[v]["x"]) / 2
            my = (G.nodes[u]["y"] + G.nodes[v]["y"]) / 2
            lon, lat = to_wgs84.transform(mx, my)
            uhi = sample_point(lat, lon, raster_data, raster_transform)
            if uhi is not None:
                if uhi > _UHI_HOT_THRESHOLD:
                    discount -= _HOT_PENALTY
                elif uhi < _UHI_COOL_THRESHOLD:
                    discount += _COOL_DISCOUNT

        data["green_weight"] = max(length * (1.0 - discount), length * 0.1)
