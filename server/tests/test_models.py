import pytest
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
    app = create_app()
    app.config.from_object(TestingConfig)
    
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


class TestUser:
    """Test cases for User model."""
    
    def test_user_creation(self, app):
        """Test creating a new user."""
        with app.app_context():
            user = User(
                email='test@example.com',
                role='interviewee'
            )
            user.set_password('password123')
            
            db.session.add(user)
            db.session.commit()
            
            assert user.id is not None
            assert user.email == 'test@example.com'
            assert user.role == 'interviewee'
            assert user.check_password('password123')
            assert not user.check_password('wrongpassword')
            assert user.created_at is not None
    
    def test_user_password_hashing(self, app):
        """Test password hashing and verification."""
        with app.app_context():
            user = User(email='test@example.com', role='recruiter')
            user.set_password('securepassword')
            
            assert user.password_hash != 'securepassword'
            assert user.check_password('securepassword')
            assert not user.check_password('wrongpassword')
    
    def test_user_unique_email(self, app):
        """Test that email must be unique."""
        with app.app_context():
            user1 = User(email='test@example.com', role='interviewee')
            user1.set_password('password123')
            
            user2 = User(email='test@example.com', role='recruiter')
            user2.set_password('password456')
            
            db.session.add(user1)
            db.session.commit()
            
            # This should raise an integrity error
            with pytest.raises(Exception):
                db.session.add(user2)
                db.session.commit()


class TestIntervieweeProfile:
    """Test cases for IntervieweeProfile model."""
    
    def test_interviewee_profile_creation(self, app):
        """Test creating an interviewee profile."""
        with app.app_context():
            user = User(email='interviewee@example.com', role='interviewee')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            profile = IntervieweeProfile(
                user_id=user.id,
                first_name='John',
                last_name='Doe',
                phone='+1234567890',
                location='New York',
                position='Software Engineer',
                company='Tech Corp',
                bio='Experienced developer',
                skills='Python, JavaScript, React',
                onboarding_completed=True,
                avatar='avatar.jpg',
                title='Senior Developer',
                website='https://johndoe.com',
                linkedin='https://linkedin.com/in/johndoe',
                github='https://github.com/johndoe',
                timezone='UTC-5',
                availability='Full-time',
                salary_expectation='$80k-$120k',
                work_type='Remote'
            )
            
            db.session.add(profile)
            db.session.commit()
            
            assert profile.id is not None
            assert profile.user_id == user.id
            assert profile.first_name == 'John'
            assert profile.last_name == 'Doe'
            assert profile.onboarding_completed is True
            assert profile.avatar == 'avatar.jpg'
            assert profile.title == 'Senior Developer'
    
    def test_interviewee_profile_relationship(self, app):
        """Test the relationship between User and IntervieweeProfile."""
        with app.app_context():
            user = User(email='test@example.com', role='interviewee')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            profile = IntervieweeProfile(
                user_id=user.id,
                first_name='Jane',
                last_name='Smith'
            )
            db.session.add(profile)
            db.session.commit()
            
            # Test relationship
            assert user.interviewee_profile == profile
            assert profile.user == user


