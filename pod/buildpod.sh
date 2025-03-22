#!/bin/sh -x

# Make sure that we've got the required packages installed.
# Debian is the assumed OS.
#apt install -y  podman pwgen

# Create some passwords
export POSTGRESPWD=`pwgen -s 25`
export POSTGRESTPWD=`pwgen -s 25`
export FLASKDBPWD=`pwgen -s 25`

# Setup some static naming of things.
export DB_NAME=mrg
export PODNAME=mrg-check-in
export POSTGRES_CONTAINER_NAME=postgres

export NGINX_KEY=./nginx/ssl/nginx-selfsigned.key
export NGINX_CRT=./nginx/ssl/nginx-selfsigned.crt
export NGINX_PEM=./nginx/ssl/dhparam.pem

# Dump the passwords to a text file. Just in case.
echo "export POSTGRESPWD=$POSTGRESPWD\nexport POSTGRESTPWD=$POSTGRESTPWD\nexport FLASKDBPWD=$FLASKDBPWD" > ./passwords.txt

# Delete the old pod
podman pod stop $PODNAME
podman pod rm $PODNAME
podman volume prune -f
podman image prune -f

# Create the new pod
# Note that the JSON interface (port 3000) can be dropped for production.
# the postgresql port (5432) can be removed entirely if you are super confident
# that you don't neeed direct DB access.
podman pod create --name $PODNAME \
  --hostname mrg-check-in \
  -p 443:443 \
  -p 5432:5432 \

# Setup PostgreSQL, note the 1 volume for data, and the password generated earlier.
podman container create \
  --replace \
  --pod $PODNAME \
  --name $POSTGRES_CONTAINER_NAME \
  -v mrg_db:/var/lib/postgres/data/ \
  -e POSTGRES_PASSWORD=$POSTGRESPWD \
  -e POSTGRES_DB=$DB_NAME \
  docker.io/library/postgres

echo "ALTER USER authenticator WITH PASSWORD '$POSTGRESTPWD';" > ./postgresql/password.sql
echo "ALTER USER python_api WITH PASSWORD '$FLASKDBPWD';" > ./postgresql/password.sql
podman cp ./postgresql/. $POSTGRES_CONTAINER_NAME:/docker-entrypoint-initdb.d/.
rm ./postgresql/password.sql

# Setup the POSTGREST RESTful interface
podman container create \
  --replace \
  --pod $PODNAME \
  --name postgrest \
  --requires=$POSTGRES_CONTAINER_NAME \
  -e PGRST_DB_SCHEMAS="robots,people" \
  -e PGRST_DB_ANON_ROLE="web_anon" \
  -e PGRST_SERVER_HOST="*" \
  -e PGRST_DB_URI="postgres://authenticator:$POSTGRESTPWD@localhost:5432/$DB_NAME" \
  docker.io/postgrest/postgrest

# Setup Nginx. www volume is mapped to a local directory until I can figure out how
# to SCP directly into a volume remotely.
podman container create \
  --replace \
  --pod $PODNAME \
  --name nginx \
  --requires=postgrest \
  -v ./www/:/var/www/:Z \
  docker.io/library/nginx

# Generate SSL Certificates if any are missing, as this takes awhile.
if [ ! -f "$NGINX_KEY"  ] || [ ! -f "$NGINX_CRT" ] || [ ! -f "$NGINX_PEM" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $NGINX_KEY -out $NGINX_CRT -subj "/C=CA/ST=Manitoba/L=Winnipeg/O=Manitoba Robot Games/OU=IT/CN=mbrobotgames.ca"
    openssl dhparam -out $NGINX_PEM 4096
fi
# Copy the nginx setup into the configuration volume.
podman cp ./nginx/. nginx:/etc/nginx/
# rm $NGINX_KEY $NGINX_CRT $NGINX.PEM


# Build the flask image.
podman build \
  --tag flask-mrg \
  --file ./flask/Containerfile

# Create the flask container.
podman container create --replace --pod $PODNAME \
  --name flask-mrg \
  -e DB_PASSWORD=$FLASKDBPWD \
  -e DB_USERNAME="python_api" \
  flask-mrg

# Start the pod
podman pod start $PODNAME
