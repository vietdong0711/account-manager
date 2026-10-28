#!/bin/sh
set -e

BACKEND_URL=${BACKEND_URL:-http://backend:8080}
BACKEND_HOST=${BACKEND_HOST:-backend}

if [ "$BACKEND_HOST" = "backend" ] && [ "$BACKEND_URL" != "http://backend:8080" ]; then
    BACKEND_HOST=$(echo "$BACKEND_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:[0-9]*$||')
fi

sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
sed -i "s|__BACKEND_HOST__|$BACKEND_HOST|g" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
