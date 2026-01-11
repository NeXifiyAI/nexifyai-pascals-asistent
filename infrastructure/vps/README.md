# NeXify AI - VPS Infrastructure

## Quick Start

```bash
# 1. SSH zum Server
ssh root@72.62.152.47

# 2. Setup ausführen
curl -fsSL https://raw.githubusercontent.com/NeXifiyAI/nexifyai-pascals-asistent/main/infrastructure/vps/setup.sh | bash

# 3. .env bearbeiten
cd /opt/nexify
nano .env

# 4. Starten
docker compose up -d
```

## Services

| Service         | URL                            | Port   | Funktion            |
| --------------- | ------------------------------ | ------ | ------------------- |
| **Traefik**     | traefik.srv1243952.hstgr.cloud | 80/443 | Reverse Proxy, SSL  |
| **n8n**         | n8n.srv1243952.hstgr.cloud     | 5678   | Workflow Automation |
| **code-server** | code.srv1243952.hstgr.cloud    | 8080   | VS Code im Browser  |
| **Dozzle**      | logs.srv1243952.hstgr.cloud    | 8080   | Docker Logs Viewer  |
| **Redis**       | intern                         | 6379   | Queue/Cache         |
| **PostgreSQL**  | intern                         | 5432   | n8n Database        |

## Ressourcen-Verteilung (8GB VPS)

```
Total RAM: 8 GB
├── System/OS:     ~1.0 GB
├── n8n:           ~2.0 GB (limit)
├── code-server:   ~1.0 GB (limit)
├── PostgreSQL:    ~0.5 GB (limit)
├── Redis:         ~0.3 GB (limit)
├── Traefik:       ~0.1 GB
├── Watchtower:    ~0.1 GB
├── Dozzle:        ~0.1 GB
└── Headroom:      ~2.9 GB ✓
```

## Befehle

```bash
# Status prüfen
docker compose ps

# Logs ansehen
docker compose logs -f n8n
docker compose logs -f code-server

# Neustart
docker compose restart

# Update (Watchtower macht das automatisch)
docker compose pull && docker compose up -d

# Stoppen
docker compose down

# Alles löschen (Vorsicht!)
docker compose down -v
```

## Backup

```bash
# Volumes sichern
docker run --rm -v nexify_n8n-data:/data -v /backup:/backup alpine tar czf /backup/n8n-$(date +%Y%m%d).tar.gz /data
docker run --rm -v nexify_postgres-data:/data -v /backup:/backup alpine tar czf /backup/postgres-$(date +%Y%m%d).tar.gz /data
```

## Architektur

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │    Traefik      │ ← SSL, Routing
              │   (Port 80/443) │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌─────────┐
   │   n8n   │   │  code-   │   │ Dozzle  │
   │         │   │  server  │   │ (Logs)  │
   └────┬────┘   └──────────┘   └─────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌───────────┐
│Redis │  │ PostgreSQL│
└──────┘  └───────────┘
```

## Verbindung zu externen Services

| Service       | Typ           | URL                              |
| ------------- | ------------- | -------------------------------- |
| **Dashboard** | Vercel        | nexify-dashboard.vercel.app      |
| **Marketing** | Vercel        | nexify-automate.com              |
| **Brain/DB**  | Supabase      | cwebcfgdraghzeqgfsty.supabase.co |
| **CRM**       | Twenty Cloud  | app.twenty.com                   |
| **Invoicing** | Invoice Ninja | app.invoiceninja.com             |
