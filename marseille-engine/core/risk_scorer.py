import pandas as pd


# Months considered high-risk for heat (Mediterranean climate)
HIGH_RISK_MONTHS = {6, 7, 8}
MEDIUM_RISK_MONTHS = {5, 9}


def compute_risk_level(uhi_mean: float, month: int) -> str:
    """Combine UHI score and seasonality into a risk level."""
    if month in HIGH_RISK_MONTHS:
        seasonal_factor = 1.0
    elif month in MEDIUM_RISK_MONTHS:
        seasonal_factor = 0.6
    else:
        seasonal_factor = 0.2

    score = uhi_mean * seasonal_factor

    if score > 0.55:
        return "high"
    elif score > 0.3:
        return "medium"
    return "low"
