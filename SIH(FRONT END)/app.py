from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_pymongo import PyMongo
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import os
import bcrypt
from datetime import datetime
from bson import ObjectId
import json

app = Flask(__name__, 
            template_folder='.', 
            static_folder='.',
            static_url_path='')

# MongoDB Configuration
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/disaster_alert_db')
mongo = PyMongo(app)

# Admin Configuration
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'smartindiahackathon72@gmail.com')
SYSTEM_EMAIL = os.environ.get('SYSTEM_EMAIL', 'smartindiahackathon72@gmail.com')

# Email Configuration - Gmail SMTP
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', SYSTEM_EMAIL)
# IMPORTANT: Use Gmail App Password, not regular password
# Get App Password from: https://support.google.com/accounts/answer/185833
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')  # Leave empty - must be set via environment
print("🔧 Using Gmail SMTP for email delivery (requires App Password)")

app.config['MAIL_DEFAULT_SENDER'] = SYSTEM_EMAIL

# Initialize Mail
mail = Mail(app)

# Email configuration validation
def validate_email_config():
    """Validate Gmail SMTP configuration and provide helpful feedback"""
    config_issues = []
    
    if not app.config['MAIL_PASSWORD']:
        config_issues.append("❌ MAIL_PASSWORD not set - Gmail App Password required")
    
    if not app.config['MAIL_USERNAME']:
        config_issues.append("❌ MAIL_USERNAME not set")
    
    if config_issues:
        print("\n🚨 EMAIL CONFIGURATION ISSUES:")
        for issue in config_issues:
            print(f"  {issue}")
        print("\n📚 Gmail App Password Setup:")
        print("   1. Go to https://myaccount.google.com/security")
        print("   2. Enable 2-Step Verification")
        print("   3. Generate App Password for 'Mail'")
        print("   4. Use 16-character App Password (not regular password)")
        print("🔧 Set: $env:MAIL_PASSWORD='your-16-char-app-password'")
        return False
    else:
        print("✅ Email configuration appears valid (Gmail SMTP)")
        return True

# Check email config on startup
email_config_valid = validate_email_config()

# Initialize collections
reports_collection = mongo.db.reports
users_collection = mongo.db.users
contacts_collection = mongo.db.contacts

# Helper functions
def serialize_mongo_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    return doc

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    """Check password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

def send_email_to_admin(subject, sender_name, sender_email, message_body, contact_subject):
    """Send email notification to admin about new contact message"""
    try:
        # Check email configuration first
        if not email_config_valid:
            print("❌ Email not sent - configuration invalid")
            return False
        
        print(f"📧 Attempting to send email to {ADMIN_EMAIL}")
        print(f"📧 SMTP Server: {app.config['MAIL_SERVER']}:{app.config['MAIL_PORT']}")
        print(f"📧 Username: {app.config['MAIL_USERNAME']}")
        print(f"📧 Password configured: {'Yes' if app.config['MAIL_PASSWORD'] else 'No'}")
        
        # Create email message
        msg = Message(
            subject=f'[Disaster Alert System] New Contact: {subject}',
            recipients=[ADMIN_EMAIL],
            reply_to=sender_email
        )
        
        # Email body with HTML formatting
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1565C0 0%, #42a5f5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 24px;">🚨 New Contact Message</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Disaster Alert System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="color: #1565C0; margin-top: 0;">Contact Details</h3>
                    <p><strong>Name:</strong> {sender_name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{sender_email}">{sender_email}</a></p>
                    <p><strong>Subject Category:</strong> {contact_subject.title()}</p>
                    <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #1565C0; margin-top: 0;">Message</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #1565C0; border-radius: 4px;">
                        <p style="margin: 0; line-height: 1.6;">{message_body}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                    <p style="margin: 0; font-size: 14px; color: #1565C0;">
                        <strong>Quick Actions:</strong> Reply directly to this email to respond to {sender_name}, or access the admin dashboard to manage all contact messages.
                    </p>
                </div>
            </div>
        </div>
        """
        
        # Text version for email clients that don't support HTML
        msg.body = f"""
        New Contact Message - Disaster Alert System
        
        Contact Details:
        Name: {sender_name}
        Email: {sender_email}
        Subject: {contact_subject.title()}
        Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
        
        Message:
        {message_body}
        
        Reply directly to this email to respond to the sender.
        """
        
        # Send the email
        mail.send(msg)
        print("✅ Email sent successfully to admin!")
        return True
        
    except Exception as e:
        error_msg = str(e).lower()
        print(f"❌ Failed to send email to admin: {e}")
        
        # Provide specific error guidance
        if 'authentication failed' in error_msg or 'username and password not accepted' in error_msg:
            print("🔧 Solution: Check Gmail App Password in EMAIL_SETUP.md")
        elif 'connection' in error_msg:
            print("🔧 Solution: Check internet connection and firewall settings")
        elif 'timeout' in error_msg:
            print("🔧 Solution: Check network connectivity to smtp.gmail.com:587")
        
        return False

