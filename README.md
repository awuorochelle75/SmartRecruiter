# SmartRecruiter

## Backend (Flask + PostgreSQL)

### Setup

1. Create a `.env` file in `server/` (see `.env.example`):
   ```
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartrecruiter
   ```
2. Install dependencies:
   ```bash
cd server
pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   flask shell
   >>> from app import create_app
   >>> from app.models import db
   >>> app = create_app()
   >>> with app.app_context():
   ...     db.create_all()
   ...
   ```
4. Run the server:
   ```bash
python run.py
   ```

### Testing

The project includes comprehensive test suites for both models and API routes. Tests use an in-memory SQLite database for fast execution.

#### Prerequisites

Make sure you have pytest installed:
```bash
# If not already installed via requirements.txt
pip install pytest
```

#### Running Tests

**Run all tests:**
```bash
cd server
python3 -m pytest tests/ -v
```

**Run specific test files:**
```bash
# Run only model tests
python3 -m pytest tests/test_models.py -v

# Run only route tests
python3 -m pytest tests/test_routes.py -v
```

**Run specific test classes:**
```bash
# Run only authentication route tests
python3 -m pytest tests/test_routes.py::TestAuthRoutes -v

# Run only user model tests
python3 -m pytest tests/test_models.py::TestUser -v
```

**Run specific test methods:**
```bash
# Run a specific test
python3 -m pytest tests/test_routes.py::TestAuthRoutes::test_signup_interviewee -v
```

**Run tests with different output options:**
```bash
# Shorter output (less verbose)
python3 -m pytest tests/ --tb=short

# Show print statements
python3 -m pytest tests/ -s

# Stop on first failure
python3 -m pytest tests/ -x

# Run tests in parallel (requires pytest-xdist)
python3 -m pytest tests/ -n auto
```

#### Test Coverage

**Model Tests (27 tests):**
- User creation and authentication
- Profile management (Interviewee/Recruiter)
- Notification and privacy settings
- Assessment system (questions, attempts, answers)
- Practice problems and attempts
- Messaging and notifications
- Interview scheduling
- Feedback system

**Route Tests (29 tests):**
- Authentication endpoints (signup, login, logout)
- Profile management endpoints
- Assessment CRUD operations
- Interviewee assessment workflow
- Category management
- Analytics and reporting
- Public endpoints

#### Test Structure

```
server/tests/
├── test_models.py      # Database model tests
├── test_routes.py      # API endpoint tests
└── __init__.py
```

#### Test Configuration

Tests automatically use:
- In-memory SQLite database (`sqlite:///:memory:`)
- Test-specific Flask configuration
- Automatic database setup/teardown per test
- Isolated test environments

#### Troubleshooting

**If tests fail with database errors:**
```bash
# Clear any existing test database
rm -f test.db
python3 -m pytest tests/ -v
```

**If pytest command not found:**
```bash
# Install pytest globally (if needed)
sudo apt install python3-pytest
# or
pip install pytest
```

**If you see deprecation warnings:**
These are normal and don't affect test functionality. They're related to:
- `datetime.utcnow()` deprecation (will be updated in future versions)
- SQLAlchemy legacy API warnings (compatibility warnings)

### Deployment
- **Backend:** Render (use `wsgi.py` as entrypoint)
- **Frontend:** Vercel (see client/README.md)

### CI/CD
- GitHub Actions: see `.github/workflows/ci-cd.yml`
- On push to main: tests run, then deploy to Render (backend) and Vercel (frontend)