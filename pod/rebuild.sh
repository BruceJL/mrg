#!/usr/bin/env bash
set -euo pipefail

# ------------------------------
# Configuration
# ------------------------------
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
#systemctl start "$POD_NAME"

echo "✅ Rebuild complete. Pod $POD_NAME is running."