def create_report_index():
    """Create indexes for better query performance"""
    try:
        reports_collection.create_index([("timestamp", -1)])
        reports_collection.create_index([("status", 1)])
        reports_collection.create_index([("type", 1)])
        reports_collection.create_index([("location", "text")])
        print("📊 Database indexes created successfully")
    except Exception as e:
        print(f"⚠️ Index creation failed: {e}")

# Initialize database indexes
create_report_index()

# Configure Flask to serve static files
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

@app.route('/fonts/<path:filename>')
def serve_fonts(filename):
    return send_from_directory('fonts', filename)

# Main routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home.html')
def home():
    return render_template('home.html')

@app.route('/new-post.html')
def new_post():
    return render_template('new-post.html')

# Auth routes
@app.route('/pages/auth/login.html')
def login():
    return render_template('pages/auth/login.html')

@app.route('/pages/auth/register.html')
def register():
    return render_template('pages/auth/register.html')

# Info routes
@app.route('/pages/info/about.html')
def about():
    return render_template('pages/info/about.html')

@app.route('/pages/info/contact.html')
def contact():
    return render_template('pages/info/contact.html')

# Reports route
@app.route('/pages/reports.html')
def reports():
    return render_template('pages/reports.html')

# API endpoints for disaster reports
@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all disaster reports from MongoDB"""
    try:
        # Build query based on filters
        query = {}
        
        # Filter by status if provided
        status_filter = request.args.get('status', 'all')
        if status_filter != 'all':
            query['status'] = status_filter
        
        # Filter by type if provided
        type_filter = request.args.get('type', 'all')
        if type_filter != 'all':
            query['disasterType'] = type_filter
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        skip = (page - 1) * limit
        
        # Query reports from MongoDB
        reports_cursor = reports_collection.find(query).sort('timestamp', -1).skip(skip).limit(limit)
        reports = [serialize_mongo_doc(report) for report in reports_cursor]
        
        # Get total count for pagination
        total_count = reports_collection.count_documents(query)
        
        return jsonify({
            'success': True,
            'reports': reports,
            'total': total_count,
            'page': page,
            'limit': limit,
            'pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"❌ Error fetching reports: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch reports'
        }), 500

@app.route('/api/reports', methods=['POST'])
def submit_report():
    """Submit a new disaster report to MongoDB"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['disasterType', 'description', 'location', 'name']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create new report document
        report = {
            'name': data['name'].strip(),
            'location': data['location'].strip(),
            'disasterType': data['disasterType'],
            'description': data['description'].strip(),
            'coordinates': data.get('coordinates', {}),
            'address': data.get('address', ''),
            'photos': data.get('photos', []),
            'timestamp': datetime.utcnow(),
            'status': 'pending',
            'verified': False,
            'severity': data.get('severity', 'medium'),
            'contactInfo': data.get('contactInfo', ''),
            'reporterIP': request.remote_addr,
            'userAgent': request.headers.get('User-Agent', '')
        }
        
        # Insert into MongoDB
        result = reports_collection.insert_one(report)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': 'Report submitted successfully',
                'reportId': str(result.inserted_id)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save report'
            }), 500
        
    except Exception as e:
        print(f"❌ Error submitting report: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to submit report'
        }), 500

@app.route('/api/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report by ID"""
    try:
        if not ObjectId.is_valid(report_id):
            return jsonify({
                'success': False,
                'error': 'Invalid report ID'
            }), 400
        
        report = reports_collection.find_one({'_id': ObjectId(report_id)})
        
        if report:
            return jsonify({
                'success': True,
                'report': serialize_mongo_doc(report)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Report not found'
            }), 404
            
    except Exception as e:
        print(f"❌ Error fetching report: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch report'
        }), 500

