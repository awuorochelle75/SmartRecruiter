import os
from flask import Blueprint, request, jsonify, session, current_app
from .models import db, User, IntervieweeProfile, RecruiterProfile, Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAttemptAnswer, AssessmentFeedback, CandidateFeedback, CodeEvaluationResult
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.utils import secure_filename
import uuid
import json as pyjson
import smtplib
from email.mime.text import MIMEText
from sqlalchemy import func
import subprocess
import tempfile
import json

auth_bp = Blueprint('auth', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'avatars')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        
        
@auth_bp.route('/settings/notifications', methods=['GET', 'POST'])
def notifications_settings():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'interviewee':
        from .models import IntervieweeNotificationSettings
        if request.method == 'GET':
            settings = IntervieweeNotificationSettings.query.filter_by(user_id=user.id).first()
            if not settings:
                return jsonify({
                    'email_new_opportunities': True,
                    'email_interview_invites': True,
                    'email_assessment_invites': True,
                    'email_results_updates': True,
                    'push_new_opportunities': False,
                    'push_interview_reminders': True,
                    'push_assessment_reminders': True,
                    'push_message_notifications': True,
                    'weekly_job_alerts': True,
                    'monthly_progress_reports': False,
                }), 200
            return jsonify({
                'email_new_opportunities': settings.email_new_opportunities,
                'email_interview_invites': settings.email_interview_invites,
                'email_assessment_invites': settings.email_assessment_invites,
                'email_results_updates': settings.email_results_updates,
                'push_new_opportunities': settings.push_new_opportunities,
                'push_interview_reminders': settings.push_interview_reminders,
                'push_assessment_reminders': settings.push_assessment_reminders,
                'push_message_notifications': settings.push_message_notifications,
                'weekly_job_alerts': settings.weekly_job_alerts,
                'monthly_progress_reports': settings.monthly_progress_reports,
            }), 200
        elif request.method == 'POST':
            data = request.get_json()
            settings = IntervieweeNotificationSettings.query.filter_by(user_id=user.id).first()
            if not settings:
                settings = IntervieweeNotificationSettings(user_id=user.id)
                db.session.add(settings)
            settings.email_new_opportunities = data.get('email_new_opportunities', settings.email_new_opportunities)
            settings.email_interview_invites = data.get('email_interview_invites', settings.email_interview_invites)
            settings.email_assessment_invites = data.get('email_assessment_invites', settings.email_assessment_invites)
            settings.email_results_updates = data.get('email_results_updates', settings.email_results_updates)
            settings.push_new_opportunities = data.get('push_new_opportunities', settings.push_new_opportunities)
            settings.push_interview_reminders = data.get('push_interview_reminders', settings.push_interview_reminders)
            settings.push_assessment_reminders = data.get('push_assessment_reminders', settings.push_assessment_reminders)
            settings.push_message_notifications = data.get('push_message_notifications', settings.push_message_notifications)
            settings.weekly_job_alerts = data.get('weekly_job_alerts', settings.weekly_job_alerts)
            settings.monthly_progress_reports = data.get('monthly_progress_reports', settings.monthly_progress_reports)
            db.session.commit()
            return jsonify({'message': 'Notification settings updated successfully'}), 200
    elif user.role == 'recruiter':
        from .models import RecruiterNotificationSettings
        if request.method == 'GET':
            settings = RecruiterNotificationSettings.query.filter_by(user_id=user.id).first()
            if not settings:
                return jsonify({
                    'email_new_applications': True,
                    'email_assessment_completed': True,
                    'email_interview_reminders': True,
                    'push_new_applications': False,
                    'push_assessment_completed': True,
                    'push_interview_reminders': True,
                    'weekly_reports': True,
                    'monthly_analytics': False,
                }), 200
            return jsonify({
                'email_new_applications': settings.email_new_applications,
                'email_assessment_completed': settings.email_assessment_completed,
                'email_interview_reminders': settings.email_interview_reminders,
                'push_new_applications': settings.push_new_applications,
                'push_assessment_completed': settings.push_assessment_completed,
                'push_interview_reminders': settings.push_interview_reminders,
                'weekly_reports': settings.weekly_reports,
                'monthly_analytics': settings.monthly_analytics,
            }), 200
        elif request.method == 'POST':
            data = request.get_json()
            settings = RecruiterNotificationSettings.query.filter_by(user_id=user.id).first()
            if not settings:
                settings = RecruiterNotificationSettings(user_id=user.id)
                db.session.add(settings)
            settings.email_new_applications = data.get('email_new_applications', settings.email_new_applications)
            settings.email_assessment_completed = data.get('email_assessment_completed', settings.email_assessment_completed)
            settings.email_interview_reminders = data.get('email_interview_reminders', settings.email_interview_reminders)
            settings.push_new_applications = data.get('push_new_applications', settings.push_new_applications)
            settings.push_assessment_completed = data.get('push_assessment_completed', settings.push_assessment_completed)
            settings.push_interview_reminders = data.get('push_interview_reminders', settings.push_interview_reminders)
            settings.weekly_reports = data.get('weekly_reports', settings.weekly_reports)
            settings.monthly_analytics = data.get('monthly_analytics', settings.monthly_analytics)
            db.session.commit()
            return jsonify({'message': 'Notification settings updated successfully'}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 403


@auth_bp.route('/settings/privacy', methods=['GET', 'POST'])
def interviewee_privacy():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    from .models import IntervieweePrivacySettings
    # TODO: Implement the privacy settings route for interviewees to manage profile visibility and contact preferences.
    if request.method == 'GET':
        settings = IntervieweePrivacySettings.query.filter_by(user_id=user.id).first()
        if not settings:
            return jsonify({
                'profile_visibility': 'public',
                'show_salary_expectation': False,
                'show_contact_info': True,
                'allow_recruiter_contact': True,
                'show_activity_status': True,
            }), 200
        return jsonify({
            'profile_visibility': settings.profile_visibility,
            'show_salary_expectation': settings.show_salary_expectation,
            'show_contact_info': settings.show_contact_info,
            'allow_recruiter_contact': settings.allow_recruiter_contact,
            'show_activity_status': settings.show_activity_status,
        }), 200
    elif request.method == 'POST':
        data = request.get_json()
        settings = IntervieweePrivacySettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = IntervieweePrivacySettings(user_id=user.id)
            db.session.add(settings)
        settings.profile_visibility = data.get('profile_visibility', settings.profile_visibility)
        settings.show_salary_expectation = data.get('show_salary_expectation', settings.show_salary_expectation)
        settings.show_contact_info = data.get('show_contact_info', settings.show_contact_info)
        settings.allow_recruiter_contact = data.get('allow_recruiter_contact', settings.allow_recruiter_contact)
        settings.show_activity_status = data.get('show_activity_status', settings.show_activity_status)
        db.session.commit()
        return jsonify({'message': 'Privacy settings updated successfully'}), 200


@auth_bp.route('/settings/security', methods=['POST'])
def interviewee_security():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    # TODO: Implement the security settings route for interviewees to manage password changes and two-factor authentication.
    if 'current_password' in data and 'new_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        user.set_password(data['new_password'])
        db.session.commit()
    if 'enable_2fa' in data:
        from .models import IntervieweeNotificationSettings
        settings = IntervieweeNotificationSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = IntervieweeNotificationSettings(user_id=user.id)
            db.session.add(settings)
        settings.monthly_progress_reports = bool(data['enable_2fa'])
        db.session.commit()
    return jsonify({'message': 'Security settings updated successfully'}), 200

@auth_bp.route('/profile/company_logo', methods=['POST'])
def upload_company_logo():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    if 'logo' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['logo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_AVATAR_SIZE:
        return jsonify({'error': 'File too large (max 2MB)'}), 400
    file.seek(0)
    filename = secure_filename(f"company_{user_id}_{uuid.uuid4().hex}_{file.filename}")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
    if profile and profile.company_logo:
        old_path = os.path.join(UPLOAD_FOLDER, profile.company_logo)
        if os.path.exists(old_path):
            os.remove(old_path)
    if profile:
        profile.company_logo = filename
        db.session.commit()
    return jsonify({'message': 'Company logo updated successfully', 'company_logo': filename}), 200


@auth_bp.route('/settings/security', methods=['POST'])
def recruiter_security():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    if 'current_password' in data and 'new_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        user.set_password(data['new_password'])
        db.session.commit()
    if 'enable_2fa' in data:
        from .models import RecruiterNotificationSettings
        settings = RecruiterNotificationSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = RecruiterNotificationSettings(user_id=user.id)
            db.session.add(settings)
        settings.monthly_analytics = bool(data['enable_2fa'])
        db.session.commit()
    return jsonify({'message': 'Security settings updated successfully'}), 200

@auth_bp.route('/profile/avatar', methods=['POST'])
def upload_avatar():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_AVATAR_SIZE:
        return jsonify({'error': 'File too large (max 2MB)'}), 400
    file.seek(0)
    filename = secure_filename(f"{user_id}_{uuid.uuid4().hex}_{file.filename}")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    if user.role == 'interviewee':
        profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
    else:
        profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
    if profile and profile.avatar:
        old_path = os.path.join(UPLOAD_FOLDER, profile.avatar)
        if os.path.exists(old_path):
            os.remove(old_path)
    if profile:
        profile.avatar = filename
        db.session.commit()
    return jsonify({'message': 'Avatar updated successfully', 'avatar': filename}), 200

@auth_bp.route('/assessments', methods=['POST', 'OPTIONS'])
def create_assessment():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    try:
        assessment = Assessment(
            recruiter_id=user.id,
            title=data.get('title'),
            description=data.get('description'),
            type=data.get('type'),
            difficulty=data.get('difficulty'),
            duration=data.get('duration'),
            passing_score=data.get('passing_score'),
            instructions=data.get('instructions'),
            tags=','.join(data.get('tags', [])),
            status=data.get('status', 'draft'),
            deadline=data.get('deadline'),
            is_test=data.get('is_test', False),
        )
        db.session.add(assessment)
        db.session.flush()
        for q in data.get('questions', []):
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type=q.get('type'),
                question=q.get('question'),
                options=pyjson.dumps(q.get('options')) if q.get('options') else None,
                correct_answer=pyjson.dumps(q.get('correctAnswer')) if q.get('correctAnswer') is not None else None,
                points=q.get('points'),
                explanation=q.get('explanation'),
                starter_code=q.get('starter_code'),
                solution=q.get('solution'),
                answer=q.get('answer'),
                test_cases=q.get('test_cases') if q.get('type') == 'coding' else None,
            )
            db.session.add(question)
        db.session.commit()
        return jsonify({'message': 'Assessment created', 'assessment_id': assessment.id}), 201
    except Exception as e:
        import traceback; traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Failed to create assessment', 'details': str(e)}), 400

@auth_bp.route('/assessments/<int:assessment_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'], strict_slashes=False)
def assessment_operations(assessment_id):
    if request.method == 'OPTIONS':
        return '', 200
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    
    assessment = Assessment.query.filter_by(id=assessment_id, recruiter_id=user.id).first()
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404
    
    
    if request.method == 'GET':
        return jsonify({
            'id': assessment.id,
            'title': assessment.title,
            'description': assessment.description,
            'type': assessment.type,
            'difficulty': assessment.difficulty,
            'duration': assessment.duration,
            'passing_score': assessment.passing_score,
            'instructions': assessment.instructions,
            'tags': assessment.tags.split(',') if assessment.tags else [],
            'status': assessment.status,
            'created_at': assessment.created_at.isoformat() if assessment.created_at else None,
            'deadline': assessment.deadline if hasattr(assessment, 'deadline') else None,
            'updated_at': assessment.updated_at.isoformat(),
            'questions': [
                {
                    'id': q.id,
                    'type': q.type,
                    'question': q.question,
                    'options': pyjson.loads(q.options) if q.options else [],
                    'correct_answer': pyjson.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                } for q in assessment.questions
            ]
        }), 200
        
        # TODO: Implement the PUT method to update an existing assessment with new data.
    
    elif request.method == 'PUT':
        data = request.get_json()
        assessment.title = data.get('title', assessment.title)
        assessment.description = data.get('description', assessment.description)
        assessment.type = data.get('type', assessment.type)
        assessment.difficulty = data.get('difficulty', assessment.difficulty)
        assessment.duration = data.get('duration', assessment.duration)
        assessment.passing_score = data.get('passingScore', assessment.passing_score)
        assessment.instructions = data.get('instructions', assessment.instructions)
        assessment.tags = ','.join(data.get('tags', []))
        assessment.status = data.get('status', assessment.status)
        assessment.deadline = data.get('deadline', assessment.deadline)
        AssessmentQuestion.query.filter_by(assessment_id=assessment.id).delete()
        for q in data.get('questions', []):
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type=q.get('type'),
                question=q.get('question'),
                options=pyjson.dumps(q.get('options')) if q.get('options') else None,
                correct_answer=pyjson.dumps(q.get('correctAnswer')) if q.get('correctAnswer') is not None else None,
                points=q.get('points'),
                explanation=q.get('explanation'),
                starter_code=q.get('starter_code'),
                solution=q.get('solution'),
                answer=q.get('answer'),
                test_cases=q.get('test_cases') if q.get('type') == 'coding' else None,
            )
            db.session.add(question)
        db.session.commit()
        return jsonify({'message': 'Assessment updated', 'assessment_id': assessment.id}), 200
    
    elif request.method == 'DELETE':
        # DELETE method
        AssessmentAttempt.query.filter_by(assessment_id=assessment.id).delete()
        db.session.delete(assessment)
        db.session.commit()
        return jsonify({'message': 'Assessment deleted'}), 200
    
    
