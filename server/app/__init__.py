from .models import db
from .routes import api
from .config import DevelopmentConfig, ProductionConfig, TestingConfig
from .utils import init_jwt
from flask import Flask, jsonify

import os

from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object(ProductionConfig)
    elif env == 'testing':
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(DevelopmentConfig)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    db.init_app(app)
    jwt = init_jwt(app)
    app.register_blueprint(api, url_prefix='/api')
    

    @app.errorhandler(422)
    def handle_unprocessable_entity(err):
        return jsonify({'error': 'Unprocessable Entity', 'message': str(err)}), 422

    @app.errorhandler(401)
    def handle_unauthorized(err):
        return jsonify({'error': 'Unauthorized', 'message': str(err)}), 401
    

    @app.errorhandler(NoAuthorizationError)
    def handle_no_auth_error(err):
        return jsonify({'error': 'Missing or invalid JWT', 'message': str(err)}), 401

    return app

