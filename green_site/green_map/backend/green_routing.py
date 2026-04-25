import osmnx as ox
import networkx as nx
from shapely.geometry import LineString
import math
from pyproj import Transformer
import time
import os

# ✅ cache su disco OSMnx (molto utile)
ox.settings.use_cache = True
ox.settings.cache_folder = os.path.join(os.path.dirname(__file__), "..", "cache")
ox.settings.log_console = False

# cache in memoria
_CACHE = {"G": None, "center": None, "dist": None, "crs": None, "transform_to_wgs84": None}

def _haversine_km(a, b):
    lat1, lon1 = a
    lat2, lon2 = b
    R = 6371.0
    p1 = math.radians(lat1); p2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    h = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(h))

def build_graph_once(center_lat, center_lon, dist_m=2500):
    """
    ✅ Chiamala UNA VOLTA all'avvio server.
    Primo colpo può essere lento (scarica OSM).
    Poi tutte le route saranno veloci.
    """
    dist_m = int(dist_m)

    # già pronto?
    if _CACHE["G"] is not None and _CACHE["center"] == (center_lat, center_lon) and _CACHE["dist"] == dist_m:
        return _CACHE["G"]

    G = ox.graph_from_point(
        (center_lat, center_lon),
        dist=dist_m,
        network_type="walk",
        simplify=True,
    )

    # proietta in metri
    G = ox.project_graph(G)

    # prepara transformer per tornare a lon/lat
    graph_crs = G.graph["crs"]
    _CACHE["crs"] = graph_crs
    _CACHE["transform_to_wgs84"] = Transformer.from_crs(graph_crs, "EPSG:4326", always_xy=True)

    # ✅ peso "green" proxy (veloce)
    green_highways = {"footway", "path", "pedestrian", "cycleway"}

    for u, v, k, data in G.edges(keys=True, data=True):
        length = float(data.get("length", 1.0))
        data["length"] = length

        highway = data.get("highway")
        base = 0.0
        if isinstance(highway, str) and highway in green_highways:
            base = 0.30  # premio pedonali

        alpha = 0.35
        data["green_weight"] = float(length * (1.0 - alpha * base))

    _CACHE["G"] = G
    _CACHE["center"] = (center_lat, center_lon)
    _CACHE["dist"] = dist_m
    return G

def _nearest_node(G, lat, lon):
    graph_crs = G.graph["crs"]
    transformer = Transformer.from_crs("EPSG:4326", graph_crs, always_xy=True)
    x, y = transformer.transform(lon, lat)
    return ox.distance.nearest_nodes(G, X=float(x), Y=float(y))

def _path_to_geojson(G, nodes):
    # usa transformer già pronto
    t = _CACHE["transform_to_wgs84"] or Transformer.from_crs(G.graph["crs"], "EPSG:4326", always_xy=True)

    coords = []
    for n in nodes:
        x = float(G.nodes[n]["x"])
        y = float(G.nodes[n]["y"])
        lon, lat = t.transform(x, y)
        coords.append((float(lon), float(lat)))

    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {"type": "LineString", "coordinates": coords}
        }]
    }

def _km_from_path(G, path):
    km = 0.0
    for a, b in zip(path[:-1], path[1:]):
        edata = G.get_edge_data(a, b)
        if not edata:
            continue
        best = min(edata.values(), key=lambda d: float(d.get("length", 1e18)))
        km += float(best.get("length", 0.0)) / 1000.0
    return float(km)

def route_green(start_latlon, end_latlon, timeout_s=5):
    """
    ✅ timeout_s qui vale solo per il calcolo percorso (non download).
    Il download lo facciamo al warmup server.
    """
    t0 = time.time()

    G = _CACHE["G"]
    if G is None:
        return {"error": "graph_not_ready"}

    s = _nearest_node(G, start_latlon[0], start_latlon[1])
    t = _nearest_node(G, end_latlon[0], end_latlon[1])

    if time.time() - t0 > timeout_s:
        return {"error": "timeout_nearest"}

    nodes_green = nx.shortest_path(G, s, t, weight="green_weight")

    if time.time() - t0 > timeout_s:
        return {"error": "timeout_path"}

    geojson = _path_to_geojson(G, nodes_green)
    km = round(_km_from_path(G, nodes_green), 2)

    geojson["features"][0]["properties"] = {"name": "Percorso Green", "km": float(km)}

    return {
        "green": geojson,
        "km_green": float(km),
        "dist_m_used": int(_CACHE["dist"] or 0),
        "took_s": round(time.time() - t0, 2)
    }
