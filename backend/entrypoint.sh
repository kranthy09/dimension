#!/bin/bash
# entrypoint.sh - Backend entrypoint script

set -e

echo "Waiting for database to be ready..."

# Wait for database with proper health check using Python
python3 << END
import time
import psycopg2
import os
import sys

max_retries = 30
retry_count = 0

# Print connection details for debugging (hide password)
print("=" * 60)
print("DATABASE CONNECTION DETAILS:")
print(f"  Host: {os.environ.get('POSTGRES_HOST', 'db')}")
print(f"  Database: {os.environ.get('POSTGRES_DB', 'NOT SET')}")
print(f"  User: {os.environ.get('POSTGRES_USER', 'NOT SET')}")
print(f"  Password: {'*' * len(os.environ.get('POSTGRES_PASSWORD', ''))}")
print("=" * 60)

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(
            host="db",
            database=os.environ["POSTGRES_DB"],
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"]
        )
        conn.close()
        print("✓ Postgres is ready!")
        break
    except psycopg2.OperationalError as e:
        retry_count += 1
        print(f"✗ Connection failed (attempt {retry_count}/{max_retries})")
        print(f"  Error: {e}")
        print(f"  Error code: {e.pgcode if hasattr(e, 'pgcode') else 'N/A'}")

        # Show detailed error on first attempt and every 10th attempt
        if retry_count == 1 or retry_count % 10 == 0:
            print("  Full error details:")
            print(f"    {type(e).__name__}: {str(e)}")

        time.sleep(1)
else:
    print("=" * 60)
    print("FATAL: Failed to connect to database after 30 attempts")
    print("=" * 60)
    print("Environment variables:")
    print(f"  POSTGRES_DB = {os.environ.get('POSTGRES_DB', 'NOT SET')}")
    print(f"  POSTGRES_USER = {os.environ.get('POSTGRES_USER', 'NOT SET')}")
    print(f"  DATABASE_URL = {os.environ.get('DATABASE_URL', 'NOT SET')[:50]}...")
    print("=" * 60)
    sys.exit(1)
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
