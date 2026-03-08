#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' is required but not installed or not on PATH."
    exit 1
  fi
}

require_cmd node
require_cmd npm
require_cmd psql

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is missing in .env"
  exit 1
fi

url="${DATABASE_URL#postgresql://}"
cred_part="${url%%@*}"
host_and_db="${url#*@}"
host_port_db="${host_and_db%%\?*}"
host_port="${host_port_db%%/*}"
db_name="${host_port_db#*/}"

db_user="${cred_part%%:*}"
db_pass="${cred_part#*:}"
db_host="${host_port%%:*}"
db_port="${host_port#*:}"

if [[ "$db_port" == "$host_port" ]]; then
  db_port="5432"
fi

ADMIN_DB_USER="${ADMIN_DB_USER:-postgres}"
ADMIN_DB_PASSWORD="${ADMIN_DB_PASSWORD:-postgres}"

echo "Checking PostgreSQL connection to ${db_host}:${db_port} ..."
PGPASSWORD="$ADMIN_DB_PASSWORD" psql \
  -h "$db_host" \
  -p "$db_port" \
  -U "$ADMIN_DB_USER" \
  -d postgres \
  -c 'SELECT 1;' >/dev/null

echo "Ensuring role '${db_user}' exists ..."
role_exists=$(PGPASSWORD="$ADMIN_DB_PASSWORD" psql \
  -h "$db_host" \
  -p "$db_port" \
  -U "$ADMIN_DB_USER" \
  -d postgres \
  -tAc "SELECT 1 FROM pg_roles WHERE rolname='${db_user}'")

if [[ "$role_exists" != "1" ]]; then
  safe_pass=${db_pass//\'/\'\'}
  PGPASSWORD="$ADMIN_DB_PASSWORD" psql \
    -h "$db_host" \
    -p "$db_port" \
    -U "$ADMIN_DB_USER" \
    -d postgres \
    -c "CREATE ROLE \"${db_user}\" WITH LOGIN PASSWORD '${safe_pass}';"
  echo "Created role '${db_user}'"
fi

echo "Ensuring database '${db_name}' exists ..."
db_exists=$(PGPASSWORD="$ADMIN_DB_PASSWORD" psql \
  -h "$db_host" \
  -p "$db_port" \
  -U "$ADMIN_DB_USER" \
  -d postgres \
  -tAc "SELECT 1 FROM pg_database WHERE datname='${db_name}'")

if [[ "$db_exists" != "1" ]]; then
  PGPASSWORD="$ADMIN_DB_PASSWORD" createdb \
    -h "$db_host" \
    -p "$db_port" \
    -U "$ADMIN_DB_USER" \
    -O "$db_user" \
    "$db_name"
  echo "Created database '${db_name}'"
fi

echo "Installing dependencies ..."
npm install

echo "Running Prisma generate/migrate/seed ..."
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed

echo "Starting app on http://localhost:3000 ..."
npm run dev