@app.route('/api/reports/<report_id>/status', methods=['PATCH'])
def update_report_status(report_id):
    """Update report status (for admin use)"""
    try:
        if not ObjectId.is_valid(report_id):
            return jsonify({
                'success': False,
                'error': 'Invalid report ID'
            }), 400
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'verified', 'resolved', 'dismissed']:
            return jsonify({
                'success': False,
                'error': 'Invalid status'
            }), 400
        
        result = reports_collection.update_one(
            {'_id': ObjectId(report_id)},
            {
                '$set': {
                    'status': new_status,
                    'lastUpdated': datetime.utcnow(),
                    'verified': new_status in ['verified', 'resolved']
                }
            }
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': f'Report status updated to {new_status}'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Report not found or status unchanged'
            }), 404
            
    except Exception as e:
        print(f"❌ Error updating report status: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to update report status'
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Handle login requests with MongoDB user verification"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        user_type = data.get('userType', 'citizen')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Find user in MongoDB
        user = users_collection.find_one({'email': email})
        
        if user and check_password(password, user['password']):
            # Update last login
            users_collection.update_one(
                {'_id': user['_id']},
                {'$set': {'lastLogin': datetime.utcnow()}}
            )
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': str(user['_id']),
                    'email': user['email'],
                    'name': user['fullName'],
                    'type': user.get('userType', 'citizen'),
                    'verified': user.get('verified', False)
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({
            'success': False,
            'error': 'Login failed'
        }), 500

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    """Handle registration requests with MongoDB user storage"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        email = data['email'].lower().strip()
        full_name = data['fullName'].strip()
        password = data['password']
        phone = data.get('phone', '').strip()
        user_type = data.get('userType', 'citizen')
        
        # Validate email format
        if '@' not in email or len(email.split('@')) != 2:
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }), 400
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User with this email already exists'
            }), 409
        
        # Create new user document
        user = {
            'fullName': full_name,
            'email': email,
            'password': hash_password(password),
            'phone': phone,
            'userType': user_type,
            'verified': False,
            'createdAt': datetime.utcnow(),
            'lastLogin': None,
            'active': True
        }
        
        # Insert user into MongoDB
        result = users_collection.insert_one(user)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': 'Registration successful',
                'user': {
                    'id': str(result.inserted_id),
                    'name': full_name,
                    'email': email,
                    'type': user_type
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create user account'
            }), 500
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({
            'success': False,
            'error': 'Registration failed'
        }), 500

@app.route('/api/auth/verify/<user_id>', methods=['POST'])
def verify_user(user_id):
    """Verify user account (admin function)"""
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({
                'success': False,
                'error': 'Invalid user ID'
            }), 400
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'verified': True,
                    'verifiedAt': datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': 'User verified successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
    except Exception as e:
        print(f"❌ User verification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to verify user'
        }), 500

@app.route('/api/contact', methods=['POST'])
def api_contact():
    """Handle contact form submissions with MongoDB storage"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['contactName', 'contactEmail', 'subject', 'message']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create contact document
        contact = {
            'name': data['contactName'].strip(),
            'email': data['contactEmail'].lower().strip(),
            'subject': data['subject'].strip(),
            'message': data['message'].strip(),
            'timestamp': datetime.utcnow(),
            'status': 'new',
            'replied': False,
            'adminEmail': ADMIN_EMAIL,  # Include admin email for reference
            'sentToAdmin': True,  # Mark as sent to admin
            'ipAddress': request.remote_addr,
            'userAgent': request.headers.get('User-Agent', '')
        }
        
        # Validate email format
        if '@' not in contact['email']:
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Insert into MongoDB
        result = contacts_collection.insert_one(contact)
        
        if result.inserted_id:
            # Send email to admin
            email_sent = send_email_to_admin(
                subject=contact['subject'],
                sender_name=contact['name'],
                sender_email=contact['email'],
                message_body=contact['message'],
                contact_subject=contact['subject']
            )
            
            # Update contact record with email status
            contacts_collection.update_one(
                {'_id': result.inserted_id},
                {'$set': {'emailSent': email_sent, 'emailSentAt': datetime.utcnow() if email_sent else None}}
            )
            
            success_message = f'Thank you for your message! It has been sent to our admin team at {ADMIN_EMAIL}.'
            if email_sent:
                success_message += ' You should receive a response within 24-48 hours.'
            else:
                success_message += ' Your message has been saved and our admin will be notified.'
            
            return jsonify({
                'success': True,
                'message': success_message,
                'contactId': str(result.inserted_id),
                'adminEmail': ADMIN_EMAIL,
                'emailDelivered': email_sent
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save contact message'
            }), 500
        
    except Exception as e:
        print(f"❌ Contact form error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to send message'
        }), 500

