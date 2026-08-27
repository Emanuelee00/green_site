"""
Converts the UHI raster to a colourised PNG for Leaflet ImageOverlay.
Supports temporal mode: applies MODIS zone anomalies to modulate pixel values.
"""
import io

import numpy as np
from PIL import Image

_COLORMAP = np.array([
    [34,  197, 94 ],  # 0.00  green
    [134, 239, 172],  # 0.20  light green
    [253, 224, 71 ],  # 0.40  yellow
    [251, 146, 60 ],  # 0.60  orange
    [239, 68,  68 ],  # 0.80  red
    [185, 28,  28 ],  # 1.00  deep red
], dtype=np.float32)

# Approximate geographic bounds per MODIS zone
# (lat_min, lat_max, lon_min, lon_max)
_ZONE_BOUNDS = {
    "centre_ville":   (43.270, 43.315, 5.355, 5.415),
    "sud_urbain":     (43.200, 43.275, 5.340, 5.450),
    "nord_urbain":    (43.315, 43.420, 5.340, 5.430),
    "periurbain_est": (43.215, 43.360, 5.415, 5.527),
    "periurbain_nord":(43.360, 43.420, 5.290, 5.430),
    "rural_est":      (43.200, 43.280, 5.450, 5.527),
    "rural_nord":     (43.380, 43.420, 5.430, 5.527),
    "rural_ouest":    (43.250, 43.420, 5.250, 5.330),
    "rural_sud":      (43.200, 43.255, 5.250, 5.355),
}


def _apply_colormap(normalized: np.ndarray) -> np.ndarray:
    n_stops = len(_COLORMAP) - 1
    idx_f  = normalized * n_stops
    idx_lo = np.clip(idx_f.astype(int), 0, n_stops - 1)
    idx_hi = np.clip(idx_lo + 1, 0, n_stops)
    frac   = (idx_f - idx_lo)[..., np.newaxis]
    rgb    = (1 - frac) * _COLORMAP[idx_lo] + frac * _COLORMAP[idx_hi]
    rgb    = np.clip(rgb, 0, 255).astype(np.uint8)
    alpha  = np.full((*normalized.shape, 1), 185, dtype=np.uint8)
    return np.concatenate([rgb, alpha], axis=-1)


def _build_zone_mask(shape: tuple, transform) -> np.ndarray:
    """
    Build a 2D array where each cell contains the zone index (0-8) for that pixel.
    -1 = no zone matched.
    """
    rows, cols = shape
    zones = list(_ZONE_BOUNDS.keys())
    mask = np.full((rows, cols), -1, dtype=np.int8)

    # Compute lat/lon grids from the raster transform
    col_idx = np.arange(cols)
    row_idx = np.arange(rows)
    lons = transform.c + col_idx * transform.a           # lon per column
    lats = transform.f + row_idx * transform.e           # lat per row (e is negative)
    lon_grid = np.tile(lons, (rows, 1))
    lat_grid = np.tile(lats, (cols, 1)).T

    for zi, (zone, (la_min, la_max, lo_min, lo_max)) in enumerate(zip(zones, _ZONE_BOUNDS.values())):
        in_zone = (lat_grid >= la_min) & (lat_grid <= la_max) & \
                  (lon_grid >= lo_min) & (lon_grid <= lo_max)
        mask[in_zone & (mask == -1)] = zi   # first match wins

    return mask


def raster_to_png(
    raster_data: np.ndarray,
    nodata_mask: np.ndarray,
    zone_anomalies: dict[str, float] | None = None,
    raster_transform=None,
) -> bytes:
    """
    Args:
        raster_data:     2D float array (raw UHI values)
        nodata_mask:     boolean mask (True = nodata)
        zone_anomalies:  {zone_name: anomaly_norm} for temporal mode (-1..1)
                         None = static 2023 UHI mode
        raster_transform: rasterio transform (needed for zone_anomalies)
    Returns:
        PNG bytes (RGBA)
    """
    data = raster_data.copy()

    if zone_anomalies and raster_transform is not None:
        zones = list(_ZONE_BOUNDS.keys())
        zone_mask = _build_zone_mask(data.shape, raster_transform)
        anomaly_grid = np.zeros_like(data)
        for zi, zone in enumerate(zones):
            anomaly_grid[zone_mask == zi] = zone_anomalies.get(zone, 0.0)
        # Shift the raw UHI values proportionally to the anomaly
        # anomaly_norm in [-1, 1] → shift ±15% of the UHI range
        lo = np.nanmin(data)
        hi = np.nanmax(data)
        shift = anomaly_grid * (hi - lo) * 0.15
        data = np.clip(data + shift, lo, hi)

    lo = np.nanmin(data)
    hi = np.nanmax(data)
    norm = np.clip((data - lo) / (hi - lo + 1e-8), 0.0, 1.0)
    norm = np.where(nodata_mask, 0.0, norm)

    rgba = _apply_colormap(norm)
    rgba[nodata_mask, 3] = 0

    img = Image.fromarray(rgba, mode="RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=False)
    buf.seek(0)
    return buf.read()
