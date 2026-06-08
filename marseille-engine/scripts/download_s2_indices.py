"""
Download Sentinel-2 L2A bands for Marseille (2023-08-22) from AWS public COG archive,
compute NDVI / NDWI / SWIR / Urban index rasters and save as float32 GeoTIFF.

Usage:
    cd marseille-engine
    UV_PYTHON=/usr/bin/python3 uv run python scripts/download_s2_indices.py

Output (relative to marseille-engine/):
    ../heatmap-marseille/indices/ndvi.tif
    ../heatmap-marseille/indices/ndwi.tif
    ../heatmap-marseille/indices/swir.tif
    ../heatmap-marseille/indices/urban.tif
"""

import sys
import requests
import numpy as np
import rasterio
from rasterio.warp import reproject, Resampling, calculate_default_transform
from rasterio.crs import CRS
from pathlib import Path

OUT_DIR = Path("../heatmap-marseille/indices")
OUT_DIR.mkdir(parents=True, exist_ok=True)

BBOX   = [5.25, 43.20, 5.55, 43.42]  # Marseille bounding box
TARGET_CRS = CRS.from_epsg(4326)

# ── 1. Find Sentinel-2 tile via Earth Search STAC ─────────────────────────────

print("Searching STAC catalog…")
resp = requests.post(
    "https://earth-search.aws.element84.com/v1/search",
    json={
        "collections": ["sentinel-2-l2a"],
        "bbox": BBOX,
        "datetime": "2023-08-21T00:00:00Z/2023-08-23T23:59:59Z",
        "query": {"eo:cloud_cover": {"lt": 20}},
        "limit": 5,
    },
    timeout=30,
)
resp.raise_for_status()
items = resp.json().get("features", [])
if not items:
    sys.exit("No Sentinel-2 scene found for Marseille on 2023-08-22 with cloud < 20%.")

item = items[0]
print(f"Using scene: {item['id']}")

assets = item["assets"]

# Map asset keys (vary between STAC implementations)
def find_asset(keys: list[str]) -> str:
    for k in keys:
        if k in assets:
            href = assets[k]["href"]
            print(f"  Band {keys[0]}: {href}")
            return href
    raise KeyError(f"None of {keys} found in assets: {list(assets.keys())}")

url_b03 = find_asset(["green",  "B03"])
url_b04 = find_asset(["red",    "B04"])
url_b08 = find_asset(["nir",    "nir08", "B08"])
url_b11 = find_asset(["swir16", "B11"])

# ── 2. Read bands via VSICURL (rasterio reads COGs over HTTP) ─────────────────

TARGET_SHAPE = None  # set after first band
TARGET_TRANSFORM = None

def read_band_to_4326(url: str) -> tuple[np.ndarray, dict]:
    """Read a COG band, reproject to EPSG:4326 at a fixed target grid, return float32 array."""
    global TARGET_SHAPE, TARGET_TRANSFORM
    print(f"  Reading {url.split('/')[-1]}…")
    with rasterio.open(url) as src:
        from rasterio.warp import transform_bounds
        src_bounds = transform_bounds(TARGET_CRS, src.crs, *BBOX)

        from rasterio.windows import from_bounds
        win = from_bounds(*src_bounds, src.transform)
        win = win.intersection(rasterio.windows.Window(0, 0, src.width, src.height))

        data = src.read(1, window=win).astype("float32")
        win_transform = src.window_transform(win)

        if TARGET_SHAPE is None:
            # First band sets the reference grid (10m bands come first)
            dst_transform, dst_w, dst_h = calculate_default_transform(
                src.crs, TARGET_CRS,
                data.shape[1], data.shape[0],
                left=src_bounds[0], bottom=src_bounds[1],
                right=src_bounds[2], top=src_bounds[3],
            )
            TARGET_SHAPE = (dst_h, dst_w)
            TARGET_TRANSFORM = dst_transform
        else:
            dst_w, dst_h = TARGET_SHAPE[1], TARGET_SHAPE[0]
            dst_transform = TARGET_TRANSFORM

        dst = np.full((dst_h, dst_w), np.nan, dtype="float32")
        reproject(
            source=data, destination=dst,
            src_transform=win_transform, src_crs=src.crs,
            dst_transform=dst_transform, dst_crs=TARGET_CRS,
            resampling=Resampling.bilinear,
            src_nodata=src.nodata or 0,
            dst_nodata=np.nan,
        )
        meta = {
            "driver": "GTiff", "dtype": "float32",
            "count": 1, "crs": TARGET_CRS, "transform": dst_transform,
            "width": dst_w, "height": dst_h, "nodata": float("nan"),
        }
        return dst, meta

print("\nDownloading bands…")
b03, meta = read_band_to_4326(url_b03)  # Green
b04, _    = read_band_to_4326(url_b04)  # Red
b08, _    = read_band_to_4326(url_b08)  # NIR
b11, _    = read_band_to_4326(url_b11)  # SWIR

# ── 3. Compute indices ─────────────────────────────────────────────────────────

eps = 1e-6

def normalize(arr: np.ndarray) -> np.ndarray:
    lo, hi = np.nanmin(arr), np.nanmax(arr)
    return (arr - lo) / (hi - lo + eps)

def safe_ratio(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    with np.errstate(invalid="ignore", divide="ignore"):
        r = np.where(np.abs(b) > eps, a / b, np.nan)
    return r.astype("float32")

ndvi  = safe_ratio(b08 - b04, b08 + b04)           # [-1, 1], vegetation
ndwi  = safe_ratio(b03 - b08, b03 + b08)           # [-1, 1], water/moisture
swir  = normalize(b11)                              # [0, 1], SWIR reflectance
urban = normalize(safe_ratio(b11, b08 + eps))       # proxy for imperviousness

print("\nSaving indices…")
for name, data in [("ndvi", ndvi), ("ndwi", ndwi), ("swir", swir), ("urban", urban)]:
    out_path = OUT_DIR / f"{name}.tif"
    with rasterio.open(out_path, "w", **meta) as dst:
        dst.write(data, 1)
    print(f"  Saved {out_path}  ({np.nanmin(data):.3f} … {np.nanmax(data):.3f})")

print("\nDone. Add to config/config.yaml:")
print("  indices_dir: ../heatmap-marseille/indices")