@app.route('/api/contact', methods=['GET'])
def get_contacts():
    """Get all contact messages (admin function)"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        skip = (page - 1) * limit
        
        # Filter by status if provided
        status_filter = request.args.get('status', 'all')
        query = {} if status_filter == 'all' else {'status': status_filter}
        
        # Query contacts from MongoDB
        contacts_cursor = contacts_collection.find(query).sort('timestamp', -1).skip(skip).limit(limit)
        contacts = [serialize_mongo_doc(contact) for contact in contacts_cursor]
        
        # Get total count
        total_count = contacts_collection.count_documents(query)
        
        return jsonify({
            'success': True,
            'contacts': contacts,
            'total': total_count,
            'page': page,
            'limit': limit,
            'pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"❌ Error fetching contacts: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch contact messages'
        }), 500
# Admin Configuration Endpoints
@app.route('/api/admin/email', methods=['GET'])
def get_admin_email():
    """Get admin email for frontend display and contact purposes"""
    return jsonify({
        'success': True,
        'adminEmail': ADMIN_EMAIL,
        'systemEmail': SYSTEM_EMAIL,
        'contactNote': 'All contact form messages are sent directly to our admin team'
    })

# Additional API endpoints
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        # Get report statistics
        total_reports = reports_collection.count_documents({})
        pending_reports = reports_collection.count_documents({'status': 'pending'})
        verified_reports = reports_collection.count_documents({'status': 'verified'})
        resolved_reports = reports_collection.count_documents({'status': 'resolved'})
        
        # Get user statistics
        total_users = users_collection.count_documents({})
        verified_users = users_collection.count_documents({'verified': True})
        
        # Get contact statistics
        total_contacts = contacts_collection.count_documents({})
        new_contacts = contacts_collection.count_documents({'status': 'new'})
        
        # Get disaster type distribution
        disaster_types = list(reports_collection.aggregate([
            {'$group': {'_id': '$disasterType', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]))
        
        return jsonify({
            'success': True,
            'stats': {
                'reports': {
                    'total': total_reports,
                    'pending': pending_reports,
                    'verified': verified_reports,
                    'resolved': resolved_reports
                },
                'users': {
                    'total': total_users,
                    'verified': verified_users
                },
                'contacts': {
                    'total': total_contacts,
                    'new': new_contacts
                },
                'disaster_types': disaster_types
            }
        })
        
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch statistics'
        }), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users (admin function)"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        skip = (page - 1) * limit
        
        # Query users from MongoDB (exclude password field)
        users_cursor = users_collection.find(
            {}, 
            {'password': 0}  # Exclude password field
        ).sort('createdAt', -1).skip(skip).limit(limit)
        
        users = [serialize_mongo_doc(user) for user in users_cursor]
        
        # Get total count
        total_count = users_collection.count_documents({})
        
        return jsonify({
            'success': True,
            'users': users,
            'total': total_count,
            'page': page,
            'limit': limit,
            'pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch users'
        }), 500

# Live Disasters API endpoint
@app.route('/api/live-disasters', methods=['GET'])
def get_live_disasters():
    """Get live disasters with location data for map visualization"""
    try:
        # Get recent disasters (last 24 hours) that are still active
        from datetime import datetime, timedelta
        
        # Calculate 24 hours ago
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        # Query for recent, active disasters with location data
        pipeline = [
            {
                '$match': {
                    'timestamp': {'$gte': twenty_four_hours_ago},
                    'location': {'$exists': True, '$ne': ''}
                }
            },
            {
                '$sort': {'timestamp': -1}
            },
            {
                '$limit': 50  # Limit to 50 most recent disasters
            }
        ]
        
        reports = list(mongo.db.reports.aggregate(pipeline))
        
        # Convert ObjectId to string and add coordinates
        live_disasters = []
        for report in reports:
            report['_id'] = str(report['_id'])
            
            # Convert timestamp to ISO format string for JavaScript compatibility
            if 'timestamp' in report and report['timestamp']:
                report['timestamp'] = report['timestamp'].isoformat() + 'Z'
            
            # Add mock coordinates based on location (in production, you'd geocode these)
            coordinates = get_coordinates_for_location(report['location'])
            if coordinates:
                report['coordinates'] = coordinates
            
            # Determine severity based on disaster type and description
            report['severity'] = determine_severity(report)
            
            live_disasters.append(report)
        
        print(f"📍 Returning {len(live_disasters)} live disasters")
        return jsonify(live_disasters)
        
    except Exception as e:
        print(f"❌ Error fetching live disasters: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch live disasters',
            'details': str(e)
        }), 500

def get_coordinates_for_location(location):
    """Get approximate coordinates for Indian locations (mock geocoding)"""
    # This is a mock function. In production, use a geocoding service
    location_coords = {
        # Major Indian cities and states
        'mumbai': [19.0760, 72.8777],
        'delhi': [28.7041, 77.1025],
        'bangalore': [12.9716, 77.5946],
        'kolkata': [22.5726, 88.3639],
        'chennai': [13.0827, 80.2707],
        'hyderabad': [17.3850, 78.4867],
        'pune': [18.5204, 73.8567],
        'ahmedabad': [23.0225, 72.5714],
        'jaipur': [26.9124, 75.7873],
        'lucknow': [26.8467, 80.9462],
        'kanpur': [26.4499, 80.3319],
        'nagpur': [21.1458, 79.0882],
        'indore': [22.7196, 75.8577],
        'thane': [19.2183, 72.9781],
        'bhopal': [23.2599, 77.4126],
        'visakhapatnam': [17.6868, 83.2185],
        'pimpri': [18.6298, 73.7997],
        'patna': [25.5941, 85.1376],
        'vadodara': [22.3072, 73.1812],
        'ghaziabad': [28.6692, 77.4538],
        'ludhiana': [30.9010, 75.8573],
        'agra': [27.1767, 78.0081],
        'nashik': [19.9975, 73.7898],
        'faridabad': [28.4089, 77.3178],
        'meerut': [28.9845, 77.7064],
        'rajkot': [22.3039, 70.8022],
        'kalyan': [19.2437, 73.1355],
        'vasai': [19.4912, 72.8054],
        'varanasi': [25.3176, 82.9739],
        'srinagar': [34.0837, 74.7973],
        'aurangabad': [19.8762, 75.3433],
        'dhanbad': [23.7957, 86.4304],
        'amritsar': [31.6340, 74.8723],
        'navi mumbai': [19.0330, 73.0297],
        'allahabad': [25.4358, 81.8463],
        'ranchi': [23.3441, 85.3096],
        'howrah': [22.5958, 88.2636],
        'coimbatore': [11.0168, 76.9558],
        'jabalpur': [23.1815, 79.9864],
        'gwalior': [26.2183, 78.1828],
        'vijayawada': [16.5062, 80.6480],
        'jodhpur': [26.2389, 73.0243],
        'madurai': [9.9252, 78.1198],
        'raipur': [21.2514, 81.6296],
        'kota': [25.2138, 75.8648],
        'chandigarh': [30.7333, 76.7794],
        'guwahati': [26.1445, 91.7362],
        'solapur': [17.6599, 75.9064],
        'hubli': [15.3647, 75.1240],
        'tiruchirappalli': [10.7905, 78.7047],
        'bareilly': [28.3670, 79.4304],
        'mysore': [12.2958, 76.6394],
        'tiruppur': [11.1085, 77.3411],
        'gurgaon': [28.4595, 77.0266],
        'aligarh': [27.8974, 78.0880],
        'jalandhar': [31.3260, 75.5762],
        'bhubaneswar': [20.2961, 85.8245],
        'salem': [11.6643, 78.1460],
        'warangal': [17.9689, 79.5941],
        'mira': [19.2952, 72.8679],
        'bhiwandi': [19.2812, 73.0482],
        'thiruvananthapuram': [8.5241, 76.9366],
        'bhilai': [21.2167, 81.3833],
        'cuttack': [20.4625, 85.8828],
        'firozabad': [27.1592, 78.3957],
        'kochi': [9.9312, 76.2673],
        'bhavnagar': [21.7645, 72.1519],
        'dehradun': [30.3165, 78.0322],
        'durgapur': [23.5204, 87.3119],
        'asansol': [23.6739, 86.9524],
        'nanded': [19.1383, 77.2975],
        'kolhapur': [16.7050, 74.2433],
        'ajmer': [26.4499, 74.6399],
        'gulbarga': [17.3297, 76.8343],
        'jamnagar': [22.4707, 70.0577],
        'ujjain': [23.1765, 75.7885],
        'loni': [28.7333, 77.2833],
        'siliguri': [26.7271, 88.3953],
        'jhansi': [25.4484, 78.5685],
        'ulhasnagar': [19.2183, 73.1581],
        'nellore': [14.4426, 79.9865],
        'jammu': [32.7266, 74.8570],
        'sangli': [16.8524, 74.5815],
        'belgaum': [15.8497, 74.4977],
        'mangalore': [12.9141, 74.8560],
        'ambattur': [13.1143, 80.1548],
        'tirunelveli': [8.7139, 77.7567],
        'malegaon': [20.5579, 74.5287],
        'gaya': [24.7914, 85.0002]
    }
    
    # Try to find coordinates for the location
    location_lower = location.lower()
    
    # Direct match
    if location_lower in location_coords:
        return location_coords[location_lower]
    
    # Try partial matches
    for city, coords in location_coords.items():
        if city in location_lower or location_lower in city:
            return coords
    
    # If no match found, return random coordinates within India
    import random
    # India bounding box: roughly 8°N to 37°N, 68°E to 97°E
    lat = random.uniform(8.0, 37.0)
    lng = random.uniform(68.0, 97.0)
    return [lat, lng]

def determine_severity(report):
    """Determine disaster severity based on type and description"""
    disaster_type = report.get('disasterType', '').lower()
    description = report.get('description', '').lower()
    
    # High severity indicators
    high_severity_keywords = ['major', 'severe', 'massive', 'catastrophic', 'emergency', 'critical', 'death', 'casualties', 'evacuation']
    medium_severity_keywords = ['moderate', 'significant', 'considerable', 'damage', 'injured', 'affected']
    
    # Check for high severity keywords
    for keyword in high_severity_keywords:
        if keyword in description:
            return 'high'
    
    # Check for medium severity keywords
    for keyword in medium_severity_keywords:
        if keyword in description:
            return 'medium'
    
    # Disaster type based severity
    if disaster_type in ['earthquake', 'cyclone', 'fire']:
        return 'high'
    elif disaster_type in ['flood', 'landslide']:
        return 'medium'
    else:
        return 'low'

# Database connection test endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify database connection"""
    try:
        # Test MongoDB connection
        mongo.db.command('ping')
        
        return jsonify({
            'success': True,
            'message': 'Application and database are healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'MongoDB connected'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Database connection failed',
            'details': str(e)
        }), 503

