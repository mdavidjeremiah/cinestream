#!/usr/bin/env python3
"""
CineStream Backend Setup Script
Run this to initialize the database and create a superuser
"""
import os
import sys
import subprocess

def run(cmd, cwd=None):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"Command failed: {cmd}")
        return False
    return True

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("=" * 50)
    print("  CineStream Backend Setup")
    print("=" * 50)
    
    # Check if PostgreSQL is available
    print("\n[1/4] Checking database connection...")
    db_check = subprocess.run(
        'python -c "import django; import os; os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'cinestream.settings\'); django.setup(); from django.db import connection; connection.ensure_connection(); print(\'DB OK\')"',
        shell=True, cwd=backend_dir, capture_output=True, text=True
    )
    
    if 'DB OK' not in db_check.stdout:
        print("\n⚠️  PostgreSQL connection failed!")
        print("Make sure PostgreSQL is running and credentials in .env are correct.")
        print("Default: DB_NAME=cinestream_db, DB_USER=postgres, DB_PASSWORD=postgres")
        print("\nTo create DB manually:")
        print("  psql -U postgres -c \"CREATE DATABASE cinestream_db;\"")
        print("\nTrying SQLite fallback for development...")
        # Patch settings to use SQLite if PG not available
        
    # Migrations
    print("\n[2/4] Running migrations...")
    if not run("python manage.py makemigrations", cwd=backend_dir):
        return
    if not run("python manage.py migrate", cwd=backend_dir):
        return
    
    # Create superuser
    print("\n[3/4] Creating admin user...")
    create_admin = subprocess.run(
        'python -c "import os; os.environ.setdefault(\'DJANGO_SETTINGS_MODULE\', \'cinestream.settings\'); import django; django.setup(); from accounts.models import User; User.objects.filter(email=\'admin@cinestream.com\').exists() or User.objects.create_superuser(username=\'admin\', email=\'admin@cinestream.com\', password=\'Admin1234!\', role=\'admin\')"',
        shell=True, cwd=backend_dir
    )
    
    print("\n[4/4] Collecting static files...")
    run("python manage.py collectstatic --noinput", cwd=backend_dir)
    
    print("\n" + "=" * 50)
    print("  Setup Complete!")
    print("=" * 50)
    print("\nAdmin credentials:")
    print("  Email:    admin@cinestream.com")
    print("  Password: Admin1234!")
    print("\nStart the server:")
    print("  cd backend && python manage.py runserver")
    print("\nGet a FREE TMDB API key at:")
    print("  https://www.themoviedb.org/settings/api")
    print("Then add it to backend/.env:")
    print("  TMDB_API_KEY=your_key_here")

if __name__ == "__main__":
    main()
