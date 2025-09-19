"""
Vercel serverless function entry point
This file is used by Vercel to handle API routes
"""

from main import app

# Export the FastAPI app for Vercel
handler = app