@auth_bp.route('/assessments', methods=['GET', 'OPTIONS'])
def list_assessments():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    
    is_test = request.args.get('is_test')
    query = Assessment.query.filter_by(recruiter_id=user.id)
    if is_test is not None:
        query = query.filter_by(is_test=(is_test.lower() == 'true'))
    assessments = query.order_by(Assessment.created_at.desc()).all()
    result = []
    for a in assessments:
        result.append({
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'type': a.type,
            'difficulty': a.difficulty,
            'duration': a.duration,
            'passing_score': a.passing_score,
            'instructions': a.instructions,
            'tags': a.tags.split(',') if a.tags else [],
            'status': a.status,
            'created_at': a.created_at.isoformat() if a.created_at else None,
            'deadline': a.deadline if hasattr(a, 'deadline') else None,
            'updated_at': a.updated_at.isoformat(),
            'is_test': a.is_test,
            'questions': [
                {
                    'id': q.id,
                    'type': q.type,
                    'question': q.question,
                    'options': pyjson.loads(q.options) if q.options else [],
                    'correct_answer': pyjson.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                    'test_cases': q.test_cases,
                } for q in a.questions
            ]
        })
    return jsonify(result), 200


@auth_bp.route('/public/test-assessments', methods=['GET'])
def public_test_assessments():
    tests = Assessment.query.filter_by(is_test=True, status='active').order_by(Assessment.created_at.desc()).all()
    result = [] # Initialize result list
    
    for a in tests:
        result.append({
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'type': a.type,
            'difficulty': a.difficulty,
            'duration': a.duration,
            'passing_score': a.passing_score,
            'instructions': a.instructions,
            'tags': a.tags.split(',') if a.tags else [],
            'status': a.status,
            'created_at': a.created_at.isoformat() if a.created_at else None,
            'deadline': a.deadline if hasattr(a, 'deadline') else None,
            'updated_at': a.updated_at.isoformat(),
            'is_test': a.is_test,
            'questions': [
                {
                    'id': q.id,
                    'type': q.type,
                    'question': q.question,
                    'options': pyjson.loads(q.options) if q.options else [],
                    'correct_answer': pyjson.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                    'test_cases': q.test_cases,
                } for q in a.questions
            ]
        })
    return jsonify(result), 200


