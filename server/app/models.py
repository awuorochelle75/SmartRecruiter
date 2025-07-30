from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Boolean

db = SQLAlchemy()

# User table to store basic account credentials and roles
class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(255), unique=True)
    password_reset_token = db.Column(db.String(255), unique=True)
    password_reset_expires = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_verification_token(self):
        import secrets
        self.email_verification_token = secrets.token_urlsafe(32)
        return self.email_verification_token
    
    def generate_password_reset_token(self):
        import secrets
        from datetime import datetime, timedelta
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_expires = datetime.utcnow() + timedelta(hours=24)
        return self.password_reset_token

# Profile table specific to interviewees
class IntervieweeProfile(db.Model):
    __tablename__ = 'interviewee_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(30))
    location = db.Column(db.String(100))
    position = db.Column(db.String(100))
    company = db.Column(db.String(100))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)
    onboarding_completed = db.Column(db.Boolean, default=False)
    avatar = db.Column(db.String(255))
    title = db.Column(db.String(100))
    website = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    timezone = db.Column(db.String(50))
    availability = db.Column(db.String(50))
    salary_expectation = db.Column(db.String(50))
    work_type = db.Column(db.String(50))
    user = db.relationship('User', backref=db.backref('interviewee_profile', uselist=False))

# Profile table specific to recruiters
class RecruiterProfile(db.Model):
    __tablename__ = 'recruiter_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(30))
    location = db.Column(db.String(100))
    company_name = db.Column(db.String(100), nullable=False)
    company_website = db.Column(db.String(255))
    role = db.Column(db.String(100))
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    company_size = db.Column(db.String(50))
    company_description = db.Column(db.Text)
    company_logo = db.Column(db.String(255))
    timezone = db.Column(db.String(50))
    position = db.Column(db.String(100))
    user = db.relationship('User', backref=db.backref('recruiter_profile', uselist=False))
    
# New: Notification settings for recruiter
class RecruiterNotificationSettings(db.Model):
    __tablename__ = 'recruiter_notification_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    email_new_applications = db.Column(db.Boolean, default=True)
    email_assessment_completed = db.Column(db.Boolean, default=True)
    email_interview_reminders = db.Column(db.Boolean, default=True)
    push_new_applications = db.Column(db.Boolean, default=False)
    push_assessment_completed = db.Column(db.Boolean, default=True)
    push_interview_reminders = db.Column(db.Boolean, default=True)
    push_message_notifications = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=True)
    monthly_analytics = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('recruiter_notification_settings', uselist=False))

# New: Notification settings for interviewee
class IntervieweeNotificationSettings(db.Model):
    __tablename__ = 'interviewee_notification_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    email_new_opportunities = db.Column(db.Boolean, default=True)
    email_interview_invites = db.Column(db.Boolean, default=True)
    email_assessment_invites = db.Column(db.Boolean, default=True)
    email_results_updates = db.Column(db.Boolean, default=True)
    push_new_opportunities = db.Column(db.Boolean, default=False)
    push_interview_reminders = db.Column(db.Boolean, default=True)
    push_assessment_reminders = db.Column(db.Boolean, default=True)
    push_message_notifications = db.Column(db.Boolean, default=True)
    weekly_job_alerts = db.Column(db.Boolean, default=True)
    monthly_progress_reports = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('interviewee_notification_settings', uselist=False))
    
# New: Privacy settings for interviewee
class IntervieweePrivacySettings(db.Model):
    __tablename__ = 'interviewee_privacy_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    profile_visibility = db.Column(db.String(20), default='public')
    show_salary_expectation = db.Column(db.Boolean, default=False)
    show_contact_info = db.Column(db.Boolean, default=True)
    allow_recruiter_contact = db.Column(db.Boolean, default=True)
    show_activity_status = db.Column(db.Boolean, default=True)
    user = db.relationship('User', backref=db.backref('interviewee_privacy_settings', uselist=False))

# Sessions table for tracking client-side session data
class Session(db.Model):
    __tablename__ = 'session'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.Text, nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    recruiter = db.relationship('User', backref=db.backref('categories', lazy='dynamic'))
    assessments = db.relationship('Assessment', backref='category', lazy='dynamic')

