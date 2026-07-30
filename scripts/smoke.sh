#!/usr/bin/env bash
# Phase D fail-fast smoke checklist — run from repo root
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

pass=0
fail=0
skip=0

check() {
  local name="$1"
  shift
  printf "  %-40s " "$name"
  if "$@" >/dev/null 2>&1; then
    echo "PASS"
    pass=$((pass + 1))
  else
    echo "FAIL"
    fail=$((fail + 1))
  fi
}

skip_check() {
  local name="$1"
  local reason="$2"
  printf "  %-40s " "$name"
  echo "SKIP ($reason)"
  skip=$((skip + 1))
}

echo "=== paadel.app smoke checklist ==="

check "Bun installed" command -v bun
check "Turbo build" bun run build
check "Typecheck" bun run typecheck
check "Biome + ultracite (apps/packages)" bun run lint

if [[ -f .env ]]; then
  check "packages/env loads" bash -c 'cd apps/api && bun --env-file=../../.env -e "import { serverEnv } from \"@paadel/env/server\"; void serverEnv.NODE_ENV"'
else
  skip_check "packages/env loads" "no .env — copy .env.example"
fi

if command -v docker >/dev/null 2>&1; then
  check "Postgres reachable" docker compose exec -T postgres pg_isready -U paadel -d paadel
  check "Redis reachable" docker compose exec -T redis redis-cli ping
  if [[ -f .env ]]; then
    check "Drizzle migrate" bun run db:migrate
  else
    skip_check "Drizzle migrate" "no .env"
  fi
else
  skip_check "Postgres reachable" "docker not available"
  skip_check "Redis reachable" "docker not available"
  skip_check "Drizzle migrate" "docker not available"
fi

if [[ -f .env ]]; then
  API_PID=""
  cleanup() {
    [[ -n "${API_PID}" ]] && kill "$API_PID" 2>/dev/null || true
  }
  trap cleanup EXIT
  (cd apps/api && bun --env-file=../../.env run src/index.ts) &
  API_PID=$!
  sleep 2
  check "API /health" curl -sf http://localhost:3001/health
  check "Scalar /docs" curl -sf http://localhost:3001/docs
  check "API /matches stub" curl -sf http://localhost:3001/matches
else
  skip_check "API endpoints" "no .env"
fi

skip_check "Better Auth OAuth (dev)" "needs GITHUB_CLIENT_* + Postgres"
skip_check "R2 upload prefix" "needs R2 credentials"
skip_check "WebSocket handshake" "needs running API + WS client test"
skip_check "Mantine /app render" "manual or e2e — build covers compile"
skip_check "Coolify stg + Doppler" "deploy environment"

echo ""
echo "Result: $pass passed, $fail failed, $skip skipped"
[[ "$fail" -eq 0 ]]