class TestRecruiterProfile:
    """Test cases for RecruiterProfile model."""
    
    def test_recruiter_profile_creation(self, app):
        """Test creating a recruiter profile."""
        with app.app_context():
            user = User(email='recruiter@example.com', role='recruiter')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            profile = RecruiterProfile(
                user_id=user.id,
                first_name='Sarah',
                last_name='Johnson',
                phone='+1987654321',
                location='San Francisco',
                company_name='Tech Recruiters Inc',
                company_website='https://techrecruiters.com',
                role='Senior Recruiter',
                bio='Experienced tech recruiter',
                avatar='recruiter_avatar.jpg',
                industry='Technology',
                company_size='50-200',
                company_description='Leading tech recruitment firm',
                company_logo='logo.png',
                timezone='UTC-8',
                position='Senior Recruiter'
            )
            
            db.session.add(profile)
            db.session.commit()
            
            assert profile.id is not None
            assert profile.user_id == user.id
            assert profile.company_name == 'Tech Recruiters Inc'
            assert profile.avatar == 'recruiter_avatar.jpg'
            assert profile.industry == 'Technology'
    
    def test_recruiter_profile_relationship(self, app):
        """Test the relationship between User and RecruiterProfile."""
        with app.app_context():
            user = User(email='recruiter@example.com', role='recruiter')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            profile = RecruiterProfile(
                user_id=user.id,
                first_name='Mike',
                last_name='Wilson',
                company_name='Recruit Co'
            )
            db.session.add(profile)
            db.session.commit()
            
            # Test relationship
            assert user.recruiter_profile == profile
            assert profile.user == user


class TestNotificationSettings:
    """Test cases for notification settings models."""
    
    def test_recruiter_notification_settings(self, app):
        """Test RecruiterNotificationSettings model."""
        with app.app_context():
            user = User(email='recruiter@example.com', role='recruiter')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            settings = RecruiterNotificationSettings(
                user_id=user.id,
                email_new_applications=True,
                email_assessment_completed=True,
                email_interview_reminders=False,
                push_new_applications=True,
                push_assessment_completed=False,
                push_interview_reminders=True,
                push_message_notifications=True,
                weekly_reports=True,
                monthly_analytics=False
            )
            
            db.session.add(settings)
            db.session.commit()
            
            assert settings.id is not None
            assert settings.user_id == user.id
            assert settings.email_new_applications is True
            assert settings.push_interview_reminders is True
            assert settings.monthly_analytics is False
    
    def test_interviewee_notification_settings(self, app):
        """Test IntervieweeNotificationSettings model."""
        with app.app_context():
            user = User(email='interviewee@example.com', role='interviewee')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            settings = IntervieweeNotificationSettings(
                user_id=user.id,
                email_new_opportunities=True,
                email_interview_invites=False,
                email_assessment_invites=True,
                email_results_updates=True,
                push_new_opportunities=False,
                push_interview_reminders=True,
                push_assessment_reminders=False,
                push_message_notifications=True,
                weekly_job_alerts=True,
                monthly_progress_reports=False
            )
            
            db.session.add(settings)
            db.session.commit()
            
            assert settings.id is not None
            assert settings.user_id == user.id
            assert settings.email_interview_invites is False
            assert settings.push_message_notifications is True
            assert settings.monthly_progress_reports is False


class TestIntervieweePrivacySettings:
    """Test cases for IntervieweePrivacySettings model."""
    
    def test_privacy_settings_creation(self, app):
        """Test creating privacy settings."""
        with app.app_context():
            user = User(email='interviewee@example.com', role='interviewee')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            privacy = IntervieweePrivacySettings(
                user_id=user.id,
                profile_visibility='public',
                show_salary_expectation=False,
                show_contact_info=True,
                allow_recruiter_contact=True,
                show_activity_status=False
            )
            
            db.session.add(privacy)
            db.session.commit()
            
            assert privacy.id is not None
            assert privacy.user_id == user.id
            assert privacy.profile_visibility == 'public'
            assert privacy.show_salary_expectation is False
            assert privacy.show_contact_info is True


class TestSession:
    """Test cases for Session model."""
    
    def test_session_creation(self, app):
        """Test creating a session."""
        with app.app_context():
            session = Session(
                session_id='test-session-123',
                data='{"user_id": 1, "logged_in": true}',
                expiry=datetime.utcnow() + timedelta(days=1)
            )
            
            db.session.add(session)
            db.session.commit()
            
            assert session.id is not None
            assert session.session_id == 'test-session-123'
            assert session.data == '{"user_id": 1, "logged_in": true}'
            assert session.expiry > datetime.utcnow()


