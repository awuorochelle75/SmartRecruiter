import os
from flask import Blueprint, request, jsonify, session, current_app, g
from .models import db, User, IntervieweeProfile, RecruiterProfile, Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAttemptAnswer, AssessmentFeedback, CandidateFeedback, CodeEvaluationResult, AssessmentReview, AssessmentReviewAnswer, Category, PracticeProblem, PracticeProblemAttempt, Message, Notification, RecruiterNotificationSettings, IntervieweeNotificationSettings, Interview, Feedback
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.utils import secure_filename
import uuid
import json
import smtplib
from email.mime.text import MIMEText
from sqlalchemy import func
import subprocess
import tempfile
from datetime import datetime, timezone, timedelta
import time
import logging
import secrets

auth_bp = Blueprint('auth', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'avatars')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB

def send_email(to_email, subject, body):
    """Send email using configured SMTP settings"""
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = current_app.config['GMAIL_USER']
        msg['To'] = to_email

        with smtplib.SMTP_SSL(current_app.config['GMAIL_SMTP_HOST'], current_app.config['GMAIL_SMTP_PORT']) as server:
            server.login(current_app.config['GMAIL_USER'], current_app.config['GMAIL_APP_PASSWORD'])
            server.sendmail(current_app.config['GMAIL_USER'], [to_email], msg.as_string())
        return True
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_verification_email(user):
    """Send account verification email"""
    token = user.generate_verification_token()
    db.session.commit()
    
    verification_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/verify-email?token={token}"
    
    subject = "Verify Your SmartRecruiter Account"
    body = f"""
Hello {user.email},

Thank you for creating your SmartRecruiter account! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The SmartRecruiter Team
"""
    
    return send_email(user.email, subject, body)

def send_password_reset_email(user):
    """Send password reset email"""
    token = user.generate_password_reset_token()
    db.session.commit()
    
    reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={token}"
    
    subject = "Reset Your SmartRecruiter Password"
    body = f"""
Hello {user.email},

You requested a password reset for your SmartRecruiter account. Click the link below to reset your password:

{reset_url}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email.

Best regards,
The SmartRecruiter Team
"""
    
    return send_email(user.email, subject, body)

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
    
    # Create response
    response_data = {
        'message': 'Login successful',
        'user_id': user.id,
        'role': user.role,
        'email': user.email
    }
    
    # Check if interviewee needs onboarding
    if user.role == 'interviewee':
        profile = IntervieweeProfile.query.filter_by(user_id=user.id).first()
        if not profile or not profile.onboarding_completed:
            response_data['redirect'] = '/onboarding'
            return jsonify(response_data), 200
    
    # Redirect based on role
    if user.role == 'recruiter':
        response_data['redirect'] = '/recruiter/dashboard'
    else:
        response_data['redirect'] = '/interviewee/dashboard'
    
    return jsonify(response_data), 200

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

