#!/usr/bin/env python3
"""
Backup migration README content before resetting migrations
"""
import os
import shutil

def backup_migration_readme():
    """Backup the migration README content"""
    readme_path = "migrations/README"
    backup_path = "scripts/migration_readme_backup.txt"
    
    if os.path.exists(readme_path):
        shutil.copy2(readme_path, backup_path)
        print(f"Migration README backed up to {backup_path}")
    else:
        print("Migration README not found")

if __name__ == "__main__":
    backup_migration_readme() 