import threading
from flask import Flask, render_template


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.after_request
    def add_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    _warmup_graph(app)
    return app


def _warmup_graph(app):
    from .routing.engine import build_graph_once
    cfg = app.config

    def run():
        print("Warmup grafo OSM...")
        build_graph_once(cfg["OSM_CENTER_LAT"], cfg["OSM_CENTER_LON"], cfg["OSM_DIST_M"])
        print("Grafo pronto.")

    threading.Thread(target=run, daemon=True).start()
