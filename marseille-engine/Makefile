.PHONY: install dev run run-prod start stop lint format typecheck test clean docker-build docker-up docker-down help

FRONTEND_DIR := ../marseille-app
VITE         := node $(FRONTEND_DIR)/node_modules/vite/bin/vite.js

# ── Setup ────────────────────────────────────────────────────────────────────

install:        ## Install all dependencies
	UV_PYTHON=/usr/bin/python3 uv sync

dev:            ## Install deps + dev extras (linting, typing)
	UV_PYTHON=/usr/bin/python3 uv add --dev ruff mypy

# ── Run ──────────────────────────────────────────────────────────────────────

run:            ## Start the API server (reload on file change)
	UV_PYTHON=/usr/bin/python3 uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

run-prod:       ## Start the API server (production, no reload)
	UV_PYTHON=/usr/bin/python3 uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 2

start:          ## Start API + web frontend (Ctrl+C stops both)
	@kill $$(lsof -ti:8000) 2>/dev/null; true
	@trap 'kill 0' INT; \
	UV_PYTHON=/usr/bin/python3 uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload & \
	until curl -s http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done && \
	cd $(FRONTEND_DIR) && node node_modules/vite/bin/vite.js & \
	wait

start-dashboard: ## Start API + admin dashboard (Ctrl+C stops both)
	@kill $$(lsof -ti:8000) 2>/dev/null; true
	@trap 'kill 0' INT; \
	UV_PYTHON=/usr/bin/python3 uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload & \
	echo "⏳ Waiting for engine to boot (loading raster + OSM graph)..." && \
	until curl -s http://localhost:8000/health > /dev/null 2>&1; do sleep 2; done && \
	echo "✅ Engine ready — starting dashboard..." && \
	cd ../marseille-dashboard && node node_modules/vite/bin/vite.js --port 5174 & \
	wait

start-mobile:   ## Start API + mobile app preview (Ctrl+C stops both)
	@kill $$(lsof -ti:8000) 2>/dev/null; true
	@kill $$(lsof -ti:8081) 2>/dev/null; true
	@trap 'kill 0' INT; \
	UV_PYTHON=/usr/bin/python3 uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload & \
	sleep 2 && cd ../fresh-route && \
	EXPO_NO_DOTEXPO_FOLDER=1 TMPDIR=/goinfre/eielmini/.expo-cache HOME=/goinfre/eielmini \
	node node_modules/expo/bin/cli start --web --port 8081 & \
	wait

# ── Quality ──────────────────────────────────────────────────────────────────

lint:           ## Check code style with ruff
	UV_PYTHON=/usr/bin/python3 uv run ruff check .

format:         ## Auto-format code with ruff
	UV_PYTHON=/usr/bin/python3 uv run ruff format .

typecheck:      ## Type-check with mypy
	UV_PYTHON=/usr/bin/python3 uv run mypy api/ core/

# ── Test ─────────────────────────────────────────────────────────────────────

test:           ## Run tests
	UV_PYTHON=/usr/bin/python3 uv run pytest tests/ -v

# ── Docker ───────────────────────────────────────────────────────────────────

docker-build:   ## Build Docker image
	docker build -t marseille-engine .

docker-up:      ## Start with docker-compose
	docker compose up --build

docker-down:    ## Stop docker-compose
	docker compose down

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean:          ## Remove venv and cache
	rm -rf .venv __pycache__ .ruff_cache .mypy_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +

# ── Help ─────────────────────────────────────────────────────────────────────

help:           ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' Makefile | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
