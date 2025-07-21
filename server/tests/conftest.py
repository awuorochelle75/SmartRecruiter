import pytest
from app import create_app
from app.models import db

@pytest.fixture(scope="function")
def test_app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })

    with app.app_context():
        db.create_all()
        yield app  
        db.session.remove()
        db.drop_all()
