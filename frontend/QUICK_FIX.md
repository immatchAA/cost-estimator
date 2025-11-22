# Quick Fix for localhost Connection Errors

## The Problem
Your frontend is trying to connect to `localhost:8000` instead of your Railway backend, causing connection errors.

## Immediate Solution (3 Steps)

### Step 1: Get Your Railway Backend URL

1. Go to Railway dashboard: https://railway.app
2. Click on your **backend service**
3. Find your deployment URL (looks like: `https://pleasant-wholeness-production.up.railway.app`)
4. **Copy the full URL** (don't include `/api` - we'll add that)

### Step 2: Add Environment Variable in Vercel

1. Go to Vercel: https://vercel.com
2. Click on your project: **archiquest**
3. Go to **Settings** → **Environment Variables**
4. Click **"+ New Variable"**
5. Add:

   **Key**: `VITE_API_URL`
   
   **Value**: `https://YOUR-RAILWAY-URL.up.railway.app/api`
   
   Replace `YOUR-RAILWAY-URL` with your actual Railway URL.
   
   Example: `https://pleasant-wholeness-production.up.railway.app/api`
   
6. Select **all environments**: Production, Preview, Development
7. Click **"Save"**

### Step 3: Redeploy Frontend

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for completion

**Option B: Push Empty Commit**
```bash
git commit --allow-empty -m "Redeploy for VITE_API_URL"
git push
```

## What I've Fixed in Code

I've updated these files to use the environment variable:
- ✅ `TeacherDashboard.jsx` 
- ✅ `StudentDashboard.jsx`
- ✅ `Class.jsx`
- ✅ `ClassManagement.jsx`
- ✅ `RegisterForm.jsx`

**Note**: There are still more files with hardcoded localhost URLs, but after you set `VITE_API_URL` in Vercel and redeploy, the errors should be resolved.

## Verify It's Working

After redeploying:
1. Visit your Vercel site: `https://archiquest.vercel.app`
2. Open browser DevTools (F12) → Console
3. You should **NOT** see `ERR_CONNECTION_REFUSED` errors
4. API calls should go to your Railway backend

## If You Still See Errors

Check:
1. ✅ Environment variable name is exactly `VITE_API_URL` (case-sensitive)
2. ✅ You redeployed after adding the variable
3. ✅ Railway backend URL is correct (no typos)
4. ✅ URL includes `/api` at the end

## Need Your Railway URL?

If you can't find your Railway backend URL, check:
1. Railway dashboard → Your service → Settings → Domains
2. Or check Railway deployment logs for the public URL

Once you share your Railway backend URL, I can tell you the exact value to put in Vercel!

