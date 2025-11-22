# SendGrid Email Setup Guide

## Why SendGrid?

Railway **blocks SMTP connections** (ports 587, 465, etc.) for security reasons. SendGrid uses **HTTP/HTTPS API** which Railway allows, making it perfect for sending emails from Railway deployments.

## Benefits

✅ **Works on Railway** - Uses HTTPS, not blocked  
✅ **Free tier** - 100 emails/day forever  
✅ **Works with any email** - Gmail, Outlook, Yahoo, etc.  
✅ **Reliable delivery** - Professional email infrastructure  
✅ **No SMTP needed** - Pure HTTP API

## Setup Steps

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com
2. Click **"Start for Free"** or **"Sign Up"**
3. Complete registration (no credit card required for free tier)
4. Verify your email address

### Step 2: Create API Key

1. **Login to SendGrid Dashboard**
2. Go to **Settings** → **API Keys** (or visit https://app.sendgrid.com/settings/api_keys)
3. Click **"Create API Key"**
4. **Name**: `Archiquest Email Service` (or any name)
5. **API Key Permissions**: Select **"Full Access"** (or at minimum, **"Mail Send"** permission)
6. Click **"Create & View"**
7. **⚠️ IMPORTANT: Copy the API key immediately!** You won't be able to see it again.
   - It will look like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Verify Sender Identity (Required for Production)

SendGrid requires you to verify who you're sending emails from:

**Option A: Single Sender Verification (Easiest - Recommended for Testing)**

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in the form:
   - **From Email**: `noreply@archiquest.com` (or any email you own)
   - **From Name**: `Archiquest`
   - **Reply To**: Same email
   - **Address**: Your address
   - **City**: Your city
   - **Country**: Your country
4. Click **"Create"**
5. **Check your email** and click the verification link from SendGrid

**Option B: Domain Authentication (For Production)**

If you own a domain (e.g., `archiquest.com`):
1. Go to **Settings** → **Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Follow SendGrid's DNS setup instructions
4. This allows sending from any email on your domain

### Step 4: Add Environment Variables in Railway

1. **Go to Railway Dashboard**
   - Open your backend service
   - Go to **Variables** tab

2. **Add SendGrid API Key:**
   - Click **"+ New Variable"**
   - **Name**: `SENDGRID_API_KEY`
   - **Value**: `SG.your-api-key-here` (paste the API key you copied)
   - Click **Save**

3. **Add From Email:**
   - Click **"+ New Variable"**
   - **Name**: `SENDGRID_FROM_EMAIL` (or `FROM_EMAIL` - both work)
   - **Value**: Use the email you verified in Step 3
     - Example: `akosikyle505@gmail.com` or `noreply@archiquest.com`
   - Click **Save**

4. **Remove old SMTP variables** (optional, they won't be used anymore):
   - You can delete: `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`

5. **Railway will automatically redeploy** after adding variables

## Environment Variables Summary

Add these to Railway:

```
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

**Note:** You can use either `SENDGRID_FROM_EMAIL` or `FROM_EMAIL` - both are supported. `SENDGRID_FROM_EMAIL` takes precedence if both are set.

## Verification

### Step 1: Check Health Endpoint

After Railway redeploys, check:
```
GET https://your-railway-url.up.railway.app/health/email
```

Should return:
```json
{
  "email_service": "SendGrid",
  "sendgrid_api_key_set": true,
  "from_email": "your-verified-email@example.com",
  "configuration_complete": true
}
```

### Step 2: Test Email Sending

1. Try registering with any email address
2. You should receive a verification code
3. Check Railway logs for:
   - `✅ Email sent successfully to email@example.com`

## Free Tier Limits

- **100 emails/day** - Perfect for testing and small apps
- **Unlimited** emails/month (but limited to 100/day)
- No credit card required

## Troubleshooting

### "SendGrid API key not configured"

- Make sure `SENDGRID_API_KEY` is set in Railway
- Check that the API key starts with `SG.`
- Verify the variable name is exactly `SENDGRID_API_KEY`

### "Sender email not verified" (Status 403)

- You need to verify the sender email in SendGrid
- Go to **Settings** → **Sender Authentication**
- Verify the email address you're using in `FROM_EMAIL`

### "Invalid API key" (Status 401)

- Your API key might be incorrect
- Generate a new API key in SendGrid
- Make sure you copied the entire key (it's very long)

### Emails not received

- Check spam/junk folder
- Verify sender email in SendGrid dashboard
- Check Railway logs for specific error messages
- Make sure you verified the sender email address

## Migration from SMTP

If you had SMTP variables set:

1. ✅ Add `SENDGRID_API_KEY` and `FROM_EMAIL` to Railway
2. ✅ Remove old SMTP variables (optional)
3. ✅ Railway will redeploy automatically
4. ✅ Test email sending - should work immediately!

## Security Notes

⚠️ **Never commit API keys to Git**  
✅ Use Railway environment variables  
✅ Keep your API key secret  
✅ Use SendGrid's IP whitelisting if needed (Settings → IP Access Management)

## Need More Emails?

If you need more than 100 emails/day:
1. Go to SendGrid Dashboard → **Billing**
2. Upgrade to a paid plan
3. Plans start at $19.95/month for 50,000 emails

## Summary

**What you need:**
1. ✅ SendGrid account (free)
2. ✅ API key from SendGrid
3. ✅ Verified sender email
4. ✅ `SENDGRID_API_KEY` variable in Railway
5. ✅ `FROM_EMAIL` variable in Railway

**Result:**
- ✅ Emails work on Railway (no SMTP blocking)
- ✅ Works with any email provider
- ✅ Reliable delivery
- ✅ Free tier available

That's it! Your email verification should now work perfectly! 🎉

