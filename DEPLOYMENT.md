# Compare Bot Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
1. Vercel account
2. Neon database account
3. OpenAI API key

### Step 1: Set up Neon Database
1. Create a new project in [Neon Console](https://console.neon.tech/)
2. Copy your connection string
3. Run the database initialization:
```bash
cd database
python3 init.py
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your Neon database connection string
   - `NEON_DATABASE_URL`: Same as DATABASE_URL
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `JWT_SECRET`: A random secret string for JWT signing
   - `NEXT_PUBLIC_API_URL`: Your Vercel API URL (will be provided after deployment)

### Step 3: Configure Environment Variables
In your Vercel dashboard, add these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon database connection string | `postgresql://user:pass@host/db` |
| `NEON_DATABASE_URL` | Same as DATABASE_URL | `postgresql://user:pass@host/db` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `JWT_SECRET` | JWT signing secret | `your-random-secret-key` |
| `NEXT_PUBLIC_API_URL` | Your Vercel API URL | `https://your-app.vercel.app/api` |

### Step 4: Test Deployment
1. Visit your deployed URL
2. Use demo credentials: `client_001` / `demo123`
3. Upload a test PDF report
4. Check the comparison results

## Local Development

### Quick Start
```bash
# Clone and setup
git clone <your-repo>
cd compare-bot

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development servers
npm run dev
```

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Set up environment
cp env.example .env
# Edit .env with your credentials

# Initialize database
cd database
python3 init.py
cd ..

# Start development
npm run dev
```

## Project Structure

```
compare-bot/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── contexts/         # React contexts
├── backend/              # FastAPI backend
│   ├── api/             # Vercel serverless functions
│   └── main.py          # Main FastAPI app
├── database/            # Database schemas and scripts
├── scripts/             # Setup and deployment scripts
└── vercel.json          # Vercel configuration
```

## API Endpoints

### Authentication
- `POST /auth/login` - Client login

### Reports
- `POST /upload_report` - Upload weekly PDF report
- `GET /compare_reports` - Get AI comparison results
- `GET /reports` - List client reports

## Database Schema

```sql
-- Reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    week_number INTEGER NOT NULL,
    report_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, week_number)
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` environment variable
   - Ensure your Neon database is running
   - Verify network access from Vercel

2. **OpenAI API Error**
   - Verify your `OPENAI_API_KEY` is correct
   - Check your OpenAI account has credits
   - Ensure the API key has proper permissions

3. **PDF Upload Issues**
   - Ensure the file is a valid PDF
   - Check file size limits (Vercel has 4.5MB limit for serverless functions)
   - Verify the PDF contains extractable text

4. **Authentication Issues**
   - Check JWT_SECRET is set correctly
   - Verify client_id matches between frontend and backend
   - Ensure tokens haven't expired

### Support
For issues or questions, contact the Horseradish AI team.

Built with ❤️ by Horseradish AI
