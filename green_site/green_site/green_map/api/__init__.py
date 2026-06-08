from flask import Flask
from flask_cors import CORS

from .routes import bp


def create_app() -> Flask:
    """
    App factory: crea e configura l'istanza Flask.
    Usare sempre questa funzione invece di creare app direttamente.
    """
    app = Flask(__name__)
    CORS(app)  # abilita CORS per tutte le route (dev)

    app.register_blueprint(bp)

    return app
