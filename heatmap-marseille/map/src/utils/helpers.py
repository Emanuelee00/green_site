import os
from pathlib import Path

def ensure_dir(path: str) -> None:
    """Crée un répertoire s'il n'existe pas."""
    Path(path).mkdir(parents=True, exist_ok=True)

def save_report(data: dict, filename: str) -> None:
    """Sauvegarde un rapport d'analyse en JSON."""
    import json
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
