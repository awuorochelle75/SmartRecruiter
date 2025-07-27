#!/usr/bin/env python3
"""
Restore migration README content after creating fresh migrations
"""
import os
import shutil

def restore_migration_readme():
    """Restore the migration README content"""
    backup_path = "scripts/migration_readme_backup.txt"
    readme_path = "migrations/README"
    
    if os.path.exists(backup_path):
        shutil.copy2(backup_path, readme_path)
        print(f"Migration README restored from {backup_path}")
        
        # Clean up backup file
        os.remove(backup_path)
        print("Backup file cleaned up")
    else:
        print("Backup file not found")

if __name__ == "__main__":
    restore_migration_readme() 