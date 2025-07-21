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

    

