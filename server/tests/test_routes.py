import pytest
import json
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import (
    User, IntervieweeProfile, RecruiterProfile, 
    RecruiterNotificationSettings, IntervieweeNotificationSettings,
    IntervieweePrivacySettings, Session, Category, Assessment,
    AssessmentQuestion, AssessmentAttempt, AssessmentAttemptAnswer,
    AssessmentFeedback, CandidateFeedback, CodeEvaluationResult,
    PracticeProblem, PracticeProblemAttempt, Message, Notification,
    Interview, Feedback
)
from app.config import TestingConfig


@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app(TestingConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()


class TestAuthRoutes:
    """Test cases for authentication routes."""
    
    def test_signup_interviewee(self, client):
        """Test interviewee signup."""
        data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe',
            'bio': 'Experienced developer',
            'skills': 'Python, JavaScript'
        }
    
        response = client.post('/signup', json=data)
        assert response.status_code == 201
        assert response.json['message'] == 'Account created successfully. Please check your email to verify your account.'
    
    def test_signup_recruiter(self, client):
        """Test recruiter signup."""
        data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
    
        response = client.post('/signup', json=data)
        assert response.status_code == 201
        assert response.json['message'] == 'Account created successfully. Please check your email to verify your account.'
    
    def test_signup_missing_fields(self, client):
        """Test signup with missing required fields."""
        data = {
            'email': 'test@example.com',
            'password': 'password123'
            # Missing role, first_name, last_name
        }
        
        response = client.post('/signup', json=data)
        assert response.status_code == 400
        assert 'Missing required field' in response.json['error']
    
    def test_signup_duplicate_email(self, client):
        """Test signup with duplicate email."""
        # Create first user
        data1 = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=data1)
        
        # Try to create second user with same email
        data2 = {
            'email': 'test@example.com',
            'password': 'password456',
            'role': 'recruiter',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'company_name': 'Tech Corp'
        }
        
        response = client.post('/signup', json=data2)
        assert response.status_code == 409
        assert 'User already exists' in response.json['error']
    
    def test_login_success(self, client):
        """Test successful login."""
        # Create user first
        signup_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='test@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
    
        response = client.post('/login', json=login_data)
        assert response.status_code == 200
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
    
        response = client.post('/login', json=data)
        assert response.status_code == 401
        assert 'Email address not found' in response.json['error']
    
    def test_logout(self, client):
        """Test logout."""
        # First login to create session
        signup_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Now logout
        response = client.post('/logout')
        assert response.status_code == 200
        assert response.json['message'] == 'Logged out successfully'


class TestProfileRoutes:
    """Test cases for profile routes."""
    
    def test_get_profile_interviewee(self, client):
        """Test getting interviewee profile."""
        # Create and login user
        signup_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='interviewee@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Get profile
        response = client.get('/profile')
        assert response.status_code == 200
        data = response.json
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'
        assert data['email'] == 'interviewee@example.com'
    
    def test_get_profile_recruiter(self, client):
        """Test getting recruiter profile."""
        # Create and login user
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Get profile
        response = client.get('/profile')
        assert response.status_code == 200
        data = response.json
        assert data['first_name'] == 'Sarah'
        assert data['last_name'] == 'Johnson'
        assert data['company_name'] == 'Tech Corp'
    
    def test_update_profile_interviewee(self, client):
        """Test updating interviewee profile."""
        # Create and login user
        signup_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='interviewee@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Update profile
        update_data = {
            'first_name': 'Johnny',
            'last_name': 'Smith',
            'phone': '+1234567890',
            'location': 'New York',
            'position': 'Senior Developer',
            'company': 'Tech Corp',
            'bio': 'Updated bio',
            'skills': 'Python, JavaScript, React'
        }
    
        response = client.post('/profile', json=update_data)
        assert response.status_code == 200
        
        # Verify update
        response = client.get('/profile')
        data = response.json
        assert data['first_name'] == 'Johnny'
        assert data['last_name'] == 'Smith'
        assert data['phone'] == '+1234567890'
        assert data['location'] == 'New York'
    
    def test_get_current_user(self, client):
        """Test getting current user info."""
        # Create and login user
        signup_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='test@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Get current user
        response = client.get('/me')
        assert response.status_code == 200
        data = response.json
        assert data['email'] == 'test@example.com'
        assert data['role'] == 'interviewee'
        assert data['first_name'] == 'John'
        assert data['last_name'] == 'Doe'


