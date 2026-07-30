#!/usr/bin/env bash
# Phase D fail-fast smoke checklist — run from repo root.
# Doppler is required: every env-dependent check runs through `doppler run`.
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

if ! (command -v doppler >/dev/null 2>&1 && doppler me >/dev/null 2>&1); then
  echo "  doppler CLI not authenticated — run: bun run doppler:setup" >&2
  exit 1
fi

check "Bun installed" command -v bun
check "Turbo build" bun run build
check "Typecheck" bun run typecheck
check "Biome + ultracite (apps/packages)" bun run lint
check "Doppler config keys" bun run doppler:validate
check "packages/env loads" bash -c 'doppler run -- bash -c "cd apps/api && bun -e \"import { serverEnv } from \\\"@paadel/env/server\\\"; void serverEnv.APP_ENV\""'

if command -v docker >/dev/null 2>&1; then
  check "Postgres reachable" docker compose exec -T postgres pg_isready -U paadel -d paadel
  check "Redis reachable" docker compose exec -T redis redis-cli ping
  check "Drizzle migrate" bun run db:migrate
else
  skip_check "Postgres reachable" "docker not available"
  skip_check "Redis reachable" "docker not available"
  skip_check "Drizzle migrate" "docker not available"
fi

API_PID=""
cleanup() {
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

(cd apps/api && doppler run -- bun run src/index.ts) &
API_PID=$!
sleep 2

check "API /health" curl -sf http://localhost:3001/health
check "Scalar /docs" curl -sf http://localhost:3001/docs
check "API /matches requires session" bash -c '[[ "$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/matches)" == "401" ]]'
check "R2 upload prefix" curl -sf http://localhost:3001/health/r2
check "WebSocket ping/pong" bash -c 'bun -e "
  const ws = new WebSocket(\"ws://localhost:3001/ws\");
  const timeout = setTimeout(() => { ws.close(); process.exit(1); }, 5000);
  ws.addEventListener(\"open\", () => ws.send(JSON.stringify({ type: \"ping\", payload: {} })));
  ws.addEventListener(\"message\", (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.type === \"pong\") { clearTimeout(timeout); ws.close(); process.exit(0); }
  });
"'

skip_check "Better Auth OAuth (dev)" "manual — GitHub redirect needs a browser"
skip_check "Mantine /app render" "manual or e2e — build covers compile"
skip_check "Coolify stg + Doppler" "deploy environment"

echo ""
echo "Result: $pass passed, $fail failed, $skip skipped"
[[ "$fail" -eq 0 ]]
