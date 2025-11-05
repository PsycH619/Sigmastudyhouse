# Sigma Study House - Enhanced Authentication System

## Overview

This document describes the completely reworked authentication system for Sigma Study House, featuring modern security practices, improved user experience, and comprehensive functionality.

## Table of Contents

1. [Features](#features)
2. [Security Improvements](#security-improvements)
3. [Architecture](#architecture)
4. [User Flows](#user-flows)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Customization](#customization)
8. [Migration Guide](#migration-guide)
9. [Production Deployment](#production-deployment)

---

## Features

### ✅ Implemented Features

#### Security
- **Password Hashing**: PBKDF2 with SHA-256 (100,000 iterations)
- **Input Sanitization**: XSS protection and validation
- **Session Management**: Token-based authentication with expiry
- **Rate Limiting**: Failed login attempt tracking
- **Account Lockout**: Automatic lockout after 5 failed attempts (15-minute duration)
- **Password Strength Validation**: Enforced strong password requirements
- **Remember Me**: Extended session duration (7 days)
- **Secure Logout**: Session cleanup and token invalidation

#### User Experience
- **Smooth Animations**: Slide-in, fade, and pulse effects
- **Real-time Validation**: Instant feedback on form inputs
- **Password Strength Indicator**: Visual representation with 4 levels
- **Password Visibility Toggle**: Eye icon for showing/hiding passwords
- **Loading States**: Spinner animations during async operations
- **Error Handling**: Clear, user-friendly error messages
- **Responsive Design**: Mobile-optimized interface

#### Functionality
- **Email/Password Login**: Traditional authentication method
- **User Registration**: Account creation with validation
- **Forgot Password**: Password reset workflow
- **Google Sign-In**: OAuth integration (ready for configuration)
- **Profile Management**: User information and settings
- **Automatic Migration**: Legacy plain-text passwords upgraded on login

---

## Security Improvements

### Before (Old System)

❌ Plain text passwords stored in localStorage
❌ No rate limiting
❌ Client-side only validation
❌ No session management
❌ Weak password requirements (6 characters)
❌ No input sanitization

### After (New System)

✅ PBKDF2 password hashing with salt
✅ Account lockout after failed attempts
✅ Enhanced validation on both client and business logic
✅ Token-based session management with expiry
✅ Strong password requirements (8+ chars, mixed case, numbers)
✅ Input sanitization and XSS protection
✅ Backward compatibility with automatic migration

---

## Architecture

### Core Components

```
AuthManager Class
├── Security Layer
│   ├── hashPassword()           - PBKDF2 hashing
│   ├── verifyPassword()         - Hash verification
│   ├── sanitizeInput()          - XSS protection
│   ├── validateEmail()          - Email format validation
│   └── validatePasswordStrength() - Password rules
│
├── Session Management
│   ├── generateSessionToken()   - Crypto-random tokens
│   ├── validateSession()        - Token verification
│   └── SESSION_DURATION         - Configurable expiry
│
├── Rate Limiting
│   ├── isAccountLocked()        - Lockout status check
│   ├── recordFailedAttempt()    - Attempt tracking
│   ├── resetLoginAttempts()     - Success handler
│   └── cleanupOldAttempts()     - Automatic cleanup
│
├── Authentication Flows
│   ├── login()                  - User authentication
│   ├── logout()                 - Session termination
│   ├── register()               - Account creation
│   ├── handleForgotPassword()   - Password reset
│   └── handleGoogleSignIn()     - OAuth integration
│
└── UI Management
    ├── updateAuthUI()           - Dynamic UI updates
    ├── showLoginModal()         - Modal control
    ├── initializeAuthModals()   - Event binding
    └── updatePasswordStrength() - Visual feedback
```

### Data Storage (localStorage)

```javascript
{
  // Current user session
  currentUser: {
    id: number,
    name: string,
    email: string,
    provider: 'email' | 'google',
    emailVerified: boolean,
    createdAt: string
  },

  // All registered users
  users: [{
    id: number,
    name: string,
    email: string,
    passwordHash: string,      // PBKDF2 hash
    passwordSalt: string,       // Random salt
    provider: string,
    emailVerified: boolean,
    createdAt: string,
    lastLogin: string
  }],

  // Active sessions
  sessions: {
    [token]: {
      userId: number,
      email: string,
      createdAt: number,
      expiresAt: number,
      rememberMe: boolean
    }
  },

  // Login attempt tracking
  loginAttempts: {
    [email]: {
      count: number,
      lastAttempt: number
    }
  },

  // Password reset tokens
  resetTokens: {
    [email]: {
      token: string,
      expiresAt: number,
      createdAt: number
    }
  },

  // Current session token
  sessionToken: string,

  // User credit balance
  userCredit: number
}
```

---

## User Flows

### 1. Sign Up Flow

```
User clicks "Sign Up"
  ↓
Modal opens with registration form
  ↓
User enters: Name, Email, Password, Confirm Password
  ↓
Real-time password strength indicator updates
  ↓
On submit:
  ├─ Sanitize all inputs
  ├─ Validate email format
  ├─ Check password strength (8+ chars, mixed case, numbers)
  ├─ Verify password match
  ├─ Check for existing account
  ├─ Generate salt and hash password (PBKDF2)
  ├─ Create user record
  ├─ Generate session token
  ├─ Auto-login user
  └─ Display success message
  ↓
User is now authenticated
```

### 2. Sign In Flow

```
User clicks "Sign In"
  ↓
Modal opens with login form
  ↓
User enters: Email, Password
Optional: Check "Remember Me"
  ↓
On submit:
  ├─ Sanitize inputs
  ├─ Validate email format
  ├─ Check account lockout status
  │   └─ If locked: Show remaining time
  ├─ Find user by email
  ├─ Verify password hash
  │   ├─ If invalid: Record failed attempt
  │   └─ If valid: Reset attempt counter
  ├─ Update last login timestamp
  ├─ Generate session token
  │   └─ Extended duration if "Remember Me" checked
  ├─ Create session
  └─ Update UI
  ↓
User is now authenticated
```

### 3. Forgot Password Flow

```
User clicks "Forgot Password?"
  ↓
Form switches to password reset
  ↓
User enters: Email
  ↓
On submit:
  ├─ Validate email format
  ├─ Check if user exists (silently)
  ├─ Generate reset token
  ├─ Store token with 1-hour expiry
  ├─ Log token to console (demo mode)
  └─ Display success message (always)
  ↓
Auto-switch back to login after 2 seconds
```

### 4. Account Lockout Flow

```
Failed login attempt
  ↓
Record attempt with timestamp
  ↓
Check attempt count
  ├─ < 3 remaining: Show warning
  ├─ = 0 remaining: Lock account for 15 minutes
  └─ Lockout expired: Auto-reset attempts
  ↓
If locked:
  └─ Display remaining lockout time
```

---

## API Reference

### AuthManager Class Methods

#### Security Methods

```javascript
// Hash password with PBKDF2
async hashPassword(password, salt = null)
// Returns: { hash: string, salt: string }

// Verify password against hash
async verifyPassword(password, hash, salt)
// Returns: boolean

// Sanitize user input
sanitizeInput(input)
// Returns: string

// Validate email format
validateEmail(email)
// Returns: boolean

// Check password strength
validatePasswordStrength(password)
// Returns: { valid: boolean, errors: string[] }
```

#### Authentication Methods

```javascript
// User login
async login(userData, rememberMe = false)
// Parameters:
//   - userData: { id, name, email, provider, ... }
//   - rememberMe: boolean
// Returns: void

// User logout
async logout()
// Returns: void

// User registration
async register(userData)
// Parameters:
//   - userData: { name, email, password, provider }
// Returns: boolean (success)

// Handle forgot password
async handleForgotPassword(event)
// Returns: void
```

#### Session Management

```javascript
// Generate cryptographically secure token
generateSessionToken()
// Returns: string (64-character hex)

// Validate current session
validateSession()
// Returns: void (logs out if invalid)

// Check account lock status
isAccountLocked(email)
// Returns: false | { locked: true, remainingMinutes: number }

// Record failed login
recordFailedAttempt(email)
// Returns: string | null (warning message)

// Reset login attempts
resetLoginAttempts(email)
// Returns: void
```

#### UI Methods

```javascript
// Update authentication UI
updateAuthUI()
// Returns: void

// Show/hide login modal
showLoginModal()
hideLoginModal()
// Returns: void

// Show forgot password form
showForgotPasswordForm()
// Returns: void

// Update password strength indicator
updatePasswordStrength(password)
// Returns: void
```

---

## Usage Examples

### Basic Usage

```javascript
// Initialize auth manager (automatic on page load)
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});
```

### Check Current User

```javascript
// Get current authenticated user
const currentUser = window.authManager?.currentUser;

if (currentUser) {
    console.log('Logged in as:', currentUser.name);
    console.log('Email:', currentUser.email);
    console.log('Provider:', currentUser.provider);
} else {
    console.log('Not logged in');
}
```

### Programmatic Login

```javascript
// Manually trigger login
const userData = {
    id: 12345,
    name: 'John Doe',
    email: 'john@example.com',
    provider: 'email'
};

await window.authManager.login(userData, true); // with remember me
```

### Check Password Strength

```javascript
const password = 'MyP@ssw0rd123';
const validation = window.authManager.validatePasswordStrength(password);

if (validation.valid) {
    console.log('Password is strong!');
} else {
    console.log('Password errors:', validation.errors);
    // ['Password must contain uppercase letters']
}
```

### Custom Validation

```javascript
// Add custom validation before login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Custom validation logic
    const email = document.getElementById('loginEmail').value;

    if (email.endsWith('@company.com')) {
        showNotification('Please use your personal email', 'warning');
        return;
    }

    // Continue with normal login
    await window.authManager.handleLogin(e);
});
```

---

## Customization

### Configuration Options

Edit these constants in `auth.js`:

```javascript
class AuthManager {
    constructor() {
        // Maximum failed login attempts before lockout
        this.MAX_LOGIN_ATTEMPTS = 5;

        // Lockout duration in milliseconds (15 minutes)
        this.LOCKOUT_DURATION = 15 * 60 * 1000;

        // Session duration in milliseconds (7 days)
        this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
    }
}
```

### Password Hashing Settings

```javascript
async hashPassword(password, salt = null) {
    const hashBuffer = await window.crypto.subtle.deriveBits({
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,  // Increase for more security (slower)
        hash: 'SHA-256'      // Can use SHA-384 or SHA-512
    }, keyMaterial, 256);
}
```

### Password Strength Requirements

```javascript
validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {  // Change minimum length
        errors.push('Password must be at least 8 characters long');
    }

    // Add custom requirements
    if (!/[@#$%^&*]/.test(password)) {
        errors.push('Password must contain special characters (@#$%^&*)');
    }

    return { valid: errors.length === 0, errors };
}
```

### Custom Styling

Edit `css/auth.css` to customize colors, animations, and layout:

```css
:root {
    --primary: #ff6b35;          /* Primary color */
    --success: #2ecc71;          /* Success color */
    --danger: #e74c3c;           /* Error color */
    --warning: #f39c12;          /* Warning color */
}

/* Customize modal appearance */
.auth-container {
    max-width: 500px;            /* Modal width */
    border-radius: 20px;         /* Corner radius */
    padding: 40px;               /* Internal spacing */
}
```

---

## Migration Guide

### Upgrading from Old System

The new system is **backward compatible**. Existing users with plain-text passwords will be automatically migrated:

```javascript
// In handleLogin()
if (user.passwordHash && user.passwordSalt) {
    // New hashed password
    passwordValid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
} else if (user.password) {
    // Legacy plain-text password
    passwordValid = user.password === password;

    // Automatically upgrade to hashed password
    if (passwordValid) {
        const { hash, salt } = await this.hashPassword(password);
        user.passwordHash = hash;
        user.passwordSalt = salt;
        delete user.password;
        await this.saveToDatabase('users', this.users);
    }
}
```

### Manual Migration Script

If you need to migrate all users at once:

```javascript
async function migrateAllPasswords() {
    const authManager = window.authManager;
    const users = authManager.users;

    for (const user of users) {
        if (user.password && !user.passwordHash) {
            const { hash, salt } = await authManager.hashPassword(user.password);
            user.passwordHash = hash;
            user.passwordSalt = salt;
            delete user.password;
            console.log(`Migrated user: ${user.email}`);
        }
    }

    await authManager.saveToDatabase('users', users);
    console.log('Migration complete!');
}

// Run migration
await migrateAllPasswords();
```

---

## Production Deployment

### ⚠️ Important: This is Still a Demo Implementation

The current system uses localStorage for demonstration purposes. For production, you **MUST** implement:

### 1. Backend API

Create server-side endpoints:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/verify-email
```

### 2. Server-Side Password Hashing

Use established libraries:

```javascript
// Node.js with bcrypt
const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
```

### 3. Secure Session Management

Use HTTP-only cookies with server-side sessions:

```javascript
// Express.js example
app.post('/api/auth/login', async (req, res) => {
    // Verify credentials...

    // Create session
    req.session.userId = user.id;

    // Set HTTP-only cookie
    res.cookie('sessionId', session.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, user: sanitizedUser });
});
```

### 4. Database Integration

Replace localStorage with a proper database:

```javascript
// Example with PostgreSQL
const query = `
    INSERT INTO users (name, email, password_hash, password_salt, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, name, email, created_at
`;

const result = await db.query(query, [name, email, hash, salt]);
```

### 5. Email Service

Implement actual password reset emails:

```javascript
// Example with SendGrid
const sgMail = require('@sendgrid/mail');

async function sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;

    const msg = {
        to: email,
        from: 'noreply@sigmastudyhouse.com',
        subject: 'Password Reset Request',
        html: `
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 1 hour.</p>
        `
    };

    await sgMail.send(msg);
}
```

### 6. Security Headers

Implement security headers:

```javascript
// Express.js with Helmet
const helmet = require('helmet');
app.use(helmet());

// Custom security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
```

### 7. HTTPS

Always use HTTPS in production:

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name sigmastudyhouse.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 8. Rate Limiting

Implement server-side rate limiting:

```javascript
// Express with express-rate-limit
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later.'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    // Handle login...
});
```

### 9. Input Validation

Use validation libraries:

```javascript
// Express with express-validator
const { body, validationResult } = require('express-validator');

app.post('/api/auth/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('name').trim().isLength({ min: 2 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Handle registration...
    }
);
```

### 10. Logging and Monitoring

Implement comprehensive logging:

```javascript
// Winston logger
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Log authentication events
logger.info('User login', {
    userId: user.id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get('user-agent')
});
```

---

## Testing

### Manual Testing Checklist

- [ ] Sign up with valid credentials
- [ ] Sign up with weak password (should fail)
- [ ] Sign up with existing email (should fail)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password 5 times (should lock account)
- [ ] Wait 15 minutes and try again (should unlock)
- [ ] Use "Remember Me" and close/reopen browser
- [ ] Request password reset
- [ ] Sign out and verify session cleared
- [ ] Test password visibility toggle
- [ ] Test password strength indicator
- [ ] Test responsive design on mobile

### Automated Testing (Future)

```javascript
// Example Jest test
describe('AuthManager', () => {
    test('should hash passwords correctly', async () => {
        const authManager = new AuthManager();
        const password = 'TestPassword123';

        const { hash, salt } = await authManager.hashPassword(password);

        expect(hash).toBeTruthy();
        expect(salt).toBeTruthy();
        expect(hash).not.toBe(password);
    });

    test('should validate strong passwords', () => {
        const authManager = new AuthManager();
        const result = authManager.validatePasswordStrength('StrongP@ss123');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});
```

---

## Troubleshooting

### Common Issues

**Q: "Account temporarily locked" message won't go away**

A: Clear localStorage or wait 15 minutes. To manually unlock:

```javascript
// Open browser console
window.authManager.loginAttempts = {};
window.authManager.saveToDatabase('loginAttempts', {});
```

**Q: Password strength indicator not updating**

A: Make sure the password input has `id="registerPassword"` and the strength div has class `password-strength`.

**Q: Google Sign-In not working**

A: You need to:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sign-In API
3. Create OAuth 2.0 credentials
4. Replace `YOUR_GOOGLE_CLIENT_ID` in `auth.js` line 159

**Q: Session expires too quickly**

A: Adjust `SESSION_DURATION` in the AuthManager constructor.

**Q: Legacy users can't log in**

A: The system automatically migrates on login. If issues persist, use the manual migration script.

---

## Browser Compatibility

- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Opera 67+
- ⚠️ IE 11 (not supported - uses Web Crypto API)

---

## Credits

- **Password Hashing**: Web Crypto API (PBKDF2)
- **Icons**: Font Awesome 6.4.0
- **Animations**: Custom CSS3 animations
- **Design**: Material Design inspired

---

## License

This authentication system is part of Sigma Study House project.
© 2023 Sigma Study House. All rights reserved.

---

## Support

For questions or issues:
- Email: info@sigmastudyhouse.com
- Phone: 00962796101060
- Location: Wasfi Al-Tal Street, Amman, Jordan

---

## Changelog

### Version 2.0.0 (Current)

**Added:**
- PBKDF2 password hashing
- Session token management
- Account lockout mechanism
- Forgot password flow
- Remember me functionality
- Enhanced password strength validation
- Input sanitization
- Smooth animations
- Backward compatibility with migration

**Improved:**
- Error messages clarity
- Loading states
- UI/UX design
- Mobile responsiveness
- Security overall

**Removed:**
- Plain text password storage
- Weak password requirements (6 chars minimum)

### Version 1.0.0 (Legacy)

- Basic email/password authentication
- Simple form validation
- localStorage persistence
