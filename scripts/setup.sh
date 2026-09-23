#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

set_if_empty() {
  local name="$1"
  local value="$2"
  local current
  current="$(grep -E "^${name}=" .env | head -n 1 | cut -d= -f2- || true)"
  if [[ -z "${current}" ]]; then
    if grep -qE "^${name}=" .env; then
      sed -i.bak "s|^${name}=.*|${name}=${value}|" .env && rm -f .env.bak
    else
      echo "${name}=${value}" >> .env
    fi
  fi
}

secret() { openssl rand -base64 32 | tr -d '\n'; }

set_if_empty JWT_SECRET "$(secret)"
set_if_empty JWT_REFRESH_SECRET "$(secret)"
set_if_empty SEED_ADMIN_PASSWORD "$(secret)"
set_if_empty SEED_ORGANIZER_PASSWORD "$(secret)"
set_if_empty SEED_PARTICIPANT_PASSWORD "$(secret)"

npm install
npm run db:generate

echo "Create the PostgreSQL database, set DATABASE_URL, then run migrations and the seed."
