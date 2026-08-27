import numpy as np
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse, Response

from api.routers.timeline import BASELINE_END, BASELINE_START, ZONES, _zone_annual
from core.raster_renderer import raster_to_png

router = APIRouter()


@router.get("/uhi/raster.png", responses={200: {"content": {"image/png": {}}}})
def get_raster_png(request: Request, scale: float = Query(0.25, ge=0.05, le=1.0)):
    """Static colourised PNG (used as fallback)."""
    loader = request.app.state.loader
    data = loader.raster_data.copy()
    mask = np.isnan(data)
    step = max(1, round(1.0 / scale))
    png_bytes = raster_to_png(data[::step, ::step], mask[::step, ::step])
    return Response(content=png_bytes, media_type="image/png", headers={
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
    })


@router.get("/uhi/raster/raw")
def get_raster_raw(request: Request, scale: float = Query(0.3, ge=0.05, le=1.0)):
    """
    Returns UHI raster as raw float32 binary + metadata headers.
    Client uses this for WebGL colourisation without round-tripping to server.
    Nodata → NaN (client treats NaN as transparent).
    """
    loader = request.app.state.loader
    data = loader.raster_data  # already NaN for nodata
    step = max(1, round(1.0 / scale))
    downsampled = data[::step, ::step].astype(np.float32)

    rows, cols = downsampled.shape
    raw = downsampled.tobytes()

    return Response(
        content=raw,
        media_type="application/octet-stream",
        headers={
            "X-Raster-Rows":   str(rows),
            "X-Raster-Cols":   str(cols),
            "X-Raster-Min":    str(float(np.nanmin(downsampled))),
            "X-Raster-Max":    str(float(np.nanmax(downsampled))),
            "Cache-Control":   "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "X-Raster-Rows,X-Raster-Cols,X-Raster-Min,X-Raster-Max",
        },
    )


@router.get("/uhi/raster/all-zones-history")
def get_all_zones_history(request: Request):
    """
    Returns annual LST for all 9 zones + anomaly vs 2000-2010 baseline.
    Used by the WebGL layer to colorise client-side without per-year requests.
    Shape: { zone: { year: { lst, anomaly_norm } } }
    """
    loader = request.app.state.loader
    df = loader.modis_df
    if df is None:
        return JSONResponse({})

    result: dict = {}
    for zone in ZONES:
        annual = _zone_annual(df, zone)
        baseline_vals = [v for y, v in annual.items() if BASELINE_START <= y <= BASELINE_END]
        baseline = float(np.mean(baseline_vals)) if baseline_vals else None
        zone_data: dict = {}
        raw_anomalies = []
        for year in range(2000, 2025):
            lst = annual.get(year)
            anomaly = (lst - baseline) if (lst and baseline) else 0.0
            raw_anomalies.append(anomaly)
            zone_data[year] = {"lst": round(lst, 2) if lst else None, "anomaly": round(anomaly, 3)}
        # Normalise anomaly across all years for this zone
        max_abs = max(abs(a) for a in raw_anomalies) or 1.0
        for year in range(2000, 2025):
            zone_data[year]["anomaly_norm"] = round(zone_data[year]["anomaly"] / max_abs, 4)
        result[zone] = zone_data

    return JSONResponse(result, headers={"Cache-Control": "public, max-age=3600"})


@router.get("/uhi/raster/bounds")
def get_raster_bounds(request: Request):
    loader = request.app.state.loader
    import rasterio
    with rasterio.open(loader.config["data"]["raster_uhi"]) as src:
        b = src.bounds
    return JSONResponse({
        "bounds": [[b.bottom, b.left], [b.top, b.right]],
        "south": b.bottom, "west": b.left, "north": b.top, "east": b.right,
    })
