"""
Script to create an admin user

Usage:
    docker compose exec backend python3 scripts/create_admin.py

Or with custom values:
    docker compose exec backend python3 scripts/create_admin.py \
        --email admin@example.com \
        --password yourpassword \
        --name "Admin User"
In docker terminal:
        python3 scripts/create_admin.py \
        --email admin@evolune.com \
        --password admin123 \
        --name "Admin User"
"""
import sys
import os
import argparse

# Add backend to path FIRST (before importing app modules)
# When running in Docker: current directory is /app (backend root)
# When running on host: need to add backend to path
if os.path.exists('/app/app'):
    # Running in Docker - /app is the backend root
    sys.path.insert(0, '/app')
else:
    # Running on host - add backend directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_path = os.path.abspath(os.path.join(script_dir, '..'))
    sys.path.insert(0, backend_path)

# Now import app modules
from app.config import get_settings
from app.core.security import get_password_hash
from app.models.user import User
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine


def create_admin_user(email: str, password: str, full_name: str):
    """Create an admin user"""
    settings = get_settings()

    # Database setup
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        # Check if user already exists
        existing_user = session.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User with email '{email}' already exists!")
            return False

        # Create admin user
        hashed_password = get_password_hash(password)
        admin_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_admin=True,
            is_active=True
        )

        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        print(f"✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   Name: {admin_user.full_name}")
        print(f"   Admin: {admin_user.is_admin}")
        print(f"   ID: {admin_user.id}")

        return True

    except Exception as e:
        session.rollback()
        print(f"❌ Error creating admin user: {e}")
        return False
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", type=str, help="Admin email address")
    parser.add_argument("--password", type=str, help="Admin password")
    parser.add_argument("--name", type=str, help="Admin full name")

    args = parser.parse_args()

    # Use provided arguments or prompt for input
    email = args.email or input("Enter admin email: ").strip()
    password = args.password or input("Enter admin password: ").strip()
    full_name = args.name or input("Enter admin full name: ").strip()

    if not email or not password or not full_name:
        print("❌ All fields are required!")
        sys.exit(1)

    if len(password) < 8:
        print("❌ Password must be at least 8 characters long!")
        sys.exit(1)

    success = create_admin_user(email, password, full_name)
    sys.exit(0 if success else 1)
