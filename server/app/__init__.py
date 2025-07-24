from flask import Flask, request, session, send_from_directory
from .models import db
from flask_migrate import Migrate
from .config import DevelopmentConfig, ProductionConfig
import os
from flask_cors import CORS
import logging
import json
import uuid
from datetime import datetime, timedelta
from flask.sessions import SessionInterface, SessionMixin
from werkzeug.datastructures import CallbackDict


def create_app():
    app = Flask(__name__)
    app.secret_key = 'dev-secret-key'
    
    # Support both localhost and 127.0.0.1 for CORS in local dev
    CORS(
        app,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)
    
    db.init_app(app)
    Migrate(app, db)
    
    # Set up custom session interface
    app.session_interface = DatabaseSessionInterface(app)
    
    logging.basicConfig(level=logging.DEBUG)
    from .routes import auth_bp
    app.register_blueprint(auth_bp)
    @app.route('/uploads/avatars/<filename>')
    def uploaded_avatar(filename):
        uploads_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'avatars')
        return send_from_directory(uploads_path, filename)
    
    @app.before_request
    def suppress_avatar_logging():
        if request.path.startswith('/uploads/avatars/'):
            logging.getLogger('werkzeug').setLevel(logging.WARNING)
        else:
            logging.getLogger('werkzeug').setLevel(logging.INFO)
    
    app.config['GMAIL_USER'] = 'davidwize189@gmail.com'
    app.config['GMAIL_APP_PASSWORD'] = 'gqslabpcfzrzgvke'
    app.config['GMAIL_SMTP_HOST'] = 'smtp.gmail.com'
    app.config['GMAIL_SMTP_PORT'] = 465
    return app
 
 
 