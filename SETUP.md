# Setup Instructions

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

## Local Development Setup

### 1. Clone and Navigate to Project

```bash
cd Authenticai_psichoapp
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL
# - SUPABASE_KEY
# - SUPABASE_SERVICE_KEY
# - GEMINI_API_KEY
# - JWT_SECRET (generate a random string)

# Run database migrations (in Supabase SQL Editor, run supabase/schema.sql)

# Start the server
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL (http://localhost:8000 for local dev)

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the SQL script
5. Note your project URL and API keys

### 5. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your backend `.env` file

## Testing the Application

1. **Start Backend**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Signup**
   - Navigate to http://localhost:5173
   - Click "Sign up"
   - Create a client account
   - Create a therapist account (optional)

4. **Test Journal Entry**
   - Log in as a client
   - Click "New Journal Entry"
   - Write an entry and save
   - Check that AI analysis appears

5. **Test Therapist Dashboard**
   - Log in as a therapist
   - View client list and journal entries
   - Check analytics dashboard

## Project Structure

```
Authenticai_psichoapp/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API routes
│   │   ├── services/    # AI service
│   │   ├── utils/       # Auth, audit utilities
│   │   └── models.py    # Pydantic models
│   ├── main.py          # FastAPI app
│   └── requirements.txt
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── contexts/    # React contexts
│   └── package.json
├── supabase/            # Database schema
│   └── schema.sql
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get token

### Journal
- `POST /api/journal` - Create journal entry
- `GET /api/journal/me` - Get user's journal entries
- `GET /api/journal/{entry_id}` - Get specific entry

### AI
- `POST /api/ai/analyze_mood` - Analyze mood from text
- `POST /api/ai/affirmation` - Generate daily affirmation
- `GET /api/ai/activities` - Get activity suggestions

### Therapist
- `GET /api/therapist/dashboard` - Therapist dashboard data
- `GET /api/therapist/clients` - List all clients
- `GET /api/therapist/clients/{client_id}/journals` - Get client journals

### Feedback
- `POST /api/feedback` - Create feedback message
- `GET /api/feedback/me` - Get user's feedback

## Common Issues

### Backend won't start
- Check that all environment variables are set
- Verify database connection
- Ensure port 8000 is not in use

### Frontend can't connect to backend
- Check CORS settings in backend
- Verify VITE_API_URL is correct
- Check browser console for errors

### Database errors
- Ensure schema.sql has been executed
- Check RLS policies are enabled
- Verify user has proper permissions

### AI analysis not working
- Verify GEMINI_API_KEY is set
- Check API quota/limits
- Review backend logs for errors

## Next Steps

- Review DEPLOYMENT.md for production deployment
- Set up monitoring and logging
- Configure backup strategies
- Review security best practices
- Test with real users

