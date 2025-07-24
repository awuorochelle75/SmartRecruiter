import os
from flask import Blueprint, request, jsonify, session, current_app
from .models import db, User, IntervieweeProfile, RecruiterProfile, Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAttemptAnswer, AssessmentFeedback, CandidateFeedback, CodeEvaluationResult
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.utils import secure_filename
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    # Validate required fields
    required_fields = ['email', 'password', 'role', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    if data['role'] not in ['interviewee', 'recruiter']:
        return jsonify({'error': 'Invalid role'}), 400
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409
    try:
        # Create new user
        user = User(
            email=data['email'],
            role=data['role']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()  # Get user.id before commit
        # Create profile based on role
        if data['role'] == 'interviewee':
            profile = IntervieweeProfile(
                user_id=user.id,
                first_name=data['first_name'],
                last_name=data['last_name'],
                bio=data.get('bio', ''),
                skills=data.get('skills', ''),
                onboarding_completed=False
            )
            db.session.add(profile)
        elif data['role'] == 'recruiter':
            if 'company_name' not in data or not data['company_name']:
                return jsonify({'error': 'Missing required field: company_name'}), 400
            profile = RecruiterProfile(
                user_id=user.id,
                first_name=data['first_name'],
                last_name=data['last_name'],
                company_name=data['company_name']
            )
            db.session.add(profile)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'A database integrity error occurred. Please check your input and try again.'}), 400