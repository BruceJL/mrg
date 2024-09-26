#!/bin/sh -x

# Make sure that we've got the required packages installed.
# Debian is the assumed OS.
apt install -y  podman pwgen

# Create some passwords
export POSTGRESPWD=`pwgen -s 25`
export POSTGRESTPWD=`pwgen -s 25`
export DB_NAME=mrg
export PODNAME=mrg-check-in
export POSTGRES_CONTAINER_NAME=postgres

# Dump the passwords to a text file. Just in case.
echo "export POSTGRESPWD=$POSTGRESPWD\nexport POSTGRESTPWD=$POSTGRESTPWD" > ./passwords.txt

# Delete the old pod
podman pod stop $PODNAME
podman pod rm $PODNAME
podman volume prune -f

# Create the new pod
podman pod create --name $PODNAME \
  --hostname mrg-check-in \
  -p 80:80 -p 443:443 -p 5431:5432 -p 3000:3000

# Setup PostgreSQL, note the 1 volume for data, and the password generated earlier.
podman container create --replace --pod $PODNAME \
  --name $POSTGRES_CONTAINER_NAME \
  -v mrg_db:/var/lib/postgres/data/ \
  -e POSTGRES_PASSWORD=$POSTGRESPWD \
  -e POSTGRES_DB=$DB_NAME \
  docker.io/library/postgres

echo "ALTER USER authenticator WITH PASSWORD '$POSTGRESTPWD';" > ./postgresql/password.sql
podman cp ./postgresql/. $POSTGRES_CONTAINER_NAME:/docker-entrypoint-initdb.d/.
rm ./postgresql/password.sql

# Setup the POSTGREST RESTful interface
podman container create --replace --pod $PODNAME \
  --name postgrest \
  --requires=$POSTGRES_CONTAINER_NAME \
  -e PGRST_DB_SCHEMAS="robots,people" \
  -e PGRST_DB_ANON_ROLE="web_anon" \
  -e PGRST_DB_URI="postgres://authenticator:$POSTGRESTPWD@localhost:5432/$DB_NAME" \
  docker.io/postgrest/postgrest

# Setup Nginx. Note that it creates two volumes, one for config and another for data.
podman container create --replace --pod $PODNAME \
  --name nginx \
  --requires=postgrest \
  -v nginx_data:/var/www/ \
  docker.io/library/nginx

# Copy the nginx setup into the configuration volume.
podman cp ./nginx/. nginx:/etc/nginx/templates

# Create the flask container.
# podman run --replace --pod $PODNAME --name flask flask-mrg

# Start the pod
podman pod start $PODNAME
