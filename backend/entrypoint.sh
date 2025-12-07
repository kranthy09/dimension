#!/bin/bash
# entrypoint.sh - Backend entrypoint script

set -e

echo "Waiting for database to be ready..."

# Wait for database with proper health check using Python
python3 << END
import time
import psycopg2
import os

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(
            host="db",
            database=os.environ["POSTGRES_DB"],
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"]
        )
        conn.close()
        print("Postgres is ready!")
        break
    except psycopg2.OperationalError:
        retry_count += 1
        print(f"Postgres is unavailable - sleeping (attempt {retry_count}/{max_retries})")
        time.sleep(1)
else:
    print("Failed to connect to database after 30 attempts")
    exit(1)
END

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
