#!/usr/bin/env sh
# Container entrypoint: apply DB migrations, then serve.
#
# `alembic upgrade head` is idempotent — it creates the schema on a fresh
# Supabase Postgres database and is a no-op once everything is applied. We run
# it on every boot so deploys carrying new migrations apply automatically.
set -e

echo "▶ Applying database migrations (alembic upgrade head)…"
alembic upgrade head

echo "▶ Starting Uvicorn on 0.0.0.0:${PORT:-8000}…"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
