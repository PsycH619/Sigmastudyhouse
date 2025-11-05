# Authentication System - Quick Start Guide

## 🚀 Quick Reference

### Files Modified/Created

```
✅ js/auth.js              - Complete rewrite with security features
✅ css/auth.css            - Enhanced UI with animations
✅ index.html              - Added Remember Me & Forgot Password
✅ AUTHENTICATION_SYSTEM.md - Comprehensive documentation
✅ AUTH_QUICK_START.md     - This quick reference
```

---

## 🔐 Key Features Implemented

### Security
- ✅ PBKDF2 password hashing (100k iterations, SHA-256)
- ✅ Account lockout after 5 failed attempts (15 min)
- ✅ Session token management with expiry
- ✅ Input sanitization (XSS protection)
- ✅ Strong password validation (8+ chars, mixed case, numbers)
- ✅ Remember Me (7-day sessions)

### User Experience
- ✅ Smooth animations and transitions
- ✅ Real-time password strength indicator (4 levels)
- ✅ Password visibility toggle
- ✅ Loading spinners
- ✅ Clear error messages
- ✅ Forgot password flow
- ✅ Mobile responsive

---

## 📝 Testing Checklist

### Sign Up Flow
```bash
1. Click "Sign Up" button
2. Fill in the form:
   Name: Test User
   Email: test@example.com
   Password: TestPass123
   Confirm: TestPass123
3. Watch password strength indicator
4. Submit form
✅ Should create account and auto-login
```

### Sign In Flow
```bash
1. Click "Sign In" button
2. Enter credentials
3. Check "Remember Me" (optional)
4. Submit form
✅ Should login successfully
```

### Account Lockout Test
```bash
1. Enter correct email
2. Enter wrong password 5 times
✅ Should lock account for 15 minutes
✅ Should show remaining time
```

### Forgot Password
```bash
1. Click "Forgot Password?"
2. Enter email address
3. Submit
✅ Should show success message
✅ Check console for reset token
```

---

## 🎨 UI Components

### Password Strength Levels

| Strength | Color | Width | Requirements |
|----------|-------|-------|--------------|
| Weak | Red | 25% | < 30 points |
| Medium | Orange | 50% | 30-49 points |
| Strong | Yellow | 75% | 50-69 points |
| Very Strong | Green | 100% | 70+ points |

### Password Strength Calculation
```javascript
- Length 8+:      +25 points
- Length 12+:     +10 points
- Lowercase:      +15 points
- Uppercase:      +15 points
- Numbers:        +15 points
- Special chars:  +20 points
```

---

## 🔧 Configuration

### Adjust Security Settings

Edit `js/auth.js` (lines 20-22):

```javascript
this.MAX_LOGIN_ATTEMPTS = 5;              // Failed attempts before lockout
this.LOCKOUT_DURATION = 15 * 60 * 1000;   // 15 minutes
this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
```

### Change Password Requirements

Edit `js/auth.js` (lines 189-209):

```javascript
validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {  // Change minimum length
        errors.push('Password must be at least 8 characters long');
    }
    // Add your custom rules here...
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Can't login after testing lockout
**Solution:**
```javascript
// Open browser console (F12)
window.authManager.loginAttempts = {};
window.authManager.saveToDatabase('loginAttempts', {});
```

### Issue: Session expires immediately
**Solution:** Check if cookies are enabled and localStorage is accessible.

### Issue: Password strength not updating
**Solution:** Ensure input has `id="registerPassword"` attribute.

### Issue: Google Sign-In not working
**Solution:**
1. Get Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Replace line 159 in `js/auth.js`:
```javascript
client_id: "YOUR_ACTUAL_CLIENT_ID"
```

---

## 💻 Developer Usage

### Check if user is logged in

```javascript
if (window.authManager?.currentUser) {
    console.log('User:', window.authManager.currentUser.name);
} else {
    console.log('Not logged in');
}
```

### Programmatic login

```javascript
await window.authManager.login({
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    provider: 'email'
}, true); // rememberMe = true
```

### Logout

```javascript
await window.authManager.logout();
```

### Check password strength

```javascript
const result = window.authManager.validatePasswordStrength('MyPass123');
console.log(result.valid); // true/false
console.log(result.errors); // array of error messages
```

### Hash a password

```javascript
const { hash, salt } = await window.authManager.hashPassword('MyPassword123');
console.log(hash); // long hex string
console.log(salt); // comma-separated numbers
```

---

## 📊 Data Structure

### User Object
```javascript
{
    id: 1234567890,
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "abc123...",     // PBKDF2 hash
    passwordSalt: "1,2,3,4,...",   // Random salt
    provider: "email",             // or "google"
    emailVerified: false,
    createdAt: "2023-12-01T10:30:00.000Z",
    lastLogin: "2023-12-05T15:45:00.000Z"
}
```

### Session Object
```javascript
{
    token: "abc123...",            // 64-char hex token
    userId: 1234567890,
    email: "john@example.com",
    createdAt: 1701523456789,
    expiresAt: 1702128256789,      // timestamp
    rememberMe: true
}
```

---

## 🎯 Key Methods Reference

### Authentication
```javascript
authManager.login(userData, rememberMe)      // Login user
authManager.logout()                         // Logout user
authManager.register(userData)               // Register new user
authManager.handleForgotPassword(event)      // Password reset
```

### Security
```javascript
authManager.hashPassword(password, salt)     // Hash password
authManager.verifyPassword(pass, hash, salt) // Verify hash
authManager.sanitizeInput(input)             // Clean input
authManager.validateEmail(email)             // Validate email
authManager.validatePasswordStrength(pass)   // Check strength
```

### Session
```javascript
authManager.generateSessionToken()           // Create token
authManager.validateSession()                // Check session
authManager.isAccountLocked(email)           // Check lockout
authManager.recordFailedAttempt(email)       // Track failure
authManager.resetLoginAttempts(email)        // Clear attempts
```

### UI
```javascript
authManager.showLoginModal()                 // Show modal
authManager.hideLoginModal()                 // Hide modal
authManager.updateAuthUI()                   // Update UI
authManager.updatePasswordStrength(pass)     // Update indicator
```

---

## 🎨 CSS Classes

### Form States
```css
.form-control              /* Normal input */
.form-control:focus        /* Focused input */
.form-control:hover        /* Hovered input */
.form-control.error        /* Error state (shakes) */
```

### Button States
```css
.btn                       /* Normal button */
.btn:hover                 /* Hovered (ripple effect) */
.btn:active                /* Pressed (scale down) */
.btn:disabled              /* Disabled state */
.btn .fa-spinner           /* Loading spinner */
```

### Password Strength
```css
.password-strength         /* Container */
.strength-weak             /* Red (25%) */
.strength-medium           /* Orange (50%) */
.strength-strong           /* Yellow (75%) */
.strength-very-strong      /* Green (100%, pulsing) */
```

### Animations
```css
@keyframes slideInUp       /* Modal entrance */
@keyframes shake           /* Error shake */
@keyframes pulse           /* Strong password */
@keyframes spin            /* Loading spinner */
@keyframes slideInDown     /* Warning appearance */
```

---

## 🔄 Migration from Old System

### Automatic Migration

Old users with plain-text passwords are **automatically upgraded** on login:

```javascript
// Old format
{
    email: "user@example.com",
    password: "plaintext123"
}

