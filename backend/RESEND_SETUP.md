# Resend Email Service Setup Guide

This guide will help you set up Resend for sending verification codes and transactional emails.

## Why Resend?

Resend is a modern transactional email service that:
- ✅ Works reliably with **all email providers** (Gmail, Outlook, Yahoo, etc.)
- ✅ Better deliverability than Gmail SMTP
- ✅ Free tier: 3,000 emails/month
- ✅ Simple API integration
- ✅ Fast and reliable

## Setup Steps

### 1. Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. After signing in, go to the API Keys section
2. Create a new API key
3. Copy the API key (it will look like: `re_6sWrvHpK_3mvupFZJfptYd8KYChsLoBB6`)
4. **Important**: Save this key securely - you won't be able to see it again!

### 3. Verify Your Email Domain (Optional but Recommended)

**For Production:**
1. Go to Domains in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records Resend provides to your domain
4. Wait for verification (usually takes a few minutes)

**For Development/Testing:**
- You can use the default `onboarding@resend.dev` sender email
- This works for testing but emails may go to spam
- For production, use your own verified domain

### 4. Set Environment Variables in Railway

Add these environment variables to your Railway project:

1. Go to Railway dashboard → Your backend service → Variables
2. Add the following variables:

```
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual Resend API key
- For development, use `onboarding@resend.dev` as FROM_EMAIL
- For production with a verified domain, use `noreply@yourdomain.com` or similar

### 5. Deploy

After setting environment variables:
1. Commit and push your code changes
2. Railway will automatically redeploy
3. The Resend package will be installed during deployment

## Testing

After deployment, test the email functionality:

1. Try registering with a **Gmail** email - should work
2. Try registering with an **Outlook** email - should now work! ✅
3. Try registering with a **Yahoo** email - should work
4. Check Railway logs to see email send confirmations

## Environment Variables Summary

**Required:**
- `RESEND_API_KEY` - Your Resend API key

**Optional:**
- `FROM_EMAIL` - Sender email address (defaults to `onboarding@resend.dev`)

**Old SMTP Variables (No longer needed):**
- You can remove these if you're fully switching to Resend:
  - `SMTP_SERVER`
  - `SMTP_PORT`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly in Railway
2. **Check Logs**: Railway logs will show detailed error messages
3. **Check Resend Dashboard**: Look at the Resend dashboard for delivery status

### Emails Going to Spam

1. **Use a Verified Domain**: For production, verify your own domain in Resend
2. **Check Email Content**: Make sure HTML email is well-formatted
3. **Check Sender Reputation**: Using `onboarding@resend.dev` may cause spam issues

### API Key Errors

1. Verify the API key is correct (starts with `re_`)
2. Make sure there are no extra spaces in the environment variable
3. Check that the API key has proper permissions in Resend dashboard

## Resend Limits

- **Free Tier**: 3,000 emails/month
- **Rate Limit**: 50 emails/second
- **Sending Limits**: See Resend dashboard for current usage

## Migration from Gmail SMTP

If you're migrating from Gmail SMTP:

1. ✅ Add `RESEND_API_KEY` to Railway environment variables
2. ✅ Add `FROM_EMAIL` (or it will default to `onboarding@resend.dev`)
3. ✅ Deploy the updated code
4. ✅ Test email sending with different email providers
5. ⚠️ Optional: Remove old SMTP environment variables once confirmed working

## Benefits Over Gmail SMTP

- ✅ **Works with all providers**: Gmail, Outlook, Yahoo, etc.
- ✅ **Better deliverability**: Emails less likely to go to spam
- ✅ **Reliable**: Designed for transactional emails
- ✅ **Simple API**: No SMTP connection management
- ✅ **Better logging**: Resend dashboard shows delivery status
- ✅ **Higher limits**: 3,000 emails/month on free tier

## Next Steps

After setup:
1. Test email sending with different email providers
2. Monitor Railway logs for any errors
3. Check Resend dashboard for email delivery status
4. Consider verifying your own domain for production use