# Assessments created by recruiters
class Assessment(db.Model):
    __tablename__ = 'assessment'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    passing_score = db.Column(db.Integer, nullable=False)
    instructions = db.Column(db.Text)
    tags = db.Column(db.Text)
    status = db.Column(db.String(20), default='draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = db.Column(db.String(50))
    is_test = db.Column(db.Boolean, default=False, nullable=False)
    questions = db.relationship('AssessmentQuestion', backref='assessment', cascade='all, delete-orphan')

# Questions associated with each assessment
class AssessmentQuestion(db.Model):
    __tablename__ = 'assessment_question'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text)
    correct_answer = db.Column(db.Text)
    points = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.Text)
    starter_code = db.Column(db.Text)
    solution = db.Column(db.Text)
    answer = db.Column(db.Text)
    test_cases = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
# Track attempts made by interviewees on assessments
class AssessmentAttempt(db.Model):
    __tablename__ = 'assessment_attempt'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='in_progress')
    current_question = db.Column(db.Integer, default=0)
    score = db.Column(db.Float)
    passed = db.Column(db.Boolean)
    num_attempt = db.Column(db.Integer, nullable=False, default=1)
    time_spent = db.Column(db.Integer)
    answers = db.relationship('AssessmentAttemptAnswer', backref='attempt', cascade='all, delete-orphan')
    assessment = db.relationship('Assessment', backref=db.backref('attempts', cascade='all, delete-orphan', lazy='dynamic'))
    interviewee = db.relationship('User', backref=db.backref('assessment_attempts', lazy='dynamic'))
    
    
class AssessmentAttemptAnswer(db.Model):
    __tablename__ = 'assessment_attempt_answer'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('assessment_question.id'), nullable=False)
    answer = db.Column(db.Text)
    is_correct = db.Column(db.Boolean)
    test_case_score = db.Column(db.Float)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)
    question = db.relationship('AssessmentQuestion')

