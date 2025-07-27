import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = 'postgresql://smartuser:smartpassword@localhost/smartrecruiter'

class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True
    DEBUG = True
