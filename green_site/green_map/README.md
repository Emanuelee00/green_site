🌿 Green Map — Interactive Environmental Web App

Green Map is an interactive web application that combines Leaflet + Folium with a Python (Flask) backend to visualize environmental data and calculate pedestrian routes, with a focus on green and sustainable areas.

The project demonstrates advanced interaction between a frontend website and a Leaflet map embedded via iframe, using postMessage for real-time communication.

✨ Features

🗺️ Interactive map (Leaflet + Folium)

🌿 Environmental layers:

Districts

Green areas (OpenStreetMap)

Public fountains

Heat zones (proxy)

NDVI satellite data (Copernicus)

📍 My Location (browser geolocation)

🎯 Destination selection by clicking on the map

🧭 Green routing (Flask backend + OSMnx)

🌱 Custom plant-shaped markers

🌍 Multi-language UI (Italian, English, French, Spanish, Arabic)

🎨 Theme system (Forest, Ocean, Sunset, Night)

🖥️ Fullscreen map mode

📁 Project Structure
GreenMap/
│
├─ index.html
├─ style.css
├─ script.js
├─ map_folium.html
│
├─ js/
│   ├─ geolocate.js
│   └─ route.js
│
├─ backend/
│   ├─ app.py
│   └─ green_routing.py
│
├─ data/
│   ├─ quartiers.geojson
│   └─ other_layers.geojson
│
├─ requirements.txt
├─ README.md
└─ venv/

🧰 Technologies Used
Frontend

HTML5 / CSS3 / JavaScript

Leaflet.js

Leaflet Awesome Markers

Leaflet Fullscreen

i18n (custom translation system)

Backend

Python 3.10+

Flask

OSMnx

NetworkX

Shapely

PyProj

🚀 How to Run the Project
1️⃣ Frontend (Static Server)

You must run the frontend via a local server (not via file://).

python3 -m http.server 8000


Open in your browser:

http://127.0.0.1:8000

2️⃣ Backend (Flask API)
Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

Install dependencies
pip install -r requirements.txt


If needed (binary wheels):

pip install --prefer-binary flask osmnx networkx shapely pyproj

Start the backend
python -m backend.app


Backend runs at:

http://127.0.0.1:5000

🔌 Backend API Endpoints
Health check
GET /


Response:

{ "ok": true, "service": "green-map-backend" }

Green route calculation
GET /route?slat=..&slon=..&elat=..&elon=..


Returns:

GeoJSON LineString

Distance in km

Analysis area radius

🗺️ Map Architecture (Iframe Communication)

The Leaflet map is generated using Folium and embedded as an iframe:

<iframe id="mapFrame" src="map_folium.html"></iframe>


Communication between the main site and the map happens via:

window.postMessage(...)

Supported Messages
Message Type	Description
GM_IFRAME_READY	Map is ready
GM_MAP_CLICK	User clicked map (destination)
GM_TOGGLE_LAYER	Enable / disable layers
GM_USER_LOCATION	Show user position
GM_DRAW_ROUTES	Draw routes
GM_SHOW_ROUTE	Highlight selected route
GM_ADD_PLANT	Add plant marker
GM_CLEAR_PLANTS	Remove plant markers
🌱 Plant Markers (Custom Feature)

You can add plant-shaped markers to highlight green spots.

Example:

iframe.contentWindow.postMessage({
  type: "GM_ADD_PLANT",
  lat: 43.2965,
  lon: 5.3698,
  label: "🌿 Green Spot"
}, "*");

🌍 Multi-language Support (i18n)

UI elements use the data-i18n attribute:

<span data-i18n="routeBtn">Calculate green routes</span>


Languages supported:

🇮🇹 Italian

🇬🇧 English

🇫🇷 French

🇪🇸 Spanish

🇸🇦 Arabic (RTL supported)

Language selection is stored in localStorage.

🎨 Theme System

Users can switch between themes using the plant button:

🌿 Forest

🌊 Ocean

🌸 Sunset

🍃 Night

Themes affect both UI and typography.

⚠️ Common Issues & Tips
Map not visible

✔️ Use a local server (http.server)
✔️ Do not open HTML via file system

Routing is slow

✔️ First request downloads OSM data (cached later)
✔️ Routing area is capped for performance

Geolocation not working

✔️ Allow browser permissions
✔️ Use localhost or HTTPS

Translations not updating

✔️ Check data-i18n keys
✔️ Check console for JS errors

🚧 Future Improvements

True “green score” using NDVI per segment

Shade / tree-based routing

Heat avoidance routing

Nearby parks & fountains suggestions

Deployment on Vercel / Render / Fly.io