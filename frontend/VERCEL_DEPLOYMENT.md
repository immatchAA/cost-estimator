# Vercel Deployment Guide

This guide will help you deploy your React + Vite frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

   - Make sure your code is committed and pushed to your repository

2. **Import Project to Vercel**

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"
   - Import your Git repository

3. **Configure Project Settings**

   **Option A: Set Root Directory to `frontend`** (Recommended)

   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

   **Option B: Deploy from Root Directory**

   - **Root Directory**: Leave as root (`.`)
   - The `vercel.json` at the root will automatically handle building from the `frontend` directory
   - Vercel will use the configuration in the root `vercel.json`

4. **Set Environment Variables**

   - In the project settings, go to "Environment Variables"
   - Add the following variable:
     - **Name**: `VITE_API_URL`
     - **Value**: Your backend API URL (e.g., `https://your-backend-api.com/api` or `http://localhost:8000/api` for development)
   - Make sure to add it for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at a URL like `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

3. **Login to Vercel**

   ```bash
   vercel login
   ```

4. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts
   - When asked for the root directory, confirm it's `frontend` or navigate to it
   - Set environment variables when prompted

5. **For production deployment**
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set the following environment variable in Vercel:

- `VITE_API_URL`: Your backend API URL
  - Production: `https://your-production-api.com/api`
  - Development: `http://localhost:8000/api` (if testing locally)

## Important Notes

1. **API URL**: Your frontend uses `VITE_API_URL` environment variable for API calls. Make sure your backend API is accessible from the internet (not just localhost) for production.

2. **CORS**: Ensure your backend API has CORS configured to allow requests from your Vercel domain.

3. **Supabase**: Your Supabase credentials are currently hardcoded. Consider moving them to environment variables for better security:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Automatic Deployments**: Vercel will automatically deploy when you push to your main branch. Preview deployments are created for pull requests.

## Troubleshooting

- **Build fails**: Check the build logs in Vercel dashboard
- **API calls fail**: Verify `VITE_API_URL` is set correctly and your backend is accessible
- **404 errors on routes**: The `vercel.json` includes a rewrite rule to handle React Router, so this should work automatically

## Next Steps

After deployment:

1. Update your backend CORS settings to include your Vercel domain
2. Test all functionality on the deployed site
3. Set up a custom domain (optional) in Vercel project settings
