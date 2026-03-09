#!/usr/bin/env bash
set -euo pipefail

# ------------------------------
# Configuration
# ------------------------------
# ------------------------------
# Check Podman version (quadlets require >= 4.4)
# ------------------------------
PODMAN_VERSION=$(podman --version | awk '{print $3}')
PODMAN_MINOR=$(echo "$PODMAN_VERSION" | cut -d. -f1,2 | awk -F. '{printf "%d%02d", $1, $2}')
if [ "$PODMAN_MINOR" -lt 404 ]; then
    echo "ERROR: Podman >= 4.4 is required for quadlet support (found $PODMAN_VERSION)."
    echo "On Debian 12, install from the Trixie repo:"
    echo "  echo 'deb http://deb.debian.org/debian trixie main' | sudo tee /etc/apt/sources.list.d/trixie.list"
    echo "  echo -e 'Package: *\nPin: release n=trixie\nPin-Priority: 100' | sudo tee /etc/apt/preferences.d/trixie"
    echo "  sudo apt-get update && sudo apt-get -t trixie install -y podman crun"
    exit 1
fi

POD_NAME="mrg-check-in-pod"
FLASK_IMAGE="flask-mrg"
NGINX_IMAGE="nginx-mrg"
POSTGRES_IMAGE="postgresql-mrg"

NGINX_DIR="./nginx"
NGINX_SSL_DIR="$NGINX_DIR/ssl"
NGINX_KEY="$NGINX_SSL_DIR/nginx-selfsigned.key"
NGINX_CRT="$NGINX_SSL_DIR/nginx-selfsigned.crt"
NGINX_PEM="$NGINX_SSL_DIR/dhparam.pem"

SECRETS_DIR="./secrets"
mkdir -p "$SECRETS_DIR"
mkdir -p "$NGINX_SSL_DIR"
mkdir -p /var/www

# ------------------------------
# Stop the pod (if running)
# ------------------------------
echo "Stopping pod $POD_NAME..."
systemctl stop "$POD_NAME" || true

# ------------------------------
# Wipe the database volume
# ------------------------------
echo "Wiping the Data Volume..."
podman volume rm mrg_db || true

# ------------------------------
# Copy the quadlet files and reinit systemd
# ------------------------------
cp ./quadlets/* /etc/containers/systemd/
systemctl daemon-reexec
systemctl daemon-reload

# ------------------------------
# Build Flask image
# ------------------------------
echo "Building Flask image..."
podman build --dns=8.8.8.8 -t "$FLASK_IMAGE" -f ./flask/Containerfile

# ------------------------------
# Build PostgreSQL image
# ------------------------------
echo "Building PostgreSQL image..."
podman build --dns=8.8.8.8 -t "$POSTGRES_IMAGE" -f ./postgresql/Containerfile

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
podman build --dns=8.8.8.8 -t "$NGINX_IMAGE" -f ./nginx/Containerfile

# ------------------------------
# Create secrets
# ------------------------------
echo "Creating secrets..."
pwgen -s 25 1 > "$SECRETS_DIR/postgres_pwd.txt"
pwgen -s 25 1 > "$SECRETS_DIR/postgrest_pwd.txt"
pwgen -s 25 1 > "$SECRETS_DIR/flask_pwd.txt"

podman secret rm postgres_pwd postgrest_pwd flask_pwd || true
podman secret create postgres_pwd "$SECRETS_DIR/postgres_pwd.txt"
podman secret create postgrest_pwd "$SECRETS_DIR/postgrest_pwd.txt"
podman secret create flask_pwd "$SECRETS_DIR/flask_pwd.txt"

# ------------------------------
# Start the pod
# ------------------------------
echo "Reloading systemd user units..."
systemctl daemon-reload

echo "Starting pod $POD_NAME..."
systemctl start "$POD_NAME"

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

echo "✅ Rebuild complete. Pod $POD_NAME is running."
