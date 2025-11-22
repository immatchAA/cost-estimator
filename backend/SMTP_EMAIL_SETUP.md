# SMTP Email Setup Guide

## Overview

The email service has been switched from Resend to SMTP. This allows you to send verification emails to **any email address** using any SMTP server (Gmail, Outlook, Yahoo, etc.).

## How It Works

SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. It's built into Python, so **no additional packages are needed** (unlike Resend).

## Railway Environment Variables

Add these environment variables in Railway:

### Required Variables:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password (16 characters, spaces are optional)

3. **Set Railway Variables:**
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

### Option 2: Outlook/Hotmail

```
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
FROM_EMAIL=your-email@outlook.com
```

**Note:** For Outlook, you may need to enable "Less secure app access" or use an app password.

### Option 3: Yahoo

```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@yahoo.com
```

**Note:** Yahoo requires an app password. Generate it in Yahoo Account Security settings.

### Option 4: Custom SMTP Server

If you have your own email server:

```
SMTP_SERVER=mail.yourdomain.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@yourdomain.com
```

## Setting Variables in Railway

1. Go to Railway Dashboard
2. Open your backend service
3. Go to **Variables** tab
4. Click **"+ New Variable"**
5. Add each variable:
   - Name: `SMTP_SERVER`
   - Value: `smtp.gmail.com` (or your SMTP server)
   - Repeat for `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `FROM_EMAIL`
6. Click **Save**
7. Railway will automatically redeploy

## Verification

After setting variables and redeploying:

1. **Check Health Endpoint:**
   ```
   GET https://your-railway-url.up.railway.app/health/email
   ```
   Should return:
   ```json
   {
     "email_service": "SMTP",
     "smtp_server": "smtp.gmail.com",
     "smtp_port": "587",
     "smtp_username_set": true,
     "smtp_password_set": true,
     "from_email": "your-email@gmail.com",
     "configuration_complete": true
   }
   ```

2. **Test Email Sending:**
   - Try registering with any email address (Gmail, Outlook, Yahoo, etc.)
   - You should receive a verification code

## Benefits of SMTP

✅ **Works with any email provider** (Gmail, Outlook, Yahoo, custom domains)  
✅ **No external dependencies** (smtplib is built into Python)  
✅ **Free to use** (if using your own email account)  
✅ **No API key needed** (just email credentials)  
✅ **More reliable** for transactional emails  
✅ **Better deliverability** to all email providers

## Troubleshooting

### "SMTP authentication failed"

- Check that `SMTP_USERNAME` and `SMTP_PASSWORD` are correct
- For Gmail: Make sure you're using an **App Password**, not your regular password
- For Outlook: Enable "Less secure app access" or use an app password

### "SMTP server disconnected"

- Check `SMTP_SERVER` and `SMTP_PORT` are correct
- Common ports: 587 (TLS), 465 (SSL), 25 (not recommended)
- Make sure your email provider allows SMTP connections

### Emails not received

- Check spam/junk folder
- Verify `FROM_EMAIL` is set correctly
- Check Railway logs for error messages
- Some email providers have sending limits

### Still having issues?

Check Railway application logs for detailed error messages:
```
INFO:services.email_service:SMTP_SERVER: smtp.gmail.com
INFO:services.email_service:SMTP_PORT: 587
ERROR:services.email_service:SMTP authentication failed: ...
```

## Security Notes

⚠️ **Never commit email credentials to Git**  
✅ Use Railway environment variables  
✅ Use App Passwords instead of main passwords when possible  
✅ Consider using a dedicated email account for your app

## Migration from Resend

If you were using Resend before:

1. ✅ **Remove Resend variables:**
   - Delete `RESEND_API_KEY` from Railway (optional, won't cause issues)

2. ✅ **Add SMTP variables:**
   - Follow steps above to add SMTP configuration

3. ✅ **Redeploy:**
   - Railway will automatically redeploy when variables are added

4. ✅ **No code changes needed:**
   - The `EmailService` class handles everything automatically

That's it! Your email verification should now work with any email provider! 🎉

