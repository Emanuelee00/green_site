import requests
import time
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://public-api.meteofrance.fr/public/DPClim/v1"
headers = {"apikey": API_KEY}

# ÉTAPE 1 — Trouver l'id station de Marseille (département 13)
r = requests.get(
    f"{BASE_URL}/liste-stations/quotidienne",
    params={"id-departement": "13"},
    headers=headers
)
stations = r.json()
for s in stations:
    if "MARIGNANE" in s["nom"].upper() or "MARSEILLE" in s["nom"].upper():
        print(f"Station trouvée : {s['nom']} — id: {s['id']}")