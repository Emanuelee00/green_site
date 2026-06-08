# temp-analysis

Analyse des températures journalières à Marseille (station Marignane, 1980–2024).

## Données

Source : API Climatologique Météo-France (`DPClim v1`)  
Station : MARIGNANE — id `13054001`  
Fréquence : quotidienne — paramètres : `TN`, `TX`, `TM`, `TAMPLI`

## Scripts

| Fichier | Description |
|---|---|
| `findStation.py` | Recherche l'identifiant station par département |
| `doRequests.py` | Télécharge les données année par année via l'API |
| `fusionCSV.py` | Fusionne les CSV annuels en `marseille_complet.csv` |
| `graphAmplitude.py` | Graphique amplitude thermique jour/nuit (1980→2024) |
| `graphTendance.py` | Graphique tendance TN/TX/TM avec droite de régression |

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # ajouter la clé API DPClim
```

## Utilisation

### 1. Obtenir une clé API

Créer un compte sur [portail-api.meteofrance.fr](https://portail-api.meteofrance.fr), souscrire au produit **DonneesPubliquesClimatologie**, et copier la clé dans `.env` :

```
API_KEY=ta_clé_ici
```

### 2. Trouver une station

```bash
python findStation.py
```

Modifie `id-departement` dans le script pour chercher dans un autre département. L'id à 8 chiffres retourné est à utiliser dans l'étape suivante.

### 3. Télécharger les données

Dans `doRequests.py`, configure :
- `STATION_ID` — id à 8 chiffres de la station
- `ANNEES` — plage d'années souhaitée (ex: `range(1980, 2025)`)

```bash
python doRequests.py
```

Les fichiers sont téléchargés dans `data_output/` (un CSV par année). L'API est asynchrone : le script attend automatiquement que chaque fichier soit prêt avant de continuer.

### 4. Fusionner les CSV

```bash
python fusionCSV.py
```

Génère `marseille_complet.csv` avec les colonnes `DATE`, `TN`, `TX`, `TM`, `TAMPLI`.

### 5. Générer les graphiques

```bash
python graphAmplitude.py   # amplitude jour/nuit
python graphTendance.py    # tendance TN/TX/TM
```

Les graphiques sont sauvegardés dans `graph_output/`.

## Résultats

- `amplitude_jour_nuit.png` — amplitude thermique quotidienne + moyenne glissante 30 jours
- `evolution_thermique.png` — évolution annuelle TN, TX, TM + droite de tendance