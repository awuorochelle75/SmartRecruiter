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

    


# 2. IntervieweeProfile
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

