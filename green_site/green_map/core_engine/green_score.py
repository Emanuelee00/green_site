"""
Green score per edge del grafo stradale.

Fase 1 (proxy): usa il tipo di strada OSM per premiare i percorsi pedonali.
Fase 2 (reale): leggerà i valori NDVI/UHI dal raster Sentinel-2.
"""

_PEDESTRIAN = {"footway", "path", "pedestrian", "cycleway"}
_GREEN_DISCOUNT = 0.35  # un edge verde "pesa" il 35% in meno → viene preferito


def apply(G) -> None:
    """
    Aggiunge l'attributo 'green_weight' a ogni edge di G.
    Peso più basso = percorso più preferito dal router.
    Modifica G sul posto (in-place).
    """
    for _, _, _, data in G.edges(keys=True, data=True):
        length = float(data.get("length", 1.0))
        highway = data.get("highway", "")

        is_green = isinstance(highway, str) and highway in _PEDESTRIAN
        discount = _GREEN_DISCOUNT if is_green else 0.0

        data["green_weight"] = length * (1.0 - discount)


def score(data: dict) -> float:
    """
    Restituisce un punteggio 0–100 di greenness per un singolo edge.
    Usato dall'endpoint /score.
    """
    highway = data.get("highway", "")
    if isinstance(highway, str) and highway in _PEDESTRIAN:
        return 80.0
    return 30.0
