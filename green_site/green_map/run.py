import sys
import os

# permette di importare core_engine e api da qualsiasi directory
sys.path.insert(0, os.path.dirname(__file__))

import config
import core_engine
from api import create_app

print("Warmup grafo OSM (prima volta può essere lento)...")
core_engine.build(config.MAP_CENTER_LAT, config.MAP_CENTER_LON, config.GRAPH_DIST_M)
print("Grafo pronto.")

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.PORT, debug=True)