@auth_bp.route('/send-invite', methods=['POST'])
def send_invite():
    data = request.get_json()
    recipients = data.get('email')
    subject = data.get('subject', 'You are invited to an assessment')
    message = data.get('message')
    assessment_title = data.get('assessment_title')

    if not recipients or not message or not assessment_title:
        return jsonify({'error': 'Missing required fields'}), 400

    if isinstance(recipients, str):
        recipients = [recipients]

    body = f"{message}\n\nAssessment: {assessment_title}"
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = current_app.config['GMAIL_USER']
    msg['To'] = ", ".join(recipients)

    try:
        with smtplib.SMTP_SSL(current_app.config['GMAIL_SMTP_HOST'], current_app.config['GMAIL_SMTP_PORT']) as server:
            server.login(current_app.config['GMAIL_USER'], current_app.config['GMAIL_APP_PASSWORD'])
            server.sendmail(current_app.config['GMAIL_USER'], recipients, msg.as_string())
        return jsonify({'message': 'Invitation sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    

@auth_bp.route('/settings/delete-account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    try:
        # Delete related data based on role
        if user.role == 'interviewee':
            from .models import IntervieweeProfile, IntervieweeNotificationSettings, IntervieweePrivacySettings
            profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
            if profile and profile.avatar:
                avatar_path = os.path.join(UPLOAD_FOLDER, profile.avatar)
                if os.path.exists(avatar_path):
                    os.remove(avatar_path)
            IntervieweeProfile.query.filter_by(user_id=user.id).delete()
            IntervieweeNotificationSettings.query.filter_by(user_id=user.id).delete()
            IntervieweePrivacySettings.query.filter_by(user_id=user.id).delete()
            # TODO: Delete interviewee's assessment results, messages, etc. if applicable
        elif user.role == 'recruiter':
            from .models import RecruiterProfile, RecruiterNotificationSettings, Assessment, AssessmentQuestion
            profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
            if profile and profile.avatar:
                avatar_path = os.path.join(UPLOAD_FOLDER, profile.avatar)
                if os.path.exists(avatar_path):
                    os.remove(avatar_path)
            assessments = Assessment.query.filter_by(recruiter_id=user.id).all()
            for a in assessments:
                AssessmentQuestion.query.filter_by(assessment_id=a.id).delete()
            Assessment.query.filter_by(recruiter_id=user.id).delete()
            RecruiterProfile.query.filter_by(user_id=user.id).delete()
            RecruiterNotificationSettings.query.filter_by(user_id=user.id).delete()
            # TODO: Delete recruiter's messages, invites, etc. if applicable
        db.session.delete(user)
        db.session.commit()
        session.clear()
        response = jsonify({'message': 'Account deleted successfully'})
        response.delete_cookie('session')
        return response, 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account', 'details': str(e)}), 500


@auth_bp.route('/interviewee/assessments/<int:assessment_id>/start', methods=['POST'])
def start_assessment_attempt(assessment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    assessment = Assessment.query.filter_by(id=assessment_id, is_test=True, status='active').first()
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404
    prev_attempts = AssessmentAttempt.query.filter_by(interviewee_id=user.id, assessment_id=assessment_id).count()
    max_attempts = 3
    if prev_attempts >= max_attempts:
        return jsonify({'error': 'Max attempts reached'}), 403
    attempt = AssessmentAttempt(
        interviewee_id=user.id,
        assessment_id=assessment_id,
        num_attempt=prev_attempts + 1,
        status='in_progress',
        current_question=0
    )
    db.session.add(attempt)
    db.session.commit()
    return jsonify({'attempt_id': attempt.id, 'num_attempt': attempt.num_attempt}), 201


@auth_bp.route('/interviewee/assessments/<int:assessment_id>/attempt', methods=['GET'])
def get_current_attempt(assessment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempt = AssessmentAttempt.query.filter_by(interviewee_id=user.id, assessment_id=assessment_id).order_by(AssessmentAttempt.num_attempt.desc()).first()
    #TODO: Check if the assessment is a test and active
    if not attempt:
        return jsonify({'error': 'No attempt found'}), 404
    answers = {a.question_id: a.answer for a in attempt.answers}
    return jsonify({
        'attempt_id': attempt.id,
        'status': attempt.status,
        'current_question': attempt.current_question,
        'score': attempt.score,
        'passed': attempt.passed,
        'answers': answers,
        'started_at': attempt.started_at,
        'completed_at': attempt.completed_at,
        'num_attempt': attempt.num_attempt,
        'time_spent': attempt.time_spent
    }), 200
    
    
@auth_bp.route('/interviewee/attempts/<int:attempt_id>/answer', methods=['POST'])
def submit_answer(attempt_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt or attempt.interviewee_id != user.id:
        return jsonify({'error': 'Attempt not found'}), 404
    if attempt.status != 'in_progress':
        return jsonify({'error': 'Attempt not in progress'}), 400
    data = request.get_json()
    question_id = data.get('question_id')
    answer = data.get('answer')
    question = AssessmentQuestion.query.get(question_id)
    if not question or question.assessment_id != attempt.assessment_id:
        return jsonify({'error': 'Invalid question'}), 400
    existing = AssessmentAttemptAnswer.query.filter_by(attempt_id=attempt.id, question_id=question_id).first()
    is_correct = None
    
    if question.type == 'multiple-choice':
        try:
            correct = pyjson.loads(question.correct_answer)
            is_correct = (answer == correct)
        except Exception:
            is_correct = None
    elif question.type == 'short-answer':
        is_correct = (answer.strip().lower() == (question.answer or '').strip().lower())
    if existing:
        existing.answer = answer
        existing.is_correct = is_correct
        existing.answered_at = func.now()
    else:
        db.session.add(AssessmentAttemptAnswer(
            attempt_id=attempt.id,
            question_id=question_id,
            answer=answer,
            is_correct=is_correct
        ))
    attempt.current_question = data.get('next_question', attempt.current_question)
    db.session.commit()
    return jsonify({'message': 'Answer saved', 'is_correct': is_correct}), 200


@auth_bp.route('/interviewee/attempts/<int:attempt_id>/submit', methods=['POST'])
def submit_attempt(attempt_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt or attempt.interviewee_id != user.id:
        return jsonify({'error': 'Attempt not found'}), 404
    if attempt.status != 'in_progress':
        return jsonify({'error': 'Attempt not in progress'}), 400
    assessment = Assessment.query.get(attempt.assessment_id)
    total_points = 0
    earned_points = 0
    for q in assessment.questions:
        total_points += q.points
        ans = next((a for a in attempt.answers if a.question_id == q.id), None)
        if ans and ans.is_correct:
            earned_points += q.points
    score = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = score >= assessment.passing_score
    attempt.score = score
    attempt.passed = passed
    attempt.status = 'completed'
    attempt.completed_at = func.now()
    db.session.commit()
    return jsonify({'message': 'Attempt submitted', 'score': score, 'passed': passed}), 200


@auth_bp.route('/interviewee/assessments/<int:assessment_id>/attempts', methods=['GET'])
def get_attempts_for_assessment(assessment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempts = AssessmentAttempt.query.filter_by(interviewee_id=user.id, assessment_id=assessment_id).order_by(AssessmentAttempt.num_attempt.desc()).all()
    result = []
    for a in attempts:
        result.append({
            'attempt_id': a.id,
            'status': a.status,
            'score': a.score,
            'passed': a.passed,
            'started_at': a.started_at,
            'completed_at': a.completed_at,
            'num_attempt': a.num_attempt,
            'time_spent': a.time_spent
        })
    return jsonify(result), 200




@auth_bp.route('/interviewee/attempts/summary', methods=['GET'])
def get_attempts_summary():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempts = AssessmentAttempt.query.filter_by(interviewee_id=user.id).order_by(AssessmentAttempt.started_at.desc()).all()
    result = []
    for a in attempts:
        assessment = Assessment.query.get(a.assessment_id)
        result.append({
            'assessment_id': a.assessment_id,
            'assessment_title': assessment.title if assessment else None,
            'attempt_id': a.id,
            'status': a.status,
            'score': a.score,
            'passed': a.passed,
            'started_at': a.started_at,
            'completed_at': a.completed_at,
            'num_attempt': a.num_attempt,
            'time_spent': a.time_spent
        })
    return jsonify(result), 200


#TODO: Implement the route to retrieve feedback for assessment attempts by interviewees.
@auth_bp.route('/feedback/assessment/<int:assessment_id>', methods=['POST', 'GET'])
def assessment_feedback(assessment_id):
    user_id = session.get('user_id')
    if request.method == 'POST':
        data = request.get_json()
        feedback = data.get('feedback')
        rating = data.get('rating')
        if not feedback:
            return jsonify({'error': 'Feedback required'}), 400
        af = AssessmentFeedback(
            assessment_id=assessment_id,
            user_id=user_id,
            feedback=feedback,
            rating=rating
        )
        db.session.add(af)
        db.session.commit()
        return jsonify({'message': 'Feedback submitted'}), 201
    else:
        feedbacks = AssessmentFeedback.query.filter_by(assessment_id=assessment_id).all()
        return jsonify([
            {
                'id': f.id,
                'user_id': f.user_id,
                'feedback': f.feedback,
                'rating': f.rating,
                'created_at': f.created_at
            } for f in feedbacks
        ]), 200



@auth_bp.route('/feedback/candidate/<int:attempt_id>', methods=['POST', 'GET'])
def candidate_feedback(attempt_id):
    user_id = session.get('user_id')
    if request.method == 'POST':
        user = User.query.get(user_id)
        if not user or user.role != 'recruiter':
            return jsonify({'error': 'Unauthorized'}), 403
        data = request.get_json()
        feedback = data.get('feedback')
        rating = data.get('rating')
        if not feedback:
            return jsonify({'error': 'Feedback required'}), 400
        cf = CandidateFeedback(
            attempt_id=attempt_id,
            recruiter_id=user_id,
            feedback=feedback,
            rating=rating
        )
        db.session.add(cf)
        db.session.commit()
        return jsonify({'message': 'Feedback submitted'}), 201
    else:  # GET
        feedbacks = CandidateFeedback.query.filter_by(attempt_id=attempt_id).all()
        return jsonify([
            {
                'id': f.id,
                'recruiter_id': f.recruiter_id,
                'feedback': f.feedback,
                'rating': f.rating,
                'created_at': f.created_at
            } for f in feedbacks
        ]), 200


@auth_bp.route('/code-eval/<int:attempt_answer_id>', methods=['GET', 'POST'])
def code_evaluation(attempt_answer_id):
    # user_id = session.get('user_id')
    # user = User.query.get(session.get('user_id'))
    # if not user or user.role not in ['interviewee', 'recruiter']:
    #     return jsonify({'error': 'Unauthorized'}), 403
    if request.method == 'POST':
        data = request.get_json()
        test_case_results = data.get('test_case_results')
        score = data.get('score')
        feedback = data.get('feedback')
        cer = CodeEvaluationResult(
            attempt_answer_id=attempt_answer_id,
            test_case_results=pyjson.dumps(test_case_results) if test_case_results else None,
            score=score,
            feedback=feedback
        )
        db.session.add(cer)
        db.session.commit()
        return jsonify({'message': 'Code evaluation saved'}), 201
    else:
        
        cer = CodeEvaluationResult.query.filter_by(attempt_answer_id=attempt_answer_id).first()
        if not cer:
            return jsonify({'error': 'Not found'}), 404
        return jsonify({
            'id': cer.id,
            'test_case_results': pyjson.loads(cer.test_case_results) if cer.test_case_results else [],
            'score': cer.score,
            'feedback': cer.feedback,
            'created_at': cer.created_at
        }), 200


@auth_bp.route('/analytics/interviewee/summary', methods=['GET'])
def interviewee_analytics():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    attempts = AssessmentAttempt.query.filter_by(interviewee_id=user_id).all()
    total = len(attempts)
    completed = [a for a in attempts if a.status == 'completed']
    avg_score = sum([a.score or 0 for a in completed]) / len(completed) if completed else 0
    pass_rate = sum([1 for a in completed if a.passed]) / len(completed) * 100 if completed else 0
    return jsonify({
        'total_attempts': total,
        'completed_attempts': len(completed),
        'average_score': avg_score,
        'pass_rate': pass_rate
    }), 200


@auth_bp.route('/analytics/recruiter/assessment/<int:assessment_id>', methods=['GET'])
def recruiter_assessment_analytics(assessment_id):
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    # assessment = Assessment.query.get(assessment_id)
    # if not assessment or assessment.recruiter_id != user.id:
    #     return jsonify({'error': 'Assessment not found'}), 404
    attempts = AssessmentAttempt.query.filter_by(assessment_id=assessment_id).all()
    total = len(attempts)
    completed = [a for a in attempts if a.status == 'completed']
    avg_score = sum([a.score or 0 for a in completed]) / len(completed) if completed else 0
    pass_rate = sum([1 for a in completed if a.passed]) / len(completed) * 100 if completed else 0
    feedbacks = AssessmentFeedback.query.filter_by(assessment_id=assessment_id).all()
    avg_rating = sum([f.rating or 0 for f in feedbacks]) / len(feedbacks) if feedbacks else 0
    return jsonify({
        'total_attempts': total,
        'completed_attempts': len(completed),
        'average_score': avg_score,
        'pass_rate': pass_rate,
        'feedback_count': len(feedbacks),
        'average_feedback_rating': avg_rating
    }), 200
    
    
# TODO: Implement the code evaluation route for running code snippets and test cases.
@auth_bp.route('/run-code', methods=['POST'])
def run_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'javascript')
        test_cases = data.get('test_cases', [])
        results = []
        if language == 'javascript':
            if not test_cases:
                input_val = data.get('input', '')
                js_code = f"""
const readline = () => {json.dumps(input_val)};
{code}
"""
                with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w') as f:
                    f.write(js_code)
                    temp_path = f.name
                try:
                    proc = subprocess.run(['node', temp_path], capture_output=True, text=True, timeout=5)
                    output = proc.stdout.strip()
                    error = proc.stderr.strip()
                    if error:
                        return jsonify({'output': '', 'error': error}), 200
                    return jsonify({'output': output, 'error': ''}), 200
                except subprocess.TimeoutExpired:
                    return jsonify({'output': '', 'error': 'Error: Code execution timed out (possible infinite loop)'}), 200
                finally:
                    os.remove(temp_path)
            else:
                timeout_occurred = False
                timeout_error_result = None
                for tc in test_cases:
                    input_val = tc.get('input', '')
                    expected = tc.get('expectedOutput', '')
                    js_code = f"""
const readline = () => {json.dumps(input_val)};
{code}
"""
                    with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w') as f:
                        f.write(js_code)
                        temp_path = f.name
                    try:
                        proc = subprocess.run(['node', temp_path], capture_output=True, text=True, timeout=5)
                        output = proc.stdout.strip()
                        error = proc.stderr.strip()
                        passed = (output == str(expected))
                        results.append({
                            'input': input_val,
                            'expected': expected,
                            'output': output,
                            'error': error,
                            'passed': passed,
                            'raw_stdout': proc.stdout,
                            'raw_stderr': proc.stderr,
                        })
                    except subprocess.TimeoutExpired:
                        timeout_occurred = True
                        timeout_error_result = {
                            'input': input_val,
                            'expected': expected,
                            'output': '',
                            'error': 'Error: Code execution timed out (possible infinite loop)',
                            'passed': False,
                            'raw_stdout': '',
                            'raw_stderr': '',
                        }
                        break
                    finally:
                        os.remove(temp_path)
                if timeout_occurred:
                    return jsonify({'test_case_results': [], 'timeout': True, 'output': timeout_error_result['error']}), 200
                if all(r['error'] and not r['output'] for r in results):
                    return jsonify({'test_case_results': results, 'timeout': False}), 200
                return jsonify({'test_case_results': results, 'timeout': False}), 200
        return jsonify({'output': '', 'error': 'Unsupported language'}), 400
    except Exception as e:
        return jsonify({'output': '', 'error': str(e)}), 200
    

# Todo: Implement the route to retrieve assessment results for recruiters.
@auth_bp.route('/assessments/<int:assessment_id>/results', methods=['GET'])
def get_assessment_results(assessment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    attempts = AssessmentAttempt.query.filter_by(assessment_id=assessment_id).all()
    results = [] # Initialize results list
    for a in attempts:
        interviewee = User.query.get(a.interviewee_id)
        profile = interviewee.interviewee_profile if interviewee else None
        results.append({
            'candidate_id': a.interviewee_id,
            'candidate_name': f"{profile.first_name} {profile.last_name}" if profile else None,
            'attempt_id': a.id,
            'score': a.score,
            'status': a.status,
            'passed': a.passed,
            'started_at': a.started_at,
            'completed_at': a.completed_at,
            'time_spent': a.time_spent,
        })
    return jsonify(results), 200


    