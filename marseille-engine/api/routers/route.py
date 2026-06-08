import time
import networkx as nx
from pyproj import Transformer
from fastapi import APIRouter, Query, Request, HTTPException

import osmnx as ox
from core import graph_builder
from core.raster_query import sample_point, uhi_to_label

router = APIRouter()


@router.get("/")
def get_fresh_route(
    request: Request,
    from_lat: float = Query(...),
    from_lon: float = Query(...),
    to_lat: float = Query(...),
    to_lon: float = Query(...),
):
    """Returns the coolest pedestrian route between two points."""
    t0 = time.time()

    G = graph_builder.get()
    if G is None:
        raise HTTPException(status_code=503, detail="Graph not ready")

    try:
        src = _nearest_node(G, from_lat, from_lon)
        dst = _nearest_node(G, to_lat, to_lon)
        # A* with geographic heuristic — faster than Dijkstra for point-to-point
        path = nx.astar_path(G, src, dst, heuristic=_geo_heuristic(G), weight="green_weight")
    except nx.NetworkXNoPath:
        raise HTTPException(status_code=404, detail="No path found between the two points")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    geojson = _path_to_geojson(G, path)
    distance_m = _path_distance_m(G, path)

    # Average UHI along the route
    loader = request.app.state.loader
    uhi_avg = _avg_uhi(G, path, loader.raster_data, loader.raster_transform)
    fresh_score = round(1.0 - uhi_avg, 3) if uhi_avg is not None else None

    return {
        "geometry": geojson,
        "distance_m": round(distance_m, 1),
        "uhi_avg": round(uhi_avg, 3) if uhi_avg is not None else None,
        "fresh_score": fresh_score,
        "label": uhi_to_label(uhi_avg) if uhi_avg is not None else None,
        "took_s": round(time.time() - t0, 2),
    }


# ── helpers ──────────────────────────────────────────────────────────────────

def _geo_heuristic(G):
    """A* heuristic: straight-line distance in projected CRS (meters)."""
    import math
    def h(u, v):
        ux, uy = G.nodes[u]["x"], G.nodes[u]["y"]
        vx, vy = G.nodes[v]["x"], G.nodes[v]["y"]
        return math.hypot(ux - vx, uy - vy)
    return h

def _nearest_node(G, lat: float, lon: float) -> int:
    crs = G.graph["crs"]
    t = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    x, y = t.transform(lon, lat)
    return ox.distance.nearest_nodes(G, X=float(x), Y=float(y))


def _path_to_geojson(G, path: list) -> dict:
    t = graph_builder.to_wgs84()
    coords = []
    for n in path:
        lon, lat = t.transform(float(G.nodes[n]["x"]), float(G.nodes[n]["y"]))
        coords.append([round(lon, 6), round(lat, 6)])
    return {"type": "LineString", "coordinates": coords}


def _path_distance_m(G, path: list) -> float:
    total = 0.0
    for a, b in zip(path[:-1], path[1:]):
        edges = G.get_edge_data(a, b)
        if edges:
            best = min(edges.values(), key=lambda d: float(d.get("length", 1e9)))
            total += float(best.get("length", 0.0))
    return total


def _avg_uhi(G, path: list, raster_data, raster_transform) -> float | None:
    if raster_data is None or raster_transform is None:
        return None
    t = graph_builder.to_wgs84()
    samples = []
    for n in path:
        lon, lat = t.transform(float(G.nodes[n]["x"]), float(G.nodes[n]["y"]))
        v = sample_point(lat, lon, raster_data, raster_transform)
        if v is not None:
            samples.append(v)
    if not samples:
        return None
    import numpy as np
    lo = float(raster_data[~np.isnan(raster_data)].min())
    hi = float(raster_data[~np.isnan(raster_data)].max())
    avg_raw = sum(samples) / len(samples)
    return float(np.clip((avg_raw - lo) / (hi - lo), 0.0, 1.0)) if hi > lo else 0.0