class TestCategory:
    """Test cases for Category model."""
    
    def test_category_creation(self, app):
        """Test creating a category."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            db.session.commit()
            
            category = Category(
                name='Programming',
                description='Programming and coding challenges',
                recruiter_id=recruiter.id
            )
            
            db.session.add(category)
            db.session.commit()
            
            assert category.id is not None
            assert category.name == 'Programming'
            assert category.description == 'Programming and coding challenges'
            assert category.recruiter_id == recruiter.id
            assert category.recruiter == recruiter
    
    def test_global_category(self, app):
        """Test creating a global category (no recruiter_id)."""
        with app.app_context():
            category = Category(
                name='General',
                description='General assessment category'
            )
            
            db.session.add(category)
            db.session.commit()
            
            assert category.id is not None
            assert category.name == 'General'
            assert category.recruiter_id is None


class TestAssessment:
    """Test cases for Assessment model."""
    
    def test_assessment_creation(self, app):
        """Test creating an assessment."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            category = Category(name='Programming')
            db.session.add(category)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                category_id=category.id,
                title='Python Programming Test',
                description='Test your Python programming skills',
                type='coding',
                difficulty='intermediate',
                duration=60,
                passing_score=70,
                instructions='Complete the coding challenges',
                tags='python,programming,algorithms',
                status='draft',
                deadline='2024-12-31',
                is_test=True
            )
            
            db.session.add(assessment)
            db.session.commit()
            
            assert assessment.id is not None
            assert assessment.recruiter_id == recruiter.id
            assert assessment.category_id == category.id
            assert assessment.title == 'Python Programming Test'
            assert assessment.type == 'coding'
            assert assessment.difficulty == 'intermediate'
            assert assessment.duration == 60
            assert assessment.passing_score == 70
            assert assessment.is_test is True


class TestAssessmentQuestion:
    """Test cases for AssessmentQuestion model."""
    
    def test_assessment_question_creation(self, app):
        """Test creating an assessment question."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type='coding',
                question='Write a function to reverse a string',
                options='["option1", "option2"]',
                correct_answer='def reverse(s): return s[::-1]',
                points=10,
                explanation='Use string slicing to reverse',
                starter_code='def reverse(s):\n    # Your code here\n    pass',
                solution='def reverse(s):\n    return s[::-1]',
                answer='def reverse(s): return s[::-1]',
                test_cases='[{"input": "hello", "expected": "olleh"}]'
            )
            
            db.session.add(question)
            db.session.commit()
            
            assert question.id is not None
            assert question.assessment_id == assessment.id
            assert question.type == 'coding'
            assert question.question == 'Write a function to reverse a string'
            assert question.points == 10
            assert question.assessment == assessment


class TestAssessmentAttempt:
    """Test cases for AssessmentAttempt model."""
    
    def test_assessment_attempt_creation(self, app):
        """Test creating an assessment attempt."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            attempt = AssessmentAttempt(
                interviewee_id=interviewee.id,
                assessment_id=assessment.id,
                started_at=datetime.utcnow(),
                status='in_progress',
                current_question=0,
                num_attempt=1,
                time_spent=0
            )
            
            db.session.add(attempt)
            db.session.commit()
            
            assert attempt.id is not None
            assert attempt.interviewee_id == interviewee.id
            assert attempt.assessment_id == assessment.id
            assert attempt.status == 'in_progress'
            assert attempt.current_question == 0
            assert attempt.num_attempt == 1
            assert attempt.interviewee == interviewee
            assert attempt.assessment == assessment


