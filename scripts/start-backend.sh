#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="${E2E_BACKEND_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)/../backend}"
PORT=8090
HEALTH_URL="http://localhost:${PORT}/api/health"

DATABASE_URL="${E2E_DATABASE_URL:-postgres://root:root123@localhost:5432/productdb_e2e?sslmode=disable}"
API_DOMAIN="http://localhost:${PORT}"
MEDIA_ROOT="${E2E_MEDIA_ROOT:-${TMPDIR:-/tmp}/pm-e2e-media}"
API_GATEWAY_SECRET="${E2E_API_SECRET:-e2e}"

export DATABASE_URL
export API_DOMAIN
export MEDIA_ROOT
export API_GATEWAY_SECRET

mkdir -p "$MEDIA_ROOT"

if ! PGPASSWORD=root123 psql -h localhost -U root -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='productdb_e2e'" | grep -q 1; then
  PGPASSWORD=root123 psql -h localhost -U root -d postgres -c "CREATE DATABASE productdb_e2e" >/dev/null
fi

BIN_DIR="$(mktemp -d)"
BIN="$BIN_DIR/backend"
PID=""

cleanup() {
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
  rm -rf "$BIN_DIR"
  rm -rf "$MEDIA_ROOT"
}
trap cleanup EXIT

echo "Backend dir: $BACKEND_DIR"
(cd "$BACKEND_DIR" && go build -o "$BIN" .)

"$BIN" &
PID=$!
echo "Backend PID: $PID"

for _ in $(seq 1 60); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "Backend ready at $HEALTH_URL"
    wait "$PID"
    exit 0
  fi
  sleep 1
done

echo "Backend failed to become healthy in time" >&2
if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
  kill "$PID" 2>/dev/null || true
fi
exit 1