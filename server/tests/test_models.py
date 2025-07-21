import pytest
from app.models import (
    db, User, IntervieweeProfile, RecruiterProfile, Assessment,
    AssessmentQuestion, AssessmentAttempt, Invitation, Submission,
    Feedback, Statistic, Notification, AuditLog, Setting,
    IntervieweeAvailability, IntervieweeInterviewHistory
)

from werkzeug.security import check_password_hash

def test_user_model_creation(test_app):
    with test_app.app_context():
        user = User(email="test@example.com", role="interviewee")
        user.set_password("securepass123")
        db.session.add(user)
        db.session.commit()

        saved = User.query.filter_by(email="test@example.com").first()
        assert saved is not None
        assert saved.role == "interviewee"
        assert saved.password_hash != "securepass123"
        assert check_password_hash(saved.password_hash, "securepass123")

def test_user_password_check(test_app):
    with test_app.app_context():
        user = User(email="checkpass@example.com", role="recruiter")
        user.set_password("topsecret")
        assert user.check_password("topsecret") is True
        assert user.check_password("wrong") is False   