// Automatically converts to
{
    email: "user@example.com",
    passwordHash: "abc123...",
    passwordSalt: "1,2,3,4..."
}
```

### Manual Migration (All Users)

```javascript
// Run in browser console
async function migrateAllUsers() {
    const users = window.authManager.users;
    for (const user of users) {
        if (user.password && !user.passwordHash) {
            const { hash, salt } = await window.authManager.hashPassword(user.password);
            user.passwordHash = hash;
            user.passwordSalt = salt;
            delete user.password;
        }
    }
    await window.authManager.saveToDatabase('users', users);
    console.log('✅ All users migrated!');
}

await migrateAllUsers();
```

---

## 🚨 Production Deployment

### ⚠️ CRITICAL: Before Going Live

This system uses **localStorage** for demo purposes only.

**YOU MUST IMPLEMENT:**

1. ✅ Backend API server
2. ✅ Real database (PostgreSQL, MongoDB, etc.)
3. ✅ Server-side password hashing
4. ✅ HTTP-only cookies for sessions
5. ✅ HTTPS/SSL certificates
6. ✅ Email service for password resets
7. ✅ Rate limiting on server
8. ✅ CSRF protection
9. ✅ Security headers
10. ✅ Logging and monitoring

See `AUTHENTICATION_SYSTEM.md` for full production guide.

---

## 📞 Support

**Questions?**
- Email: info@sigmastudyhouse.com
- Phone: 00962796101060

**Found a bug?**
- Check browser console (F12)
- Clear localStorage and try again
- Check if cookies are enabled

---

## ✅ Final Checklist

Before deploying:

- [ ] Tested sign up flow
- [ ] Tested sign in flow
- [ ] Tested account lockout
- [ ] Tested forgot password
- [ ] Tested remember me
- [ ] Tested on mobile
- [ ] Reviewed security settings
- [ ] Read production deployment guide
- [ ] Configured Google Sign-In (if using)
- [ ] Tested logout functionality

---

## 🎉 What's New in v2.0

| Feature | Old System | New System |
|---------|------------|------------|
| Password Storage | Plain text ❌ | PBKDF2 hashed ✅ |
| Session Management | None ❌ | Token-based ✅ |
| Account Lockout | None ❌ | 5 attempts, 15 min ✅ |
| Password Requirements | 6 chars ❌ | 8+ chars, mixed ✅ |
| Input Sanitization | None ❌ | XSS protection ✅ |
| Forgot Password | None ❌ | Full workflow ✅ |
| Remember Me | None ❌ | 7-day sessions ✅ |
| Password Strength | Basic ❌ | 4-level indicator ✅ |
| Animations | Basic ❌ | Smooth & modern ✅ |
| Mobile Support | Basic ❌ | Fully responsive ✅ |

---

## 📚 Additional Resources

- Full Documentation: `AUTHENTICATION_SYSTEM.md`
- Firebase Setup: `FIREBASE_SETUP.md`
- Authentication Guide: `AUTHENTICATION_GUIDE.md`

---

**Made with ❤️ for Sigma Study House**

Last Updated: December 2023
Version: 2.0.0
