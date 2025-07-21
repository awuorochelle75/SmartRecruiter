from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON, NUMERIC
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# # Users table to store basic account credentials and roles
class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)



# Profile table specific to interviewees
class IntervieweeProfile(db.Model):
    __tablename__= 'interviewee_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    position = db.Column(db.String(100))
    company = db.Column(db.String(100))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)
    onboarding_completed = db.Column(db.Boolean, default=False)
    avatar = db.Column(db.String(255))
    resume_url = db.Column(db.String(255))

    user = db.relationship('Users', backref=db.backref('interviewee_profile', uselist=False))  

# Profile table specific to recruiters
class RecruiterProfile(db.Model):
    __tablename__ = 'recruiter_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(30))
    location = db.Column(db.String(100))
    company_name = db.Column(db.String(100))
    company_website = db.Column(db.String(255))
    role = db.Column(db.String(100))
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))

    user = db.relationship('Users', backref=db.backref('recruiter_profile', uselist=False))  

# Sessions table for tracking client-side session data
class Sessions(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    sessions = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.Text)
    expiry = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Assessments created by recruiters
class Assessments(db.Model):
    __tablename__ = 'assessments'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    type = db.Column(db.String(50))
    difficulty = db.Column(db.String(50))
    duration = db.Column(db.Integer)
    passing_score = db.Column(db.Integer)
    instructions = db.Column(db.Text)
    tags = db.Column(db.Text)
    status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.String(50))

    recruiter = db.relationship('Users', backref='assessments')  # Relationship to recruiter who created the assessment

# Questions associated with each assessment
class AssessmentQuestions(db.Model):
    __tablename__ = 'assessment_questions'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    type = db.Column(db.String(50))
    question = db.Column(db.Text)
    options = db.Column(db.Text)
    correct_answer = db.Column(db.Text)
    points = db.Column(db.Integer)
    explanation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    assessment = db.relationship('Assessments', backref='questions')  

# Invitations sent to interviewees for assessments
class Invitations(db.Model):
    __tablename__ = 'invitations'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'))
    interviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20))
    invited_at = db.Column(db.DateTime, default=datetime.utcnow)

    assessment = db.relationship('Assessments', backref='invitations')  
    interviewee = db.relationship('Users', backref='invitations')  


# Track attempts made by interviewees on assessments
class AssessmentAttempts(db.Model):
    __tablename__ = 'assessment_attempts'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20))

    interviewee = db.relationship('Users', backref='assessment_attempts') 
    assessment = db.relationship('Assessments', backref='attempts') 

# Store answers submitted by interviewees
class Submissions(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempts.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('assessment_questions.id'))
    answer = db.Column(db.Text)
    score = db.Column(NUMERIC(5, 2))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    attempt = db.relationship('AssessmentAttempts', backref='submissions') 

# Feedback provided by recruiters on submissions
class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id'))
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submission = db.relationship('Submissions', backref='feedback') 
    recruiter = db.relationship('Users', backref='feedbacks') 

# Aggregated performance statistics per user and assessment
class Statistics(db.Model):
    __tablename__ = 'statistics'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'))
    average_score = db.Column(NUMERIC(5, 2))
    total_attempts = db.Column(db.Integer)
    highest_score = db.Column(NUMERIC(5, 2))
    last_attempt_at = db.Column(db.DateTime)

    user = db.relationship('Users', backref='statistics')  
    assessment = db.relationship('Assessments', backref='statistics') 

# Notification messages sent to users
class Notifications(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(255))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('Users', backref='notifications')  

# Logs for auditing user actions
class AuditLogs(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100))
    target_table = db.Column(db.String(100))
    target_id = db.Column(db.Integer)
    log_metadata = db.Column(JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('Users', backref='audit_logs') 

# Configurable settings either globally or per user
class Settings(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    key = db.Column(db.String(100))
    value = db.Column(db.Text)
    scope = db.Column(db.String(20))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('Users', backref='settings') 

# Interviewee availability slots for scheduling
class IntervieweeAvailability(db.Model):
    __tablename__ = 'interviewee_availability'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    interviewee = db.relationship('Users', backref='availability')  

# Interviewee availability slots for scheduling
class IntervieweeInterviewHistory(db.Model):
    __tablename__ = 'interviewee_interview_history'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'))
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempts.id'))
    interview_date = db.Column(db.DateTime)
    status = db.Column(db.String(20))
    score = db.Column(NUMERIC(5, 2))
    feedback = db.Column(db.Text)

    interviewee = db.relationship('Users', backref='interview_history') 