class TestAssessmentRoutes:
    """Test cases for assessment routes."""
    
    def test_create_assessment(self, client):
        """Test creating an assessment."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Create assessment
        assessment_data = {
            'title': 'Python Programming Test',
            'description': 'Test your Python skills',
            'type': 'coding',
            'difficulty': 'intermediate',
            'duration': 60,
            'passing_score': 70,
            'instructions': 'Complete the coding challenges',
            'tags': ['python', 'programming'],
            'status': 'draft',
            'is_test': True,
            'questions': [
                {
                    'type': 'coding',
                    'question': 'Write a function to reverse a string',
                    'points': 10,
                    'explanation': 'Use string slicing',
                    'starter_code': 'def reverse(s):\n    # Your code here\n    pass',
                    'solution': 'def reverse(s):\n    return s[::-1]',
                    'test_cases': '[{"input": "hello", "expected": "olleh"}]'
                }
            ]
        }
    
        response = client.post('/assessments', json=assessment_data)
        assert response.status_code == 201
        assert response.json['message'] == 'Assessment created'
        assert 'assessment_id' in response.json
    
    def test_get_assessments(self, client):
        """Test getting assessments list."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Create an assessment first
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'questions': []
        }
        client.post('/assessments', json=assessment_data)
    
        # Get assessments
        response = client.get('/assessments')
        assert response.status_code == 200
        data = response.json
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]['title'] == 'Test Assessment'
    
    def test_get_assessment_detail(self, client):
        """Test getting assessment details."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Create an assessment
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'questions': [
                {
                    'type': 'coding',
                    'question': 'Write a function to reverse a string',
                    'points': 10,
                    'starter_code': 'def reverse(s):\n    pass',
                    'solution': 'def reverse(s):\n    return s[::-1]'
                }
            ]
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Get assessment details
        response = client.get(f'/assessments/{assessment_id}')
        assert response.status_code == 200
        data = response.json
        assert data['title'] == 'Test Assessment'
        assert data['type'] == 'coding'
        assert len(data['questions']) == 1
    
    def test_update_assessment(self, client):
        """Test updating an assessment."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Create an assessment
        assessment_data = {
            'title': 'Original Title',
            'description': 'Original description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'questions': []
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Update assessment
        update_data = {
            'title': 'Updated Title',
            'description': 'Updated description',
            'difficulty': 'intermediate',
            'duration': 45,
            'passingScore': 75
        }
        
        response = client.put(f'/assessments/{assessment_id}', json=update_data)
        assert response.status_code == 200
        assert response.json['message'] == 'Assessment updated'
        
        # Verify update
        response = client.get(f'/assessments/{assessment_id}')
        data = response.json
        assert data['title'] == 'Updated Title'
        assert data['description'] == 'Updated description'
        assert data['difficulty'] == 'intermediate'
    
    def test_delete_assessment(self, client):
        """Test deleting an assessment."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Create an assessment
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'questions': []
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Delete assessment
        response = client.delete(f'/assessments/{assessment_id}')
        assert response.status_code == 200
        assert response.json['message'] == 'Assessment deleted'
        
        # Verify deletion
        response = client.get(f'/assessments/{assessment_id}')
        assert response.status_code == 404


class TestIntervieweeAssessmentRoutes:
    """Test cases for interviewee assessment routes."""
    
    def test_start_assessment_attempt(self, client):
        """Test starting an assessment attempt."""
        # Create recruiter and assessment
        recruiter_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=recruiter_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'status': 'active',
            'is_test': True,
            'questions': []
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Logout and create interviewee
        client.post('/logout')
        
        interviewee_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=interviewee_data)
        
        # Verify email manually for testing
        interviewee_user = User.query.filter_by(email='interviewee@example.com').first()
        interviewee_user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Start assessment attempt
        response = client.post(f'/interviewee/assessments/{assessment_id}/start')
        assert response.status_code == 201
        assert 'attempt_id' in response.json
        assert response.json['num_attempt'] == 1
    
    def test_submit_answer(self, client):
        """Test submitting an answer."""
        # Create recruiter and assessment with question
        recruiter_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=recruiter_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'status': 'active',
            'is_test': True,
            'questions': [
                {
                    'type': 'multiple-choice',
                    'question': 'What is 2+2?',
                    'points': 10,
                    'options': ['3', '4', '5', '6'],
                    'correctAnswer': 1
                }
            ]
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Get question ID
        assessment_response = client.get(f'/assessments/{assessment_id}')
        question_id = assessment_response.json['questions'][0]['id']
        
        # Logout and create interviewee
        client.post('/logout')
        
        interviewee_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=interviewee_data)
        
        # Verify email manually for testing
        interviewee_user = User.query.filter_by(email='interviewee@example.com').first()
        interviewee_user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Start assessment attempt
        start_response = client.post(f'/interviewee/assessments/{assessment_id}/start')
        attempt_id = start_response.json['attempt_id']
        
        # Submit answer
        answer_data = {
            'question_id': question_id,
            'answer': '4',
            'next_question': 1
        }
    
        response = client.post(f'/interviewee/attempts/{attempt_id}/answer', json=answer_data)
        assert response.status_code == 200
        assert response.json['message'] == 'Answer saved'
        assert response.json['is_correct'] is True
    
    def test_submit_attempt(self, client):
        """Test submitting a completed attempt."""
        # Create recruiter and assessment
        recruiter_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=recruiter_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'status': 'active',
            'is_test': True,
            'questions': [
                {
                    'type': 'multiple-choice',
                    'question': 'What is 2+2?',
                    'points': 10,
                    'options': ['3', '4', '5', '6'],
                    'correctAnswer': 1
                }
            ]
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Get question ID
        assessment_response = client.get(f'/assessments/{assessment_id}')
        question_id = assessment_response.json['questions'][0]['id']
        
        # Logout and create interviewee
        client.post('/logout')
        
        interviewee_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=interviewee_data)
        
        # Verify email manually for testing
        interviewee_user = User.query.filter_by(email='interviewee@example.com').first()
        interviewee_user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Start assessment attempt
        start_response = client.post(f'/interviewee/assessments/{assessment_id}/start')
        attempt_id = start_response.json['attempt_id']
        
        # Submit answer
        answer_data = {
            'question_id': question_id,
            'answer': '4',
            'next_question': 1
        }
        client.post(f'/interviewee/attempts/{attempt_id}/answer', json=answer_data)
        
        # Submit attempt
        response = client.post(f'/interviewee/attempts/{attempt_id}/submit')
        assert response.status_code == 200
        assert response.json['message'] == 'Attempt submitted'
        assert response.json['score'] == 100.0
        assert response.json['passed'] is True


class TestCategoryRoutes:
    """Test cases for category routes."""
    
    def test_create_category(self, client):
        """Test creating a category."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Create category
        category_data = {
            'name': 'Programming',
            'description': 'Programming and coding challenges'
        }
        
        response = client.post('/categories', json=category_data)
        assert response.status_code == 201
        data = response.json
        assert data['name'] == 'Programming'
        assert data['description'] == 'Programming and coding challenges'
    
    def test_get_categories(self, client):
        """Test getting categories list."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Create a category first
        category_data = {
            'name': 'Programming',
            'description': 'Programming challenges'
        }
        client.post('/categories', json=category_data)
        
        # Get categories
        response = client.get('/categories')
        assert response.status_code == 200
        data = response.json
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]['name'] == 'Programming'
    
    def test_update_category(self, client):
        """Test updating a category."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Create a category
        category_data = {
            'name': 'Original Name',
            'description': 'Original description'
        }
        create_response = client.post('/categories', json=category_data)
        category_id = create_response.json['id']
        
        # Update category
        update_data = {
            'name': 'Updated Name',
            'description': 'Updated description'
        }
        
        response = client.put(f'/categories/{category_id}', json=update_data)
        assert response.status_code == 200
        data = response.json
        assert data['name'] == 'Updated Name'
        assert data['description'] == 'Updated description'
    
    def test_delete_category(self, client):
        """Test deleting a category."""
        # Create and login recruiter
        signup_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=signup_data)
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Create a category
        category_data = {
            'name': 'Test Category',
            'description': 'Test description'
        }
        create_response = client.post('/categories', json=category_data)
        category_id = create_response.json['id']
        
        # Delete category
        response = client.delete(f'/categories/{category_id}')
        assert response.status_code == 200
        assert response.json['message'] == 'Category deleted'


