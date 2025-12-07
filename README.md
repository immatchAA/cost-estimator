# ArchiQuest - Architectural AI Cost Estimator

A full-stack web application for architectural cost estimation with AI-powered material pricing.

## 📖 About

This project is a capstone research that aims to revolutionize architectural cost estimation through AI-powered material pricing and intelligent cost analysis. The system provides educators and students with a comprehensive platform for learning and practicing cost estimation in architectural projects, featuring real-time material price updates, challenge-based learning, and collaborative features.

## 👥 Team

- **Richelle Villanueva**
- **Shaina Miparanum**
- **Kimmer Vargas**
- **Gerard Tac-an**
- **Kyle Ezekiel Moreno**

## 🛠️ Tech Stack

### Frontend

- **React**: ^19.1.0
- **React DOM**: ^19.1.0
- **React Router DOM**: ^7.8.0
- **Vite**: ^7.0.4
- **Tailwind CSS**: ^4.1.12
- **Supabase JS**: ^2.57.4
- **Node.js**: 18.x or higher

### Backend

- **Python**: 3.12.5
- **FastAPI**: 0.115.0
- **Uvicorn**: 0.32.0
- **Supabase**: 2.8.0
- **Pydantic**: 2.9.2

### Services

- **Supabase**: Database & Authentication
- **Google Gemini API**: AI material pricing

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. **Settings**:
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)
4. **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend.up.railway.app/api`
5. Click **Deploy**

### Backend (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. **Settings**:
   - Root Directory: `backend`
4. **Environment Variables** (Variables tab):
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```
5. Railway auto-deploys

**Important**: After backend deploys, update frontend `VITE_API_URL` in Vercel with your Railway URL.

## 👤 Sample Credentials

### Teacher

- **Email**: `teacher@archiquest.com`
- **Password**: `Teacher123!`

### Student

- **Email**: `student@archiquest.com`
- **Password**: `Student123!`

**Note**: Create these accounts via `/register` or Supabase dashboard.
