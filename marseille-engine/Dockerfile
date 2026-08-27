FROM python:3.13-slim

WORKDIR /app

# System deps needed by rasterio, geopandas, osmnx
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    libspatialindex-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first (better layer caching)
COPY pyproject.toml uv.lock ./

# Install dependencies (no project, just deps)
RUN uv sync --frozen --no-install-project

# Copy source
COPY api/ ./api/
COPY core/ ./core/
COPY config/ ./config/

# Data is mounted at runtime (marseille_uhi.tif is 20MB, quartiers.geojson is 2.5MB)
# docker run -v /path/to/heatmap-marseille:/data ...
# Update config/config.yaml to point to /data/...

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
