from flask import Blueprint, jsonify, request

from core_engine import router

bp = Blueprint("api", __name__)


@bp.get("/health")
def health():
    graph_ready = router.graph_builder.get() is not None
    return jsonify(ok=True, graph_ready=graph_ready)


@bp.get("/route")
def route():
    try:
        slat = float(request.args["slat"])
        slon = float(request.args["slon"])
        elat = float(request.args["elat"])
        elon = float(request.args["elon"])
    except (KeyError, ValueError):
        return jsonify(error="Parametri richiesti: slat slon elat elon"), 400

    result = router.route((slat, slon), (elat, elon))

    if "error" in result:
        return jsonify(result), 503

    return jsonify(result)


@bp.get("/heatmap")
def heatmap():
    # placeholder — in fase 2 restituirà i dati NDVI/UHI reali
    return jsonify(ok=True, message="heatmap not yet implemented")
