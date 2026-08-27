import json

import numpy as np
from fastapi import APIRouter, HTTPException, Query, Request

from api.models import QuartierStats, UHIPoint
from core.raster_query import sample_point, uhi_to_label

router = APIRouter()


@router.get("/quartiers")
def get_all_quartiers(request: Request):
    """Returns all districts as GeoJSON with UHI scores."""
    gdf = request.app.state.loader.quartiers
    return json.loads(gdf.to_json())


@router.get("/quartier/{quartier_id}", response_model=QuartierStats)
def get_quartier(request: Request, quartier_id: str):
    """Returns UHI statistics for a specific district (by NOM_QUA)."""
    gdf = request.app.state.loader.quartiers
    match = gdf[gdf["NOM_QUA"].str.upper() == quartier_id.upper()]

    if match.empty:
        raise HTTPException(status_code=404, detail=f"Quartier '{quartier_id}' not found")

    row = match.iloc[0]
    return QuartierStats(
        id=row["NOM_QUA"],
        name=row["NOM_QUA"],
        uhi_mean=float(row["uhi_mean"]),
        uhi_min=float(row["uhi_min"]),
        uhi_max=float(row["uhi_max"]),
        rank=int(row["rank"]),
    )


@router.get("/point", response_model=UHIPoint)
def get_uhi_point(
    request: Request,
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Returns UHI score for a given coordinate."""
    loader = request.app.state.loader
    raw = sample_point(lat, lon, loader.raster_data, loader.raster_transform)

    if raw is None:
        raise HTTPException(status_code=404, detail="Coordinate outside Marseille raster coverage")

    # Normalize using the same min/max used for quartiers
    gdf = loader.quartiers
    lo = float(gdf["uhi_mean"].min())
    hi = float(gdf["uhi_mean"].max())
    score = (raw - lo) / (hi - lo) if hi > lo else 0.0
    score = float(np.clip(score, 0.0, 1.0))

    return UHIPoint(
        lat=lat,
        lon=lon,
        uhi_score=score,
        ndvi=None,
        ndwi=None,
        swir=None,
        label=uhi_to_label(score),
    )
