"""
GET /indices/{name}/raw  →  float32 binary + X-Raster-* headers
GET /indices/available   →  {name: bool}

Supported names: ndvi, ndwi, swir, urban
Same wire format as /uhi/raster/raw.
"""
import numpy as np
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException, Request
from fastapi.responses import Response

router = APIRouter()
ALLOWED = {"ndvi", "ndwi", "swir", "urban"}

# Candidate directories searched in order — covers both engine locations
_CANDIDATES = [
    Path("/goinfre/eielmini/green_project/heatmap-marseille/indices"),
    Path("/goinfre/eielmini/heatmap-marseille/indices"),
]


def _indices_dir() -> Path:
    for p in _CANDIDATES:
        if p.exists():
            return p
    raise RuntimeError(f"Indices directory not found. Searched: {_CANDIDATES}")


def _load_index(name: str, scale: float) -> np.ndarray:
    import rasterio
    path = _indices_dir() / f"{name}.tif"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Index '{name}' not found at {path}. Run scripts/download_s2_indices.py first.",
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
        raise HTTPException(status_code=400, detail=f"Unknown index. Choose from: {sorted(ALLOWED)}")
    data = _load_index(name, scale)
    rows, cols = data.shape
    return Response(
        content=data.tobytes(),
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
    try:
        d = _indices_dir()
        return {name: (d / f"{name}.tif").exists() for name in sorted(ALLOWED)}
    except RuntimeError:
        return {name: False for name in sorted(ALLOWED)}