class TestAssessmentAttemptAnswer:
    """Test cases for AssessmentAttemptAnswer model."""
    
    def test_assessment_attempt_answer_creation(self, app):
        """Test creating an assessment attempt answer."""
        with app.app_context():
            # Create users
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            # Create assessment and question
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type='coding',
                question='Write a function to reverse a string',
                points=10
            )
            db.session.add(question)
            db.session.commit()
            
            # Create attempt
            attempt = AssessmentAttempt(
                interviewee_id=interviewee.id,
                assessment_id=assessment.id,
                status='in_progress'
            )
            db.session.add(attempt)
            db.session.commit()
            
            # Create answer
            answer = AssessmentAttemptAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                answer='def reverse(s): return s[::-1]',
                is_correct=True,
                test_case_score=1.0
            )
            
            db.session.add(answer)
            db.session.commit()
            
            assert answer.id is not None
            assert answer.attempt_id == attempt.id
            assert answer.question_id == question.id
            assert answer.answer == 'def reverse(s): return s[::-1]'
            assert answer.is_correct is True
            assert answer.test_case_score == 1.0
            assert answer.attempt == attempt
            assert answer.question == question


class TestAssessmentFeedback:
    """Test cases for AssessmentFeedback model."""
    
    def test_assessment_feedback_creation(self, app):
        """Test creating assessment feedback."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            feedback = AssessmentFeedback(
                assessment_id=assessment.id,
                user_id=interviewee.id,
                feedback='Great assessment! Very challenging.',
                rating=5
            )
            
            db.session.add(feedback)
            db.session.commit()
            
            assert feedback.id is not None
            assert feedback.assessment_id == assessment.id
            assert feedback.user_id == interviewee.id
            assert feedback.feedback == 'Great assessment! Very challenging.'
            assert feedback.rating == 5
            assert feedback.assessment == assessment
            assert feedback.user == interviewee


class TestCandidateFeedback:
    """Test cases for CandidateFeedback model."""
    
    def test_candidate_feedback_creation(self, app):
        """Test creating candidate feedback."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            attempt = AssessmentAttempt(
                interviewee_id=interviewee.id,
                assessment_id=assessment.id,
                status='completed'
            )
            db.session.add(attempt)
            db.session.commit()
            
            feedback = CandidateFeedback(
                attempt_id=attempt.id,
                recruiter_id=recruiter.id,
                feedback='Excellent problem-solving skills!',
                rating=4
            )
            
            db.session.add(feedback)
            db.session.commit()
            
            assert feedback.id is not None
            assert feedback.attempt_id == attempt.id
            assert feedback.recruiter_id == recruiter.id
            assert feedback.feedback == 'Excellent problem-solving skills!'
            assert feedback.rating == 4
            assert feedback.attempt == attempt
            assert feedback.recruiter == recruiter


class TestCodeEvaluationResult:
    """Test cases for CodeEvaluationResult model."""
    
    def test_code_evaluation_result_creation(self, app):
        """Test creating a code evaluation result."""
        with app.app_context():
            # Create users and assessment
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Test Assessment',
                type='coding',
                difficulty='easy',
                duration=30,
                passing_score=60
            )
            db.session.add(assessment)
            db.session.commit()
            
            question = AssessmentQuestion(
                assessment_id=assessment.id,
                type='coding',
                question='Write a function to reverse a string',
                points=10
            )
            db.session.add(question)
            db.session.commit()
            
            attempt = AssessmentAttempt(
                interviewee_id=interviewee.id,
                assessment_id=assessment.id,
                status='completed'
            )
            db.session.add(attempt)
            db.session.commit()
            
            answer = AssessmentAttemptAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                answer='def reverse(s): return s[::-1]'
            )
            db.session.add(answer)
            db.session.commit()
            
            evaluation = CodeEvaluationResult(
                attempt_answer_id=answer.id,
                test_case_results='[{"input": "hello", "expected": "olleh", "output": "olleh", "passed": true}]',
                score=1.0,
                feedback='All test cases passed!'
            )
            
            db.session.add(evaluation)
            db.session.commit()
            
            assert evaluation.id is not None
            assert evaluation.attempt_answer_id == answer.id
            assert evaluation.score == 1.0
            assert evaluation.feedback == 'All test cases passed!'
            assert evaluation.attempt_answer == answer


