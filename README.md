# AuthenticAI Wellness Journal

A HIPAA-compliant wellness journal app that bridges daily client engagement and therapist monitoring, combining journaling, mood analytics, and guided exercises.

## Tech Stack

- **Frontend**: React + Vite (Deploy to Netlify)
- **Backend**: FastAPI (Deploy to Railway)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

## Project Structure

```
Authenticai_psichoapp/
├── backend/          # FastAPI backend
├── frontend/         # React + Vite frontend
├── supabase/         # Database migrations and schema
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables (see `.env.example`)
6. Run migrations: `alembic upgrade head`
7. Start server: `uvicorn main:app --reload`

### Frontend Setup

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start dev server: `npm run dev`

### Environment Variables

#### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
ENVIRONMENT=development
```

#### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
```

## Features

### Client Features
- Journal entries (text and voice-to-text)
- Mood tracking with AI sentiment analysis
- Daily affirmations and challenges
- Progress history and insights

### Therapist Features
- Client dashboard with analytics
- Journal feed with AI summaries
- Mood trend graphs
- Feedback system for clients

## Security & Compliance

- HIPAA/GDPR compliant
- End-to-end encryption
- Role-based access control (RBAC)
- Audit logging
- Data encryption at rest and in transit

## License

Proprietary - All rights reserved

