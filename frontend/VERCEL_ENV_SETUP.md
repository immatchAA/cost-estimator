# Vercel Environment Variable Setup Guide

## Problem
Your frontend is trying to connect to `localhost:8000` instead of your Railway backend. This causes connection errors when deployed to Vercel.

## Solution: Set VITE_API_URL in Vercel

### Step 1: Get Your Railway Backend URL

1. Go to your Railway dashboard
2. Click on your backend service
3. Go to Settings → Domains
4. Copy your Railway backend URL (e.g., `https://your-app.up.railway.app`)

**Important**: The URL should NOT have `/api` at the end - we'll add that in the environment variable.

### Step 2: Add Environment Variable in Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on your project (archiquest)
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add a new environment variable:

   **Name**: `VITE_API_URL`
   
   **Value**: `https://your-railway-app.up.railway.app/api`
   
   **Environments**: Select all (Production, Preview, Development)
   
6. Click **Save**

**Option B: Using Vercel CLI**

```bash
vercel env add VITE_API_URL
# When prompted, enter: https://your-railway-app.up.railway.app/api
# Select all environments (production, preview, development)
```

### Step 3: Redeploy Your Frontend

After adding the environment variable, you **must redeploy**:

**Option A: Using Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

**Option B: Using Vercel CLI**
```bash
vercel --prod
```

**Option C: Push a New Commit**
```bash
git commit --allow-empty -m "Trigger redeploy for environment variables"
git push
```

### Step 4: Verify

After redeployment:

1. Open your Vercel deployment: `https://archiquest.vercel.app`
2. Open browser DevTools (F12) → Console
3. You should NOT see `ERR_CONNECTION_REFUSED` errors
4. API calls should go to your Railway backend URL

## Important Notes

1. **Environment Variable Name**: Must be exactly `VITE_API_URL` (case-sensitive)
   - Vite requires environment variables to start with `VITE_` to be exposed to the frontend

2. **API URL Format**: 
   - ✅ Correct: `https://your-app.up.railway.app/api`
   - ❌ Wrong: `https://your-app.up.railway.app/api/` (trailing slash)
   - ❌ Wrong: `https://your-app.up.railway.app` (missing /api)

3. **Redeploy Required**: Environment variables only take effect after redeployment

4. **Check All Environments**: Make sure to add the variable for Production, Preview, AND Development

## Troubleshooting

### Still Getting Connection Refused Errors

1. **Verify Environment Variable**: 
   - Check Vercel dashboard → Settings → Environment Variables
   - Make sure `VITE_API_URL` is set correctly

2. **Check Redeploy**:
   - Make sure you redeployed after adding the variable
   - Environment variables don't apply to existing deployments

3. **Check Browser Console**:
   - Open DevTools → Network tab
   - See what URL it's trying to connect to
   - Should be your Railway URL, not localhost

4. **Check Vercel Build Logs**:
   - Go to Vercel dashboard → Deployments → Latest deployment → Logs
   - Look for build errors or warnings

### Getting CORS Errors

If you get CORS errors instead of connection refused:
1. Check your Railway backend CORS settings
2. Make sure your Vercel domain is in the allowed origins list
3. See `backend/main.py` for CORS configuration

## Example Environment Variable

```
Name: VITE_API_URL
Value: https://pleasant-wholeness-production.up.railway.app/api
Environments: Production, Preview, Development
```

Replace `pleasant-wholeness-production.up.railway.app` with your actual Railway backend URL.

## Next Steps

After setting up `VITE_API_URL`:
1. ✅ Frontend will connect to Railway backend
2. ✅ No more localhost connection errors
3. ✅ All API calls will work in production
4. ✅ Both frontend and backend will be connected