class TestPracticeProblem:
    """Test cases for PracticeProblem model."""
    
    def test_practice_problem_creation(self, app):
        """Test creating a practice problem."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            category = Category(name='Algorithms')
            db.session.add(category)
            db.session.commit()
            
            problem = PracticeProblem(
                recruiter_id=recruiter.id,
                category_id=category.id,
                title='Two Sum Problem',
                description='Find two numbers that add up to a target',
                difficulty='easy',
                estimated_time='30 min',
                points=10,
                is_public=True,
                tags='algorithms,arrays,hash-table',
                problem_type='coding',
                max_attempts=3,
                options='["option1", "option2", "option3", "option4"]',
                correct_answer=2,
                explanation='Use a hash table to store complements',
                allowed_languages='python,javascript,java',
                time_limit=300,
                memory_limit=128,
                starter_code='def twoSum(nums, target):\n    # Your code here\n    pass',
                solution='def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
                visible_test_cases='[{"input": [2,7,11,15], "target": 9, "expected": [0,1]}]',
                hidden_test_cases='[{"input": [3,2,4], "target": 6, "expected": [1,2]}]',
                answer_template='The solution uses a hash table approach',
                keywords='hash table,complement,linear time',
                max_char_limit=500,
                hints='["Try using a hash table", "Think about complements"]',
                learning_resources='[{"title": "Hash Tables", "url": "https://example.com/hash-tables"}]',
                study_sections='[{"title": "Hash Table Basics", "content": "Introduction to hash tables"}]'
            )
            
            db.session.add(problem)
            db.session.commit()
            
            assert problem.id is not None
            assert problem.recruiter_id == recruiter.id
            assert problem.category_id == category.id
            assert problem.title == 'Two Sum Problem'
            assert problem.difficulty == 'easy'
            assert problem.problem_type == 'coding'
            assert problem.max_attempts == 3
            assert problem.is_public is True
            assert problem.recruiter == recruiter
            assert problem.category == category


class TestPracticeProblemAttempt:
    """Test cases for PracticeProblemAttempt model."""
    
    def test_practice_problem_attempt_creation(self, app):
        """Test creating a practice problem attempt."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            problem = PracticeProblem(
                recruiter_id=recruiter.id,
                title='Test Problem',
                difficulty='easy',
                problem_type='coding',
                max_attempts=3
            )
            db.session.add(problem)
            db.session.commit()
            
            attempt = PracticeProblemAttempt(
                user_id=interviewee.id,
                problem_id=problem.id,
                problem_type='coding',
                code_submission='def solution(nums, target):\n    return [0, 1]',
                test_case_results='[{"input": [2,7,11,15], "target": 9, "expected": [0,1], "output": [0,1], "passed": true}]',
                score=10.0,
                max_score=10.0,
                passed=True,
                time_taken=120,
                attempt_number=1,
                points_earned=10,
                streak=1
            )
            
            db.session.add(attempt)
            db.session.commit()
            
            assert attempt.id is not None
            assert attempt.user_id == interviewee.id
            assert attempt.problem_id == problem.id
            assert attempt.problem_type == 'coding'
            assert attempt.score == 10.0
            assert attempt.passed is True
            assert attempt.attempt_number == 1
            assert attempt.user == interviewee
            assert attempt.problem == problem


class TestMessage:
    """Test cases for Message model."""
    
    def test_message_creation(self, app):
        """Test creating a message."""
        with app.app_context():
            sender = User(email='sender@example.com', role='recruiter')
            sender.set_password('password123')
            db.session.add(sender)
            
            receiver = User(email='receiver@example.com', role='interviewee')
            receiver.set_password('password456')
            db.session.add(receiver)
            db.session.commit()
            
            message = Message(
                sender_id=sender.id,
                receiver_id=receiver.id,
                content='Hello! I would like to discuss a job opportunity.',
                conversation_id=f'{sender.id}-{receiver.id}',
                read=False
            )
            
            db.session.add(message)
            db.session.commit()
            
            assert message.id is not None
            assert message.sender_id == sender.id
            assert message.receiver_id == receiver.id
            assert message.content == 'Hello! I would like to discuss a job opportunity.'
            assert message.read is False
            assert message.sender == sender
            assert message.receiver == receiver


