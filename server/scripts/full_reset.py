#!/usr/bin/env python3
"""
Complete database and migration reset script
"""
import os
import sys
import subprocess

def run_script(script_name, description):
    """Run a Python script and handle errors"""
    print(f"\n--- {description} ---")
    script_path = f"scripts/{script_name}"
    
    if not os.path.exists(script_path):
        print(f"Error: Script {script_path} not found")
        return False
    
    try:
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}:")
        print(f"Error: {e.stderr}")
        return False

def full_reset():
    """Perform complete database and migration reset"""
    print("Starting complete database and migration reset...")
    
    # Step 1: Backup migration README
    if not run_script("backup_migration_readme.py", "Backing up migration README"):
        return False
    
    # Step 2: Reset database
    if not run_script("reset_database.py", "Resetting PostgreSQL database"):
        return False
    
    # Step 3: Reset migrations
    if not run_script("reset_migrations.py", "Resetting migrations"):
        return False
    
    # Step 4: Restore migration README
    if not run_script("restore_migration_readme.py", "Restoring migration README"):
        return False
    
    print("\n--- Complete reset finished successfully! ---")
    print("Your database and migrations have been reset to a clean state.")
    return True

if __name__ == "__main__":
    if not full_reset():
        sys.exit(1) 