class AssessmentFeedback(db.Model):
    __tablename__ = 'assessment_feedback'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assessment = db.relationship('Assessment', backref=db.backref('feedbacks', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('assessment_feedbacks', lazy='dynamic'))

class CandidateFeedback(db.Model):
    __tablename__ = 'candidate_feedback'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt.id'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    attempt = db.relationship('AssessmentAttempt', backref=db.backref('candidate_feedbacks', lazy='dynamic'))
    recruiter = db.relationship('User', backref=db.backref('candidate_feedbacks', lazy='dynamic'))

class CodeEvaluationResult(db.Model):
    __tablename__ = 'code_evaluation_result'
    id = db.Column(db.Integer, primary_key=True)
    attempt_answer_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt_answer.id'), nullable=False)
    test_case_results = db.Column(db.Text)
    score = db.Column(db.Float)
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    attempt_answer = db.relationship('AssessmentAttemptAnswer', backref=db.backref('code_evaluation_result', uselist=False))

class AssessmentReview(db.Model):
    __tablename__ = 'assessment_review'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt.id'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    overall_score = db.Column(db.Float)
    overall_feedback = db.Column(db.Text)
    reviewed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attempt = db.relationship('AssessmentAttempt', backref=db.backref('reviews', lazy='dynamic'))
    recruiter = db.relationship('User', backref=db.backref('assessment_reviews', lazy='dynamic'))

class AssessmentReviewAnswer(db.Model):
    __tablename__ = 'assessment_review_answer'
    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('assessment_review.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('assessment_question.id'), nullable=False)
    attempt_answer_id = db.Column(db.Integer, db.ForeignKey('assessment_attempt_answer.id'), nullable=False)
    
    # Manual scoring fields
    manual_score = db.Column(db.Float)
    max_points = db.Column(db.Float)
    is_correct = db.Column(db.Boolean)
    feedback = db.Column(db.Text)
    review_notes = db.Column(db.Text)
    
    auto_score = db.Column(db.Float)
    auto_is_correct = db.Column(db.Boolean)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    review = db.relationship('AssessmentReview', backref=db.backref('review_answers', lazy='dynamic'))
    question = db.relationship('AssessmentQuestion')
    attempt_answer = db.relationship('AssessmentAttemptAnswer')


class PracticeProblem(db.Model):
    __tablename__ = 'practice_problem'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(50), nullable=False)
    estimated_time = db.Column(db.String(50))
    points = db.Column(db.Integer, default=0)
    is_public = db.Column(db.Boolean, default=True)
    tags = db.Column(db.Text)
    problem_type = db.Column(db.String(50), nullable=False, default='multiple-choice')
    max_attempts = db.Column(db.Integer, default=1)
    options = db.Column(db.Text)
    correct_answer = db.Column(db.Integer)
    explanation = db.Column(db.Text)
    allowed_languages = db.Column(db.Text)
    time_limit = db.Column(db.Integer)
    memory_limit = db.Column(db.Integer)
    starter_code = db.Column(db.Text)
    solution = db.Column(db.Text)
    visible_test_cases = db.Column(db.Text)
    hidden_test_cases = db.Column(db.Text)
    answer_template = db.Column(db.Text)
    keywords = db.Column(db.Text)
    max_char_limit = db.Column(db.Integer)
    hints = db.Column(db.Text)
    learning_resources = db.Column(db.Text)
    study_sections = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category = db.relationship('Category', backref=db.backref('practice_problems', lazy='dynamic'))
    recruiter = db.relationship('User', backref=db.backref('practice_problems', lazy='dynamic'))


class PracticeProblemAttempt(db.Model):
    __tablename__ = 'practice_problem_attempt'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('practice_problem.id'), nullable=False)
    problem_type = db.Column(db.String(50), nullable=False)
    answer = db.Column(db.Text)  # For short answer
    selected_option = db.Column(db.Integer)  # For multiple choice
    code_submission = db.Column(db.Text)  # For coding
    test_case_results = db.Column(db.Text)  # JSON: [{input, expected, output, passed}]
    score = db.Column(db.Float, nullable=False, default=0)
    max_score = db.Column(db.Float, nullable=False, default=0)
    passed = db.Column(db.Boolean, default=False)
    time_taken = db.Column(db.Integer)  # seconds
    attempt_number = db.Column(db.Integer, nullable=False, default=1)
    points_earned = db.Column(db.Integer, nullable=False, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    streak = db.Column(db.Integer, nullable=False, default=1)
    # Relationships
    user = db.relationship('User', backref=db.backref('practice_problem_attempts', lazy='dynamic'))
    problem = db.relationship('PracticeProblem', backref=db.backref('attempts', lazy='dynamic'))
    
class Message(db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    read = db.Column(db.Boolean, default=False)
    conversation_id = db.Column(db.String(64), nullable=False)  # e.g., "recruiterId-intervieweeId"
    attachments = db.relationship('MessageAttachment', backref='message', cascade='all, delete-orphan')
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
    
class MessageAttachment(db.Model):
    __tablename__ = 'message_attachment'
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # in bytes
    mime_type = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

class Conversation(db.Model):
    __tablename__ = 'conversation'
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(64), unique=True, nullable=False)  # e.g., "recruiterId-intervieweeId"
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    archived_by_user1 = db.Column(db.Boolean, default=False)
    archived_by_user2 = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id], backref='conversations_as_user1')
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='conversations_as_user2')

class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    data = db.Column(db.Text)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))
    
    
class Interview(db.Model):
    __tablename__ = 'interview'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=True)
    position = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='scheduled')
    meeting_link = db.Column(db.String(255))
    location = db.Column(db.String(255))
    notes = db.Column(db.Text)
    feedback = db.Column(db.Text)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    recruiter = db.relationship('User', foreign_keys=[recruiter_id], backref='scheduled_interviews')
    interviewee = db.relationship('User', foreign_keys=[interviewee_id], backref='interviews')
    assessment = db.relationship('Assessment', backref='interviews')



class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    interviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')
    priority = db.Column(db.String(20), default='medium')
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    interviewee = db.relationship('User', backref='feedback_submitted')