class TestNotification:
    """Test cases for Notification model."""
    
    def test_notification_creation(self, app):
        """Test creating a notification."""
        with app.app_context():
            user = User(email='user@example.com', role='interviewee')
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            notification = Notification(
                user_id=user.id,
                type='message',
                content='You have a new message from a recruiter',
                data='{"messageId": 1, "senderId": 2}',
                read=False
            )
            
            db.session.add(notification)
            db.session.commit()
            
            assert notification.id is not None
            assert notification.user_id == user.id
            assert notification.type == 'message'
            assert notification.content == 'You have a new message from a recruiter'
            assert notification.data == '{"messageId": 1, "senderId": 2}'
            assert notification.read is False
            assert notification.user == user


class TestInterview:
    """Test cases for Interview model."""
    
    def test_interview_creation(self, app):
        """Test creating an interview."""
        with app.app_context():
            recruiter = User(email='recruiter@example.com', role='recruiter')
            recruiter.set_password('password123')
            db.session.add(recruiter)
            
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password456')
            db.session.add(interviewee)
            db.session.commit()
            
            assessment = Assessment(
                recruiter_id=recruiter.id,
                title='Technical Interview',
                type='coding',
                difficulty='intermediate',
                duration=60,
                passing_score=70
            )
            db.session.add(assessment)
            db.session.commit()
            
            interview = Interview(
                recruiter_id=recruiter.id,
                interviewee_id=interviewee.id,
                assessment_id=assessment.id,
                position='Software Engineer',
                type='technical',
                scheduled_at=datetime.utcnow() + timedelta(days=7),
                duration=60,
                status='scheduled',
                meeting_link='https://meet.google.com/abc-defg-hij',
                location='Virtual',
                notes='Technical interview focusing on algorithms',
                feedback='',
                rating=None
            )
            
            db.session.add(interview)
            db.session.commit()
            
            assert interview.id is not None
            assert interview.recruiter_id == recruiter.id
            assert interview.interviewee_id == interviewee.id
            assert interview.assessment_id == assessment.id
            assert interview.position == 'Software Engineer'
            assert interview.type == 'technical'
            assert interview.status == 'scheduled'
            assert interview.meeting_link == 'https://meet.google.com/abc-defg-hij'
            assert interview.recruiter == recruiter
            assert interview.interviewee == interviewee
            assert interview.assessment == assessment


class TestFeedback:
    """Test cases for Feedback model."""
    
    def test_feedback_creation(self, app):
        """Test creating feedback."""
        with app.app_context():
            interviewee = User(email='interviewee@example.com', role='interviewee')
            interviewee.set_password('password123')
            db.session.add(interviewee)
            db.session.commit()
            
            feedback = Feedback(
                interviewee_id=interviewee.id,
                type='suggestion',
                subject='Feature Request',
                message='It would be great to have more practice problems in JavaScript.',
                status='pending',
                priority='medium',
                admin_notes=''
            )
            
            db.session.add(feedback)
            db.session.commit()
            
            assert feedback.id is not None
            assert feedback.interviewee_id == interviewee.id
            assert feedback.type == 'suggestion'
            assert feedback.subject == 'Feature Request'
            assert feedback.message == 'It would be great to have more practice problems in JavaScript.'
            assert feedback.status == 'pending'
            assert feedback.priority == 'medium'
            assert feedback.interviewee == interviewee


def test_placeholder_models():
    """Placeholder test to ensure pytest runs."""
    assert True
