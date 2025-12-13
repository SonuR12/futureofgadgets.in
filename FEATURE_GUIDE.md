# Feature Guide: Email Verification & Password Reset

## 🎯 User-Facing Features

### 1. Sign Up with Email Verification

**What Users See:**
1. Fill out sign-up form (name, email, phone, password)
2. Click "Create Account"
3. See success message: "Account created! Please check your email to verify."
4. Receive email with verification link
5. Click link to verify email
6. See success page: "Email Verified!"

**Email Verification Banner:**
- Yellow banner appears on all pages for unverified users
- Shows: "Email verification required"
- Button: "Resend verification email"
- Can be dismissed with X button

### 2. Forgot Password

**What Users See:**
1. Click "Sign In" button
2. See "Forgot Password?" link below password field
3. Click link to show forgot password form
4. Enter email address
5. Click "Send Reset Link"
6. See success message: "Password reset link sent to your email!"
7. Receive email with reset link
8. Click link to open reset password page
9. Enter new password (with validation)
10. Click "Reset Password"
11. See success message and redirect to home

### 3. Resend Verification Email

**From Email Verification Banner:**
1. See yellow banner at top of page
2. Click "Resend verification email"
3. See success message: "Verification email sent! Check your inbox."

**From Profile Page:**
- Email verification banner also appears in profile
- Same resend functionality

## 🎨 UI Components

### Auth Dialog States

#### Sign In View
```
┌─────────────────────────────────┐
│     Welcome Back!               │
│  Sign in to your account        │
├─────────────────────────────────┤
│  Email address                  │
│  [________________]             │
│                                 │
│  Password      Forgot Password? │
│  [________________] 👁          │
│                                 │
│  [    Sign In    ]              │
│                                 │
│  ─── Or continue with ───       │
│                                 │
│  [🔵 Continue with Google]      │
│                                 │
│  Don't have an account?         │
│  Sign up here                   │
└─────────────────────────────────┘
```

#### Forgot Password View
```
┌─────────────────────────────────┐
│     Forgot Password             │
│  Enter your email to reset      │
├─────────────────────────────────┤
│  Email address                  │
│  [________________]             │
│                                 │
│  [  Send Reset Link  ]          │
│                                 │
│  Back to Sign In                │
└─────────────────────────────────┘
```

#### Sign Up View
```
┌─────────────────────────────────┐
│     Create Account              │
│  Sign up to get started         │
├─────────────────────────────────┤
│  Full Name                      │
│  [________________]             │
│                                 │
│  Email address                  │
│  [________________]             │
│                                 │
│  Phone Number                   │
│  [________________]             │
│                                 │
│  Password                       │
│  [________________] 👁          │
│  ⚠ Missing: special characters  │
│                                 │
│  [  Create Account  ]           │
│                                 │
│  ─── Or continue with ───       │
│                                 │
│  [🔵 Continue with Google]      │
│                                 │
│  Already have an account?       │
│  Sign in here                   │
└─────────────────────────────────┘
```

### Email Verification Banner
```
┌─────────────────────────────────────────────────────┐
│ 📧  Email verification required                  ✕  │
│     Please verify your email address to access      │
│     all features.                                    │
│     [Resend verification email]                      │
└─────────────────────────────────────────────────────┘
```

### Verification Pages

#### Email Verification (Loading)
```
┌─────────────────────────────────┐
│                                 │
│         ⟳ (spinning)            │
│                                 │
│    Verifying Email...           │
│                                 │
│  Please wait while we verify    │
│  your email address.            │
│                                 │
└─────────────────────────────────┘
```

#### Email Verification (Success)
```
┌─────────────────────────────────┐
│                                 │
│         ✓ (green)               │
│                                 │
│    Email Verified!              │
│                                 │
│  Your email has been verified   │
│  successfully. Redirecting...   │
│                                 │
└─────────────────────────────────┘
```

#### Email Verification (Error)
```
┌─────────────────────────────────┐
│                                 │
│         ✕ (red)                 │
│                                 │
│    Verification Failed          │
│                                 │
│  The verification link is       │
│  invalid or has expired.        │
│                                 │
└─────────────────────────────────┘
```