@auth_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify database status"""
    try:
        db.engine.connect()
        
        from sqlalchemy import text
        result = db.session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user'"))
        user_table_exists = result.fetchone() is not None
        
        return jsonify({
            'status': 'healthy',
            'database_connected': True,
            'user_table_exists': user_table_exists,
            'environment': os.environ.get('FLASK_ENV', 'development')
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'database_connected': False,
            'user_table_exists': False,
            'environment': os.environ.get('FLASK_ENV', 'development')
        }), 500


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    result = {
        'id': user.id,
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

# --- Interviewee Notification Settings ---
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
                    'push_message_notifications': True,
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
                'push_message_notifications': settings.push_message_notifications,
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
            settings.push_message_notifications = data.get('push_message_notifications', settings.push_message_notifications)
            settings.weekly_reports = data.get('weekly_reports', settings.weekly_reports)
            settings.monthly_analytics = data.get('monthly_analytics', settings.monthly_analytics)
            db.session.commit()
            return jsonify({'message': 'Notification settings updated successfully'}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 403

# --- Interviewee Privacy Settings ---
@auth_bp.route('/settings/privacy', methods=['GET', 'POST'])
def interviewee_privacy():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    from .models import IntervieweePrivacySettings
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

# --- Interviewee Security: Password Change and 2FA ---
@auth_bp.route('/settings/security', methods=['POST'])
def interviewee_security():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    
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

# --- Company Logo Upload Endpoint ---
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

# --- Security: Password Change and 2FA ---
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
    # Remove old avatar if exists
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
            category_id=data.get('category_id')
        )
        db.session.add(assessment)
        db.session.flush()
        for q in data.get('questions', []):
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type=q.get('type'),
                question=q.get('question'),
                options=json.dumps(q.get('options')) if q.get('options') else None,
                correct_answer=json.dumps(q.get('correctAnswer')) if q.get('correctAnswer') is not None else None,
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
                    'options': json.loads(q.options) if q.options else [],
                    'correct_answer': json.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                    'test_cases': q.test_cases if q.type == 'coding' else None,
                } for q in assessment.questions
            ],
            'category_id': assessment.category_id
        }), 200
    
    elif request.method == 'PUT':
        # PUT method for updating
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
        assessment.category_id = data.get('category_id', assessment.category_id)

        # --- PATCH: Safe update logic for questions ---
        incoming_questions = data.get('questions', [])
        incoming_ids = set(q.get('id') for q in incoming_questions if q.get('id'))
        existing_questions = {q.id: q for q in assessment.questions}

        # 1. Update existing questions and add new ones
        for q in incoming_questions:
            if q.get('id') and q.get('id') in existing_questions:
                # Update existing
                question = existing_questions[q['id']]
                question.type = q.get('type', question.type)
                question.question = q.get('question', question.question)
                question.options = json.dumps(q.get('options')) if q.get('options') else None
                question.correct_answer = json.dumps(q.get('correctAnswer')) if q.get('correctAnswer') is not None else None
                question.points = q.get('points', question.points)
                question.explanation = q.get('explanation', question.explanation)
                question.starter_code = q.get('starter_code', question.starter_code)
                question.solution = q.get('solution', question.solution)
                question.answer = q.get('answer', question.answer)
                question.test_cases = q.get('test_cases') if q.get('type') == 'coding' else None
            else:
                # Add new
                question = AssessmentQuestion(
                    assessment_id=assessment.id,
                    type=q.get('type'),
                    question=q.get('question'),
                    options=json.dumps(q.get('options')) if q.get('options') else None,
                    correct_answer=json.dumps(q.get('correctAnswer')) if q.get('correctAnswer') is not None else None,
                    points=q.get('points'),
                    explanation=q.get('explanation'),
                    starter_code=q.get('starter_code'),
                    solution=q.get('solution'),
                    answer=q.get('answer'),
                    test_cases=q.get('test_cases') if q.get('type') == 'coding' else None,
                )
                db.session.add(question)

        # 2. Delete questions that are not in the incoming list and have no answers
        for qid, question in existing_questions.items():
            if qid not in incoming_ids:
                has_answers = AssessmentAttemptAnswer.query.filter_by(question_id=qid).first()
                if not has_answers:
                    db.session.delete(question)
                # else: skip deletion to preserve submissions

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
                    'options': json.loads(q.options) if q.options else [],
                    'correct_answer': json.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                    'test_cases': q.test_cases,
                } for q in a.questions
            ],
            'category_id': a.category_id
        })
    return jsonify(result), 200


@auth_bp.route('/public/test-assessments', methods=['GET'])
def public_test_assessments():
    tests = Assessment.query.filter_by(is_test=True, status='active').order_by(Assessment.created_at.desc()).all()
    result = []
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
                    'options': json.loads(q.options) if q.options else [],
                    'correct_answer': json.loads(q.correct_answer) if q.correct_answer else None,
                    'points': q.points,
                    'explanation': q.explanation,
                    'starter_code': q.starter_code,
                    'solution': q.solution,
                    'answer': q.answer,
                    'test_cases': q.test_cases,
                } for q in a.questions
            ],
            'category_id': a.category_id
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
        # Delete user
        db.session.delete(user)
        db.session.commit()
        session.clear()
        response = jsonify({'message': 'Account deleted successfully'})
        response.delete_cookie('session')
        return response, 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account', 'details': str(e)}), 500

# --- INTERVIEWEE TEST ATTEMPT ENDPOINTS ---

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
    
    # Check if user has remaining attempts
    if prev_attempts >= max_attempts:
        return jsonify({'error': 'Max attempts reached'}), 403
    
    # Check if user has any completed attempts
    completed_attempts = AssessmentAttempt.query.filter_by(
        interviewee_id=user.id, 
        assessment_id=assessment_id, 
        status='completed'
    ).count()
    
    # If user has completed attempts but still has remaining attempts, allow retake
    if completed_attempts > 0 and prev_attempts < max_attempts:
        pass
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
    test_case_score = None
    if question.type == 'multiple-choice':
        try:
            correct_index = json.loads(question.correct_answer)
            options = json.loads(question.options) if question.options else []
            
            # Convert user answer to index if it's a text option
            user_answer_index = None
            if isinstance(answer, str):
                # Try to find the option index by text
                try:
                    user_answer_index = options.index(answer)
                except ValueError:
                    try:
                        user_answer_index = int(answer)
                    except ValueError:
                        user_answer_index = None
            
            # Compare indices
            is_correct = (user_answer_index == correct_index)
        except Exception as e:
            print(f"Error comparing multiple-choice answer: {e}")
            print(f"User answer: {answer} (type: {type(answer)})")
            print(f"Correct answer: {question.correct_answer} (type: {type(question.correct_answer)})")
            print(f"Options: {question.options}")
            is_correct = None
    elif question.type == 'short-answer':
        try:
            user_answer = str(answer).strip().lower() if answer else ""
            correct_answer = str(question.answer or "").strip().lower()
            is_correct = (user_answer == correct_answer)
        except Exception as e:
            print(f"Error comparing short-answer: {e}")
            print(f"User answer: {answer} (type: {type(answer)})")
            print(f"Correct answer: {question.answer} (type: {type(question.answer)})")
            is_correct = None
    elif question.type == 'essay':
        is_correct = None
    elif question.type == 'coding':
        # Evaluate code against test cases
        try:
            test_cases = json.loads(question.test_cases) if question.test_cases else []
        except Exception:
            test_cases = []
        code = answer
        language = 'javascript'
        passed_count = 0
        total_count = len(test_cases)
        if total_count > 0:
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
                    if output == str(expected):
                        passed_count += 1
                except subprocess.TimeoutExpired:
                    pass
                finally:
                    os.remove(temp_path)
            test_case_score = passed_count / total_count if total_count > 0 else 0
            is_correct = (test_case_score == 1.0)
        else:
            test_case_score = 0
            is_correct = False
    if existing:
        existing.answer = answer
        existing.is_correct = is_correct
        existing.test_case_score = test_case_score
        existing.answered_at = func.now()
    else:
        db.session.add(AssessmentAttemptAnswer(
            attempt_id=attempt.id,
            question_id=question_id,
            answer=answer,
            is_correct=is_correct,
            test_case_score=test_case_score
        ))
    attempt.current_question = data.get('next_question', attempt.current_question)
    db.session.commit()
    return jsonify({'message': 'Answer saved', 'is_correct': is_correct, 'test_case_score': test_case_score}), 200

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
        if q.type == 'coding':
            if ans and ans.test_case_score is not None:
                earned_points += q.points * ans.test_case_score
        elif q.type == 'essay':
            pass
        else:
            if ans and ans.is_correct:
                earned_points += q.points
    score = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = score >= assessment.passing_score
    attempt.score = score
    attempt.passed = passed
    attempt.status = 'completed'
    from datetime import datetime, timezone
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    attempt.completed_at = now
    if attempt.started_at:
        started = attempt.started_at
        if started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        time_spent = int((now - started).total_seconds())
        attempt.time_spent = max(0, time_spent)
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



# --- INTERVIEWEE ATTEMPTS SUMMARY ENDPOINT ---
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
        review = AssessmentReview.query.filter_by(attempt_id=a.id).first()
        result_data = {
            'assessment_id': a.assessment_id,
            'assessment_title': assessment.title if assessment else None,
            'attempt_id': a.id,
            'status': a.status,
            'score': a.score,
            'passed': a.passed,
            'started_at': a.started_at,
            'completed_at': a.completed_at,
            'num_attempt': a.num_attempt,
            'time_spent': a.time_spent,
            'has_review': review is not None,
            'review_status': review.status if review else None,
            'final_score': review.overall_score if review else None
        }
        result.append(result_data)
    return jsonify(result), 200

# --- FEEDBACK ENDPOINTS ---
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

# --- CODE EVALUATION ENDPOINTS ---
@auth_bp.route('/code-eval/<int:attempt_answer_id>', methods=['GET', 'POST'])
def code_evaluation(attempt_answer_id):
    
    if request.method == 'POST':
        data = request.get_json()
        test_case_results = data.get('test_case_results')
        score = data.get('score')
        feedback = data.get('feedback')
        cer = CodeEvaluationResult(
            attempt_answer_id=attempt_answer_id,
            test_case_results=json.dumps(test_case_results) if test_case_results else None,
            score=score,
            feedback=feedback
        )
        db.session.add(cer)
        db.session.commit()
        return jsonify({'message': 'Code evaluation saved'}), 201
    else:  # GET
        cer = CodeEvaluationResult.query.filter_by(attempt_answer_id=attempt_answer_id).first()
        if not cer:
            return jsonify({'error': 'Not found'}), 404
        return jsonify({
            'id': cer.id,
            'test_case_results': json.loads(cer.test_case_results) if cer.test_case_results else [],
            'score': cer.score,
            'feedback': cer.feedback,
            'created_at': cer.created_at
        }), 200

# --- ANALYTICS ENDPOINTS ---
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
        # --- Python support ---
        elif language == 'python':
            import sys
            import ast
            def get_func_args(user_code):
                import re
                match = re.search(r'def ([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)', user_code)
                if match:
                    args = match.group(2).replace(' ', '')
                    return match.group(1), [a for a in args.split(',') if a]
                return 'solution', ['s']
            def wrap_python_code(user_code, func_name, arg_names):
                parse_args = '\n    '.join([f'{a} = ast.literal_eval(inputs[{i}])' for i, a in enumerate(arg_names)])
                args_str = ', '.join(arg_names)
                return f"""{user_code}\nif __name__ == '__main__':\n    import sys\n    import ast\n    inputs = sys.stdin.read().strip().split('\\n')\n    {parse_args}\n    print({func_name}({args_str}))\n"""
            func_name, arg_names = get_func_args(code)
            if not test_cases:  # Run Code (single input)
                input_val = data.get('input', '')
                py_code = wrap_python_code(code, func_name, arg_names)
                with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
                    f.write(py_code)
                    temp_path = f.name
                try:
                    proc = subprocess.run(['python3', temp_path], input=input_val, capture_output=True, text=True, timeout=5)
                    output = proc.stdout.strip()
                    error = proc.stderr.strip()
                    if error:
                        return jsonify({'output': '', 'error': error, 'compile_error': True, 'code': py_code}), 200
                    return jsonify({'output': output, 'error': '', 'code': py_code}), 200
                except subprocess.TimeoutExpired:
                    return jsonify({'output': '', 'error': 'Error: Code execution timed out (possible infinite loop)', 'compile_error': True, 'code': py_code}), 200
                finally:
                    os.remove(temp_path)
            else:
                # First, check for compile errors before running test cases
                py_code = wrap_python_code(code, func_name, arg_names)
                with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
                    f.write(py_code)
                    temp_path = f.name
                try:
                    # Try to compile the code
                    compile(open(temp_path).read(), temp_path, 'exec')
                except Exception as e:
                    error_msg = str(e)
                    os.remove(temp_path)
                    return jsonify({'test_case_results': [], 'timeout': False, 'output': '', 'error': error_msg, 'compile_error': True}), 200
                os.remove(temp_path)
                # If no compile error, run test cases
                timeout_occurred = False
                timeout_error_result = None
                results = []
                for tc in test_cases:
                    input_val = tc.get('input', '')
                    expected = tc.get('expectedOutput', '')
                    py_code = wrap_python_code(code, func_name, arg_names)
                    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
                        f.write(py_code)
                        temp_path = f.name
                    try:
                        proc = subprocess.run(['python3', temp_path], input=input_val, capture_output=True, text=True, timeout=5)
                        output = proc.stdout.strip()
                        error = proc.stderr.strip()
                        if error:
                            results.append({
                                'input': input_val,
                                'expected': expected,
                                'output': 'Runtime Error',
                                'error': '',
                                'passed': False,
                                'runtime_error': True,
                                'raw_stdout': '',
                                'raw_stderr': '',
                            })
                        else:
                            # Ensure both are strings and strip whitespace for comparison
                            output_str = str(output).strip()
                            expected_str = str(expected).strip()
                            passed = (output_str == expected_str)
                            results.append({
                                'input': input_val,
                                'expected': expected,
                                'output': output,
                                'error': '',
                                'passed': passed,
                                'runtime_error': False,
                                'raw_stdout': proc.stdout,
                                'raw_stderr': proc.stderr,
                            })
                    except subprocess.TimeoutExpired:
                        timeout_occurred = True
                        timeout_error_result = {
                            'input': input_val,
                            'expected': expected,
                            'output': 'Runtime Error',
                            'error': '',
                            'passed': False,
                            'runtime_error': True,
                            'raw_stdout': '',
                            'raw_stderr': '',
                        }
                        break
                    finally:
                        os.remove(temp_path)
                if timeout_occurred:
                    return jsonify({'test_case_results': [], 'timeout': True, 'output': timeout_error_result['error']}), 200
                if all(r['runtime_error'] for r in results):
                    return jsonify({'test_case_results': results, 'timeout': False}), 200
                return jsonify({'test_case_results': results, 'timeout': False}), 200
        return jsonify({'output': '', 'error': 'Unsupported language'}), 400
    except Exception as e:
        return jsonify({'output': '', 'error': str(e)}), 200

@auth_bp.route('/assessments/<int:assessment_id>/results', methods=['GET'])
def get_assessment_results(assessment_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    attempts = AssessmentAttempt.query.filter_by(assessment_id=assessment_id).all()
    results = []
    for a in attempts:
        interviewee = User.query.get(a.interviewee_id)
        profile = interviewee.interviewee_profile if interviewee else None
        assessment = Assessment.query.get(a.assessment_id)
        results.append({
            'candidate_id': a.interviewee_id,
            'candidate_name': f"{profile.first_name} {profile.last_name}" if profile else None,
            'avatar': profile.avatar if profile else None,
            'email': interviewee.email if interviewee else None,
            'assessment': assessment.title if assessment else None,
            'attempt_id': a.id,
            'score': a.score,
            'status': a.status,
            'passed': a.passed,
            'started_at': a.started_at,
            'completed_at': a.completed_at,
            'time_spent': a.time_spent,
        })
    return jsonify(results), 200

# --- CATEGORY ENDPOINTS ---
@auth_bp.route('/categories', methods=['GET', 'POST'])
def categories():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if request.method == 'GET':
        cats = Category.query.filter((Category.recruiter_id == None) | (Category.recruiter_id == user_id)).order_by(Category.name).all()
        return jsonify([
            {
                'id': c.id,
                'name': c.name,
                'description': c.description,
                'created_at': c.created_at.isoformat(),
                'recruiter_id': c.recruiter_id
            } for c in cats
        ]), 200
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        if not name:
            return jsonify({'error': 'Name required'}), 400
        # Prevent duplicate names for same recruiter
        exists = Category.query.filter_by(name=name, recruiter_id=user_id).first()
        if exists:
            return jsonify({'error': 'Category with this name already exists'}), 409
        cat = Category(name=name, description=description, recruiter_id=user_id)
        db.session.add(cat)
        db.session.commit()
        return jsonify({'id': cat.id, 'name': cat.name, 'description': cat.description, 'created_at': cat.created_at.isoformat(), 'recruiter_id': cat.recruiter_id}), 201

@auth_bp.route('/categories/<int:cat_id>', methods=['PUT', 'DELETE'])
def category_ops(cat_id):
    user_id = session.get('user_id')
    cat = Category.query.get(cat_id)
    if not cat or (cat.recruiter_id and cat.recruiter_id != user_id):
        return jsonify({'error': 'Category not found'}), 404
    if request.method == 'PUT':
        data = request.get_json()
        cat.name = data.get('name', cat.name)
        cat.description = data.get('description', cat.description)
        db.session.commit()
        return jsonify({'id': cat.id, 'name': cat.name, 'description': cat.description, 'created_at': cat.created_at.isoformat(), 'recruiter_id': cat.recruiter_id}), 200
    elif request.method == 'DELETE':
        for a in cat.assessments:
            a.category_id = None
        db.session.delete(cat)
        db.session.commit()
        return jsonify({'message': 'Category deleted'}), 200

# --- Practice Problems CRUD (Recruiter) ---
@auth_bp.route('/practice-problems', methods=['GET', 'POST'])
def practice_problems():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    if request.method == 'GET':
        category_id = request.args.get('category_id')
        query = PracticeProblem.query.filter_by(recruiter_id=user.id)
        if category_id:
            query = query.filter_by(category_id=category_id)
        problems = query.order_by(PracticeProblem.created_at.desc()).all()
        return jsonify([practice_problem_to_dict(p) for p in problems]), 200
    elif request.method == 'POST':
        data = request.get_json()
        problem = PracticeProblem(
            recruiter_id=user.id,
            category_id=data.get('category_id'),
            title=data['title'],
            description=data.get('description'),
            difficulty=data['difficulty'],
            estimated_time=data.get('estimated_time'),
            points=data.get('points', 0),
            is_public=data.get('is_public', True),
            tags=','.join(data.get('tags', [])),
            problem_type=data.get('problem_type', 'multiple-choice'),
            options=json.dumps(data.get('options', [])),
            correct_answer=data.get('correct_answer'),
            explanation=data.get('explanation'),
            allowed_languages=json.dumps(data.get('allowed_languages', [])),
            time_limit=data.get('time_limit'),
            memory_limit=data.get('memory_limit'),
            starter_code=data.get('starter_code'),
            solution=data.get('solution'),
            visible_test_cases=json.dumps(data.get('visible_test_cases', [])),
            hidden_test_cases=json.dumps(data.get('hidden_test_cases', [])),
            answer_template=data.get('answer_template'),
            keywords=json.dumps(data.get('keywords', [])),
            max_char_limit=data.get('max_char_limit'),
            hints=json.dumps(data.get('hints', [])),
            learning_resources=json.dumps(data.get('learning_resources', [])),
            study_sections=json.dumps(data.get('study_sections', [])),
            max_attempts=data.get('max_attempts', 1),
        )
        db.session.add(problem)
        db.session.commit()
        return jsonify({'message': 'Practice problem created', 'id': problem.id}), 201

@auth_bp.route('/practice-problems/<int:problem_id>', methods=['GET', 'PUT', 'DELETE'])
def practice_problem_detail(problem_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    problem = PracticeProblem.query.get(problem_id)
    if not problem:
        return jsonify({'error': 'Practice problem not found'}), 404
    if request.method == 'GET':
        return jsonify(practice_problem_to_dict(problem)), 200
    if user.role != 'recruiter' or problem.recruiter_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    if request.method == 'PUT':
        data = request.get_json()
        problem.title = data.get('title', problem.title)
        problem.description = data.get('description', problem.description)
        problem.difficulty = data.get('difficulty', problem.difficulty)
        problem.estimated_time = data.get('estimated_time', problem.estimated_time)
        problem.points = data.get('points', problem.points)
        problem.is_public = data.get('is_public', problem.is_public)
        problem.tags = ','.join(data.get('tags', []))
        problem.problem_type = data.get('problem_type', problem.problem_type)
        problem.options = json.dumps(data.get('options', json.loads(problem.options or '[]')))
        problem.correct_answer = data.get('correct_answer', problem.correct_answer)
        problem.explanation = data.get('explanation', problem.explanation)
        problem.allowed_languages = json.dumps(data.get('allowed_languages', json.loads(problem.allowed_languages or '[]')))
        problem.time_limit = data.get('time_limit', problem.time_limit)
        problem.memory_limit = data.get('memory_limit', problem.memory_limit)
        problem.starter_code = data.get('starter_code', problem.starter_code)
        problem.solution = data.get('solution', problem.solution)
        problem.visible_test_cases = json.dumps(data.get('visible_test_cases', json.loads(problem.visible_test_cases or '[]')))
        problem.hidden_test_cases = json.dumps(data.get('hidden_test_cases', json.loads(problem.hidden_test_cases or '[]')))
        problem.answer_template = data.get('answer_template', problem.answer_template)
        problem.keywords = json.dumps(data.get('keywords', json.loads(problem.keywords or '[]')))
        problem.max_char_limit = data.get('max_char_limit', problem.max_char_limit)
        problem.hints = json.dumps(data.get('hints', json.loads(problem.hints or '[]')))
        problem.learning_resources = json.dumps(data.get('learning_resources', json.loads(problem.learning_resources or '[]')))
        problem.study_sections = json.dumps(data.get('study_sections', json.loads(problem.study_sections or '[]')))
        problem.max_attempts = data.get('max_attempts', problem.max_attempts)
        problem.category_id = data.get('category_id', problem.category_id)
        db.session.commit()
        return jsonify({'message': 'Practice problem updated'}), 200
    elif request.method == 'DELETE':
        db.session.delete(problem)
        db.session.commit()
        return jsonify({'message': 'Practice problem deleted'}), 200

# --- Public endpoint for interviewees to list practice problems by category ---
@auth_bp.route('/public/practice-problems', methods=['GET'])
def public_practice_problems():
    category_id = request.args.get('category_id')
    query = PracticeProblem.query
    if category_id:
        query = query.filter_by(category_id=category_id)
    problems = query.order_by(PracticeProblem.created_at.desc()).all()
    return jsonify([practice_problem_to_dict(p) for p in problems]), 200

# --- Submit a practice problem attempt ---
@auth_bp.route('/practice-problems/<int:problem_id>/attempt', methods=['POST'])
def submit_practice_problem_attempt(problem_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    problem = PracticeProblem.query.get(problem_id)
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    data = request.get_json()
    start_time = data.get('start_time')
    end_time = time.time()
    time_taken = int(end_time - start_time) if start_time else None
    problem_type = problem.problem_type
    answer = data.get('answer')
    selected_option = data.get('selected_option')
    code_submission = data.get('code_submission')
    test_case_results = None
    score = 0
    max_score = 1
    passed = False
    points_earned = 0
    error_message = None
    # --- Evaluate based on type ---
    if problem_type == 'multiple-choice' or problem_type == 'multiple_choice':
        passed = (selected_option == problem.correct_answer)
        score = 1 if passed else 0
        max_score = 1
    elif problem_type == 'short-answer' or problem_type == 'short_answer':
        # Handle both JSON array and plain string formats for answer_template
        accepted = []
        if problem.answer_template:
            try:
                # Try to parse as JSON array first
                accepted = json.loads(problem.answer_template)
                if not isinstance(accepted, list):
                    # If it's not a list, treat it as a single answer
                    accepted = [problem.answer_template]
            except json.JSONDecodeError:
                # If JSON parsing fails, treat it as a single answer
                accepted = [problem.answer_template]
        passed = any(a.strip().lower() == (answer or '').strip().lower() for a in accepted)
        score = 1 if passed else 0
        max_score = 1
    elif problem_type == 'coding':
        # Use the run_code logic for real code execution
        from flask import current_app
        from flask import request as flask_request
        # Prepare test cases
        all_cases = []
        try:
            all_cases = json.loads(problem.visible_test_cases or '[]') + json.loads(problem.hidden_test_cases or '[]')
        except Exception:
            pass
        # Call the run_code logic
        run_code_data = {
            'code': code_submission,
            'language': data.get('language', 'javascript'),
            'test_cases': all_cases
        }
        with current_app.test_request_context('/run-code', method='POST', json=run_code_data):
            from flask import jsonify as flask_jsonify
            run_code_resp = run_code()
            if hasattr(run_code_resp, 'get_json'):
                run_code_result = run_code_resp.get_json()
            else:
                run_code_result = run_code_resp[0].get_json() if isinstance(run_code_resp, tuple) else {}
        test_case_results = run_code_result.get('test_case_results', [])
        error_message = run_code_result.get('error')
        timeout = run_code_result.get('timeout')
        # Score
        num_passed = sum(1 for tc in test_case_results if tc.get('passed'))
        score = num_passed
        max_score = len(all_cases)
        passed = (score == max_score and max_score > 0)
        test_case_results = json.dumps(test_case_results)
    # --- Points logic ---
    points_earned = problem.points if passed else 0
    # Check for previous attempts
    prev = PracticeProblemAttempt.query.filter_by(user_id=user_id, problem_id=problem_id).order_by(PracticeProblemAttempt.score.desc()).first()
    attempt_number = 1
    streak = 1
    if prev:
        attempt_number = prev.attempt_number + 1
        streak = prev.streak + 1 if prev.passed else 1
        # Only award points if this is a higher score
        if prev.score >= score:
            points_earned = 0
    # Save attempt
    attempt = PracticeProblemAttempt(
        user_id=user_id,
        problem_id=problem_id,
        problem_type=problem_type,
        answer=answer,
        selected_option=selected_option,
        code_submission=code_submission,
        test_case_results=test_case_results,
        score=score,
        max_score=max_score,
        passed=passed,
        time_taken=time_taken,
        attempt_number=attempt_number,
        points_earned=points_earned,
        streak=streak
    )
    db.session.add(attempt)
    db.session.commit()
    return jsonify({
        'passed': passed,
        'score': score,
        'max_score': max_score,
        'points_earned': points_earned,
        'attempt_number': attempt_number,
        'streak': streak,
        'test_case_results': json.loads(test_case_results) if test_case_results else None,
        'error': error_message
    }), 200

# --- Get user attempts and streaks ---
@auth_bp.route('/practice-problems/attempts', methods=['GET'])
def get_user_practice_attempts():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    attempts = PracticeProblemAttempt.query.filter_by(user_id=user_id).order_by(PracticeProblemAttempt.timestamp.desc()).all()
    return jsonify([
        {
            'problem_id': a.problem_id,
            'problem_type': a.problem_type,
            'score': a.score,
            'max_score': a.max_score,
            'passed': a.passed,
            'time_taken': a.time_taken,
            'attempt_number': a.attempt_number,
            'points_earned': a.points_earned,
            'streak': a.streak,
            'timestamp': a.timestamp.isoformat() if a.timestamp else None
        }
        for a in attempts
    ]), 200

# --- Get user practice statistics ---
@auth_bp.route('/practice-problems/statistics', methods=['GET'])
def get_user_practice_statistics():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get all attempts for the user
    attempts = PracticeProblemAttempt.query.filter_by(user_id=user_id).all()
    
    if not attempts:
        return jsonify({
            'problems_solved': 0,
            'success_rate': 0,
            'avg_time': 0,
            'streak': 0
        }), 200
    
    # Calculate statistics
    total_attempts = len(attempts)
    passed_attempts = len([a for a in attempts if a.passed])
    problems_solved = passed_attempts  # Count unique problems passed
    success_rate = round((passed_attempts / total_attempts) * 100) if total_attempts > 0 else 0
    
    # Calculate average time (convert to minutes)
    total_time = sum(a.time_taken or 0 for a in attempts)
    avg_time_minutes = round(total_time / 60) if total_attempts > 0 else 0
    
    # Get current streak (from the most recent attempt)
    latest_attempt = max(attempts, key=lambda x: x.timestamp)
    current_streak = latest_attempt.streak
    
    return jsonify({
        'problems_solved': problems_solved,
        'success_rate': success_rate,
        'avg_time': avg_time_minutes,
        'streak': current_streak
    }), 200

# --- Get attempts for a specific practice problem ---
@auth_bp.route('/practice-problems/<int:problem_id>/attempts', methods=['GET'])
def get_problem_attempts(problem_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Check if problem exists
    problem = PracticeProblem.query.get(problem_id)
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Get all attempts for this problem with user information
    attempts = db.session.query(PracticeProblemAttempt, User).join(
        User, PracticeProblemAttempt.user_id == User.id
    ).filter(
        PracticeProblemAttempt.problem_id == problem_id
    ).order_by(PracticeProblemAttempt.timestamp.desc()).all()
    
    return jsonify([
        {
            'id': a.PracticeProblemAttempt.id,
            'user_id': a.PracticeProblemAttempt.user_id,
            'user_email': a.User.email,
            'problem_id': a.PracticeProblemAttempt.problem_id,
            'problem_type': a.PracticeProblemAttempt.problem_type,
            'score': a.PracticeProblemAttempt.score,
            'max_score': a.PracticeProblemAttempt.max_score,
            'passed': a.PracticeProblemAttempt.passed,
            'time_taken': a.PracticeProblemAttempt.time_taken,
            'attempt_number': a.PracticeProblemAttempt.attempt_number,
            'points_earned': a.PracticeProblemAttempt.points_earned,
            'streak': a.PracticeProblemAttempt.streak,
            'timestamp': a.PracticeProblemAttempt.timestamp.isoformat() if a.PracticeProblemAttempt.timestamp else None
        }
        for a in attempts
    ]), 200

# --- Helper function ---
def practice_problem_to_dict(problem):
    return {
        'id': problem.id,
        'title': problem.title,
        'description': problem.description,
        'difficulty': problem.difficulty,
        'estimated_time': problem.estimated_time,
        'points': problem.points,
        'is_public': problem.is_public,
        'tags': problem.tags.split(',') if problem.tags else [],
        'problem_type': problem.problem_type,
        'options': json.loads(problem.options or '[]'),
        'correct_answer': problem.correct_answer,
        'explanation': problem.explanation,
        'allowed_languages': json.loads(problem.allowed_languages or '[]'),
        'time_limit': problem.time_limit,
        'memory_limit': problem.memory_limit,
        'starter_code': problem.starter_code,
        'solution': problem.solution,
        'visible_test_cases': json.loads(problem.visible_test_cases or '[]'),
        'hidden_test_cases': json.loads(problem.hidden_test_cases or '[]'),
        'answer_template': problem.answer_template,
        'keywords': json.loads(problem.keywords or '[]'),
        'max_char_limit': problem.max_char_limit,
        'hints': json.loads(problem.hints or '[]'),
        'learning_resources': json.loads(problem.learning_resources or '[]'),
        'study_sections': json.loads(problem.study_sections or '[]'),
        'max_attempts': problem.max_attempts,
        'category_id': problem.category_id,
        'category': problem.category.name if problem.category else None,
        'recruiter_id': problem.recruiter_id,
        'created_at': problem.created_at.isoformat() if problem.created_at else None,
        'updated_at': problem.updated_at.isoformat() if problem.updated_at else None,
    }

# --- MESSAGING ENDPOINTS ---
@auth_bp.route('/messages/conversations', methods=['GET'])
def get_conversations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Get all unique conversation_ids for this user
    conversations = (
        db.session.query(Message.conversation_id)
        .filter((Message.sender_id == user_id) | (Message.receiver_id == user_id))
        .distinct()
        .all()
    )
    conversation_list = []
    for (conv_id,) in conversations:
        # Get the latest message in this conversation
        last_message = (
            Message.query.filter_by(conversation_id=conv_id)
            .order_by(Message.timestamp.desc())
            .first()
        )
        # Get the other user in the conversation
        if last_message.sender_id == user_id:
            other_user = User.query.get(last_message.receiver_id)
        else:
            other_user = User.query.get(last_message.sender_id)
        # Get unread count for this conversation
        unread_count = Message.query.filter_by(
            conversation_id=conv_id,
            receiver_id=user_id,
            read=False
        ).count()
        
        # Get company info for recruiters
        company = None
        if other_user.role == 'recruiter' and other_user.recruiter_profile:
            company = other_user.recruiter_profile.company_name
        
        conversation_list.append({
            'conversation_id': conv_id,
            'last_message': last_message.content,
            'last_message_at': last_message.timestamp.isoformat() + 'Z',
            'unread_count': unread_count,
            'other_user': {
                'id': other_user.id,
                'email': other_user.email,
                'role': other_user.role,
                'first_name': getattr(other_user.interviewee_profile, 'first_name', None) or getattr(other_user.recruiter_profile, 'first_name', None),
                'last_name': getattr(other_user.interviewee_profile, 'last_name', None) or getattr(other_user.recruiter_profile, 'last_name', None),
                'avatar': getattr(other_user.interviewee_profile, 'avatar', None) or getattr(other_user.recruiter_profile, 'avatar', None),
                'company': company,
                'status': 'online'  # Default status, can be enhanced later
            }
        })
    # Sort by latest message timestamp
    conversation_list.sort(key=lambda c: c['last_message_at'], reverse=True)
    return jsonify({'conversations': conversation_list}), 200

@auth_bp.route('/messages/<conversation_id>', methods=['GET'])
def get_messages(conversation_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Only allow access if user is part of the conversation
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.timestamp).all()
    if not messages or (messages[0].sender_id != user_id and messages[0].receiver_id != user_id):
        return jsonify({'error': 'Unauthorized or conversation not found'}), 403
    message_list = [
        {
            'id': m.id,
            'sender_id': m.sender_id,
            'receiver_id': m.receiver_id,
            'content': m.content,
            'created_at': m.timestamp.isoformat(),
            'read': m.read
        }
        for m in messages
    ]
    return jsonify({'messages': message_list}), 200

@auth_bp.route('/messages/send', methods=['POST'])
def send_message():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    if not receiver_id or not content:
        return jsonify({'error': 'receiver_id and content are required'}), 400
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'error': 'Receiver not found'}), 404
    # Only recruiters can initiate conversations
    if user.role == 'recruiter':
        # Recruiter can message any interviewee
        if receiver.role != 'interviewee':
            return jsonify({'error': 'Recruiters can only message interviewees'}), 403
        conversation_id = f"{user.id}-{receiver.id}"
    elif user.role == 'interviewee':
        # Interviewee can only reply to recruiters who have already messaged them
        if receiver.role != 'recruiter':
            return jsonify({'error': 'Interviewees can only message recruiters'}), 403
        # Check if a message from this recruiter exists
        existing = Message.query.filter_by(sender_id=receiver.id, receiver_id=user.id).first()
        if not existing:
            return jsonify({'error': 'You cannot initiate a conversation with a recruiter'}), 403
        conversation_id = f"{receiver.id}-{user.id}"
    else:
        return jsonify({'error': 'Invalid user role'}), 403
    # Save message
    message = Message(
        sender_id=user.id,
        receiver_id=receiver.id,
        content=content,
        conversation_id=conversation_id,
        timestamp=datetime.now()  # Use local time instead of UTC
    )
    db.session.add(message)
    db.session.commit()
    # Notification logic
    notif_settings = None
    if receiver.role == 'recruiter':
        notif_settings = RecruiterNotificationSettings.query.filter_by(user_id=receiver.id).first()
        push_enabled = notif_settings.push_message_notifications if notif_settings else True
    else:
        notif_settings = IntervieweeNotificationSettings.query.filter_by(user_id=receiver.id).first()
        push_enabled = notif_settings.push_message_notifications if notif_settings else True
    if push_enabled:
        notif = Notification(
            user_id=receiver.id,
            type='message',
            content=f'New message from {user.email}',
            data=json.dumps({'message_id': message.id, 'conversation_id': conversation_id, 'sender_id': user.id}),
            read=False
        )
        db.session.add(notif)
        db.session.commit()
    return jsonify({'message': 'Message sent successfully', 'message_id': message.id}), 201

@auth_bp.route('/messages/<int:message_id>/read', methods=['POST'])
def mark_message_read(message_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    if message.receiver_id != user_id:
        return jsonify({'error': 'You can only mark your own received messages as read'}), 403
    message.read = True
    db.session.commit()
    # Optionally, mark related notification as read
    notif = Notification.query.filter_by(user_id=user_id, type='message').filter(Notification.data.contains(str(message_id))).first()
    if notif:
        notif.read = True
        db.session.commit()
    return jsonify({'message': 'Message marked as read'}), 200

@auth_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    # Users can only delete their own messages
    if message.sender_id != user_id:
        return jsonify({'error': 'You can only delete your own messages'}), 403
    
    # Store conversation_id before deleting for response
    conversation_id = message.conversation_id
    
    # Delete the message
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({'message': 'Message deleted successfully', 'conversation_id': conversation_id}), 200

@auth_bp.route('/messages/<conversation_id>/mark-read', methods=['POST'])
def mark_conversation_read(conversation_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Mark all unread messages in this conversation as read
    messages = Message.query.filter_by(
        conversation_id=conversation_id,
        receiver_id=user_id,
        read=False
    ).all()
    
    for message in messages:
        message.read = True
    
    db.session.commit()
    return jsonify({'message': 'Messages marked as read'}), 200

# --- NOTIFICATION ENDPOINTS ---
@auth_bp.route('/notifications', methods=['GET'])
def get_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    notif_list = [
        {
            'id': n.id,
            'type': n.type,
            'content': n.content,
            'data': n.data,
            'read': n.read,
            'created_at': n.created_at.isoformat()
        }
        for n in notifications
    ]
    return jsonify(notif_list), 200

@auth_bp.route('/notifications/unread-count', methods=['GET'])
def get_unread_notification_count():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return jsonify({'unread_count': count}), 200

@auth_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    notif = Notification.query.get(notification_id)
    if not notif or notif.user_id != user_id:
        return jsonify({'error': 'Notification not found'}), 404
    notif.read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200

@auth_bp.route('/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Mark all unread notifications as read
    notifications = Notification.query.filter_by(user_id=user_id, read=False).all()
    for notification in notifications:
        notification.read = True
    
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200

@auth_bp.route('/notifications/clear-all', methods=['DELETE'])
def clear_all_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Delete all notifications for the user
    notifications = Notification.query.filter_by(user_id=user_id).all()
    for notification in notifications:
        db.session.delete(notification)
    
    db.session.commit()
    return jsonify({'message': 'All notifications cleared'}), 200

@auth_bp.route('/messages/available-candidates', methods=['GET'])
def get_available_candidates():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Unauthorized'}), 403
    
    interviewees = User.query.filter_by(role='interviewee').all()
    candidates = []
    
    for interviewee in interviewees:
        profile = IntervieweeProfile.query.filter_by(user_id=interviewee.id).first()
        if profile:
            candidates.append({
                'id': interviewee.id,
                'email': interviewee.email,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'position': profile.position,
                'company': profile.company,
                'skills': profile.skills,
                'avatar': profile.avatar
            })
    
    return jsonify({'candidates': candidates}), 200

# --- INTERVIEW SCHEDULING ENDPOINTS ---

@auth_bp.route('/interviews', methods=['GET'])
def get_interviews():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role == 'recruiter':
        interviews = Interview.query.filter_by(recruiter_id=user.id).order_by(Interview.scheduled_at.desc()).all()
    else:
        interviews = Interview.query.filter_by(interviewee_id=user.id).order_by(Interview.scheduled_at.desc()).all()
    
    result = []
    for interview in interviews:
        recruiter_profile = RecruiterProfile.query.filter_by(user_id=interview.recruiter_id).first()
        interviewee_profile = IntervieweeProfile.query.filter_by(user_id=interview.interviewee_id).first()
        
        result.append({
            'id': interview.id,
            'position': interview.position,
            'type': interview.type,
            'scheduled_at': interview.scheduled_at.isoformat() + 'Z',
            'duration': interview.duration,
            'status': interview.status,
            'meeting_link': interview.meeting_link,
            'location': interview.location,
            'notes': interview.notes,
            'feedback': interview.feedback,
            'rating': interview.rating,
            'created_at': interview.created_at.isoformat(),
            'recruiter': {
                'id': interview.recruiter_id,
                'name': f"{recruiter_profile.first_name} {recruiter_profile.last_name}" if recruiter_profile else "Unknown",
                'company': recruiter_profile.company_name if recruiter_profile else "Unknown"
            },
            'interviewee': {
                'id': interview.interviewee_id,
                'name': f"{interviewee_profile.first_name} {interviewee_profile.last_name}" if interviewee_profile else "Unknown",
                'position': interviewee_profile.position if interviewee_profile else "Unknown"
            },
            'assessment': {
                'id': interview.assessment_id,
                'title': interview.assessment.title if interview.assessment else None
            } if interview.assessment_id else None
        })
    
    return jsonify({'interviews': result}), 200

@auth_bp.route('/interviews', methods=['POST'])
def schedule_interview():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can schedule interviews'}), 403
    
    data = request.get_json()
    required_fields = ['interviewee_id', 'position', 'type', 'scheduled_at', 'duration']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    interviewee = User.query.filter_by(id=data['interviewee_id'], role='interviewee').first()
    if not interviewee:
        return jsonify({'error': 'Interviewee not found'}), 404
    
    try:
        scheduled_at = datetime.fromisoformat(data['scheduled_at'].replace('Z', '+00:00'))
        
        # Convert to UTC if it's timezone-aware
        if scheduled_at.tzinfo is not None:
            scheduled_at = scheduled_at.utctimetuple()
            scheduled_at = datetime(*scheduled_at[:6])
        
    except ValueError as e:
        return jsonify({'error': 'Invalid date format for scheduled_at'}), 400
    
    recruiter_profile = RecruiterProfile.query.filter_by(user_id=user.id).first()
    recruiter_name = f"{recruiter_profile.first_name} {recruiter_profile.last_name}" if recruiter_profile else "Unknown"
    recruiter_company = recruiter_profile.company_name if recruiter_profile else "Unknown"
    
    assessment_id = data.get('assessment_id')
    if assessment_id == "" or assessment_id is None:
        assessment_id = None
    else:
        try:
            assessment_id = int(assessment_id)
        except (ValueError, TypeError):
            assessment_id = None
    
    interview = Interview(
        recruiter_id=user.id,
        interviewee_id=data['interviewee_id'],
        assessment_id=assessment_id,
        position=data['position'],
        type=data['type'],
        scheduled_at=scheduled_at,
        duration=data['duration'],
        meeting_link=data.get('meeting_link'),
        location=data.get('location'),
        notes=data.get('notes')
    )
    
    db.session.add(interview)
    
    notification = Notification(
        user_id=data['interviewee_id'],
        type='interview',
        content=f'You have been invited for a {data["type"]} interview for {data["position"]} position',
        data=json.dumps({'interview_id': interview.id, 'type': 'invitation'})
    )
    db.session.add(notification)
    
    db.session.commit()
    
    try:
        from .models import IntervieweeNotificationSettings
        settings = IntervieweeNotificationSettings.query.filter_by(user_id=data['interviewee_id']).first()
        
        should_send_email = True
        if settings:
            should_send_email = settings.email_interview_invites
        
        if should_send_email:
            formatted_date = scheduled_at.strftime("%B %d, %Y")
            formatted_time = scheduled_at.strftime("%I:%M %p")
            
            subject = f"Interview Invitation - {data['position']} Position"
            
            # Build email body
            body = f"""
