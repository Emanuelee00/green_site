import json

from fastapi import APIRouter, Query, Request

from core.risk_scorer import compute_risk_level

router = APIRouter()


@router.get("/")
def get_risk_map(
    request: Request,
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
):
    """Returns GeoJSON with heat risk level per district for a given month."""
    gdf = request.app.state.loader.quartiers.copy()

    gdf["risk_level"] = gdf["uhi_score"].apply(
        lambda score: compute_risk_level(float(score), month)
    )

    # Keep only the columns needed for the frontend
    out = gdf[["NOM_QUA", "NOM_CO", "uhi_score", "rank", "risk_level", "geometry"]].copy()
    out = out.rename(columns={"NOM_QUA": "name", "NOM_CO": "arrondissement"})

    return json.loads(out.to_json())
