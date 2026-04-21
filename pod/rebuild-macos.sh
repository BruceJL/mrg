#!/usr/bin/env bash
set -euo pipefail

# ------------------------------
# macOS-compatible rebuild script
# Replaces systemd/quadlet usage from rebuild.sh with direct podman CLI commands.
# Usage: cd pod && ./rebuild-macos.sh
# Prerequisites: brew install podman pwgen openssl
# ------------------------------

# ------------------------------
# Check prerequisites
# ------------------------------
for cmd in podman pwgen openssl; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: '$cmd' is not installed. Install with: brew install $cmd"
        exit 1
    fi
done

# ------------------------------
# Check that Podman Machine is running
# ------------------------------
if ! podman info &>/dev/null; then
    echo "ERROR: Podman is not responding. Make sure your Podman Machine is running:"
    echo "  podman machine init   # (first time only)"
    echo "  podman machine start"
    exit 1
fi

PODMAN_VERSION=$(podman --version | awk '{print $3}')
echo "Using Podman $PODMAN_VERSION"

# ------------------------------
# Configuration
# ------------------------------
POD_NAME="mrg-check-in"
FLASK_IMAGE="flask-mrg"
NGINX_IMAGE="nginx-mrg"
POSTGRES_IMAGE="postgresql-mrg"

# Local dev ports (use unprivileged ports to avoid conflicts on macOS)
HTTPS_PORT=8443
POSTGRES_PORT=15432

NGINX_DIR="./nginx"
NGINX_SSL_DIR="$NGINX_DIR/ssl"
NGINX_KEY="$NGINX_SSL_DIR/nginx-selfsigned.key"
NGINX_CRT="$NGINX_SSL_DIR/nginx-selfsigned.crt"
NGINX_PEM="$NGINX_SSL_DIR/dhparam.pem"

SECRETS_DIR="./secrets"
WWW_DIR="$(pwd)/www"

mkdir -p "$SECRETS_DIR"
mkdir -p "$NGINX_SSL_DIR"
mkdir -p "$WWW_DIR"

# ------------------------------
# Stop and remove the existing pod (if running)
# ------------------------------
echo "Stopping pod $POD_NAME..."
podman pod stop "$POD_NAME" 2>/dev/null || true
podman pod rm -f "$POD_NAME" 2>/dev/null || true

# ------------------------------
# Wipe the database volume
# ------------------------------
echo "Wiping the Data Volume..."
podman volume rm mrg_db 2>/dev/null || true

