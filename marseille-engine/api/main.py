from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import history, raster, risk, route, timeline, uhi
from core.data_loader import DataLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load raster and quartiers once at startup
    app.state.loader = DataLoader(config_path="config/config.yaml")
    app.state.loader.preload()
    yield


app = FastAPI(
    title="Marseille Engine",
    description="Urban heat island & green routing API for Marseille",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uhi.router,    prefix="/uhi",     tags=["UHI"])
app.include_router(raster.router,   prefix="",          tags=["Raster"])
app.include_router(timeline.router, prefix="",          tags=["Timeline"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(route.router, prefix="/route", tags=["Routing"])
app.include_router(risk.router, prefix="/risk", tags=["Risk"])


@app.get("/health")
def health():
    return {"status": "ok"}
