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
    required_fields = ['email', 'password', 'role', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    if data['role'] not in ['interviewee', 'recruiter']:
        return jsonify({'error': 'Invalid role'}), 400
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409
    try:
        user = User(
            email=data['email'],
            role=data['role']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()
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
    
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Set session data
    session['user_id'] = user.id
    session['role'] = user.role
    
    # Check if interviewee needs onboarding
    if user.role == 'interviewee':
        profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
        if not profile or not profile.onboarding_completed:
            return jsonify({'redirect': '/onboarding'}), 200
    
    if user.role == 'recruiter':
        return jsonify({'redirect': '/recruiter/dashboard'}), 200
    else:
        return jsonify({'redirect': '/interviewee/dashboard'}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session_id = request.cookies.get('session')
    if session_id:
        from .models import db
        db.session.execute(
            db.text("DELETE FROM session WHERE session_id = :sid"),
            {"sid": session_id}
        )
        db.session.commit()
    session.clear()
    response = jsonify({'message': 'Logged out successfully'})
    response.delete_cookie('session')
    return response, 200




@auth_bp.route('/onboarding', methods=['POST'])
def onboarding():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    if 'skills' in data:
        profile.skills = ','.join(data['skills']) if isinstance(data['skills'], list) else data['skills']
    profile.onboarding_completed = True
    db.session.commit()
    return jsonify({'message': 'Onboarding completed successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    result = {
        'email': user.email,
        'role': user.role,
    }
    
    
    if user.role == 'interviewee':
        profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
        if profile:
            result['first_name'] = profile.first_name
            result['last_name'] = profile.last_name
            result['onboarding_completed'] = profile.onboarding_completed
            result['avatar'] = profile.avatar
            
    elif user.role == 'recruiter':
        profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
        if profile:
            result['first_name'] = profile.first_name
            result['last_name'] = profile.last_name
            result['company_name'] = profile.company_name
            result['avatar'] = profile.avatar
    return jsonify(result), 200


# TODO: Implement the profile route to retrieve and update user profiles for interviewees and recruiters and make sure to handle both GET and POST methods.
@auth_bp.route('/profile', methods=['GET', 'POST'])
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if request.method == 'GET':
        if user.role == 'interviewee':
            profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
            if not profile:
                return jsonify({'error': 'Profile not found'}), 404
            return jsonify({
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'email': user.email,
                'phone': profile.phone,
                'location': profile.location,
                'position': profile.position,
                'company': profile.company,
                'bio': profile.bio,
                'skills': profile.skills,
                'avatar': profile.avatar,
                'title': profile.title,
                'website': profile.website,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'timezone': profile.timezone,
                'availability': profile.availability,
                'salary_expectation': profile.salary_expectation,
                'work_type': profile.work_type,
            }), 200
        elif user.role == 'recruiter':
            profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
            if not profile:
                return jsonify({'error': 'Profile not found'}), 404
            return jsonify({
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'email': user.email,
                'phone': profile.phone,
                'location': profile.location,
                'company_name': profile.company_name,
                'company_website': profile.company_website,
                'role': profile.role,
                'bio': profile.bio,
                'avatar': profile.avatar,
                'industry': profile.industry,
                'company_size': profile.company_size,
                'company_description': profile.company_description,
                'company_logo': profile.company_logo,
                'timezone': profile.timezone,
                'position': profile.position,
            }), 200
            
    elif request.method == 'POST':
        data = request.get_json()
        if user.role == 'interviewee':
            profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
            if not profile:
                return jsonify({'error': 'Profile not found'}), 404
            profile.first_name = data.get('first_name', profile.first_name)
            profile.last_name = data.get('last_name', profile.last_name)
            profile.phone = data.get('phone', profile.phone)
            profile.location = data.get('location', profile.location)
            profile.position = data.get('position', profile.position)
            profile.company = data.get('company', profile.company)
            profile.bio = data.get('bio', profile.bio)
            profile.skills = data.get('skills', profile.skills)
            profile.title = data.get('title', profile.title)
            profile.website = data.get('website', profile.website)
            profile.linkedin = data.get('linkedin', profile.linkedin)
            profile.github = data.get('github', profile.github)
            profile.timezone = data.get('timezone', profile.timezone)
            profile.availability = data.get('availability', profile.availability)
            profile.salary_expectation = data.get('salary_expectation', profile.salary_expectation)
            profile.work_type = data.get('work_type', profile.work_type)
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
        elif user.role == 'recruiter':
            profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
            if not profile:
                return jsonify({'error': 'Profile not found'}), 404
            profile.first_name = data.get('first_name', profile.first_name)
            profile.last_name = data.get('last_name', profile.last_name)
            profile.phone = data.get('phone', profile.phone)
            profile.location = data.get('location', profile.location)
            profile.company_name = data.get('company_name', profile.company_name)
            profile.company_website = data.get('company_website', profile.company_website)
            profile.role = data.get('role', profile.role)
            profile.bio = data.get('bio', profile.bio)
            profile.industry = data.get('industry', profile.industry)
            profile.company_size = data.get('company_size', profile.company_size)
            profile.company_description = data.get('company_description', profile.company_description)
            profile.company_logo = data.get('company_logo', profile.company_logo)
            profile.timezone = data.get('timezone', profile.timezone)
            profile.position = data.get('position', profile.position)
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
        
        