# ------------------------------
# Build Ember app and copy to www/
# ------------------------------
echo "Building Ember app..."
(cd .. && npm run build)
rm -rf "$WWW_DIR"/*
cp -r ../dist/* "$WWW_DIR/"

# ------------------------------
# Build Flask image
# ------------------------------
echo "Building Flask image..."
podman build -t "$FLASK_IMAGE" -f ./flask/Containerfile

# ------------------------------
# Build PostgreSQL image
# ------------------------------
echo "Building PostgreSQL image..."
podman build -t "$POSTGRES_IMAGE" -f ./postgresql/Containerfile

# ------------------------------
# Generate SSL certificates if missing
# ------------------------------
if [ ! -f "$NGINX_KEY" ] || [ ! -f "$NGINX_CRT" ] || [ ! -f "$NGINX_PEM" ]; then
    echo "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$NGINX_KEY" -out "$NGINX_CRT" \
        -subj "/C=CA/ST=Manitoba/L=Winnipeg/O=Manitoba Robot Games/OU=IT/CN=mbrobotgames.ca"
    openssl dhparam -out "$NGINX_PEM" 4096
else
    echo "SSL certificates already exist, skipping."
fi

# ------------------------------
# Build Nginx image
# ------------------------------
echo "Building Nginx image..."
podman build -t "$NGINX_IMAGE" -f ./nginx/Containerfile

# ------------------------------
# Create secrets
# ------------------------------
echo "Creating secrets..."
pwgen -s 25 1 > "$SECRETS_DIR/postgres_pwd.txt"
pwgen -s 25 1 > "$SECRETS_DIR/postgrest_pwd.txt"
pwgen -s 25 1 > "$SECRETS_DIR/flask_pwd.txt"

podman secret rm postgres_pwd postgrest_pwd flask_pwd 2>/dev/null || true
podman secret create postgres_pwd "$SECRETS_DIR/postgres_pwd.txt"
podman secret create postgrest_pwd "$SECRETS_DIR/postgrest_pwd.txt"
podman secret create flask_pwd "$SECRETS_DIR/flask_pwd.txt"

# Read the PostgREST password for injection into PGRST_DB_URI
POSTGREST_PWD=$(cat "$SECRETS_DIR/postgrest_pwd.txt" | tr -d '[:space:]')

# ------------------------------
# Create the pod
# ------------------------------
echo "Creating pod $POD_NAME..."
podman pod create --name "$POD_NAME" \
    --hostname mrg-check-in \
    -p "${HTTPS_PORT}:443" \
    -p "${POSTGRES_PORT}:5432"

# ------------------------------
# Create PostgreSQL container
# ------------------------------
echo "Creating PostgreSQL container..."
podman create \
    --pod "$POD_NAME" \
    --name postgresql-mrg \
    -v mrg_db:/var/lib/postgresql/ \
    --secret postgres_pwd,type=env,target=POSTGRES_PASSWORD \
    -e POSTGRES_DB=mrg \
    "localhost/$POSTGRES_IMAGE"

# ------------------------------
# Create Flask container
# ------------------------------
echo "Creating Flask container..."
podman create \
    --pod "$POD_NAME" \
    --name flask-mrg \
    --secret flask_pwd,type=env,target=DB_PASSWORD \
    -e DB_USERNAME=python_api \
    "localhost/$FLASK_IMAGE"

# ------------------------------
# Create PostgREST container
# ------------------------------
echo "Creating PostgREST container..."
podman create \
    --pod "$POD_NAME" \
    --name postgrest \
    -e "PGRST_DB_URI=postgres://authenticator:${POSTGREST_PWD}@localhost:5432/mrg" \
    -e PGRST_DB_SCHEMAS=robots,people \
    -e PGRST_DB_ANON_ROLE=web_anon \
    -e "PGRST_SERVER_HOST=*" \
    docker.io/postgrest/postgrest

# ------------------------------
# Create Nginx container
# ------------------------------
echo "Creating Nginx container..."
podman create \
    --pod "$POD_NAME" \
    --name nginx-mrg \
    -v "$WWW_DIR:/var/www" \
    "localhost/$NGINX_IMAGE"

# ------------------------------
# Start the pod
# ------------------------------
echo "Starting pod $POD_NAME..."
podman pod start "$POD_NAME"

echo "Waiting for containers to start..."
sleep 5

EXPECTED_CONTAINERS="postgresql-mrg flask-mrg postgrest nginx-mrg"
FAILED=0
for ctr in $EXPECTED_CONTAINERS; do
    if podman container inspect --format '{{.State.Status}}' "$ctr" 2>/dev/null | grep -q "running"; then
        echo "  ✅ $ctr is running"
    else
        echo "  ❌ $ctr is NOT running"
        FAILED=1
    fi
done

if [ "$FAILED" -eq 1 ]; then
    echo "⚠️  Some containers failed to start. Check logs with: podman logs <container-name>"
    exit 1
fi

echo ""
echo "✅ Rebuild complete. Pod $POD_NAME is running."
echo ""
echo "Useful commands:"
echo "  podman pod ps                      # List pods"
echo "  podman ps --pod                    # List containers"
echo "  podman logs <container-name>       # View container logs"
echo "  podman pod stop $POD_NAME          # Stop the pod"
echo "  podman pod rm -f $POD_NAME         # Remove the pod"
echo ""
echo "Access the app at: https://localhost:${HTTPS_PORT}"
echo "PostgreSQL at:     localhost:${POSTGRES_PORT}"
