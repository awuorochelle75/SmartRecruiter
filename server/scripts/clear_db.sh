#!/bin/bash
# Clear all data from SmartRecruiter database tables and reset identity sequences (for development only)

set -e

DB_NAME="smartrecruiter"
DB_USER="postgres"

psql -U $DB_USER -d $DB_NAME <<EOF
TRUNCATE TABLE session RESTART IDENTITY CASCADE;
TRUNCATE TABLE interviewee_profile RESTART IDENTITY CASCADE;
TRUNCATE TABLE recruiter_profile RESTART IDENTITY CASCADE;
TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;
EOF

echo "Database $DB_NAME cleared and sequences reset." 