class TestNotificationRoutes:
    """Test cases for notification routes."""
    
    def test_get_notifications(self, client):
        """Test getting notifications."""
        # Create and login user
        signup_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='test@example.com').first()
        user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Get notifications
        response = client.get('/notifications')
        assert response.status_code == 200
        assert isinstance(response.json, list)
    
    def test_get_unread_count(self, client):
        """Test getting unread notification count."""
        # Create and login user
        signup_data = {
            'email': 'test@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='test@example.com').first()
        user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        # Get unread count
        response = client.get('/notifications/unread-count')
        assert response.status_code == 200
        assert 'unread_count' in response.json


class TestPublicRoutes:
    """Test cases for public routes."""
    
    def test_public_test_assessments(self, client):
        """Test getting public test assessments."""
        # Create recruiter and assessment
        recruiter_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=recruiter_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
        
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
        
        assessment_data = {
            'title': 'Public Test Assessment',
            'description': 'Public test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'status': 'active',
            'is_test': True,
            'questions': []
        }
        client.post('/assessments', json=assessment_data)
        
        # Get public test assessments (no login required)
        response = client.get('/public/test-assessments')
        assert response.status_code == 200
        data = response.json
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]['title'] == 'Public Test Assessment'
        assert data[0]['is_test'] is True


