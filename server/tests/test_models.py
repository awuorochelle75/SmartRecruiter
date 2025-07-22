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



def test_create_question(db):
    recruiter = User(email="quiz_creator@example.com", role="recruiter")
    recruiter.set_password("password")
    db.session.add(recruiter)
    db.session.flush()
    assessment = Assessment(title="Quiz", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    question = AssessmentQuestion(assessment_id=assessment.id, question="Q?", correct_answer="A")
    db.session.add(question)
    db.session.commit()
    assert question.id is not None


def test_create_invitation(db):
    recruiter = User(email="inviter@example.com", role="recruiter")
    recruiter.set_password("password")
    user = User(email="invitee@example.com", role="interviewee")
    user.set_password("password")
    db.session.add_all([recruiter, user])
    db.session.flush()
    assessment = Assessment(title="Test", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    invitation = Invitation(interviewee_id=user.id, assessment_id=assessment.id)
    db.session.add(invitation)
    db.session.commit()
    assert invitation.id is not None



def test_assessment_attempt(db):
    recruiter = User(email="attempt_recruiter@example.com", role="recruiter")
    recruiter.set_password("password")
    user = User(email="attempt@example.com", role="interviewee")
    user.set_password("password")
    db.session.add_all([recruiter, user])
    db.session.flush()
    assessment = Assessment(title="Test", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    attempt = AssessmentAttempt(interviewee_id=user.id, assessment_id=assessment.id)
    db.session.add(attempt)
    db.session.commit()
    assert attempt.id is not None



def test_submission(db):
    recruiter = User(email="submission_recruiter@example.com", role="recruiter")
    recruiter.set_password("password")
    user = User(email="submission_user@example.com", role="interviewee")
    user.set_password("password")
    db.session.add_all([recruiter, user])
    db.session.flush()
    assessment = Assessment(title="Test", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    attempt = AssessmentAttempt(interviewee_id=user.id, assessment_id=assessment.id)
    question = AssessmentQuestion(assessment_id=assessment.id, question="Q?")
    db.session.add_all([attempt, question])
    db.session.flush()
    submission = Submission(attempt_id=attempt.id, question_id=question.id, answer="A")
    db.session.add(submission)
    db.session.commit()
    assert submission.id is not None



def test_feedback(db):
    recruiter = User(email="feedback_recruiter@example.com", role="recruiter")
    recruiter.set_password("password")
    user = User(email="feedback_user@example.com", role="interviewee")
    user.set_password("password")
    db.session.add_all([recruiter, user])
    db.session.flush()
    assessment = Assessment(title="Test", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    attempt = AssessmentAttempt(interviewee_id=user.id, assessment_id=assessment.id)
    question = AssessmentQuestion(assessment_id=assessment.id, question="Q?")
    db.session.add_all([attempt, question])
    db.session.flush()
    submission = Submission(attempt_id=attempt.id, question_id=question.id, answer="A")
    db.session.add(submission)
    db.session.flush()
    feedback = Feedback(submission_id=submission.id, recruiter_id=recruiter.id, comment="Good job")
    db.session.add(feedback)
    db.session.commit()
    assert feedback.id is not None


def test_statistic(db):
    recruiter = User(email="stat_recruiter@example.com", role="recruiter")
    recruiter.set_password("password")
    user = User(email="statuser@example.com", role="interviewee")
    user.set_password("password")
    db.session.add_all([recruiter, user])
    db.session.flush()
    assessment = Assessment(title="Test", recruiter_id=recruiter.id)
    db.session.add(assessment)
    db.session.flush()
    stat = Statistic(user_id=user.id, assessment_id=assessment.id, average_score=90, total_attempts=3)
    db.session.add(stat)
    db.session.commit()
    assert stat.id is not None



def test_notification(db):
    user = User(email="notify@example.com", role="interviewee")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    notif = Notification(user_id=user.id, title="Hello", message="You've got mail")
    db.session.add(notif)
    db.session.commit()
    assert notif.id is not None


def test_audit_log(db):
    user = User(email="audit@example.com", role="admin")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    log = AuditLog(user_id=user.id, action="DELETE", target_table="submission", target_id=1, log_metadata={})
    db.session.add(log)
    db.session.commit()
    assert log.id is not None


def test_setting(db):
    user = User(email="setting@example.com", role="interviewee")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    setting = Setting(user_id=user.id, key="dark_mode", value="true", scope="user")
    db.session.add(setting)
    db.session.commit()
    assert setting.id is not None



def test_availability(db):
    user = User(email="available@example.com", role="interviewee")
    user.set_password("password")
    db.session.add(user)
    db.session.flush()
    avail = IntervieweeAvailability(
        interviewee_id=user.id, 
        start_time=datetime.utcnow(), 
        end_time=datetime.utcnow()
    )
    db.session.add(avail)
    db.session.commit()
    assert avail.id is not None