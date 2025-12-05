#!/bin/bash
# entrypoint.sh - Backend entrypoint script

set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Running in PRODUCTION mode with 4 workers"
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
else
    echo "Running in DEVELOPMENT mode with auto-reload"
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi
