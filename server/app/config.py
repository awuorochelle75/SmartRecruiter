import os
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    return database_url or 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    #SQLALCHEMY_DATABASE_URI = 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'
    SQLALCHEMY_DATABASE_URI = get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False

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
