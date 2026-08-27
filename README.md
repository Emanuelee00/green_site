# Marseille Green Routing

An app that plans walking/cycling routes across Marseille that minimize
exposure to urban heat — routes weighted by a composite Urban Heat Island
(UHI) index built from Sentinel-2 satellite imagery, instead of just
shortest distance.

**Live demo:** [fresh-route.92-4-217-42.sslip.io](https://fresh-route.92-4-217-42.sslip.io)

## Architecture

One backend API, three frontends built on top of it:

```
                    ┌───────────────────────┐
                    │   marseille-engine     │
                    │   FastAPI backend      │
                    │   (the only source     │
                    │    of truth for data)  │
                    └───────────┬────────────┘
                                 │ REST/JSON
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼───────┐ ┌────────▼────────┐ ┌────────▼────────┐
     │  fresh-route    │ │  marseille-app  │ │ marseille-      │
     │  Expo mobile/   │ │  3D web hero    │ │ dashboard       │
     │  web app        │ │  (React+Three)  │ │  Admin/analytics│
     └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### marseille-engine — the API

Python/FastAPI service that owns all the data and computation. Boots by
loading the UHI raster and the 111-district GeoJSON into memory, then
downloads (and caches) the Marseille OSM street graph and re-weights every
edge by how hot it is.

| Router | Endpoints | Purpose |
|---|---|---|
| `uhi.py` | `/uhi/quartiers`, `/uhi/quartier/{nome}`, `/uhi/point` | UHI score per district / coordinate |
| `history.py` | `/history/zones`, `/history/{zona}` | 2000–2024 land-surface-temperature trend (MODIS) |
| `route.py` | `/route/` | A\* route search, heat-weighted |
| `risk.py` | `/risk/?month=` | Per-district heat risk by month |
| `raster.py` | `/uhi/raster.png`, `/uhi/raster/raw`, `/uhi/raster/bounds` | Raw/rendered UHI raster for map overlays |
| `timeline.py` | `/timeline/snapshot?year=`, `/timeline/range` | Historical UHI snapshots for the timeline slider |

**Routing algorithm:** A\* over the OSM graph (`networkx.astar_path`) with a
custom edge weight — base length, discounted for footpaths and for
passing through cool areas, penalized for passing through hot ones —
instead of plain distance.

**Data sources:** a composite UHI index (40% SWIR + 30% NDVI + 10% built-up
surface + 10% NDWI, derived from Sentinel-2 imagery) rasterized over
Marseille, 111 official district boundaries, and 24 years of MODIS
land-surface-temperature history.

### fresh-route — the flagship app

Expo/React Native app (web + mobile) and the best place to see the project
in action. A 3D swipeable carousel (Three.js, rendered as animated point
clouds — buildings, boats, water — no meshes) lets you browse demo routes
around the Vieux-Port, then drills into a route's heat-adjusted score and
path. Also has a district heat-risk ranking screen.

### marseille-app — the 3D hero

React + Vite + Three.js landing experience: a 3D Calanque scene, a set of
preloaded demo routes, and a route-detail view with stats and an SVG path
overlay.

### marseille-dashboard — the analyst view

React + Vite dashboard for exploring the raw data: a Leaflet map with a
custom WebGL shader layer rendering the UHI raster pixel-by-pixel, a
2000→2024 timeline slider, district ranking, and historical trend/seasonal
charts (Recharts) per district.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for how these four services are
exposed publicly (Traefik + ports + firewall).
