#!/bin/bash
# ============================================================
# NEXIFY AI - VPS SETUP SCRIPT
# Hostinger VPS: srv1243952.hstgr.cloud (72.62.152.47)
# ============================================================
#
# USAGE:
#   ssh root@72.62.152.47
#   curl -fsSL https://raw.githubusercontent.com/NeXifiyAI/nexifyai-pascals-asistent/main/infrastructure/vps/setup.sh | bash
#
# OR:
#   git clone https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git /opt/nexify
#   cd /opt/nexify/infrastructure/vps
#   chmod +x setup.sh && ./setup.sh
#
# ============================================================

set -e

echo "============================================================"
echo "  NEXIFY AI - VPS Setup"
echo "  Server: $(hostname)"
echo "============================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ==========================================================
# 1. SYSTEM UPDATE
# ==========================================================
echo ""
echo ">>> Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
print_status "System updated"

# ==========================================================
# 2. INSTALL DOCKER
# ==========================================================
echo ""
echo ">>> Installing Docker..."

if command -v docker &> /dev/null; then
    print_warning "Docker already installed: $(docker --version)"
else
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    print_status "Docker installed: $(docker --version)"
fi

# ==========================================================
# 3. INSTALL DOCKER COMPOSE
# ==========================================================
echo ""
echo ">>> Checking Docker Compose..."

if docker compose version &> /dev/null; then
    print_status "Docker Compose available: $(docker compose version)"
else
    print_error "Docker Compose not found. Installing..."
    apt-get install -y docker-compose-plugin
fi

# ==========================================================
# 4. CREATE DIRECTORIES
# ==========================================================
echo ""
echo ">>> Creating directories..."

mkdir -p /opt/nexify/{data,config,logs,projects}
mkdir -p /opt/nexify/config/code-server

print_status "Directories created"

# ==========================================================
# 5. CREATE CODE-SERVER SETTINGS
# ==========================================================
echo ""
echo ">>> Creating code-server config..."

cat > /opt/nexify/config/code-server/settings.json << 'EOF'
{
  "workbench.colorTheme": "One Dark Pro",
  "editor.fontSize": 14,
  "editor.fontFamily": "'Fira Code', 'Cascadia Code', monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "terminal.integrated.fontSize": 13,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "git.autofetch": true,
  "git.confirmSync": false,
  "explorer.confirmDelete": false,
  "workbench.startupEditor": "none",
  "telemetry.telemetryLevel": "off",
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
EOF

print_status "code-server settings created"

# ==========================================================
# 6. SETUP FIREWALL
# ==========================================================
echo ""
echo ">>> Configuring firewall..."

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
    print_status "Firewall configured"
else
    print_warning "UFW not installed, skipping firewall setup"
fi

# ==========================================================
# 7. SETUP SWAP (for 8GB VPS)
# ==========================================================
echo ""
echo ">>> Setting up swap..."

if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    print_status "4GB swap created"
else
    print_warning "Swap already exists"
fi

# ==========================================================
# 8. CLONE REPOSITORY (if not already)
# ==========================================================
echo ""
echo ">>> Setting up repository..."

REPO_DIR="/opt/nexify/repo"
if [ ! -d "$REPO_DIR" ]; then
    git clone https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git "$REPO_DIR"
    print_status "Repository cloned"
else
    cd "$REPO_DIR"
    git pull
    print_status "Repository updated"
fi

# ==========================================================
# 9. COPY DOCKER FILES
# ==========================================================
echo ""
echo ">>> Setting up Docker configuration..."

cp "$REPO_DIR/infrastructure/vps/docker-compose.yml" /opt/nexify/
cp "$REPO_DIR/infrastructure/vps/.env.example" /opt/nexify/.env.example

if [ ! -f /opt/nexify/.env ]; then
    cp /opt/nexify/.env.example /opt/nexify/.env
    print_warning ".env created from example - PLEASE EDIT IT!"
else
    print_status ".env already exists"
fi

# ==========================================================
# 10. GENERATE SECRETS
# ==========================================================
echo ""
echo ">>> Generating secrets..."

N8N_KEY=$(openssl rand -hex 32)
POSTGRES_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)

echo ""
echo "============================================================"
echo "  GENERATED SECRETS (save these!):"
echo "============================================================"
echo "  N8N_ENCRYPTION_KEY: $N8N_KEY"
echo "  POSTGRES_PASSWORD:  $POSTGRES_PASS"
echo "============================================================"
echo ""

# ==========================================================
# FINAL INSTRUCTIONS
# ==========================================================
echo ""
echo "============================================================"
echo "  ${GREEN}SETUP COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Edit configuration:"
echo "     nano /opt/nexify/.env"
echo ""
echo "  2. Start services:"
echo "     cd /opt/nexify && docker compose up -d"
echo ""
echo "  3. Check status:"
echo "     docker compose ps"
echo "     docker compose logs -f"
echo ""
echo "  4. Access services:"
echo "     • n8n:         https://n8n.srv1243952.hstgr.cloud"
echo "     • code-server: https://code.srv1243952.hstgr.cloud"
echo "     • Logs:        https://logs.srv1243952.hstgr.cloud"
echo "     • Traefik:     https://traefik.srv1243952.hstgr.cloud"
echo ""
echo "============================================================"
