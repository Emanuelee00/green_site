"""
Returns a snapshot of LST anomaly for all 9 MODIS zones for a given year.
Anomaly = (year_lst - baseline_mean) where baseline = 2000-2010 average.
Used by the dashboard timeline slider.
"""
import numpy as np
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter()

ZONES = [
    "centre_ville", "nord_urbain", "sud_urbain",
    "periurbain_est", "periurbain_nord",
    "rural_est", "rural_nord", "rural_ouest", "rural_sud",
]

BASELINE_START = 2000
BASELINE_END   = 2010


def _zone_annual(df, zone: str) -> dict[int, float]:
    """Returns {year: mean_day_lst} for a zone, excluding -9999."""
    sub = df[(df["zone"] == zone) & (df["LST_jour_C"] != -9999)].copy()
    sub["LST_jour_C"] = sub["LST_jour_C"].where(sub["LST_jour_C"] != -9999)
    return sub.groupby("annee")["LST_jour_C"].mean().to_dict()


@router.get("/timeline/snapshot")
def get_snapshot(request: Request, year: int = Query(..., ge=2000, le=2024)):
    """
    Returns for each MODIS zone:
    - lst: mean day LST for that year
    - anomaly: difference from 2000-2010 baseline (°C)
    - anomaly_norm: normalised anomaly in [-1, 1] for colour mapping
    """
    df = request.app.state.loader.modis_df
    if df is None:
        raise HTTPException(status_code=503, detail="MODIS data not loaded")

    result = {}
    anomalies = []

    for zone in ZONES:
        annual = _zone_annual(df, zone)
        baseline_vals = [v for y, v in annual.items() if BASELINE_START <= y <= BASELINE_END]
        baseline = float(np.mean(baseline_vals)) if baseline_vals else None
        lst_year = annual.get(year)

        if lst_year is not None and baseline is not None:
            anomaly = lst_year - baseline
        else:
            anomaly = 0.0

        result[zone] = {
            "lst": round(lst_year, 2) if lst_year else None,
            "anomaly": round(anomaly, 3),
        }
        anomalies.append(anomaly)

    # Normalise anomalies to [-1, 1] across all zones for this year
    max_abs = max(abs(a) for a in anomalies) if anomalies else 1.0
    if max_abs == 0:
        max_abs = 1.0

    for zone, anomaly in zip(ZONES, anomalies):
        result[zone]["anomaly_norm"] = round(anomaly / max_abs, 3)

    return {"year": year, "zones": result}


@router.get("/timeline/range")
def get_range():
    """Returns the available year range."""
    return {"from": 2000, "to": 2024}
