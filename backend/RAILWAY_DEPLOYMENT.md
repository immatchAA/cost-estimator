# Railway Deployment Guide

This guide will help you deploy your FastAPI backend to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app) if you don't have one)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your environment variables ready (see below)

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   - Make sure your code is committed and pushed to your repository
   - Ensure the `backend` directory contains all necessary files

2. **Create a New Project in Railway**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or your Git provider)
   - Choose your repository

3. **Configure the Service**
   - Railway will auto-detect your Python project
   - **Root Directory**: Set to `backend` (important!)
   - Railway will automatically detect `requirements.txt` and `Procfile`

4. **Set Environment Variables**
   - In your Railway project, go to the "Variables" tab
   - Add the following environment variables:

   **Required Variables:**
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

   **Email Configuration (if using email verification):**
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

   **Note:** Railway will automatically set the `PORT` environment variable, so you don't need to set it manually.

5. **Deploy**
   - Railway will automatically start deploying when you connect the repository
   - Wait for the build to complete
   - Your API will be live at a URL like `https://your-project.up.railway.app`

6. **Get Your Deployment URL**
   - After deployment, Railway will provide you with a public URL
   - Go to your service → Settings → Generate Domain
   - Copy the generated domain (e.g., `https://your-app.up.railway.app`)

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Initialize Railway project**
   ```bash
   railway init
   ```

5. **Set environment variables**
   ```bash
   railway variables set SUPABASE_URL=your-supabase-url
   railway variables set SUPABASE_KEY=your-supabase-anon-key
   railway variables set GEMINI_API_KEY=your-gemini-api-key
   railway variables set SMTP_SERVER=smtp.gmail.com
   railway variables set SMTP_PORT=587
   railway variables set SMTP_USERNAME=your-email@gmail.com
   railway variables set SMTP_PASSWORD=your-app-password
   railway variables set FROM_EMAIL=your-email@gmail.com
   ```

6. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

Make sure to set the following environment variables in Railway:

### Required Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key
- `GEMINI_API_KEY`: Your Google Gemini API key

### Optional Variables (for email verification)

- `SMTP_SERVER`: SMTP server address (default: `smtp.gmail.com`)
- `SMTP_PORT`: SMTP port (default: `587`)
- `SMTP_USERNAME`: Your email address
- `SMTP_PASSWORD`: Your email app password
- `FROM_EMAIL`: Email address to send from (defaults to `SMTP_USERNAME`)

## Important Notes

1. **Root Directory**: Make sure Railway is set to use the `backend` directory as the root directory. You can set this in:
   - Railway Dashboard → Your Service → Settings → Root Directory → Set to `backend`

2. **Port Configuration**: Railway automatically sets the `PORT` environment variable. The `Procfile` uses this variable, so your app will automatically use the correct port.

3. **CORS Configuration**: The backend has been configured to allow requests from:
   - `http://localhost:5173` (local development)
   - `https://archi-quest.vercel.app` (your Vercel domain)
   - `https://archi-quest-biphfu62w-kinatulinans-projects.vercel.app` (Vercel deployment URL)

4. **Frontend Configuration**: After deployment, update your frontend's `VITE_API_URL` environment variable in Vercel to point to your Railway backend URL:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```

5. **Database**: Your Supabase database should already be set up. Make sure your `SUPABASE_URL` and `SUPABASE_KEY` are correct.

6. **Gemini API**: Make sure you have a valid Gemini API key. You can get one from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure `requirements.txt` is in the `backend` directory
- Verify Python version compatibility (Railway uses Python 3.11+ by default)

### API Calls Fail
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS configuration in `main.py`
- Ensure Railway service is running (check the "Deployments" tab)

### Environment Variables Not Working
- Make sure variables are set in Railway (not just in `.env` file)
- Restart the service after adding new variables
- Check variable names match exactly (case-sensitive)

### Port Issues
- Railway automatically handles the port via `$PORT` environment variable
- Don't hardcode port numbers in your code
- The `Procfile` uses `$PORT` which Railway provides automatically

## Next Steps

After deployment:

1. **Update Frontend API URL**
   - Go to your Vercel project settings
   - Add/Update `VITE_API_URL` environment variable:
     ```
     VITE_API_URL=https://your-railway-app.up.railway.app/api
     ```
   - Redeploy your frontend

2. **Test the API**
   - Visit `https://your-railway-app.up.railway.app/` to see the status endpoint
   - Test API endpoints from your frontend

3. **Monitor Logs**
   - Use Railway's logs tab to monitor your application
   - Check for any errors or warnings

4. **Set Up Custom Domain (Optional)**
   - In Railway, go to Settings → Domains
   - Add your custom domain
   - Update CORS in `main.py` to include your custom domain

## Railway vs Local Development

- **Local**: Uses `http://localhost:8000` (hardcoded in `main.py` when running directly)
- **Railway**: Uses `$PORT` environment variable (set automatically by Railway)
- The `Procfile` ensures Railway uses the correct port configuration

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Ensure your code is pushed to the repository
4. Check Railway status page for service issues

