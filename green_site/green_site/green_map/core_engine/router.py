"""
Trova il percorso verde tra due coordinate lat/lon.
Dipende solo da graph_builder — zero Flask, zero HTTP.
"""

import time
import networkx as nx
import osmnx as ox
from pyproj import Transformer

from . import graph_builder


def _nearest_node(G, lat: float, lon: float) -> int:
    """Converte lat/lon nel nodo OSM più vicino nel grafo proiettato."""
    crs = G.graph["crs"]
    t = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    x, y = t.transform(lon, lat)
    return ox.distance.nearest_nodes(G, X=float(x), Y=float(y))


def _nodes_to_geojson(G, nodes: list) -> dict:
    """Converte una lista di nodi OSM in un GeoJSON LineString (lon/lat)."""
    t = graph_builder.to_wgs84()
    coords = []
    for n in nodes:
        lon, lat = t.transform(float(G.nodes[n]["x"]), float(G.nodes[n]["y"]))
        coords.append([float(lon), float(lat)])

    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {"type": "LineString", "coordinates": coords},
        }],
    }


def _path_km(G, path: list) -> float:
    """Calcola la lunghezza totale del percorso in km."""
    total = 0.0
    for a, b in zip(path[:-1], path[1:]):
        edges = G.get_edge_data(a, b)
        if edges:
            best = min(edges.values(), key=lambda d: float(d.get("length", 1e9)))
            total += float(best.get("length", 0.0))
    return round(total / 1000.0, 2)


def route(start: tuple, end: tuple, timeout_s: int = 5) -> dict:
    """
    Calcola il percorso verde da start a end.

    Args:
        start:     (lat, lon)
        end:       (lat, lon)
        timeout_s: abbandona se il calcolo supera questo limite

    Returns:
        { "green": <GeoJSON>, "km_green": float, "took_s": float }
        oppure { "error": str } in caso di errore.
    """
    t0 = time.time()

    G = graph_builder.get()
    if G is None:
        return {"error": "graph_not_ready"}

    s = _nearest_node(G, start[0], start[1])
    e = _nearest_node(G, end[0], end[1])

    if time.time() - t0 > timeout_s:
        return {"error": "timeout_nearest"}

    nodes = nx.shortest_path(G, s, e, weight="green_weight")

    if time.time() - t0 > timeout_s:
        return {"error": "timeout_path"}

    geojson = _nodes_to_geojson(G, nodes)
    km = _path_km(G, nodes)
    geojson["features"][0]["properties"] = {"name": "Percorso Green", "km": km}

    return {
        "green": geojson,
        "km_green": km,
        "took_s": round(time.time() - t0, 2),
    }
