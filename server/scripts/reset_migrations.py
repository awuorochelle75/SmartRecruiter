#!/usr/bin/env python3
"""
Reset migrations and create fresh migration history
"""
import os
import shutil
import subprocess
import sys

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"Success: {description}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {description}")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def reset_migrations():
    """Reset migrations and create fresh migration history"""
    print("Starting migration reset process...")
    
    # Step 1: Remove migrations folder if it exists
    migrations_path = "migrations"
    if os.path.exists(migrations_path):
        shutil.rmtree(migrations_path)
        print("Removed existing migrations folder")
    
    # Step 2: Initialize migrations
    if not run_command("flask db init", "Initializing migrations"):
        return False
    
    # Step 3: Create initial migration
    if not run_command("flask db migrate -m \"Initial migration\"", "Creating initial migration"):
        return False
    
    # Step 4: Apply migrations
    if not run_command("flask db upgrade", "Applying migrations"):
        return False
    
    print("Migration reset completed successfully!")
    return True

if __name__ == "__main__":
    if not reset_migrations():
        sys.exit(1) 