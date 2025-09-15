#!/usr/bin/env python3
"""
Script to remove the old admin user from MongoDB
"""

from pymongo import MongoClient
import os

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/disaster_alert_db')
DATABASE_NAME = 'disaster_alert_db'

def remove_old_admin():
    """Remove the old admin user from the database"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        users_collection = db.users
        
        print("🔌 Connecting to MongoDB...")
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Find and remove the old admin user
        old_admin_email = "admin@disaster-alert.com"
        
        # Check if the old admin exists
        old_admin = users_collection.find_one({"email": old_admin_email})
        
        if old_admin:
            # Delete the old admin user
            result = users_collection.delete_one({"email": old_admin_email})
            
            if result.deleted_count > 0:
                print(f"✅ Successfully removed old admin: {old_admin_email}")
                print(f"🗑️  Deleted {result.deleted_count} user record")
            else:
                print(f"❌ Failed to remove old admin: {old_admin_email}")
        else:
            print(f"ℹ️  Old admin user not found: {old_admin_email}")
        
        # Verify remaining admin users
        remaining_admins = list(users_collection.find({"userType": "admin"}, {"password": 0}))
        
        print(f"\n📋 Remaining admin users ({len(remaining_admins)}):")
        for admin in remaining_admins:
            print(f"   👤 {admin['fullName']} - {admin['email']}")
        
        print(f"\n📊 Total users in database: {users_collection.count_documents({})}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error removing old admin: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🗑️  Removing Old Admin User")
    print("=" * 30)
    
    remove_old_admin()