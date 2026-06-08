import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://public-api.meteofrance.fr/public/DPClim/v1"
headers = {"apikey": API_KEY}

STATION_ID = "13054001"  # à remplacer avec l'id trouvé ci-dessus
ANNEES = range(1980, 2025)  # toutes les années souhaitées

for annee in ANNEES:
    print(f"\n--- Commande {annee} ---")

    # ÉTAPE 2 — Passer la commande
    commande = requests.get(
        f"{BASE_URL}/commande-station/quotidienne",
        params={
            "id-station": STATION_ID,
            "date-deb-periode": f"{annee}-01-01T00:00:00Z",
            "date-fin-periode": f"{annee}-12-31T23:59:59Z",
        },
        headers=headers
    )

    if commande.status_code != 202:
        print(f"Erreur commande : {commande.status_code} {commande.text}")
        continue

    order_id = commande.json()["elaboreProduitAvecDemandeResponse"]["return"]
    print(f"Commande n°{order_id}, en attente...")

    # ÉTAPE 3 — Attendre et télécharger
    for _ in range(30):
        time.sleep(10)
        fichier = requests.get(
            f"{BASE_URL}/commande/fichier",
            params={"id-cmde": order_id},
            headers=headers
        )
        if fichier.status_code == 201:
            filename = f"./data_output/marseille_{annee}.csv"
            with open(filename, "wb") as f:
                f.write(fichier.content)
            print(f"Téléchargé : {filename}")
            break
        elif fichier.status_code == 204:
            print("En cours...")
        else:
            print(f"Erreur : {fichier.status_code} {fichier.text}")
            break