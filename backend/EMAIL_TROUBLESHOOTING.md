# Email Troubleshooting Guide - Outlook Not Receiving Verification Codes

## Quick Diagnosis Steps

### 1. Check Railway Logs for Errors

When you try to register with an Outlook email, check your Railway deployment logs:

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Deployments" tab
4. Click on the latest deployment
5. Check the "Logs" tab

Look for messages like:
- `✅ Email sent successfully to [email]` - Email was sent successfully
- `❌ Failed to send verification email to [email]: [error]` - Email failed with specific error

### 2. Common Issues and Solutions

#### Issue 1: Email is Being Sent But Going to Spam

**Symptoms:**
- No error in logs (email shows as sent successfully)
- Email not in inbox
- User doesn't receive email

**Solution:**
- Ask users to check their **Spam/Junk folder**
- Check Outlook's "Junk Email" settings
- Email may be filtered by Outlook's spam filter

#### Issue 2: Gmail SMTP Authentication Error

**Symptoms:**
- Error message: "SMTP authentication failed"
- Email not sent

**Solution:**
- Make sure you're using an **App Password**, not your regular Gmail password
- Enable 2-Factor Authentication on your Gmail account
- Generate a new App Password:
  1. Go to Google Account → Security
  2. Enable 2-Step Verification
  3. Go to App Passwords
  4. Generate new password for "Mail"
  5. Use this password in Railway environment variables

#### Issue 3: Gmail SMTP Rate Limiting

**Symptoms:**
- Emails work sometimes but fail other times
- Error: "SMTP error" or connection timeout
- Gmail may be blocking your account

**Solution:**
- Gmail has daily sending limits (500 emails/day for free accounts)
- Consider using a transactional email service (see below)

#### Issue 4: Outlook Rejecting Gmail-Sent Emails

**Symptoms:**
- Error: "Recipient refused by server"
- Email rejected by Outlook/Microsoft servers

**Solution:**
- This is a known issue with Gmail SMTP → Outlook
- Outlook/Microsoft may reject emails from Gmail SMTP
- **Recommended:** Use a dedicated email service (see below)

#### Issue 5: Email Domain/Address Issues

**Symptoms:**
- Error: "SMTP data error" or "Email rejected"
- Invalid email format issues

**Solution:**
- Verify email addresses are valid
- Check for typos in email addresses
- Some email providers have strict validation

## Current Setup Check

Verify your Railway environment variables are set correctly:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Must be App Password, not regular password!
FROM_EMAIL=your-email@gmail.com
```

## Recommended Solution: Use a Transactional Email Service

For better reliability across all email providers (especially Outlook), consider using a dedicated transactional email service:

### Option 1: SendGrid (Recommended - Free Tier Available)

1. **Sign up** at [sendgrid.com](https://sendgrid.com) (free tier: 100 emails/day)
2. **Verify your sender identity** (email or domain)
3. **Create an API Key**:
   - Go to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
4. **Update your code** to use SendGrid API instead of SMTP

### Option 2: Mailgun (Free Tier Available)

1. **Sign up** at [mailgun.com](https://www.mailgun.com) (free tier: 5,000 emails/month)
2. **Verify your domain** or use their sandbox
3. **Get your API key** from the dashboard
4. **Update your code** to use Mailgun API

### Option 3: Amazon SES (Very Affordable)

1. **Set up** AWS account and SES
2. **Verify your email** or domain
3. **Get SMTP credentials** from SES console
4. **Update SMTP settings** in Railway

## Testing Your Email Setup

You can test if emails are being sent by:

1. **Check Railway logs** - Look for success/failure messages
2. **Try with a Gmail address** - If Gmail works but Outlook doesn't, it's likely an Outlook/Gmail compatibility issue
3. **Check spam folders** - Always check spam/junk folders
4. **Test with different Outlook addresses** - Try both `@outlook.com` and `@hotmail.com`

## Immediate Action Items

1. ✅ **Check Railway logs** when trying to register with Outlook email
2. ✅ **Check Outlook spam folder**
3. ✅ **Verify Gmail App Password** is being used (not regular password)
4. ✅ **Try with a Gmail address** to confirm email system works
5. ⚠️ **If Gmail works but Outlook doesn't**: Consider switching to SendGrid/Mailgun for better compatibility

## Need Help?

If emails are still not working after checking logs:

1. Copy the error message from Railway logs
2. Share the error message
3. We can help diagnose the specific issue

The improved logging should now show exactly what's happening when you try to send emails to Outlook addresses.

