#!/usr/bin/env python3
"""
MongoDB Setup Script for Disaster Alert System
This script helps set up the MongoDB database with initial data and indexes.
"""

from pymongo import MongoClient
from datetime import datetime
import bcrypt
import json
import os

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/disaster_alert_db')
DATABASE_NAME = 'disaster_alert_db'

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def setup_database():
    """Set up MongoDB database with initial data and indexes"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print("🔌 Connecting to MongoDB...")
        print(f"📦 Database: {DATABASE_NAME}")
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Collections
        reports_collection = db.reports
        users_collection = db.users
        contacts_collection = db.contacts
        
        # Create indexes
        print("📊 Creating database indexes...")
        
        # Reports indexes
        reports_collection.create_index([("timestamp", -1)])
        reports_collection.create_index([("status", 1)])
        reports_collection.create_index([("disasterType", 1)])
        reports_collection.create_index([("location", "text")])
        reports_collection.create_index([("verified", 1)])
        
        # Users indexes
        users_collection.create_index([("email", 1)], unique=True)
        users_collection.create_index([("createdAt", -1)])
        users_collection.create_index([("verified", 1)])
        
        # Contacts indexes
        contacts_collection.create_index([("timestamp", -1)])
        contacts_collection.create_index([("status", 1)])
        contacts_collection.create_index([("email", 1)])
        
        print("✅ Database indexes created successfully!")
        
        # Create sample admin users if they don't exist
        admin_users = [
            {
                'email': 'admin@disaster-alert.com',
                'fullName': 'System Administrator',
                'password': 'admin123'
            },
            {
                'email': 'smartindiahackathon72@gmail.com',
                'fullName': 'Smart India Hackathon Admin',
                'password': 'smartindia12@'
            }
        ]
        
        for admin_data in admin_users:
            existing_admin = users_collection.find_one({"email": admin_data['email']})
            
            if not existing_admin:
                admin_user = {
                    'fullName': admin_data['fullName'],
                    'email': admin_data['email'],
                    'password': hash_password(admin_data['password']),
                    'phone': '+1234567890',
                    'userType': 'admin',
                    'verified': True,
                    'createdAt': datetime.utcnow(),
                    'lastLogin': None,
                    'active': True
                }
                
                result = users_collection.insert_one(admin_user)
                print(f"👤 Admin user created: {admin_data['email']} (password: {admin_data['password']})")
                print(f"🆔 Admin ID: {result.inserted_id}")
            else:
                print(f"👤 Admin user already exists: {admin_data['email']}")
        
        # Add sample disaster reports if collection is empty
        if reports_collection.count_documents({}) == 0:
            print("📄 Adding sample disaster reports...")
            
            sample_reports = [
                {
                    'name': 'John Doe',
                    'location': 'Downtown Area, Mumbai',
                    'disasterType': 'flood',
                    'description': 'Heavy flooding in the downtown area due to continuous rainfall. Roads are waterlogged and vehicles are stranded.',
                    'coordinates': {'lat': 19.0760, 'lng': 72.8777},
                    'address': 'Downtown Area, Mumbai, Maharashtra, India',
                    'photos': [],
                    'timestamp': datetime.utcnow(),
                    'status': 'verified',
                    'verified': True,
                    'severity': 'high',
                    'contactInfo': 'john.doe@email.com',
                    'reporterIP': '192.168.1.1',
                    'userAgent': 'Sample Report'
                },
                {
                    'name': 'Jane Smith',
                    'location': 'Residential Area, Delhi',
                    'disasterType': 'fire',
                    'description': 'Building fire reported in residential complex. Fire department has been notified.',
                    'coordinates': {'lat': 28.7041, 'lng': 77.1025},
                    'address': 'Residential Area, Delhi, India',
                    'photos': [],
                    'timestamp': datetime.utcnow(),
                    'status': 'pending',
                    'verified': False,
                    'severity': 'high',
                    'contactInfo': 'jane.smith@email.com',
                    'reporterIP': '192.168.1.2',
                    'userAgent': 'Sample Report'
                },
                {
                    'name': 'Mike Johnson',
                    'location': 'Highway 101, Bangalore',
                    'disasterType': 'earthquake',
                    'description': 'Minor earthquake felt in the area. No major damage reported but people are concerned.',
                    'coordinates': {'lat': 12.9716, 'lng': 77.5946},
                    'address': 'Highway 101, Bangalore, Karnataka, India',
                    'photos': [],
                    'timestamp': datetime.utcnow(),
                    'status': 'resolved',
                    'verified': True,
                    'severity': 'medium',
                    'contactInfo': 'mike.johnson@email.com',
                    'reporterIP': '192.168.1.3',
                    'userAgent': 'Sample Report'
                }
            ]
            
            result = reports_collection.insert_many(sample_reports)
            print(f"✅ Added {len(result.inserted_ids)} sample reports")
        
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 Summary:")
        print(f"   • Reports: {reports_collection.count_documents({})}")
        print(f"   • Users: {users_collection.count_documents({})}")
        print(f"   • Contacts: {contacts_collection.count_documents({})}")
        print(f"\n🔐 Admin Login Options:")
        print(f"   Email: admin@disaster-alert.com")
        print(f"   Password: admin123")
        print(f"   OR")
        print(f"   Email: smartindiahackathon72@gmail.com")
        print(f"   Password: smartindia12@")
        print(f"\n🌐 Start the application with: python app.py")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🛠️  MongoDB Setup for Disaster Alert System")
    print("=" * 50)
    
    setup_database()