#### Password Reset Page
```
┌─────────────────────────────────┐
│     Reset Password              │
│  Enter your new password        │
├─────────────────────────────────┤
│  New Password                   │
│  [________________] 👁          │
│  8+ chars, letters, numbers,    │
│  symbols                        │
│                                 │
│  Confirm Password               │
│  [________________]             │
│                                 │
│  [  Reset Password  ]           │
└─────────────────────────────────┘
```

## 📧 Email Templates

### Verification Email
```
┌─────────────────────────────────────────┐
│         Future Of Gadegets                  │
│      Verify your email address          │
├─────────────────────────────────────────┤
│                                         │
│  Welcome to Future Of Gadegets!             │
│                                         │
│  Thank you for signing up. Please       │
│  verify your email address by clicking  │
│  the button below:                      │
│                                         │
│     [Verify Email Address]              │
│     (gradient blue to purple button)    │
│                                         │
│  If the button doesn't work, copy and   │
│  paste this link into your browser:     │
│  http://localhost:3000/auth/verify...   │
│                                         │
│  This link will expire in 24 hours.     │
│  If you didn't create an account,       │
│  please ignore this email.              │
│                                         │
└─────────────────────────────────────────┘
```

### Password Reset Email
```
┌─────────────────────────────────────────┐
│         Future Of Gadegets                  │
│       Reset your password               │
├─────────────────────────────────────────┤
│                                         │
│  Password Reset Request                 │
│                                         │
│  We received a request to reset your    │
│  password. Click the button below to    │
│  create a new password:                 │
│                                         │
│     [Reset Password]                    │
│     (gradient blue to purple button)    │
│                                         │
│  If the button doesn't work, copy and   │
│  paste this link into your browser:     │
│  http://localhost:3000/auth/reset...    │
│                                         │
│  This link will expire in 24 hours.     │
│  If you didn't request this reset,      │
│  please ignore this email.              │
│                                         │
└─────────────────────────────────────────┘
```

## 🔔 Toast Notifications

Users see toast notifications for:

### Success Messages
- ✅ "Account created! Please check your email to verify."
- ✅ "Welcome back!"
- ✅ "Password reset link sent to your email!"
- ✅ "Email verified successfully!"
- ✅ "Password reset successfully!"
- ✅ "Verification email sent! Check your inbox."

### Error Messages
- ❌ "Invalid email or password. Please try again."
- ❌ "Account already exists. Please sign in."
- ❌ "Password must be 8+ characters with letters, numbers, and special characters"
- ❌ "Passwords do not match"
- ❌ "Please enter your email"
- ❌ "Invalid reset link"
- ❌ "Token expired"

## 🎯 User Journey Examples

### New User Journey
1. Visit website
2. Click "Sign In" → Switch to "Sign Up"
3. Fill form and submit
4. See success toast
5. Check email (or console in dev)
6. Click verification link
7. See success page
8. Redirected to home
9. No more verification banner

### Forgot Password Journey
1. Visit website
2. Click "Sign In"
3. Click "Forgot Password?"
4. Enter email
5. See success toast
6. Check email (or console in dev)
7. Click reset link
8. Enter new password
9. See success toast
10. Redirected to home
11. Sign in with new password

### Resend Verification Journey
1. Sign in with unverified account
2. See yellow banner
3. Click "Resend verification email"
4. See success toast
5. Check email (or console in dev)
6. Click verification link
7. Banner disappears

## 💡 Tips for Users

### Password Requirements
- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Email Verification
- Check spam folder if email not received
- Verification link expires in 24 hours
- Can resend verification email anytime
- Must verify to access all features

### Password Reset
- Reset link expires in 24 hours
- Can request new reset link anytime
- Old password becomes invalid after reset
- Must meet password requirements

## 🎨 Design Features

### Colors
- Primary: Blue (#2563eb) to Purple (#7c3aed) gradient
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Yellow (#f59e0b)

### Icons
- 📧 Mail icon for verification banner
- 👁 Eye icon for password visibility
- ✓ Check icon for success
- ✕ X icon for errors
- ⟳ Spinner for loading

### Animations
- Smooth transitions
- Loading spinners
- Toast slide-in animations
- Button hover effects

## 📱 Responsive Design

All features work on:
- Desktop (full dialog view)
- Tablet (adapted layout)
- Mobile (single column, full width)

## ♿ Accessibility

- Keyboard navigation support
- Screen reader friendly
- Clear error messages
- Focus indicators
- ARIA labels