class TestAnalyticsRoutes:
    """Test cases for analytics routes."""
    
    def test_interviewee_analytics(self, client):
        """Test getting interviewee analytics."""
        # Create and login interviewee
        signup_data = {
            'email': 'interviewee@example.com',
            'password': 'password123',
            'role': 'interviewee',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        client.post('/signup', json=signup_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='interviewee@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'interviewee@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        # Get analytics
        response = client.get('/analytics/interviewee/summary')
        assert response.status_code == 200
        data = response.json
        assert 'total_attempts' in data
        assert 'completed_attempts' in data
        assert 'average_score' in data
        assert 'pass_rate' in data
    
    def test_recruiter_assessment_analytics(self, client):
        """Test getting recruiter assessment analytics."""
        # Create recruiter and assessment
        recruiter_data = {
            'email': 'recruiter@example.com',
            'password': 'password123',
            'role': 'recruiter',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'company_name': 'Tech Corp'
        }
        client.post('/signup', json=recruiter_data)
        
        # Verify email manually for testing
        user = User.query.filter_by(email='recruiter@example.com').first()
        user.email_verified = True
        db.session.commit()
    
        login_data = {
            'email': 'recruiter@example.com',
            'password': 'password123'
        }
        client.post('/login', json=login_data)
    
        assessment_data = {
            'title': 'Test Assessment',
            'description': 'Test description',
            'type': 'coding',
            'difficulty': 'easy',
            'duration': 30,
            'passing_score': 60,
            'questions': []
        }
        create_response = client.post('/assessments', json=assessment_data)
        assessment_id = create_response.json['assessment_id']
        
        # Get analytics
        response = client.get(f'/analytics/recruiter/assessment/{assessment_id}')
        assert response.status_code == 200
        data = response.json
        assert 'total_attempts' in data
        assert 'completed_attempts' in data
        assert 'average_score' in data
        assert 'pass_rate' in data


def test_placeholder_routes():
    """Placeholder test to ensure pytest runs."""
    assert True
