# Compare Bot by Horseradish AI

A weekly report comparison MVP that analyzes and compares consecutive weekly reports using AI.

## Features

- **Secure Client Login**: Basic authentication for MVP
- **PDF Upload**: Upload weekly reports (Week N)
- **AI-Powered Comparison**: Compare Week N vs Week N-1 using OpenAI
- **Clean Results Display**: Text summary with optional table format

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: FastAPI (Python) with Node.js fallback
- **Database**: Neon (PostgreSQL)
- **AI**: OpenAI Assistants API with GPT-4o-mini
- **PDF Processing**: pdfplumber

## Quick Start

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cp .env.example .env
# Fill in your API keys and database credentials
```

3. Run development servers:
```bash
npm run dev
```

## Project Structure

```
compare-bot/
├── frontend/          # Next.js application
├── backend/           # FastAPI backend
├── database/          # Database schemas and migrations
└── docs/             # Documentation
```

## API Endpoints

- `POST /upload_report` - Upload weekly PDF report
- `GET /compare_reports` - Get comparison results for client

## Database Schema

```sql
reports(
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  week_number INTEGER NOT NULL,
  report_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Built with ❤️ by Horseradish AI
