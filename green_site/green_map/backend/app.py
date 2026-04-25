from flask import Flask, request, jsonify, make_response
from backend.green_routing import build_graph_once, route_green

app = Flask(__name__)

def cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

@app.get("/")
def health():
    return cors(jsonify(ok=True, service="green-map-backend", graph_ready=True))

@app.route("/route", methods=["GET", "OPTIONS"])
def route():
    if request.method == "OPTIONS":
        return cors(make_response("", 204))

    try:
        slat = float(request.args["slat"])
        slon = float(request.args["slon"])
        elat = float(request.args["elat"])
        elon = float(request.args["elon"])
    except Exception:
        return cors(jsonify(error="Parametri mancanti: slat slon elat elon")), 400

    out = route_green((slat, slon), (elat, elon), timeout_s=5)
    return cors(jsonify(out))

if __name__ == "__main__":
    # ✅ scegli un centro fisso (Marseille) e dist ragionevole
    # Primo avvio può metterci un po'. Dopo, le route sono veloci.
    print("⏳ Warmup grafo OSM (prima volta può essere lento)...")
    build_graph_once(43.2965, 5.3698, dist_m=3333)
    print("✅ Grafo pronto. Avvio server.")

    app.run(host="127.0.0.1", port=5000, debug=True)
