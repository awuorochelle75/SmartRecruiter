from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON, NUMERIC
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# User table to store basic account credentials and roles
class User(db.Model):
    __tablename__ = 'user'
    
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
    __tablename__ = 'interviewee_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(30))
    location = db.Column(db.String(100))
    position = db.Column(db.String(100))
    company = db.Column(db.String(100))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)
    onboarding_completed = db.Column(db.Boolean, default=False)
    avatar = db.Column(db.String(255))
    title = db.Column(db.String(100))
    website = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    timezone = db.Column(db.String(50))
    availability = db.Column(db.String(50))
    salary_expectation = db.Column(db.String(50))
    work_type = db.Column(db.String(50))
    user = db.relationship('User', backref=db.backref('interviewee_profile', uselist=False))

# Profile table specific to recruiters
class RecruiterProfile(db.Model):
    __tablename__ = 'recruiter_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(30))
    location = db.Column(db.String(100))
    company_name = db.Column(db.String(100), nullable=False)
    company_website = db.Column(db.String(255))
    role = db.Column(db.String(100))
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    company_size = db.Column(db.String(50))
    company_description = db.Column(db.Text)
    company_logo = db.Column(db.String(255))
    timezone = db.Column(db.String(50))
    position = db.Column(db.String(100))
    user = db.relationship('User', backref=db.backref('recruiter_profile', uselist=False))
    
# New: Notification settings for recruiter
class RecruiterNotificationSettings(db.Model):
    __tablename__ = 'recruiter_notification_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    email_new_applications = db.Column(db.Boolean, default=True)
    email_assessment_completed = db.Column(db.Boolean, default=True)
    email_interview_reminders = db.Column(db.Boolean, default=True)
    push_new_applications = db.Column(db.Boolean, default=False)
    push_assessment_completed = db.Column(db.Boolean, default=True)
    push_interview_reminders = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=True)
    monthly_analytics = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('recruiter_notification_settings', uselist=False))

# New: Notification settings for interviewee
class IntervieweeNotificationSettings(db.Model):
    __tablename__ = 'interviewee_notification_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    email_new_opportunities = db.Column(db.Boolean, default=True)
    email_interview_invites = db.Column(db.Boolean, default=True)
    email_assessment_invites = db.Column(db.Boolean, default=True)
    email_results_updates = db.Column(db.Boolean, default=True)
    push_new_opportunities = db.Column(db.Boolean, default=False)
    push_interview_reminders = db.Column(db.Boolean, default=True)
    push_assessment_reminders = db.Column(db.Boolean, default=True)
    push_message_notifications = db.Column(db.Boolean, default=True)
    weekly_job_alerts = db.Column(db.Boolean, default=True)
    monthly_progress_reports = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('interviewee_notification_settings', uselist=False))
    
# New: Privacy settings for interviewee
class IntervieweePrivacySettings(db.Model):
    __tablename__ = 'interviewee_privacy_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    profile_visibility = db.Column(db.String(20), default='public')
    show_salary_expectation = db.Column(db.Boolean, default=False)
    show_contact_info = db.Column(db.Boolean, default=True)
    allow_recruiter_contact = db.Column(db.Boolean, default=True)
    show_activity_status = db.Column(db.Boolean, default=True)
    user = db.relationship('User', backref=db.backref('interviewee_privacy_settings', uselist=False))

# Sessions table for tracking client-side session data
class Session(db.Model):
    __tablename__ = 'session'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.Text, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Assessments created by recruiters
class Assessment(db.Model):
    __tablename__ = 'assessment'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    passing_score = db.Column(db.Integer, nullable=False)
    instructions = db.Column(db.Text)
    tags = db.Column(db.Text)
    status = db.Column(db.String(20), default='draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = db.Column(db.String(50))
    is_test = db.Column(db.Boolean, default=False, nullable=False)
    questions = db.relationship('AssessmentQuestion', backref='assessment', cascade='all, delete-orphan')

# Questions associated with each assessment
class AssessmentQuestion(db.Model):
    __tablename__ = 'assessment_question'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text)
    correct_answer = db.Column(db.Text)
    points = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.Text)
    starter_code = db.Column(db.Text)
    solution = db.Column(db.Text)
    answer = db.Column(db.Text)
    test_cases = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Invitations sent to interviewees for assessments
class Invitation(db.Model):
    __tablename__ = 'invitation'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'))
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(20))
    invited_at = db.Column(db.DateTime, default=datetime.utcnow)

    assessment = db.relationship('Assessment', backref='invitations')  
    interviewee = db.relationship('User', backref='invitations')  

# Track attempts made by interviewees on assessments
class AssessmentAttempt(db.Model):
    __tablename__ = 'assessment_attempt'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20))

    interviewee = db.relationship('User', backref='assessment_attempts') 
    assessment = db.relationship('Assessment', backref='attempts') 

# Store answers submitted by interviewees
class Submission(db.Model):
    __tablename__ = 'submission'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('assessment_question.id'))
    answer = db.Column(db.Text)
    score = db.Column(NUMERIC(5, 2))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    attempt = db.relationship('AssessmentAttempt', backref='submissions') 

# Feedback provided by recruiters on submissions
class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'))
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submission = db.relationship('Submission', backref='feedback') 
    recruiter = db.relationship('User', backref='feedbacks') 

# Aggregated performance statistics per user and assessment
class Statistic(db.Model):
    __tablename__ = 'statistic'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'))
    average_score = db.Column(NUMERIC(5, 2))
    total_attempts = db.Column(db.Integer)
    highest_score = db.Column(NUMERIC(5, 2))
    last_attempt_at = db.Column(db.DateTime)

    user = db.relationship('User', backref='statistics')  
    assessment = db.relationship('Assessment', backref='statistics') 

# Notification messages sent to users
class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(255))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='notifications')  

# Logs for auditing user actions
class AuditLog(db.Model):
    __tablename__ = 'audit_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action = db.Column(db.String(100))
    target_table = db.Column(db.String(100))
    target_id = db.Column(db.Integer)
    log_metadata = db.Column(JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='audit_logs') 

# Configurable settings either globally or per user
class Setting(db.Model):
    __tablename__ = 'setting'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    key = db.Column(db.String(100))
    value = db.Column(db.Text)
    scope = db.Column(db.String(20))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='settings') 

# Interviewee availability slots for scheduling
class IntervieweeAvailability(db.Model):
    __tablename__ = 'interviewee_availability'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    interviewee = db.relationship('User', backref='availability')  

# Interview history records
class IntervieweeInterviewHistory(db.Model):
    __tablename__ = 'interviewee_interview_history'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'))
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt.id'))
    interview_date = db.Column(db.DateTime)
    status = db.Column(db.String(20))
    score = db.Column(NUMERIC(5, 2))
    feedback = db.Column(db.Text)

    interviewee = db.relationship('User', backref='interview_history')  
