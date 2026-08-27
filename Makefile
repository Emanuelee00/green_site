.PHONY: install install-engine install-app install-dashboard install-mobile \
        run start start-dashboard start-mobile stop help

ENGINE_DIR    := marseille-engine
APP_DIR       := marseille-app
DASHBOARD_DIR := marseille-dashboard
MOBILE_DIR    := fresh-route

# Per-machine overrides (e.g. PORT := 8002), gitignored, not shared.
-include Makefile.local

# Forwarded to marseille-engine/Makefile. Empty UV_PYTHON lets uv pick its own
# interpreter (respects .python-version, pinned to 3.13); set it to force a
# specific one, e.g. the 42-school machines: `make install UV_PYTHON=/usr/bin/python3`
# Override PORT on machines where 8000 is already taken, e.g. `make start PORT=8010`
UV_PYTHON ?=
PORT      ?= 8000

# ── Setup ────────────────────────────────────────────────────────────────────

install: install-engine install-app install-dashboard install-mobile ## Install all dependencies

install-engine:      ## Install backend deps (uv)
	cd $(ENGINE_DIR) && UV_PYTHON=$(UV_PYTHON) uv sync

install-app:          ## Install web app deps (npm)
	cd $(APP_DIR) && npm install

install-dashboard:    ## Install dashboard deps (npm)
	cd $(DASHBOARD_DIR) && npm install

install-mobile:       ## Install mobile app deps (npm)
	cd $(MOBILE_DIR) && npm install

# ── Run ──────────────────────────────────────────────────────────────────────
# Each target just forwards to marseille-engine/Makefile, which owns the
# actual process wiring (boot ordering, health-check wait, port cleanup).

run:              ## Start API only
	cd $(ENGINE_DIR) && $(MAKE) run UV_PYTHON=$(UV_PYTHON) PORT=$(PORT)

start:            ## Start API + web app (marseille-app, :5173)
	cd $(ENGINE_DIR) && $(MAKE) start UV_PYTHON=$(UV_PYTHON) PORT=$(PORT)

start-dashboard:  ## Start API + admin dashboard (:5174)
	cd $(ENGINE_DIR) && $(MAKE) start-dashboard UV_PYTHON=$(UV_PYTHON) PORT=$(PORT)

start-mobile:     ## Start API + mobile preview (:8081)
	cd $(ENGINE_DIR) && $(MAKE) start-mobile UV_PYTHON=$(UV_PYTHON) PORT=$(PORT)

# ── Help ─────────────────────────────────────────────────────────────────────

help:             ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
