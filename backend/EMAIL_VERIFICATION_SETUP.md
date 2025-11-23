# Email Verification Setup Guide

This guide will help you set up email verification functionality for your Architectural AI Cost Estimator application.

## Overview

The email verification system includes:

- 6-digit verification codes sent via email using Brevo (formerly Sendinblue)
- 10-minute expiration for codes
- Resend functionality with rate limiting
- Integration with Supabase authentication
- Modern UI components for verification flow

## Database Setup

### 1. Run the SQL Schema

Execute the SQL commands in `verification_schema.sql` in your Supabase SQL editor:

```sql
-- This will create the verification_codes table and update the users table
-- See verification_schema.sql for the complete schema
```

### 2. Verify Table Creation

Make sure these tables exist in your Supabase database:

- `verification_codes` - stores verification codes
- `users` - updated with `email_verified` and `verified_at` columns

## Environment Variables

Add these environment variables to your `.env` file or your deployment platform (e.g., Render):

```env
# Email Configuration (Brevo)
BREVO_API_KEY=your-brevo-api-key
FROM_EMAIL=aarchiquest@gmail.com

# Existing Supabase variables
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

### Brevo Setup

1. **Create a Brevo Account**
   - Sign up at [brevo.com](https://www.brevo.com) (formerly Sendinblue)
   - Verify your email address

2. **Generate an API Key**
   - Log in to your Brevo account
   - Navigate to **SMTP & API** → **API Keys**
   - Click **Generate a new API key**
   - Name your API key (e.g., "VerificationEmails")
   - Copy the generated API key and set it as `BREVO_API_KEY`

3. **Configure Sender Email**
   - Set `FROM_EMAIL` to the email address you want to send from
   - Make sure this email is verified in your Brevo account
   - For better deliverability, authenticate your domain in Brevo

### For Render Deployment

When deploying to Render, add these environment variables in your Render dashboard:

1. Go to your service settings
2. Navigate to **Environment** section
3. Add the following variables:
   - `BREVO_API_KEY`: Your Brevo API key
   - `FROM_EMAIL`: aarchiquest@gmail.com (or your verified sender email)

## API Endpoints

### Verification Routes

- `POST /verification/send-code` - Send verification code to email
- `POST /verification/verify-code` - Verify the 6-digit code
- `POST /verification/resend-code` - Resend verification code

### Updated Auth Routes

- `POST /auth/register` - Initial registration (sends verification code)
- `POST /auth/register-with-verification` - Complete registration with verification

## Frontend Components

### New Components

1. **EmailVerification** (`frontend/src/components/EmailVerification/EmailVerification.jsx`)
   - Displays verification code input
   - Shows countdown timer
   - Handles resend functionality
   - Modern UI with the same styling as registration

### Updated Components

1. **RegisterForm** (`frontend/src/components/Register/RegisterForm.jsx`)
   - Now includes verification step
   - Sends verification code on registration
   - Shows verification component after initial registration

## User Flow

1. **Registration**: User fills out registration form
2. **Email Verification**: System sends 6-digit code to user's email
3. **Code Input**: User enters verification code
4. **Account Creation**: Account is created only after successful verification
5. **Login**: User can now log in normally

## Features

### Security Features

- 6-digit numeric codes (no letters to avoid confusion)
- 10-minute expiration
- One-time use codes
- Rate limiting on resend (prevents spam)

### User Experience

- Real-time countdown timer
- Clear error messages
- Resend functionality
- Consistent UI design
- Loading states

### Email Templates

- Professional HTML email design
- Clear verification code display
- Security instructions
- Branded with your app name

## Testing

### Test the Flow

1. Start your backend server:

   ```bash
   cd backend
   python main.py
   ```

2. Start your frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Test registration:
   - Go to registration page
   - Fill out form with a real email address
   - Check email for verification code
   - Enter code to complete registration

### Troubleshooting

**Email not sending:**

- Check Brevo API key is correct
- Verify `FROM_EMAIL` is set and matches a verified sender in Brevo
- Check server logs for API errors
- Verify your Brevo account is active and not suspended
- Check Brevo dashboard for delivery status

**Code not verifying:**

- Check database connection
- Verify verification_codes table exists
- Check code expiration

**Frontend issues:**

- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS settings

## Customization

### Email Template

Edit `backend/services/email_service.py` to customize:

- Email subject
- Email body design
- Branding elements
- Security messages

### Code Expiration

Change expiration time in:

- `backend/routes/verification.py` (line with `timedelta(minutes=10)`)
- `frontend/src/components/EmailVerification/EmailVerification.jsx` (timer logic)

### UI Styling

Modify CSS in:

- `frontend/src/components/Register/Register.css`
- Component-specific styles in EmailVerification.jsx

## Security Considerations

1. **Rate Limiting**: Implement additional rate limiting at the server level
2. **Code Complexity**: Consider longer codes for higher security
3. **IP Blocking**: Block IPs after multiple failed attempts
4. **Email Validation**: Validate email format before sending codes
5. **Database Cleanup**: Regularly clean up expired codes

## Production Deployment

### Environment Variables

- Use secure environment variable management
- Never commit Brevo API keys to version control
- Use different API keys for development/production
- Rotate API keys periodically for security

### Monitoring

- Monitor email delivery rates
- Track verification success rates
- Set up alerts for failed verifications

### Scaling

- Brevo handles high volume email sending automatically
- Implement Redis for verification code storage if needed
- Add database connection pooling
- Monitor Brevo API rate limits and upgrade plan if necessary

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Test with a simple email first (Gmail recommended)

The email verification system is now fully integrated and ready for use!

