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

class DatabaseSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None, sid=None, permanent=False):
        def on_update(self):
            self.modified = True
        CallbackDict.__init__(self, initial or {}, on_update)
        self.sid = sid
        self.permanent = permanent
        self.modified = False

class DatabaseSessionInterface(SessionInterface):
    def __init__(self, app):
        self.app = app
        self.permanent = app.config.get('SESSION_PERMANENT', False)
        self.cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')
        self.cookie_path = app.config.get('SESSION_COOKIE_PATH', '/')
        self.cookie_domain = app.config.get('SESSION_COOKIE_DOMAIN', None)
        self.cookie_secure = app.config.get('SESSION_COOKIE_SECURE', True)
        self.cookie_httponly = app.config.get('SESSION_COOKIE_HTTPONLY', True)
        self.cookie_samesite = app.config.get('SESSION_COOKIE_SAMESITE', 'None')
        self.max_age = app.config.get('SESSION_MAX_AGE', timedelta(days=31))

    def open_session(self, app, request):
        sid = request.cookies.get(self.cookie_name)
        if not sid:
            sid = self._generate_sid()
            return DatabaseSession(sid=sid, permanent=self.permanent)
    
        # Find session in database
        from .models import db
        session_record = db.session.execute(
            db.text("SELECT * FROM session WHERE session_id = :sid"),
            {"sid": sid}
        ).fetchone()
    
        if not session_record:
            return DatabaseSession(sid=sid, permanent=self.permanent)
    
        # Check if session has expired
        # Handle both string and datetime types for expiry
        expiry = session_record.expiry
        if isinstance(expiry, str):
            try:
                expiry = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            except ValueError:
                # If parsing fails, treat as expired
                return DatabaseSession(sid=sid, permanent=self.permanent)
        
        if expiry < datetime.utcnow():
            return DatabaseSession(sid=sid, permanent=self.permanent)
    
        # Load session data
        try:
            session_data = json.loads(session_record.data)
            session = DatabaseSession(session_data, sid=sid, permanent=self.permanent)
            session.modified = False
            return session
        except (json.JSONDecodeError, KeyError):
            return DatabaseSession(sid=sid, permanent=self.permanent)

    def save_session(self, app, session, response):
        domain = self.cookie_domain
        if not self.should_set_cookie(app, session):
            return
        
        # Calculate expiry time
        if session.permanent:
            expiry = datetime.utcnow() + self.max_age
        else:
            expiry = datetime.utcnow() + timedelta(days=1)
        
        # Save session to database
        session_data = json.dumps(dict(session))
        
        from .models import db
        # Check if session already exists
        existing = db.session.execute(
            db.text("SELECT id FROM session WHERE session_id = :sid"),
            {"sid": session.sid}
        ).fetchone()
        
        if existing:
            db.session.execute(
                db.text("UPDATE session SET data = :data, expiry = :expiry WHERE session_id = :sid"),
                {"data": session_data, "expiry": expiry, "sid": session.sid}
            )
        else:
            db.session.execute(
                db.text("INSERT INTO session (session_id, data, expiry) VALUES (:sid, :data, :expiry)"),
                {"sid": session.sid, "data": session_data, "expiry": expiry}
            )
        
        db.session.commit()
        
        # Set cookie
        response.set_cookie(
            self.cookie_name,
            session.sid,
            max_age=self.max_age.total_seconds() if session.permanent else None,
            expires=expiry if session.permanent else None,
            path=self.cookie_path,
            domain=domain,
            secure=self.cookie_secure,
            httponly=self.cookie_httponly,
            samesite=self.cookie_samesite
        )

    def _generate_sid(self):
        return str(uuid.uuid4())

def create_app(config=None):
    app = Flask(__name__)
    app.secret_key = 'dev-secret-key'  # Ensure static secret key
    
    # Configure session for cross-origin requests
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_DOMAIN'] = None
    
    # CORS configuration for development and production
    allowed_origins = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://smart-recruiter-mu.vercel.app",
        "https://smart-recruiter-mu.vercel.app/",
        "https://smartrecruiter-l0x0.onrender.com"
    ]
    
    
    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        expose_headers=["Content-Type", "Authorization"],
        max_age=86400  # Cache preflight requests for 24 hours
    )
    
    # Additional CORS headers for better compatibility
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '86400')
        return response
    
    # Handle OPTIONS requests for preflight
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        response = app.make_default_options_response()
        origin = request.headers.get('Origin')
        if origin in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '86400')
        return response
    
    # Use provided config or determine from environment
    if config:
        app.config.from_object(config)
    else:
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
    # Remove or comment out lines like:
    # DEBUG:root:Request: ... session: ...
    # But keep error logging and other non-session, non-login logs.
    from .routes import auth_bp
    app.register_blueprint(auth_bp)
    # Serve avatars
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
 