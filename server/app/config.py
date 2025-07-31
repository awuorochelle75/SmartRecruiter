import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

def get_database_url():
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    return database_url or 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'

def get_cors_origins():
    """Get CORS origins from environment or use defaults"""
    cors_origins = os.environ.get('CORS_ORIGINS')
    if cors_origins:
        return [origin.strip() for origin in cors_origins.split(',')]
    
    # Default origins based on environment
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        return [
            "https://smart-recruiter-mu.vercel.app",
            "https://smart-recruiter-mu.vercel.app/"
        ]
    else:
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://smart-recruiter-mu.vercel.app",
            "https://smart-recruiter-mu.vercel.app/"
        ]


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///smart_recruiter.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False
    
    # File upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    
    # Email settings
    GMAIL_USER = os.environ.get('GMAIL_USER')
    GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
    GMAIL_SMTP_HOST = 'smtp.gmail.com'
    GMAIL_SMTP_PORT = 465
    
    # Session settings
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # Frontend URL configuration
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:5173'
    
    # CORS configuration
    CORS_ORIGINS = get_cors_origins()

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = get_database_url()

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = get_database_url()

class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True
    DEBUG = True
