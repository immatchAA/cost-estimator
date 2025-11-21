# Quick Guide: Add Resend API Key to Railway

## Steps to Add RESEND_API_KEY to Railway

### Method 1: Using Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**

   - Open [railway.app](https://railway.app)
   - Sign in to your account

2. **Select Your Project**

   - Click on your project (cost-estimator backend)

3. **Go to Variables Tab**

   - Click on your backend service
   - Click on the **"Variables"** tab at the top

4. **Add Environment Variables**

   - Click **"+ New Variable"** button
   - Add these two variables:

   **Variable 1:**

   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_6sWrvHpK_3mvupFZJfptYd8KYChsLoBB6`
   - Click **"Add"**

   **Variable 2 (Optional but recommended):**

   - **Key**: `FROM_EMAIL`
   - **Value**: `onboarding@resend.dev`
   - Click **"Add"**

5. **Redeploy**

   - After adding the variables, Railway should automatically redeploy
   - OR manually trigger a redeploy by going to **Deployments** tab and clicking **"Redeploy"**

6. **Verify**
   - Check Railway logs to see if "Resend email service initialized" appears
   - Try registering with an email to test

### Method 2: Using Railway CLI

1. **Install Railway CLI** (if not already installed)

   ```bash
   npm install -g @railway/cli
   ```

2. **Login**

   ```bash
   railway login
   ```

3. **Navigate to your backend directory**

   ```bash
   cd backend
   ```

4. **Link to your Railway project**

   ```bash
   railway link
   ```

5. **Set environment variables**

   ```bash
   railway variables set RESEND_API_KEY=re_AmdtQpRi_BFUxEA1wWA1PPz7w4tHfg2PC
   railway variables set FROM_EMAIL=onboarding@resend.dev
   ```

6. **Redeploy**
   ```bash
   railway up
   ```

## Verification

After adding the environment variables and redeploying:

1. **Check Railway Logs**

   - Go to Railway dashboard → Your service → Deployments → Latest deployment → Logs
   - You should see: `Resend email service initialized`

2. **Test Email Sending**
   - Try registering with an email address
   - Check Railway logs for: `✅ Email sent successfully to [email]`

## Troubleshooting

### Still Getting "Resend email service not configured" Error

1. **Check Variable Name**: Make sure it's exactly `RESEND_API_KEY` (case-sensitive)
2. **Check for Extra Spaces**: Make sure there are no spaces before/after the API key value
3. **Redeploy**: After adding variables, you must redeploy for changes to take effect
4. **Check Logs**: Railway logs will show what value is being read (if any)

### API Key Not Working

1. **Verify API Key**: Make sure the API key is correct (starts with `re_`)
2. **Check Resend Dashboard**: Log into Resend to verify the API key is active
3. **Regenerate if Needed**: If the key was exposed, regenerate it in Resend dashboard

## Security Note

⚠️ **Important**: Since this API key was shared in a message, consider regenerating it:

1. Go to Resend dashboard
2. Navigate to API Keys
3. Delete the old key
4. Create a new one
5. Update Railway with the new key

## After Setup

Once the environment variable is set:

- ✅ Emails should work with Gmail
- ✅ Emails should work with Outlook
- ✅ Emails should work with all other providers
- ✅ Better deliverability than Gmail SMTP
- ✅ No more "service not configured" errors
