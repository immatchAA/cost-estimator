# ⚠️ CRITICAL: Set VITE_API_URL in Vercel

## The Problem

Your frontend is still trying to connect to `localhost:8000` because the `VITE_API_URL` environment variable is **not set in Vercel**.

Even though I've updated the code to use the environment variable, **it will still default to localhost** until you set it in Vercel.

## ✅ Solution (REQUIRED)

### Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your **backend service**
3. Go to **Settings** → **Domains** (or check the deployment URL)
4. **Copy your Railway backend URL**
   - Example: `https://pleasant-wholeness-production.up.railway.app`
   - **Important**: Copy the full URL without `/api` at the end

### Step 2: Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click on your project: **archiquest**
3. Go to **Settings** tab (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **"+ New Variable"** button
6. Fill in:

   **Name**: `VITE_API_URL`
   
   **Value**: `https://YOUR-RAILWAY-URL.up.railway.app/api`
   
   **Replace** `YOUR-RAILWAY-URL` with your actual Railway URL
   
   **Example**: `https://pleasant-wholeness-production.up.railway.app/api`
   
7. **Select all environments**: ✅ Production, ✅ Preview, ✅ Development
8. Click **"Add"**

### Step 3: Redeploy Your Frontend

⚠️ **THIS IS CRITICAL** - Environment variables only take effect after redeployment!

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **"..."** menu (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**Option B: Push a Commit**
```bash
git commit --allow-empty -m "Redeploy with VITE_API_URL"
git push
```

## ✅ Verify It's Working

After redeployment:
1. Visit your site: `https://archiquest.vercel.app`
2. Open Browser DevTools (F12) → Console tab
3. You should **NOT** see:
   - ❌ `ERR_CONNECTION_REFUSED`
   - ❌ `localhost:8000` errors
4. You should see API calls going to your Railway URL instead

## What I've Fixed in Code

I've updated these files to use the environment variable:
- ✅ TeacherDashboard.jsx
- ✅ StudentDashboard.jsx  
- ✅ Class.jsx
- ✅ ClassManagement.jsx
- ✅ RegisterForm.jsx
- ✅ EmailVerification.jsx
- ✅ CostEstimationChallenge.jsx
- ✅ UploadChallenge.jsx
- ✅ MaterialSearch.jsx
- ✅ MaterialTable.jsx
- ✅ TeacherChallengeView.jsx
- ✅ ReadingMaterials.jsx
- ✅ ReadingMaterialView.jsx
- ✅ AddReadingMaterial.jsx
- ✅ CompletedChallenges.jsx

**But they will all still default to localhost until you set `VITE_API_URL` in Vercel!**

## Quick Check

To verify your Railway backend URL is correct:
1. Go to Railway dashboard
2. Click your backend service
3. Check the **"Domains"** section
4. Copy the full URL (e.g., `https://your-app.up.railway.app`)
5. Add `/api` at the end for the environment variable value

## Example

If your Railway backend URL is:
```
https://pleasant-wholeness-production.up.railway.app
```

Then in Vercel, set:
```
VITE_API_URL = https://pleasant-wholeness-production.up.railway.app/api
```

**Note**: Include `/api` at the end!

## After Setting VITE_API_URL

Once you:
1. ✅ Set `VITE_API_URL` in Vercel
2. ✅ Redeploy your frontend
3. ✅ Wait for deployment to complete

Then your frontend will connect to your Railway backend and all the errors will be resolved!

**If you share your Railway backend URL, I can tell you the exact value to put in Vercel.**

