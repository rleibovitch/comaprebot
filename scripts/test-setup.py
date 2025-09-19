#!/usr/bin/env python3
"""
Test script to verify Compare Bot setup
Run this to check if everything is configured correctly
"""

import os
import sys
import requests
import json
from pathlib import Path

def test_environment_variables():
    """Test if required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = [
        'DATABASE_URL',
        'OPENAI_API_KEY',
        'JWT_SECRET'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        import psycopg2
        database_url = os.getenv("DATABASE_URL")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result[0] == 1:
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database query failed")
            return False
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_openai_connection():
    """Test OpenAI API connection"""
    print("🔍 Testing OpenAI API connection...")
    
    try:
        import openai
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Test with a simple completion
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'Hello'"}],
            max_tokens=5
        )
        
        if response.choices[0].message.content:
            print("✅ OpenAI API connection successful")
            return True
        else:
            print("❌ OpenAI API returned empty response")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI API connection failed: {e}")
        return False

def test_backend_api():
    """Test if backend API is running"""
    print("🔍 Testing backend API...")
    
    try:
        api_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
        response = requests.get(f"{api_url}/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "Compare Bot API" in data.get("message", ""):
                print("✅ Backend API is running")
                return True
            else:
                print("❌ Backend API returned unexpected response")
                return False
        else:
            print(f"❌ Backend API returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend API connection failed: {e}")
        print("   Make sure to run 'npm run dev' or start the backend server")
        return False

def test_frontend_build():
    """Test if frontend can be built"""
    print("🔍 Testing frontend build...")
    
    try:
        import subprocess
        import os
        
        # Change to frontend directory
        frontend_dir = Path(__file__).parent.parent / "frontend"
        os.chdir(frontend_dir)
        
        # Run build command
        result = subprocess.run(
            ["npm", "run", "build"],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Frontend build successful")
            return True
        else:
            print(f"❌ Frontend build failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend build test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Compare Bot Setup Test")
    print("=" * 40)
    
    tests = [
        test_environment_variables,
        test_database_connection,
        test_openai_connection,
        test_backend_api,
        test_frontend_build
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
        print()
    
    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