@app.route('/api/test-email', methods=['POST', 'GET'])
def test_email():
    """Test email configuration by sending a test email"""
    try:
        # Print current configuration for debugging
        print("🔧 EMAIL CONFIGURATION DEBUG:")
        print(f"   MAIL_SERVER: {app.config['MAIL_SERVER']}")
        print(f"   MAIL_PORT: {app.config['MAIL_PORT']}")
        print(f"   MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
        print(f"   MAIL_PASSWORD: {'SET' if app.config['MAIL_PASSWORD'] else 'NOT SET'}")
        print(f"   ADMIN_EMAIL: {ADMIN_EMAIL}")
        
        # Create test message
        test_result = send_email_to_admin(
            subject="Email Configuration Test",
            sender_name="System Test",
            sender_email="test@system.local",
            message_body="This is a test email to verify the email configuration is working correctly. If you receive this, your email setup is functional!",
            contact_subject="technical"
        )
        
        if test_result:
            return jsonify({
                'success': True,
                'message': f'Test email sent successfully to {ADMIN_EMAIL}',
                'emailDelivered': True,
                'adminEmail': ADMIN_EMAIL
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to send test email - check server logs for details',
                'emailDelivered': False,
                'adminEmail': ADMIN_EMAIL,
                'configValid': email_config_valid,
                'passwordSet': bool(app.config['MAIL_PASSWORD'])
            }), 500
            
    except Exception as e:
        print(f"❌ Test email error: {e}")
        return jsonify({
            'success': False,
            'error': f'Test email failed: {str(e)}',
            'emailDelivered': False
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Disaster Alert System with MongoDB...")
    print("📍 Open your browser and go to: http://localhost:5000")
    print("�️  MongoDB URI:", app.config['MONGO_URI'])
    print("�🛑 Press Ctrl+C to stop the server")
    
    try:
        # Test database connection
        mongo.db.command('ping')
        print("✅ MongoDB connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("⚠️  Make sure MongoDB is running on your system")
    
    # Run the Flask app with better configuration
    try:
        app.run(
            host='127.0.0.1',  # Use localhost only to avoid socket issues
            port=5000,         # Default Flask port
            debug=True,        # Enable debug mode for development
            use_reloader=False, # Disable reloader to prevent socket conflicts
            threaded=True      # Enable threading for better performance
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Server error: {e}")
        print("Try restarting the application")