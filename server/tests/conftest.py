import pytest
from app import create_app
from app.models import db as _db
import os
import tempfile

@pytest.fixture(scope="session")
def app():
    # Create a temporary database
    db_fd, db_path = tempfile.mkstemp()
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()

    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture(scope="function")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def db(app):
    return _db
