from pydantic import BaseModel
from typing import Optional, Literal


class UHIPoint(BaseModel):
    lat: float
    lon: float
    uhi_score: float
    ndvi: Optional[float]
    ndwi: Optional[float]
    swir: Optional[float]
    label: Literal["cool", "warm", "hot"]


class QuartierStats(BaseModel):
    id: str
    name: str
    uhi_mean: float
    uhi_min: float
    uhi_max: float
    rank: int


class RouteResponse(BaseModel):
    geometry: dict        # GeoJSON LineString
    distance_m: float
    uhi_avg: float
    fresh_score: float    # 0-1, higher = fresher path


MODIS_ZONES = [
    "centre_ville", "nord_urbain", "sud_urbain",
    "periurbain_est", "periurbain_nord",
    "rural_est", "rural_nord", "rural_ouest", "rural_sud",
]


class HistoryPoint(BaseModel):
    year: int
    lst_day: float | None
    lst_night: float | None
    amplitude: float | None


class HistoryResponse(BaseModel):
    zone: str
    from_year: int
    to_year: int
    data: list[HistoryPoint]
    trend_per_decade: float       # °C/decade (day LST, linear regression)


class RiskFeature(BaseModel):
    quartier_id: str
    name: str
    risk_level: Literal["low", "medium", "high"]
    uhi_mean: float
