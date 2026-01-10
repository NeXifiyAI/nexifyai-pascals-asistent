# ============================================================
# NEXIFY AI - MAKEFILE
# Einfache Befehle für Development & Deployment
# ============================================================

.PHONY: dev build start stop lint format clean deploy logs

# ==========================================================
# DEVELOPMENT
# ==========================================================

## Start development environment
dev:
	docker-compose up -d app
	@echo "Dashboard läuft auf http://localhost:3000"

## Start with local Supabase
dev-full:
	docker-compose --profile local-db up -d
	@echo "Dashboard + Supabase läuft"

## Stop all containers
stop:
	docker-compose down

## View logs
logs:
	docker-compose logs -f app

## Rebuild containers
rebuild:
	docker-compose build --no-cache
	docker-compose up -d

# ==========================================================
# CODE QUALITY
# ==========================================================

## Run Biome linting
lint:
	docker-compose exec app pnpm biome check .

## Fix linting issues
lint-fix:
	docker-compose exec app pnpm biome check --write .

## Format code
format:
	docker-compose exec app pnpm biome format --write .

# ==========================================================
# PRODUCTION
# ==========================================================

## Build production image
build:
	docker build -t nexify-ai:latest \
		--build-arg NEXT_PUBLIC_SUPABASE_URL=$(NEXT_PUBLIC_SUPABASE_URL) \
		--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$(NEXT_PUBLIC_SUPABASE_ANON_KEY) \
		.

## Run production image locally
start:
	docker run -p 3000:3000 --env-file .env nexify-ai:latest

## Deploy to Vercel (manual)
deploy:
	pnpm dlx vercel --prod

# ==========================================================
# CLEANUP
# ==========================================================

## Remove all containers and volumes
clean:
	docker-compose down -v --rmi local
	docker system prune -f

## Remove node_modules and rebuild
reset:
	rm -rf node_modules .next
	docker-compose build --no-cache

# ==========================================================
# HELP
# ==========================================================

## Show this help
help:
	@echo "NeXify AI - Verfügbare Befehle:"
	@echo ""
	@echo "  make dev        - Starte Development Server"
	@echo "  make dev-full   - Starte mit lokaler Supabase DB"
	@echo "  make stop       - Stoppe alle Container"
	@echo "  make logs       - Zeige Logs"
	@echo "  make rebuild    - Rebuild und starte neu"
	@echo ""
	@echo "  make lint       - Prüfe Code mit Biome"
	@echo "  make lint-fix   - Behebe Linting-Fehler"
	@echo "  make format     - Formatiere Code"
	@echo ""
	@echo "  make build      - Baue Production Image"
	@echo "  make start      - Starte Production lokal"
	@echo "  make deploy     - Deploy zu Vercel"
	@echo ""
	@echo "  make clean      - Lösche Container & Volumes"
	@echo "  make reset      - Kompletter Reset"