Dear {interviewee.first_name} {interviewee.last_name},

You have been invited for an interview!

Interview Details:
- Position: {data['position']}
- Type: {data['type'].replace('_', ' ').title()}
- Date: {formatted_date}
- Time: {formatted_time}
- Duration: {data['duration']} minutes
- Location: {data.get('location', 'Video Call')}
- Company: {recruiter_company}
- Interviewer: {recruiter_name}

"""
            
            if data.get('meeting_link'):
                body += f"Meeting Link: {data['meeting_link']}\n\n"
            
            if data.get('notes'):
                body += f"Notes: {data['notes']}\n\n"
            
            body += f"""
Please log in to your SmartRecruiter dashboard to view full interview details and prepare for your interview.

Best regards,
{recruiter_name}
{recruiter_company}
"""
            
            # Send email
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = current_app.config['GMAIL_USER']
            msg['To'] = interviewee.email
            
            with smtplib.SMTP_SSL(current_app.config['GMAIL_SMTP_HOST'], current_app.config['GMAIL_SMTP_PORT']) as server:
                server.login(current_app.config['GMAIL_USER'], current_app.config['GMAIL_APP_PASSWORD'])
                server.sendmail(current_app.config['GMAIL_USER'], [interviewee.email], msg.as_string())
                
    except Exception as e:
        print(f"Failed to send interview email: {str(e)}")
    
    return jsonify({
        'message': 'Interview scheduled successfully',
        'interview_id': interview.id
    }), 201

@auth_bp.route('/interviews/<int:interview_id>', methods=['GET'])
def get_interview(interview_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    if user.role == 'recruiter' and interview.recruiter_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'interviewee' and interview.interviewee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    recruiter_profile = RecruiterProfile.query.filter_by(user_id=interview.recruiter_id).first()
    interviewee_profile = IntervieweeProfile.query.filter_by(user_id=interview.interviewee_id).first()
    
    result = {
        'id': interview.id,
        'position': interview.position,
        'type': interview.type,
        'scheduled_at': interview.scheduled_at.isoformat() + 'Z',
        'duration': interview.duration,
        'status': interview.status,
        'meeting_link': interview.meeting_link,
        'location': interview.location,
        'notes': interview.notes,
        'feedback': interview.feedback,
        'rating': interview.rating,
        'created_at': interview.created_at.isoformat(),
        'recruiter': {
            'id': interview.recruiter_id,
            'name': f"{recruiter_profile.first_name} {recruiter_profile.last_name}" if recruiter_profile else "Unknown",
            'company': recruiter_profile.company_name if recruiter_profile else "Unknown",
            'email': interview.recruiter.email
        },
        'interviewee': {
            'id': interview.interviewee_id,
            'name': f"{interviewee_profile.first_name} {interviewee_profile.last_name}" if interviewee_profile else "Unknown",
            'position': interviewee_profile.position if interviewee_profile else "Unknown",
            'email': interview.interviewee.email
        },
        'assessment': {
            'id': interview.assessment_id,
            'title': interview.assessment.title if interview.assessment else None
        } if interview.assessment_id else None
    }
    
    return jsonify(result), 200

@auth_bp.route('/interviews/<int:interview_id>', methods=['PUT'])
def update_interview(interview_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    if user.role == 'recruiter' and interview.recruiter_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'interviewee' and interview.interviewee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'status' in data:
        interview.status = data['status']
    if 'position' in data:
        interview.position = data['position']
    if 'type' in data:
        interview.type = data['type']
    if 'duration' in data:
        interview.duration = data['duration']
    if 'meeting_link' in data:
        interview.meeting_link = data['meeting_link']
    if 'location' in data:
        interview.location = data['location']
    if 'notes' in data:
        interview.notes = data['notes']
    if 'feedback' in data:
        interview.feedback = data['feedback']
    if 'rating' in data:
        interview.rating = data['rating']
    if 'assessment_id' in data:
        assessment_id = data['assessment_id']
        if assessment_id == "" or assessment_id is None:
            interview.assessment_id = None
        else:
            try:
                interview.assessment_id = int(assessment_id)
            except (ValueError, TypeError):
                interview.assessment_id = None
    if 'scheduled_at' in data:
        try:
            scheduled_at = datetime.fromisoformat(data['scheduled_at'].replace('Z', '+00:00'))
            
            # Convert to UTC if it's timezone-aware
            if scheduled_at.tzinfo is not None:
                scheduled_at = scheduled_at.utctimetuple()
                scheduled_at = datetime(*scheduled_at[:6])
            
            interview.scheduled_at = scheduled_at
        except ValueError as e:
            return jsonify({'error': 'Invalid date format for scheduled_at'}), 400
    
    db.session.commit()
    
    return jsonify({'message': 'Interview updated successfully'}), 200

@auth_bp.route('/interviews/<int:interview_id>/cancel', methods=['POST'])
def cancel_interview(interview_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    if user.role == 'recruiter' and interview.recruiter_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'interviewee' and interview.interviewee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    interview.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'message': 'Interview cancelled successfully'}), 200

@auth_bp.route('/interviews/<int:interview_id>', methods=['DELETE'])
def delete_interview(interview_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    # Check if user is authorized to delete this interview
    if user.role == 'recruiter' and interview.recruiter_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'interviewee' and interview.interviewee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Actually delete the interview record
    db.session.delete(interview)
    db.session.commit()
    
    return jsonify({'message': 'Interview deleted successfully'}), 200

@auth_bp.route('/candidates', methods=['GET'])
def get_candidates():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can view candidates'}), 403
    
    interviewees = User.query.filter_by(role='interviewee').all()
    candidates = []
    
    for interviewee in interviewees:
        profile = IntervieweeProfile.query.filter_by(user_id=interviewee.id).first()
        if profile:
            # Get assessment attempts for this interviewee
            attempts = AssessmentAttempt.query.filter_by(interviewee_id=interviewee.id).all()
            completed_assessments = [a for a in attempts if a.status == 'completed']
            
            # Get test assessment attempts
            test_attempts = AssessmentAttempt.query.filter_by(
                interviewee_id=interviewee.id
            ).join(Assessment).filter(Assessment.is_test == True).all()
            completed_test_assessments = [a for a in test_attempts if a.status == 'completed']
            
            # Get interviews for this candidate
            interviews = Interview.query.filter_by(interviewee_id=interviewee.id).all()
            completed_interviews = [i for i in interviews if i.status == 'completed']
            
            # Calculate average scores
            assessment_avg = round(sum([a.score for a in completed_assessments if a.score]) / len(completed_assessments), 1) if completed_assessments else 0
            test_avg = round(sum([a.score for a in completed_test_assessments if a.score]) / len(completed_test_assessments), 1) if completed_test_assessments else 0
            
            status = 'applied'
            if completed_interviews:
                status = 'interviewed'
            elif completed_assessments or completed_test_assessments:
                status = 'in-review'
            if assessment_avg >= 80 or test_avg >= 80:
                status = 'shortlisted'
            
            last_activity = interviewee.created_at
            if attempts:
                last_attempt = max(attempts, key=lambda x: x.started_at)
                if last_attempt.started_at > last_activity:
                    last_activity = last_attempt.started_at
            if interviews:
                last_interview = max(interviews, key=lambda x: x.created_at)
                if last_interview.created_at > last_activity:
                    last_activity = last_interview.created_at
            
            practice_attempts = PracticeProblemAttempt.query.filter_by(user_id=interviewee.id).all()
            completed_practice = [p for p in practice_attempts if p.passed]
            practice_avg = round(sum([p.score for p in completed_practice if p.score]) / len(completed_practice), 1) if completed_practice else 0
            
            candidate_data = {
                'id': interviewee.id,
                'email': interviewee.email,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'full_name': f"{profile.first_name} {profile.last_name}",
                'position': profile.position,
                'company': profile.company,
                'location': profile.location,
                'phone': profile.phone,
                'skills': profile.skills.split(',') if profile.skills else [],
                'avatar': profile.avatar,
                'bio': profile.bio,
                'linkedin_url': profile.linkedin,
                'github_url': profile.github,
                'portfolio_url': profile.website,
                'created_at': interviewee.created_at.isoformat(),
                'last_activity': last_activity.isoformat(),
                'status': status,
                'assessments': {
                    'completed': len(completed_assessments),
                    'total': len(attempts),
                    'average_score': round(assessment_avg, 1),
                    'details': [
                        {
                            'id': a.id,
                            'assessment_title': a.assessment.title,
                            'score': a.score,
                            'status': a.status,
                            'completed_at': a.completed_at.isoformat() if a.completed_at else None
                        } for a in attempts
                    ]
                },
                'test_assessments': {
                    'completed': len(completed_test_assessments),
                    'total': len(test_attempts),
                    'average_score': round(test_avg, 1),
                    'details': [
                        {
                            'id': a.id,
                            'assessment_title': a.assessment.title,
                            'score': a.score,
                            'status': a.status,
                            'completed_at': a.completed_at.isoformat() if a.completed_at else None
                        } for a in test_attempts
                    ]
                },
                'interviews': {
                    'total': len(interviews),
                    'completed': len(completed_interviews),
                    'scheduled': len([i for i in interviews if i.status == 'scheduled']),
                    'cancelled': len([i for i in interviews if i.status == 'cancelled']),
                    'details': [
                        {
                            'id': i.id,
                            'position': i.position,
                            'type': i.type,
                            'status': i.status,
                            'scheduled_at': i.scheduled_at.isoformat() + 'Z',
                            'rating': i.rating,
                            'feedback': i.feedback
                        } for i in interviews
                    ]
                },
                'practice_problems': {
                    'completed': len(completed_practice),
                    'total': len(practice_attempts),
                    'average_score': round(practice_avg, 1)
                },
                'overall_score': round((assessment_avg + test_avg + practice_avg) / 3, 0) if (assessment_avg + test_avg + practice_avg) > 0 else 0,
                'rating': sum([i.rating for i in completed_interviews if i.rating]) / len(completed_interviews) if completed_interviews else 0
            }
            candidates.append(candidate_data)
    
    return jsonify({'candidates': candidates}), 200

@auth_bp.route('/dashboard/recruiter', methods=['GET'])
def get_recruiter_dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can access dashboard'}), 403
    
    assessments = Assessment.query.filter_by(recruiter_id=user_id).all()
    assessment_attempts = AssessmentAttempt.query.join(Assessment).filter(Assessment.recruiter_id == user_id).all()
    interviews = Interview.query.filter_by(recruiter_id=user_id).all()
    
    total_assessments = len(assessments)
    active_assessments = len([a for a in assessments if a.status == 'active'])
    
    unique_candidates = set()
    for attempt in assessment_attempts:
        unique_candidates.add(attempt.interviewee_id)
    total_candidates = len(unique_candidates)
    
    total_attempts = len(assessment_attempts)
    completed_attempts = len([a for a in assessment_attempts if a.status == 'completed'])
    completion_rate = round((completed_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0
    
    scores = [a.score for a in assessment_attempts if a.score is not None]
    average_score = round(sum(scores) / len(scores), 0) if scores else 0
    
    recent_attempts = []
    for attempt in sorted(assessment_attempts, key=lambda x: x.started_at, reverse=True)[:5]:
        interviewee = User.query.get(attempt.interviewee_id)
        profile = IntervieweeProfile.query.filter_by(user_id=attempt.interviewee_id).first()
        if interviewee and profile:
            recent_attempts.append({
                'id': attempt.id,
                'name': f"{profile.first_name} {profile.last_name}",
                'email': interviewee.email,
                'assessment': attempt.assessment.title,
                'status': attempt.status,
                'score': round(attempt.score, 0) if attempt.score is not None else None,
                'submitted_at': attempt.started_at.isoformat(),
                'completed_at': attempt.completed_at.isoformat() if attempt.completed_at else None
            })
    
    from datetime import datetime, timedelta
    today = datetime.now()
    week_from_now = today + timedelta(days=7)
    
    upcoming_interviews = []
    for interview in interviews:
        if interview.status == 'scheduled':
            scheduled_time = interview.scheduled_at
            if hasattr(scheduled_time, 'replace'):
                scheduled_time = scheduled_time.replace(tzinfo=None)
            
            if scheduled_time >= today and scheduled_time <= week_from_now:
                interviewee = User.query.get(interview.interviewee_id)
                profile = IntervieweeProfile.query.filter_by(user_id=interview.interviewee_id).first()
                if interviewee and profile:
                    upcoming_interviews.append({
                        'id': interview.id,
                        'candidate': f"{profile.first_name} {profile.last_name}",
                        'position': interview.position,
                        'time': interview.scheduled_at.isoformat() + 'Z',
                        'type': interview.type.replace('_', ' ').title()
                    })
    
    # Sort by scheduled time
    upcoming_interviews.sort(key=lambda x: x['time'])
    
    # Calculate weekly changes
    week_ago = today - timedelta(days=7)
    week_ago_assessments = len([a for a in assessments if a.created_at >= week_ago])
    week_ago_candidates = len(set([a.interviewee_id for a in assessment_attempts if a.started_at >= week_ago]))
    
    # Get assessment performance by category
    category_performance = []
    categories = Category.query.filter_by(recruiter_id=user_id).all()
    for category in categories:
        category_assessments = [a for a in assessments if a.category_id == category.id]
        category_attempts = [a for a in assessment_attempts if a.assessment.category_id == category.id]
        if category_attempts:
            scores = [a.score for a in category_attempts if a.score is not None]
            avg_score = round(sum(scores) / len(scores), 0) if scores else 0
            category_performance.append({
                'name': category.name,
                'average_score': avg_score,
                'total_assessments': len(category_assessments),
                'total_attempts': len(category_attempts)
            })
    
    # If no categories, create default performance data
    if not category_performance:
        # Get overall performance data
        scores = [a.score for a in assessment_attempts if a.score is not None]
        avg_score = round(sum(scores) / len(scores), 0) if scores else 0
        category_performance.append({
            'name': 'Overall Performance',
            'average_score': avg_score,
            'total_assessments': len(assessments),
            'total_attempts': len(assessment_attempts)
        })
    
    return jsonify({
        'stats': {
            'active_assessments': active_assessments,
            'total_candidates': total_candidates,
            'completion_rate': completion_rate,
            'average_score': average_score,
            'weekly_changes': {
                'assessments': f"+{max(0, active_assessments - week_ago_assessments)} this week",
                'candidates': f"+{max(0, total_candidates - week_ago_candidates)} this week",
                'completion_rate': f"+2.0% from last month",
                'average_score': f"+1.5 points"
            }
        },
        'recent_candidates': recent_attempts,
        'upcoming_interviews': upcoming_interviews[:3],
        'category_performance': category_performance
    }), 200

@auth_bp.route('/analytics/recruiter/summary', methods=['GET'])
def get_recruiter_analytics():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can access analytics'}), 403
    
    # Get all data for this recruiter
    assessments = Assessment.query.filter_by(recruiter_id=user_id).all()
    assessment_attempts = AssessmentAttempt.query.join(Assessment).filter(Assessment.recruiter_id == user_id).all()
    interviews = Interview.query.filter_by(recruiter_id=user_id).all()
    practice_problems = PracticeProblem.query.filter_by(recruiter_id=user_id).all()
    practice_attempts = PracticeProblemAttempt.query.join(PracticeProblem).filter(PracticeProblem.recruiter_id == user_id).all()
    messages = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).all()
    
    # Calculate analytics
    total_assessments = len(assessments)
    total_attempts = len(assessment_attempts)
    completed_attempts = len([a for a in assessment_attempts if a.status == 'completed'])
    average_score = round(sum([a.score for a in assessment_attempts if a.score]) / len(assessment_attempts), 1) if assessment_attempts else 0
    
    total_interviews = len(interviews)
    completed_interviews = len([i for i in interviews if i.status == 'completed'])
    scheduled_interviews = len([i for i in interviews if i.status == 'scheduled'])
    cancelled_interviews = len([i for i in interviews if i.status == 'cancelled'])
    
    total_practice_problems = len(practice_problems)
    total_practice_attempts = len(practice_attempts)
    completed_practice = len([p for p in practice_attempts if p.passed])
    average_practice_score = round(sum([p.score for p in practice_attempts if p.score]) / len(practice_attempts), 1) if practice_attempts else 0
    
    total_messages = len(messages)
    unread_messages = len([m for m in messages if not m.read and m.receiver_id == user_id])
    
    # Get unique candidates
    unique_candidates = set()
    for attempt in assessment_attempts:
        unique_candidates.add(attempt.interviewee_id)
    for interview in interviews:
        unique_candidates.add(interview.interviewee_id)
    
    # Monthly trends (last 6 months)
    from datetime import datetime, timedelta
    months = []
    assessment_trends = []
    interview_trends = []
    
    for i in range(6):
        month_start = datetime.now() - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        month_assessments = len([a for a in assessment_attempts if month_start <= a.started_at < month_end])
        month_interviews = len([i for i in interviews if month_start <= i.created_at < month_end])
        
        months.append(month_start.strftime('%b %Y'))
        assessment_trends.append(month_assessments)
        interview_trends.append(month_interviews)
    
    # Top performing assessments
    assessment_performance = []
    for assessment in assessments:
        attempts = [a for a in assessment_attempts if a.assessment_id == assessment.id]
        if attempts:
            avg_score = round(sum([a.score for a in attempts if a.score]) / len(attempts), 1)
            assessment_performance.append({
                'id': assessment.id,
                'title': assessment.title,
                'total_attempts': len(attempts),
                'completed_attempts': len([a for a in attempts if a.status == 'completed']),
                'average_score': avg_score,
                'type': 'test' if assessment.is_test else 'regular'
            })
    
    # Sort by average score
    assessment_performance.sort(key=lambda x: x['average_score'], reverse=True)
    
    # Category breakdown
    categories = Category.query.filter_by(recruiter_id=user_id).all()
    category_stats = []
    for category in categories:
        category_assessments = [a for a in assessments if a.category_id == category.id]
        category_attempts = [a for a in assessment_attempts if a.assessment.category_id == category.id]
        if category_attempts:
            avg_score = round(sum([a.score for a in category_attempts if a.score]) / len(category_attempts), 1)
            category_stats.append({
                'name': category.name,
                'total_assessments': len(category_assessments),
                'total_attempts': len(category_attempts),
                'average_score': avg_score
            })
    
    return jsonify({
        'overview': {
            'total_assessments': total_assessments,
            'total_attempts': total_attempts,
            'completed_attempts': completed_attempts,
            'completion_rate': round((completed_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0,
            'average_score': average_score,
            'total_candidates': len(unique_candidates),
            'total_interviews': total_interviews,
            'completed_interviews': completed_interviews,
            'interview_success_rate': round((completed_interviews / total_interviews * 100), 1) if total_interviews > 0 else 0,
            'total_practice_problems': total_practice_problems,
            'total_practice_attempts': total_practice_attempts,
            'completed_practice': completed_practice,
            'average_practice_score': average_practice_score,
            'total_messages': total_messages,
            'unread_messages': unread_messages
        },
        'trends': {
            'months': months,
            'assessment_trends': assessment_trends,
            'interview_trends': interview_trends
        },
        'top_assessments': assessment_performance[:5],
        'category_breakdown': category_stats,
        'recent_activity': {
            'recent_assessments': [
                {
                    'id': a.id,
                    'title': a.title,
                    'created_at': a.created_at.isoformat(),
                    'total_questions': len(a.questions),
                    'is_test': a.is_test
                } for a in assessments[-5:]
            ],
            'recent_interviews': [
                {
                    'id': i.id,
                    'position': i.position,
                    'type': i.type,
                    'status': i.status,
                    'scheduled_at': i.scheduled_at.isoformat() + 'Z',
                    'rating': i.rating
                } for i in interviews[-5:]
            ]
        }
    }), 200


@auth_bp.route('/dashboard/interviewee', methods=['GET'])
def get_interviewee_dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Only interviewees can access dashboard'}), 403
    
    
    assessment_attempts = AssessmentAttempt.query.filter_by(interviewee_id=user_id).all()
    practice_attempts = PracticeProblemAttempt.query.filter_by(user_id=user_id).all()
    interviews = Interview.query.filter_by(interviewee_id=user_id).all()
    
    
    completed_tests = len([a for a in assessment_attempts if a.status == 'completed'])
    total_attempts = len(assessment_attempts)
    
    scores = [a.score for a in assessment_attempts if a.score is not None]
    average_score = round(sum(scores) / len(scores), 0) if scores else 0
    
    practice_sessions = len(practice_attempts)
    
    all_interviewees = User.query.filter_by(role='interviewee').all()
    interviewee_scores = []
    for interviewee in all_interviewees:
        attempts = AssessmentAttempt.query.filter_by(interviewee_id=interviewee.id).all()
        scores = [a.score for a in attempts if a.score is not None]
        if scores:
            avg_score = sum(scores) / len(scores)
            interviewee_scores.append((interviewee.id, avg_score))
    
    interviewee_scores.sort(key=lambda x: x[1], reverse=True)
    user_rank = 1
    for interviewee_id, score in interviewee_scores:
        if interviewee_id == user_id:
            break
        user_rank += 1
    
    available_tests = []
    
    public_tests = Assessment.query.filter_by(is_test=True).all()
    for test in public_tests:
        existing_attempt = AssessmentAttempt.query.filter_by(
            interviewee_id=user_id, 
            assessment_id=test.id,
            status='completed'
        ).first()
        
        if not existing_attempt:
            recruiter_profile = RecruiterProfile.query.filter_by(user_id=test.recruiter_id).first()
            available_tests.append({
                'id': test.id,
                'title': test.title,
                'company': recruiter_profile.company_name if recruiter_profile else "Unknown Company",
                'difficulty': test.difficulty,
                'duration': f"{test.duration} min",
                'deadline': "No deadline",
                'type': 'test'
            })
    
    recent_results = []
    for attempt in sorted(assessment_attempts, key=lambda x: x.completed_at, reverse=True)[:5]:
        if attempt.status == 'completed' and attempt.completed_at:
            recruiter_profile = RecruiterProfile.query.filter_by(user_id=attempt.assessment.recruiter_id).first()
            
            feedback = None
            candidate_feedback = CandidateFeedback.query.filter_by(attempt_id=attempt.id).first()
            if candidate_feedback:
                feedback = candidate_feedback.feedback
            
            recent_results.append({
                'id': attempt.id,
                'assessment': attempt.assessment.title,
                'company': recruiter_profile.company_name if recruiter_profile else "Unknown Company",
                'score': round(attempt.score, 0) if attempt.score else 0,
                'status': 'passed' if attempt.passed else 'failed',
                'completed_at': attempt.completed_at.isoformat(),
                'feedback': feedback or "No feedback provided"
            })
    
    from datetime import datetime, timedelta
    today = datetime.now()
    week_from_now = today + timedelta(days=7)
    
    upcoming_interviews = []
    for interview in interviews:
        if interview.status == 'scheduled':
            scheduled_time = interview.scheduled_at
            if hasattr(scheduled_time, 'replace'):
                scheduled_time = scheduled_time.replace(tzinfo=None)
            
            if scheduled_time >= today and scheduled_time <= week_from_now:
                recruiter_profile = RecruiterProfile.query.filter_by(user_id=interview.recruiter_id).first()
                upcoming_interviews.append({
                    'id': interview.id,
                    'company': recruiter_profile.company_name if recruiter_profile else "Unknown Company",
                    'position': interview.position,
                    'time': interview.scheduled_at.isoformat() + 'Z',
                    'type': interview.type.replace('_', ' ').title(),
                    'interviewer': f"{recruiter_profile.first_name} {recruiter_profile.last_name}" if recruiter_profile else "Unknown"
                })
    
    upcoming_interviews.sort(key=lambda x: x['time'])
    
    skill_progress = []
    categories = Category.query.all()
    for category in categories:
        category_attempts = [a for a in assessment_attempts if a.assessment.category_id == category.id and a.status == 'completed']
        if category_attempts:
            scores = [a.score for a in category_attempts if a.score is not None]
            avg_score = round(sum(scores) / len(scores), 0) if scores else 0
            skill_progress.append({
                'skill': category.name,
                'progress': avg_score,
                'total_attempts': len(category_attempts)
            })
    
    if not skill_progress:
        type_attempts = {}
        for attempt in assessment_attempts:
            if attempt.status == 'completed':
                assessment_type = attempt.assessment.type
                if assessment_type not in type_attempts:
                    type_attempts[assessment_type] = []
                type_attempts[assessment_type].append(attempt)
        
        for assessment_type, attempts in type_attempts.items():
            scores = [a.score for a in attempts if a.score is not None]
            avg_score = round(sum(scores) / len(scores), 0) if scores else 0
            skill_progress.append({
                'skill': assessment_type.replace('_', ' ').title(),
                'progress': avg_score,
                'total_attempts': len(attempts)
            })
    
    # Calculate weekly changes
    week_ago = today - timedelta(days=7)
    week_ago_completed = len([a for a in assessment_attempts if a.status == 'completed' and a.completed_at and a.completed_at >= week_ago])
    week_ago_practice = len([p for p in practice_attempts if p.timestamp >= week_ago])
    
    return jsonify({
        'stats': {
            'tests_completed': completed_tests,
            'average_score': average_score,
            'practice_sessions': practice_sessions,
            'rank': user_rank,
            'weekly_changes': {
                'tests_completed': f"+{max(0, completed_tests - week_ago_completed)} this week",
                'average_score': f"+{max(0, average_score - (average_score - 5))}% improvement",
                'practice_sessions': f"+{max(0, practice_sessions - week_ago_practice)} this week",
                'rank': f"↑{max(0, user_rank - (user_rank - 5))} positions"
            }
        },
        'available_tests': available_tests[:3],
        'recent_results': recent_results,
        'upcoming_interviews': upcoming_interviews[:2],
        'skill_progress': skill_progress[:3]
    }), 200

@auth_bp.route('/profile/recruiter/stats', methods=['GET'])
def get_recruiter_profile_stats():
    """Get recruiter profile statistics and recent activity"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can access this endpoint'}), 403
    
    try:
        assessments = Assessment.query.filter_by(recruiter_id=user_id).all()
        assessments_count = len(assessments)
        
        candidate_ids = set()
        for assessment in assessments:
            attempts = AssessmentAttempt.query.filter_by(assessment_id=assessment.id).all()
            for attempt in attempts:
                candidate_ids.add(attempt.interviewee_id)
        candidates_managed = len(candidate_ids)
        
        # Get interviews scheduled by recruiter
        interviews = Interview.query.filter_by(recruiter_id=user_id).all()
        interviews_scheduled = len(interviews)
        
        # Get member since date
        member_since = user.created_at.strftime('%b %Y') if user.created_at else 'Unknown'
        
        # Get recent activity (last 5 activities)
        recent_activities = []
        
        # Recent assessments created
        recent_assessments = Assessment.query.filter_by(recruiter_id=user_id).order_by(Assessment.created_at.desc()).limit(3).all()
        for assessment in recent_assessments:
            recent_activities.append({
                'type': 'Assessment Created',
                'details': assessment.title,
                'date': assessment.created_at.isoformat() if assessment.created_at else None
            })
        
        # Recent interviews scheduled
        recent_interviews = Interview.query.filter_by(recruiter_id=user_id).order_by(Interview.created_at.desc()).limit(3).all()
        for interview in recent_interviews:
            interviewee = User.query.get(interview.interviewee_id)
            interviewee_profile = IntervieweeProfile.query.filter_by(user_id=interview.interviewee_id).first()
            if interviewee_profile:
                recent_activities.append({
                    'type': 'Interview Scheduled',
                    'details': f"{interviewee_profile.first_name} {interviewee_profile.last_name} - {interview.position}",
                    'date': interview.created_at.isoformat() if interview.created_at else None
                })
        
        # Recent candidate invitations (assessment attempts)
        recent_attempts = AssessmentAttempt.query.join(Assessment).filter(
            Assessment.recruiter_id == user_id
        ).order_by(AssessmentAttempt.started_at.desc()).limit(3).all()
        
        for attempt in recent_attempts:
            interviewee = User.query.get(attempt.interviewee_id)
            interviewee_profile = IntervieweeProfile.query.filter_by(user_id=attempt.interviewee_id).first()
            assessment = Assessment.query.get(attempt.assessment_id)
            if interviewee_profile and assessment:
                recent_activities.append({
                    'type': 'Candidate Invited',
                    'details': f"{interviewee_profile.first_name} {interviewee_profile.last_name} to {assessment.title}",
                    'date': attempt.started_at.isoformat() if attempt.started_at else None
                })
        
        # Sort all activities by date and take top 5
        recent_activities.sort(key=lambda x: x['date'] or '', reverse=True)
        recent_activities = recent_activities[:5]
        
        return jsonify({
            'stats': {
                'assessments_created': assessments_count,
                'candidates_managed': candidates_managed,
                'interviews_scheduled': interviews_scheduled,
                'member_since': member_since
            },
            'recent_activities': recent_activities
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile/interviewee/stats', methods=['GET'])
def get_interviewee_profile_stats():
    """Get interviewee profile statistics, achievements, and skills"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Only interviewees can access this endpoint'}), 403
    
    try:
        # Get completed assessments
        completed_attempts = AssessmentAttempt.query.filter_by(
            interviewee_id=user_id, 
            status='completed'
        ).all()
        
        assessments_completed = len(completed_attempts)
        
        scores = [attempt.score for attempt in completed_attempts if attempt.score is not None]
        average_score = round(sum(scores) / len(scores), 0) if scores else 0
        
        all_interviewees = User.query.filter_by(role='interviewee').all()
        interviewee_scores = []
        
        for interviewee in all_interviewees:
            interviewee_attempts = AssessmentAttempt.query.filter_by(
                interviewee_id=interviewee.id, 
                status='completed'
            ).all()
            if interviewee_attempts:
                avg_score = sum([a.score for a in interviewee_attempts if a.score is not None]) / len(interviewee_attempts)
                interviewee_scores.append((interviewee.id, avg_score))
        
        interviewee_scores.sort(key=lambda x: x[1], reverse=True)
        rank = next((i + 1 for i, (uid, _) in enumerate(interviewee_scores) if uid == user_id), len(interviewee_scores))
        
        member_since = user.created_at.strftime('%b %Y') if user.created_at else 'Unknown'
        
        profile = IntervieweeProfile.query.filter_by(user_id=user_id).first()
        skills = []
        if profile and profile.skills:
            skills = [skill.strip() for skill in profile.skills.split(',') if skill.strip()]
        
        achievements = []
        
        # Top performer achievement
        if average_score >= 90:
            achievements.append({
                'title': 'Top Performer',
                'description': f'Scored {average_score}% average across all assessments',
                'date': datetime.now().strftime('%Y-%m-%d')
            })
        
        # Quick learner achievement
        if assessments_completed >= 5:
            achievements.append({
                'title': 'Quick Learner',
                'description': f'Completed {assessments_completed} assessments',
                'date': datetime.now().strftime('%Y-%m-%d')
            })
        
        if average_score >= 85:
            achievements.append({
                'title': 'Consistent',
                'description': f'Maintained {average_score}%+ average score',
                'date': datetime.now().strftime('%Y-%m-%d')
            })
        
        recent_high_scores = [a for a in completed_attempts if a.score and a.score >= 90]
        if recent_high_scores:
            achievements.append({
                'title': 'High Achiever',
                'description': f'Scored 90%+ in recent assessments',
                'date': recent_high_scores[0].started_at.strftime('%Y-%m-%d') if recent_high_scores[0].started_at else datetime.now().strftime('%Y-%m-%d')
            })
        
        achievements.sort(key=lambda x: x['date'], reverse=True)
        achievements = achievements[:4]  # Limit to 4 achievements
        
        return jsonify({
            'stats': {
                'assessments_completed': assessments_completed,
                'average_score': average_score,
                'rank': rank,
                'member_since': member_since
            },
            'skills': skills,
            'achievements': achievements
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback from interviewee"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Only interviewees can submit feedback'}), 403
    
    try:
        data = request.get_json()
        feedback_type = data.get('type')
        subject = data.get('subject')
        message = data.get('message')
        
        if not all([feedback_type, subject, message]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if feedback_type not in ['general', 'suggestion', 'bug_report']:
            return jsonify({'error': 'Invalid feedback type'}), 400
        
        # Create new feedback
        feedback = Feedback(
            interviewee_id=user_id,
            type=feedback_type,
            subject=subject,
            message=message
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback_id': feedback.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/feedback', methods=['GET'])
def get_feedback():
    """Get feedback - all for recruiters, own for interviewees"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        if user.role == 'recruiter':
            feedback_list = Feedback.query.order_by(Feedback.created_at.desc()).all()
        else:
            feedback_list = Feedback.query.filter_by(interviewee_id=user_id).order_by(Feedback.created_at.desc()).all()
        
        feedback_data = []
        for feedback in feedback_list:
            interviewee = User.query.get(feedback.interviewee_id)
            interviewee_profile = IntervieweeProfile.query.filter_by(user_id=feedback.interviewee_id).first()
            feedback_data.append({
                'id': feedback.id,
                'type': feedback.type,
                'subject': feedback.subject,
                'message': feedback.message,
                'status': feedback.status,
                'priority': feedback.priority,
                'admin_notes': feedback.admin_notes,
                'created_at': feedback.created_at.isoformat() if feedback.created_at else None,
                'interviewee_name': f"{interviewee_profile.first_name} {interviewee_profile.last_name}" if interviewee_profile else "Unknown User",
                'interviewee_email': interviewee.email if interviewee else "Unknown"
            })
        
        return jsonify({'feedback': feedback_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/feedback/<int:feedback_id>', methods=['PUT'])
def update_feedback_status(feedback_id):
    """Update feedback status and admin notes (recruiters only)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can update feedback status'}), 403
    
    try:
        data = request.get_json()
        status = data.get('status')
        priority = data.get('priority')
        admin_notes = data.get('admin_notes')
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        if status:
            feedback.status = status
        if priority:
            feedback.priority = priority
        if admin_notes is not None:
            feedback.admin_notes = admin_notes
        
        feedback.updated_at = datetime.now()
        db.session.commit()
        
        return jsonify({'message': 'Feedback updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/feedback/stats', methods=['GET'])
def get_feedback_stats():
    """Get feedback statistics (recruiters only)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can view feedback stats'}), 403
    
    try:
        total_feedback = Feedback.query.count()
        pending_feedback = Feedback.query.filter_by(status='pending').count()
        reviewed_feedback = Feedback.query.filter_by(status='reviewed').count()
        resolved_feedback = Feedback.query.filter_by(status='resolved').count()
        
        # Feedback by type
        general_feedback = Feedback.query.filter_by(type='general').count()
        suggestion_feedback = Feedback.query.filter_by(type='suggestion').count()
        bug_report_feedback = Feedback.query.filter_by(type='bug_report').count()
        
        from datetime import datetime, timedelta
        week_ago = datetime.now() - timedelta(days=7)
        recent_feedback = Feedback.query.filter(Feedback.created_at >= week_ago).count()
        
        return jsonify({
            'total_feedback': total_feedback,
            'pending_feedback': pending_feedback,
            'reviewed_feedback': reviewed_feedback,
            'resolved_feedback': resolved_feedback,
            'general_feedback': general_feedback,
            'suggestion_feedback': suggestion_feedback,
            'bug_report_feedback': bug_report_feedback,
            'recent_feedback': recent_feedback
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/tests/available', methods=['GET'])
def get_available_tests():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Only interviewees can access tests'}), 403
    
    public_tests = Assessment.query.filter_by(is_test=True).all()
    
    user_attempts = AssessmentAttempt.query.filter_by(interviewee_id=user_id).all()
    completed_assessments = [a.assessment_id for a in user_attempts if a.status == 'completed']
    
    available_tests = len([t for t in public_tests if t.id not in completed_assessments])
    completed_tests = len(completed_assessments)
    
    completed_attempts = [a for a in user_attempts if a.status == 'completed' and a.score is not None]
    average_score = round(sum([a.score for a in completed_attempts]) / len(completed_attempts), 0) if completed_attempts else 0
    
    total_time = sum([a.time_spent or 0 for a in user_attempts if a.time_spent]) // 3600  # Convert to hours
    
    tests_data = []
    for test in public_tests:
        recruiter_profile = RecruiterProfile.query.filter_by(user_id=test.recruiter_id).first()
        
        test_attempts = [a for a in user_attempts if a.assessment_id == test.id]
        completed_attempts_for_test = [a for a in test_attempts if a.status == 'completed']
        
        # Determine status
        if completed_attempts_for_test:
            status = "completed"
            score = round(completed_attempts_for_test[0].score, 0) if completed_attempts_for_test[0].score else 0
        elif len(test_attempts) >= 3:
            status = "locked"
            score = None
        else:
            status = "available"
            score = None
        
        skills = []
        if test.category:
            skills.append(test.category.name)
        if test.tags:
            skills.extend(test.tags.split(','))
        
        tests_data.append({
            'id': test.id,
            'title': test.title,
            'company': recruiter_profile.company_name if recruiter_profile else "Unknown Company",
            'description': test.description or f"Test your skills in {test.type}",
            'difficulty': test.difficulty,
            'duration': test.duration,
            'questions': len(test.questions),
            'passingScore': test.passing_score,
            'skills': skills[:4],
            'deadline': None,
            'estimatedTime': f"{test.duration} minutes",
            'attempts': len(test_attempts),
            'maxAttempts': 3,
            'status': status,
            'rating': 4.5,
            'completions': len(AssessmentAttempt.query.filter_by(assessment_id=test.id, status='completed').all()),
            'score': score
        })
    
    return jsonify({
        'stats': {
            'available_tests': available_tests,
            'completed_tests': completed_tests,
            'average_score': average_score,
            'time_saved': total_time
        },
        'tests': tests_data
    }), 200
    
# --- ASSESSMENT REVIEW ENDPOINTS ---

@auth_bp.route('/assessments/<int:assessment_id>/submissions', methods=['GET'])
def get_assessment_submissions(assessment_id):
    """Get all submissions for an assessment with review status"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can view submissions'}), 403
    
    assessment = Assessment.query.get(assessment_id)
    if not assessment or assessment.recruiter_id != user_id:
        return jsonify({'error': 'Assessment not found'}), 404
    
    attempts = AssessmentAttempt.query.filter_by(assessment_id=assessment_id).order_by(AssessmentAttempt.completed_at.desc()).all()
    submissions = []
    
    for attempt in attempts:
        interviewee = User.query.get(attempt.interviewee_id)
        profile = IntervieweeProfile.query.filter_by(user_id=attempt.interviewee_id).first()
        
        # Get review status
        review = AssessmentReview.query.filter_by(attempt_id=attempt.id).first()
        
        submissions.append({
            'attempt_id': attempt.id,
            'candidate_name': f"{profile.first_name} {profile.last_name}" if profile else "Unknown",
            'candidate_email': interviewee.email if interviewee else "Unknown",
            'avatar': profile.avatar if profile else None,
            'status': attempt.status,
            'auto_score': attempt.score,
            'final_score': review.overall_score if review else attempt.score,
            'time_spent': attempt.time_spent,
            'completed_at': attempt.completed_at.isoformat() if attempt.completed_at else None,
            'review_status': review.status if review else 'not_reviewed',
            'review_id': review.id if review else None,
            'num_attempt': attempt.num_attempt
        })
    
    return jsonify(submissions), 200

@auth_bp.route('/assessments/<int:assessment_id>/submissions/<int:attempt_id>/review', methods=['GET'])
def get_submission_for_review(assessment_id, attempt_id):
    """Get detailed submission data for review"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can review submissions'}), 403
    
    assessment = Assessment.query.get(assessment_id)
    if not assessment or assessment.recruiter_id != user_id:
        return jsonify({'error': 'Assessment not found'}), 404
    
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt or attempt.assessment_id != assessment_id:
        return jsonify({'error': 'Attempt not found'}), 404
    
    interviewee = User.query.get(attempt.interviewee_id)
    profile = IntervieweeProfile.query.filter_by(user_id=attempt.interviewee_id).first()
    
    # Get or create review
    review = AssessmentReview.query.filter_by(attempt_id=attempt_id).first()
    if not review:
        review = AssessmentReview(
            attempt_id=attempt_id,
            recruiter_id=user_id,
            status='pending'
        )
        db.session.add(review)
        db.session.commit()
    
    # Get questions and answers
    questions_data = []
    for question in assessment.questions:
        attempt_answer = AssessmentAttemptAnswer.query.filter_by(
            attempt_id=attempt_id,
            question_id=question.id
        ).first()
        
        review_answer = AssessmentReviewAnswer.query.filter_by(
            review_id=review.id,
            question_id=question.id
        ).first()
        
        # Create review answer if it doesn't exist
        if not review_answer and attempt_answer:
            review_answer = AssessmentReviewAnswer(
                review_id=review.id,
                question_id=question.id,
                attempt_answer_id=attempt_answer.id,
                max_points=question.points,
                auto_score=question.points if attempt_answer.is_correct else 0,
                auto_is_correct=attempt_answer.is_correct
            )
            db.session.add(review_answer)
        
        questions_data.append({
            'question_id': question.id,
            'type': question.type,
            'question': question.question,
            'points': question.points,
            'options': json.loads(question.options) if question.options else None,
            'correct_answer': json.loads(question.correct_answer) if question.correct_answer else None,
            'explanation': question.explanation,
            'starter_code': question.starter_code,
            'solution': question.solution,
            'test_cases': question.test_cases,
            'answer': attempt_answer.answer if attempt_answer else None,
            'auto_score': review_answer.auto_score if review_answer else 0,
            'auto_is_correct': review_answer.auto_is_correct if review_answer else None,
            'manual_score': review_answer.manual_score if review_answer else None,
            'manual_is_correct': review_answer.is_correct if review_answer else None,
            'feedback': review_answer.feedback if review_answer else None,
            'review_notes': review_answer.review_notes if review_answer else None
        })
    
    db.session.commit()
    
    return jsonify({
        'review_id': review.id,
        'review_status': review.status,
        'candidate_name': f"{profile.first_name} {profile.last_name}" if profile else "Unknown",
        'candidate_email': interviewee.email if interviewee else "Unknown",
        'assessment_title': assessment.title,
        'auto_score': attempt.score,
        'final_score': review.overall_score,
        'overall_feedback': review.overall_feedback,
        'time_spent': attempt.time_spent,
        'completed_at': attempt.completed_at.isoformat() if attempt.completed_at else None,
        'questions': questions_data
    }), 200

@auth_bp.route('/assessments/reviews/<int:review_id>/answers/<int:question_id>', methods=['PUT'])
def update_review_answer(review_id, question_id):
    """Update manual scoring for a specific question"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can update reviews'}), 403
    
    review = AssessmentReview.query.get(review_id)
    if not review or review.recruiter_id != user_id:
        return jsonify({'error': 'Review not found'}), 404
    
    review_answer = AssessmentReviewAnswer.query.filter_by(
        review_id=review_id,
        question_id=question_id
    ).first()
    
    if not review_answer:
        return jsonify({'error': 'Review answer not found'}), 404
    
    data = request.get_json()
    review_answer.manual_score = data.get('manual_score', review_answer.manual_score)
    review_answer.is_correct = data.get('is_correct', review_answer.is_correct)
    review_answer.feedback = data.get('feedback', review_answer.feedback)
    review_answer.review_notes = data.get('review_notes', review_answer.review_notes)
    
    db.session.commit()
    
    return jsonify({'message': 'Review answer updated'}), 200

@auth_bp.route('/assessments/reviews/<int:review_id>/complete', methods=['POST'])
def complete_assessment_review(review_id):
    """Complete the review and calculate final score"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can complete reviews'}), 403
    
    review = AssessmentReview.query.get(review_id)
    if not review or review.recruiter_id != user_id:
        return jsonify({'error': 'Review not found'}), 404
    
    data = request.get_json()
    overall_feedback = data.get('overall_feedback', '')
    
    # Calculate final score
    review_answers = AssessmentReviewAnswer.query.filter_by(review_id=review_id).all()
    total_points = 0
    earned_points = 0
    
    for answer in review_answers:
        total_points += answer.max_points
        earned_points += answer.manual_score or answer.auto_score or 0
    
    final_score = (earned_points / total_points * 100) if total_points > 0 else 0
    
    # Update review
    review.overall_score = final_score
    review.overall_feedback = overall_feedback
    review.status = 'completed'
    review.reviewed_at = datetime.utcnow()
    
    # Update attempt with final score
    attempt = AssessmentAttempt.query.get(review.attempt_id)
    if attempt:
        attempt.score = final_score
        attempt.passed = final_score >= attempt.assessment.passing_score
    
    db.session.commit()
    
    return jsonify({
        'message': 'Review completed',
        'final_score': final_score,
        'passed': attempt.passed if attempt else False
    }), 200

@auth_bp.route('/assessments/reviews/<int:review_id>/release', methods=['POST'])
def release_assessment_results(review_id):
    """Release results to the candidate"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can release results'}), 403
    
    review = AssessmentReview.query.get(review_id)
    if not review or review.recruiter_id != user_id:
        return jsonify({'error': 'Review not found'}), 404
    
    if review.status != 'completed':
        return jsonify({'error': 'Review must be completed before releasing results'}), 400
    
    # Create notification for candidate
    attempt = AssessmentAttempt.query.get(review.attempt_id)
    if attempt:
        notification = Notification(
            user_id=attempt.interviewee_id,
            type='assessment',
            content=f'Your assessment "{attempt.assessment.title}" has been reviewed and scored.',
            data=json.dumps({
                'assessment_id': attempt.assessment_id,
                'attempt_id': attempt.id,
                'score': review.overall_score,
                'passed': attempt.passed
            })
        )
        db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({'message': 'Results released to candidate'}), 200

@auth_bp.route('/interviewee/attempts/<int:attempt_id>/review', methods=['GET'])
def get_interviewee_review(attempt_id):
    """Get review details for an interviewee's attempt"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'interviewee':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Verify the attempt belongs to this user
    attempt = AssessmentAttempt.query.get(attempt_id)
    if not attempt or attempt.interviewee_id != user_id:
        return jsonify({'error': 'Attempt not found'}), 404
    
    # Get the review
    review = AssessmentReview.query.filter_by(attempt_id=attempt_id).first()
    if not review:
        return jsonify({'error': 'No review found for this attempt'}), 404
    
    # Get assessment details
    assessment = Assessment.query.get(attempt.assessment_id)
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404
    
    # Get review answers with feedback
    review_answers = AssessmentReviewAnswer.query.filter_by(review_id=review.id).all()
    
    questions_data = []
    for review_answer in review_answers:
        question = AssessmentQuestion.query.get(review_answer.question_id)
        attempt_answer = AssessmentAttemptAnswer.query.get(review_answer.attempt_answer_id)
        
        if question:
            questions_data.append({
                'question_id': question.id,
                'question': question.question,
                'type': question.type,
                'points': question.points,
                'options': json.loads(question.options) if question.options else None,
                'correct_answer': question.correct_answer,
                'starter_code': question.starter_code,
                'answer': attempt_answer.answer if attempt_answer else None,
                'auto_score': review_answer.auto_score,
                'final_score': review_answer.manual_score or review_answer.auto_score,
                'auto_is_correct': review_answer.auto_is_correct,
                'final_is_correct': review_answer.is_correct,
                'feedback': review_answer.feedback,
                'review_notes': review_answer.review_notes
            })
    
    # Calculate actual auto-score from individual question auto-scores
    total_auto_score = sum(review_answer.auto_score for review_answer in review_answers)
    total_points = sum(question.points for question in [AssessmentQuestion.query.get(ra.question_id) for ra in review_answers] if question)
    actual_auto_score = (total_auto_score / total_points * 100) if total_points > 0 else 0
    
    return jsonify({
        'attempt_id': attempt.id,
        'assessment_id': assessment.id,
        'assessment_title': assessment.title,
        'auto_score': actual_auto_score,
        'final_score': review.overall_score,
        'overall_feedback': review.overall_feedback,
        'review_status': review.status,
        'reviewed_at': review.reviewed_at.isoformat() if review.reviewed_at else None,
        'questions': questions_data
    }), 200

@auth_bp.route('/interviews/candidates', methods=['GET'])
def get_interview_candidates():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'recruiter':
        return jsonify({'error': 'Only recruiters can view candidates'}), 403
    
    interviewees = User.query.filter_by(role='interviewee').all()
    candidates = []
    
    for interviewee in interviewees:
        profile = IntervieweeProfile.query.filter_by(user_id=interviewee.id).first()
        if profile:
            attempts = AssessmentAttempt.query.filter_by(interviewee_id=interviewee.id).all()
            completed_assessments = [a for a in attempts if a.status == 'completed']
            
            candidate_data = {
                'id': interviewee.id,
                'email': interviewee.email,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'position': profile.position,
                'company': profile.company,
                'skills': profile.skills,
                'avatar': profile.avatar,
                'completed_assessments': len(completed_assessments),
                'total_assessments': len(attempts),
                'average_score': sum([a.score for a in completed_assessments if a.score]) / len(completed_assessments) if completed_assessments else 0
            }
            candidates.append(candidate_data)
    
    return jsonify({'candidates': candidates}), 200

