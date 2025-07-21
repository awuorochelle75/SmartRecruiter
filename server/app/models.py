# app/models.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON, NUMERIC
from datetime import datetime

db = SQLAlchemy()

# users
class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nulluable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role =  db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    


# IntervieweeProfile
class IntervieweeProfile(db.model):
    __tablename__= 'interviewee_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id') , unique=True, nullable=False)
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

# RecruiterProfile
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

# Sessions
class Sessions(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    sessions = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.Text)
    expiry = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Assessments
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


# AssessmentQuestions
class AssessmentQuestions(db.Model):
    __tablename__ = 'assessment_questions'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    type = db.Column(db.String(50))
    question = db.Column(db.Text)
    options = db.Column(db.Text)  # JSON string
    correct_answer = db.Column(db.Text)
    points = db.Column(db.Integer)
    explanation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
