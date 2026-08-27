from typing import Literal

import numpy as np
import rasterio.transform


def sample_point(
    lat: float,
    lon: float,
    raster_data: np.ndarray,
    transform,
) -> float | None:
    """Sample raster value at a (lat, lon) coordinate. Returns None if out of bounds."""
    row, col = rasterio.transform.rowcol(transform, lon, lat)
    if 0 <= row < raster_data.shape[0] and 0 <= col < raster_data.shape[1]:
        val = raster_data[row, col]
        return None if np.isnan(val) else float(val)
    return None


def uhi_to_label(score: float) -> Literal["cool", "warm", "hot"]:
    if score < 0.3:
        return "cool"
    elif score < 0.6:
        return "warm"
    return "hot"
