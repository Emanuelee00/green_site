"""
GET /indices/{name}/raw  →  float32 binary + X-Raster-* headers
Supported names: ndvi, ndwi, swir, urban

Returns 404 if the TIF file is not found (run scripts/download_s2_indices.py first).
Same wire format as /uhi/raster/raw so the frontend can reuse the same renderer.
"""
import numpy as np
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response

router = APIRouter()

# Path assoluto relativo a questo file — indipendente dal CWD di uvicorn
INDICES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "heatmap-marseille" / "indices"
ALLOWED = {"ndvi", "ndwi", "swir", "urban"}


def _load_index(name: str, scale: float) -> np.ndarray:
    import rasterio
    path = INDICES_DIR / f"{name}.tif"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Index '{name}' not found. Run scripts/download_s2_indices.py first.",
        )
    with rasterio.open(path) as src:
        nodata = src.nodata
        data = src.read(1).astype(np.float32)
        if nodata is not None:
            data[data == nodata] = np.nan
    step = max(1, int(round(1.0 / scale)))
    return data[::step, ::step]


@router.get("/indices/{name}/raw")
def get_index_raw(name: str, scale: float = Query(0.3, ge=0.05, le=1.0)):
    if name not in ALLOWED:
        raise HTTPException(status_code=400, detail=f"Unknown index '{name}'. Choose from: {sorted(ALLOWED)}")

    data = _load_index(name, scale)
    rows, cols = data.shape
    raw = data.tobytes()

    return Response(
        content=raw,
        media_type="application/octet-stream",
        headers={
            "X-Raster-Rows":  str(rows),
            "X-Raster-Cols":  str(cols),
            "X-Raster-Min":   str(float(np.nanmin(data))),
            "X-Raster-Max":   str(float(np.nanmax(data))),
            "Cache-Control":  "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "X-Raster-Rows,X-Raster-Cols,X-Raster-Min,X-Raster-Max",
        },
    )


@router.get("/indices/available")
def get_available_indices():
    """Returns which index TIFs are present on disk."""
    return {
        name: (INDICES_DIR / f"{name}.tif").exists()
        for name in sorted(ALLOWED)
    }
