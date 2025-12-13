# Email Verification & Password Reset Setup

This document explains the email verification and password reset features added to the Future Of Gadegets e-commerce platform.

## 🎯 Features Added

### 1. Email Verification on Sign Up
- New users receive a verification email upon registration
- Users can resend verification emails from their profile
- Email verification banner shows for unverified users
- Verification links expire after 24 hours

### 2. Forgot Password
- "Forgot Password?" link in sign-in dialog
- Password reset via email with secure tokens
- Reset links expire after 24 hours
- Password validation on reset (8+ chars, letters, numbers, symbols)

## 📁 New Files Created

### API Routes
- `/src/app/api/auth/verify-email/route.ts` - Verify email tokens
- `/src/app/api/auth/send-verification/route.ts` - Send verification emails
- `/src/app/api/auth/forgot-password/route.ts` - Send password reset emails
- `/src/app/api/auth/reset-password/route.ts` - Reset password with token

### Pages
- `/src/app/auth/verify-email/page.tsx` - Email verification page
- `/src/app/auth/reset-password/page.tsx` - Password reset page

### Components
- `/src/components/forgot-password-dialog.tsx` - Standalone forgot password dialog
- `/src/components/email-verification-banner.tsx` - Already existed, now integrated

## 🔧 Updated Files

### Core Files
- `/src/lib/auth.ts` - Added email verification token generation on signup
- `/src/lib/email.ts` - Added nodemailer support with fallback to console logging
- `/src/components/auth-dialog.tsx` - Added forgot password flow and email verification

### Database Schema
- `/prisma/schema.prisma` - Already had the required fields:
  - `emailVerified: Boolean`
  - `emailVerificationToken: String?`
  - `emailVerificationExpires: DateTime?`
  - `resetPasswordToken: String?`
  - `resetPasswordExpires: DateTime?`

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer @types/nodemailer
```

### 2. Update Environment Variables

Add to your `.env` file (optional for production):

```env
# Email Service (Optional - for production)
# Leave empty for development (emails will be logged to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@electronic.com
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Test the Features

#### Development Mode (Console Logging)
- Don't set SMTP environment variables
- Verification links will be logged to console
- Copy the link from console and paste in browser

#### Production Mode (Real Emails)
- Set up SMTP credentials (Gmail, SendGrid, AWS SES, etc.)
- Configure environment variables
- Emails will be sent to actual addresses

## 📧 Email Service Setup (Production)

### Option 1: Gmail
1. Enable 2-factor authentication
2. Generate an App Password
3. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password
   ```

### Option 2: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Option 3: AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_access_key
SMTP_PASS=your_aws_secret_key
```

## 🔐 Security Features

- Tokens are cryptographically secure (32 bytes random)
- Tokens expire after 24 hours
- Passwords are hashed with bcrypt (12 rounds)
- Password validation enforces strong passwords
- Reset tokens are single-use (deleted after use)

## 🎨 User Flow

### Sign Up Flow
1. User fills sign-up form
2. Account created with `emailVerified: false`
3. Verification email sent automatically
4. User clicks link in email
5. Email verified, banner disappears

### Forgot Password Flow
1. User clicks "Forgot Password?" in sign-in dialog
2. Enters email address
3. Receives reset link via email
4. Clicks link, enters new password
5. Password updated, can sign in

### Email Verification Banner
- Shows on all pages for unverified users
- "Resend verification email" button
- Dismissible with X button
- Auto-hides when email is verified

## 🧪 Testing

### Test Email Verification
1. Sign up with a new account
2. Check console for verification link
3. Copy and paste link in browser
4. Verify success message

### Test Password Reset
1. Click "Forgot Password?" in sign-in
2. Enter email address
3. Check console for reset link
4. Copy and paste link in browser
5. Enter new password
6. Sign in with new password

## 📱 UI Components

### Auth Dialog Updates
- Forgot password link below password field
- Forgot password form view
- "Back to Sign In" button
- Loading states for all actions

### Verification Pages
- Clean, centered design
- Loading spinner during verification
- Success/error states with icons
- Auto-redirect after success

## 🔄 Email Templates

Both verification and reset emails include:
- Professional HTML design
- Gradient button (blue to purple)
- Fallback text link
- Expiration notice
- Company branding

## 🐛 Troubleshooting

### Emails not sending
- Check SMTP credentials
- Verify firewall/network settings
- Check console for error messages
- Try with console logging first

### Verification link not working
- Check token hasn't expired (24 hours)
- Verify NEXTAUTH_URL is correct
- Check database for token match

### Password reset not working
- Ensure password meets requirements
- Check token hasn't expired
- Verify user exists in database

## 📊 Database Queries

The system automatically:
- Generates tokens on signup
- Stores tokens with expiry dates
- Clears tokens after verification
- Updates emailVerified status
- Handles token validation

## 🎯 Next Steps

Consider adding:
- Email service provider integration (SendGrid, Mailgun)
- Custom email templates
- Email verification reminders
- Password strength meter
- Two-factor authentication
- Social login email verification

## 📝 Notes

- Admin users bypass email verification
- Google OAuth users are auto-verified
- Tokens are single-use and expire
- All emails are HTML formatted
- Development mode logs to console
- Production mode sends real emails
