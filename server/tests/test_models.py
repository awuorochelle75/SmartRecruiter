import pytest
from app.models import *
from datetime import datetime


@pytest.mark.parametrize("email", ["test@example.com"])
def test_create_user(db, email):
    user = User(email=email, role="interviewee")
    user.set_password("password")
    db.session.add(user)
    db.session.commit()
    assert user.id is not None
    assert user.check_password("password")