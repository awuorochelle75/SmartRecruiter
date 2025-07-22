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



def test_create_interviewee_profile(db):
    user = User(email="interviewee@example.com", role="interviewee")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    profile = IntervieweeProfile(user_id=user.id, first_name="John", last_name="Doe")
    db.session.add(profile)
    db.session.commit()
    assert profile.id is not None
    assert user.interviewee_profile.first_name == "John" 


def test_create_recruiter_profile(db):
    user = User(email="recruiter@example.com", role="recruiter")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    profile = RecruiterProfile(user_id=user.id, first_name="Jane", last_name="Smith")
    db.session.add(profile)
    db.session.commit()
    assert profile.id is not None
    assert user.recruiter_profile.last_name == "Smith"


def test_create_session(db):
    db.session.rollback()  # ensure clean state
    session = Session(sessions="abc123", data="{}", expiry=datetime.utcnow())
    db.session.add(session)
    db.session.commit()
    assert session.id is not None



def test_create_assessment(db):
    user = User(email="assessor@example.com", role="recruiter")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    assessment = Assessment(recruiter_id=user.id, title="Test", description="Desc")
    db.session.add(assessment)
    db.session.commit()
    assert assessment.id is not None