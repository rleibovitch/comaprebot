from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import os
import pdfplumber
import openai
from datetime import datetime
import jwt
from passlib.context import CryptContext
import uvicorn

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/comparebot")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

# OpenAI setup
openai.api_key = os.getenv("OPENAI_API_KEY")

# Database Models
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String(255), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    report_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class LoginRequest(BaseModel):
    client_id: str
    password: str

class LoginResponse(BaseModel):
    token: str
    client_id: str

class ComparisonResponse(BaseModel):
    summary: str
    highlights: List[str]
    week_number: int
    previous_week_number: int
    created_at: str

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="Compare Bot API",
    description="Weekly Report Comparison API by Horseradish AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to verify JWT token
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        client_id = payload.get("client_id")
        if client_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return client_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Helper functions
def extract_text_from_pdf(file) -> str:
    """Extract text from PDF file using pdfplumber"""
    try:
        with pdfplumber.open(file) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def get_openai_comparison(week_n_text: str, week_n_minus_1_text: str, week_number: int) -> dict:
    """Get AI comparison using OpenAI API"""
    try:
        prompt = f"""
        Compare Week {week_number} vs Week {week_number - 1} reports. 
        
        Week {week_number - 1} Report:
        {week_n_minus_1_text[:2000]}
        
        Week {week_number} Report:
        {week_n_text[:2000]}
        
        Please provide:
        1. A comprehensive summary highlighting key changes, anomalies, and trends
        2. A list of 3-5 key highlights in bullet points
        
        Format your response as JSON:
        {{
            "summary": "Your detailed summary here...",
            "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
        }}
        """
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert business analyst. Analyze weekly reports and provide clear, actionable insights."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        # Parse JSON response
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI comparison: {str(e)}")

# API Routes
@app.get("/")
async def root():
    return {"message": "Compare Bot API by Horseradish AI", "status": "running"}

@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Simple authentication for MVP - in production, use proper user management"""
    # For MVP, accept any client_id with password "demo123"
    if request.password != "demo123":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token
    token = jwt.encode(
        {"client_id": request.client_id, "exp": datetime.utcnow().timestamp() + 86400},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return LoginResponse(token=token, client_id=request.client_id)

@app.post("/upload_report")
async def upload_report(
    client_id: str = Form(...),
    week_number: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    verified_client_id: str = Depends(verify_token)
):
    """Upload and process a weekly report PDF"""
    
    # Verify client_id matches token
    if client_id != verified_client_id:
        raise HTTPException(status_code=403, detail="Client ID mismatch")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check if report already exists for this week
    existing_report = db.query(Report).filter(
        Report.client_id == client_id,
        Report.week_number == week_number
    ).first()
    
    if existing_report:
        raise HTTPException(status_code=400, detail=f"Report for week {week_number} already exists")
    
    try:
        # Extract text from PDF
        file.file.seek(0)  # Reset file pointer
        report_text = extract_text_from_pdf(file.file)
        
        if not report_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
        
        # Save to database
        report = Report(
            client_id=client_id,
            week_number=week_number,
            report_text=report_text
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "message": "Report uploaded successfully",
            "report_id": report.id,
            "week_number": week_number,
            "text_length": len(report_text)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing report: {str(e)}")

@app.get("/compare_reports", response_model=ComparisonResponse)
async def compare_reports(
    client_id: str = Query(...),
    week_number: int = Query(...),
    db: Session = Depends(get_db),
    verified_client_id: str = Depends(verify_token)
):
    """Get AI-powered comparison between consecutive weekly reports"""
    
    # Verify client_id matches token
    if client_id != verified_client_id:
        raise HTTPException(status_code=403, detail="Client ID mismatch")
    
    # Get current week report
    current_report = db.query(Report).filter(
        Report.client_id == client_id,
        Report.week_number == week_number
    ).first()
    
    if not current_report:
        raise HTTPException(status_code=404, detail=f"No report found for week {week_number}")
    
    # Get previous week report
    previous_report = db.query(Report).filter(
        Report.client_id == client_id,
        Report.week_number == week_number - 1
    ).first()
    
    if not previous_report:
        raise HTTPException(status_code=404, detail=f"No report found for week {week_number - 1}")
    
    try:
        # Get AI comparison
        comparison_result = get_openai_comparison(
            current_report.report_text,
            previous_report.report_text,
            week_number
        )
        
        return ComparisonResponse(
            summary=comparison_result["summary"],
            highlights=comparison_result["highlights"],
            week_number=week_number,
            previous_week_number=week_number - 1,
            created_at=current_report.created_at.isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating comparison: {str(e)}")

@app.get("/reports")
async def list_reports(
    client_id: str = Query(...),
    db: Session = Depends(get_db),
    verified_client_id: str = Depends(verify_token)
):
    """List all reports for a client"""
    
    if client_id != verified_client_id:
        raise HTTPException(status_code=403, detail="Client ID mismatch")
    
    reports = db.query(Report).filter(Report.client_id == client_id).order_by(Report.week_number.desc()).all()
    
    return [
        {
            "id": report.id,
            "week_number": report.week_number,
            "created_at": report.created_at.isoformat(),
            "text_length": len(report.report_text)
        }
        for report in reports
    ]

# For Vercel deployment
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
