# ArchiQuest - Architectural AI Cost Estimator

A full-stack web application for architectural cost estimation with AI-powered material pricing, student-teacher collaboration, and challenge management.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Deployment Instructions](#deployment-instructions)
- [Sample Credentials](#sample-credentials)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## 🛠️ Tech Stack

### Frontend

| Technology | Version |
|------------|---------|
| React | ^19.1.0 |
| React DOM | ^19.1.0 |
| React Router DOM | ^7.8.0 |
| Vite | ^7.0.4 |
| Tailwind CSS | ^4.1.12 |
| Axios | ^1.11.0 |
| Supabase JS | ^2.57.4 |
| React Icons | ^5.5.0 |
| React Markdown | ^10.1.0 |
| Date-fns | ^4.1.0 |
| Lucide React | ^0.541.0 |

**Node.js**: Recommended version 18.x or higher

### Backend

| Technology | Version |
|------------|---------|
| Python | 3.12.5 |
| FastAPI | 0.115.0 |
| Uvicorn | 0.32.0 |
| Supabase | 2.8.0 |
| Pydantic | 2.9.2 |
| Python-dotenv | 1.0.1 |
| Requests | 2.32.3 |
| Python-multipart | 0.0.12 |

### Database & Services

- **Supabase**: Database and Authentication
- **Google Gemini API**: AI-powered material pricing
- **Resend** (or Brevo): Email service (for future email verification feature)

## 🚀 Deployment Instructions

### Frontend Deployment (Vercel)

#### Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)
- Backend API URL ready

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"
   - Import your Git repository

3. **Configure Project Settings**
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add the following:
     - **Name**: `VITE_API_URL`
     - **Value**: Your backend API URL (e.g., `https://your-backend.up.railway.app/api`)
   - Add for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.up.railway.app/api` |

### Backend Deployment (Railway)

#### Prerequisites
- Railway account ([railway.app](https://railway.app))
- Git repository
- Supabase project with credentials
- Google Gemini API key

#### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. **Create New Project in Railway**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure the Service**
   - Railway will auto-detect your Python project
   - **Root Directory**: Set to `backend` (important!)
   - Railway will automatically detect `requirements.txt` and `Procfile`

4. **Set Environment Variables**
   - In Railway project, go to "Variables" tab
   - Add the following:

   **Required Variables:**
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

   **Optional Email Variables (for future verification feature):**
   ```
   RESEND_API_KEY=re_your_resend_api_key_here
   FROM_EMAIL=onboarding@resend.dev
   ```

   **Note**: Railway automatically sets the `PORT` environment variable.

5. **Deploy**
   - Railway will automatically start deploying
   - Wait for build to complete
   - Your API will be live at `https://your-project.up.railway.app`

6. **Get Your Deployment URL**
   - After deployment, Railway provides a public URL
   - Go to Settings → Generate Domain
   - Copy the generated domain

#### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to backend directory
cd backend

# Initialize Railway project
railway init

# Set environment variables
railway variables set SUPABASE_URL=your-supabase-url
railway variables set SUPABASE_KEY=your-supabase-anon-key
railway variables set GEMINI_API_KEY=your-gemini-api-key

# Deploy
railway up
```

#### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | ✅ | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key | `AIzaSy...` |
| `PORT` | ❌ | Server port (auto-set by Railway) | `8000` |
| `RESEND_API_KEY` | ❌ | Resend API key (for email) | `re_xxxxx` |
| `FROM_EMAIL` | ❌ | Email sender address | `onboarding@resend.dev` |

#### Important Backend Notes

1. **Root Directory**: Ensure Railway uses `backend` as root directory
   - Railway Dashboard → Service → Settings → Root Directory → `backend`

2. **CORS Configuration**: Backend is configured to allow requests from:
   - `http://localhost:5173` (local development)
   - `https://archiquest.vercel.app` (production)
   - Your Vercel deployment URLs

3. **Procfile**: Located at `backend/Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **After Deployment**: Update frontend `VITE_API_URL` in Vercel to point to your Railway backend:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```

## 👤 Sample Credentials

### Teacher Account

| Field | Value |
|-------|-------|
| **Email** | `teacher@archiquest.com` |
| **Password** | `Teacher123!` |
| **Role** | `teacher` |
| **First Name** | `John` |
| **Last Name** | `Smith` |

### Student Account

| Field | Value |
|-------|-------|
| **Email** | `student@archiquest.com` |
| **Password** | `Student123!` |
| **Role** | `student` |
| **First Name** | `Jane` |
| **Last Name** | `Doe` |

### Additional Test Accounts

#### Teacher Account 2
- **Email**: `teacher2@archiquest.com`
- **Password**: `Teacher456!`
- **Role**: `teacher`

#### Student Account 2
- **Email**: `student2@archiquest.com`
- **Password**: `Student456!`
- **Role**: `student`

### Creating Test Accounts

You can create these accounts through the registration page at `/register` or directly in your Supabase dashboard.

**Note**: These are sample credentials. In production, ensure all users create their own accounts with secure passwords.

## 📁 Project Structure

```
cost-estimator/
├── backend/
│   ├── routes/          # API routes
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic services
│   ├── main.py          # FastAPI application entry point
│   ├── requirements.txt # Python dependencies
│   └── Procfile         # Railway deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration files
│   │   └── main.jsx     # React entry point
│   ├── package.json     # Node.js dependencies
│   └── vercel.json      # Vercel deployment config
│
└── README.md            # This file
```

## 🔧 Local Development

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add your environment variables (see Backend Environment Variables)

# Run server
python main.py
# Server runs on http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
# Add: VITE_API_URL=http://localhost:8000/api

# Run development server
npm run dev
# Server runs on http://localhost:5173
```

## 🔐 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)

```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
PORT=8000
```

## 📝 Additional Notes

- **Email Verification**: Currently disabled but code is preserved for future implementation
- **CORS**: Backend CORS is configured in `backend/main.py`
- **Database**: Uses Supabase PostgreSQL database
- **Authentication**: Handled by Supabase Auth

## 🐛 Troubleshooting

### Frontend Issues
- **Build fails**: Check Vercel build logs
- **API calls fail**: Verify `VITE_API_URL` is set correctly
- **404 errors**: `vercel.json` includes rewrite rules for React Router

### Backend Issues
- **Build fails**: Check Railway build logs, ensure `requirements.txt` exists
- **API calls fail**: Verify environment variables are set in Railway
- **Port issues**: Railway automatically handles port via `$PORT` variable

## 📚 Additional Documentation

- Frontend Deployment: `frontend/VERCEL_DEPLOYMENT.md`
- Backend Deployment: `backend/RAILWAY_DEPLOYMENT.md`
- Email Setup: `backend/EMAIL_VERIFICATION_SETUP.md` (for future use)

## 📄 License

This project is part of a capstone project for academic purposes.

---

**Note**: This README is maintained for deployment and setup purposes. For detailed feature documentation, refer to the project documentation files.

