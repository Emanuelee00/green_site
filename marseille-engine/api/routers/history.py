import numpy as np
from fastapi import APIRouter, Request, Query, HTTPException

from api.models import HistoryResponse, HistoryPoint, MODIS_ZONES

router = APIRouter()


@router.get("/zones")
def list_zones():
    """Returns available MODIS zones."""
    return {"zones": MODIS_ZONES}


@router.get("/{zone}", response_model=HistoryResponse)
def get_history(
    request: Request,
    zone: str,
    from_year: int = Query(2000, alias="from", ge=2000, le=2024),
    to_year: int = Query(2024, alias="to", ge=2000, le=2024),
):
    """Returns annual LST statistics for a MODIS zone (2000-2024)."""
    if zone not in MODIS_ZONES:
        raise HTTPException(
            status_code=404,
            detail=f"Zone '{zone}' not found. Available: {MODIS_ZONES}",
        )

    df = request.app.state.loader.modis_df
    if df is None:
        raise HTTPException(status_code=503, detail="MODIS data not loaded")

    # Filter by zone and year range, exclude nodata (-9999)
    mask = (
        (df["zone"] == zone) &
        (df["annee"] >= from_year) &
        (df["annee"] <= to_year) &
        (df["LST_jour_C"] != -9999)
    )
    subset = df[mask]

    import pandas as pd

    # Replace -9999 nodata with NaN before aggregating
    subset = subset.copy()
    for col in ("LST_jour_C", "LST_nuit_C", "amplitude_C"):
        subset[col] = subset[col].where(subset[col] != -9999, other=np.nan)

    # Aggregate by year (NaN-safe mean)
    grouped = (
        subset.groupby("annee")
        .agg(
            lst_day=("LST_jour_C", "mean"),
            lst_night=("LST_nuit_C", "mean"),
            amplitude=("amplitude_C", "mean"),
        )
        .reset_index()
    )

    # Linear trend on day LST (°C/decade), skip NaN years
    valid = grouped.dropna(subset=["lst_day"])
    trend = _compute_trend(valid["annee"].values, valid["lst_day"].values)

    def _opt(val) -> float | None:
        return round(float(val), 2) if pd.notna(val) else None

    data = [
        HistoryPoint(
            year=int(row.annee),
            lst_day=_opt(row.lst_day),
            lst_night=_opt(row.lst_night),
            amplitude=_opt(row.amplitude),
        )
        for row in grouped.itertuples()
    ]

    return HistoryResponse(
        zone=zone,
        from_year=from_year,
        to_year=to_year,
        data=data,
        trend_per_decade=round(trend, 3),
    )


def _compute_trend(years: np.ndarray, values: np.ndarray) -> float:
    """Returns °C per decade via linear regression. Returns 0.0 if insufficient data."""
    if len(years) < 2:
        return 0.0
    slope, _ = np.polyfit(years, values, 1)
    return float(slope * 10)
