# Firebase Migration Guide

## What Changed?

Your authentication system has been completely migrated from localStorage to Firebase. This provides:

✅ **Production-ready authentication**
✅ **Real database (Firestore) instead of localStorage**
✅ **Automatic session management**
✅ **Email verification**
✅ **Password reset emails**
✅ **Google Sign-In support**
✅ **Better security**

---

## Files Modified

### New Files
- `FIREBASE_SETUP_GUIDE.md` - Complete Firebase setup instructions
- `FIREBASE_MIGRATION.md` - This file
- `js/auth-localStorage.js.backup` - Backup of old localStorage-based auth
- `js/auth.js.backup` - Another backup

### Modified Files
- `js/auth.js` - Completely rewritten to use Firebase Authentication
- `index.html` - Added Firebase SDK scripts
- `js/firebase-config.js` - Placeholder config (needs your Firebase credentials)
- `js/database.js` - Database abstraction layer (already existed)

---

## Key Differences

### Before (localStorage)

```javascript
// Registration
const user = {
    email: "user@example.com",
    passwordHash: "hashed_password",
    passwordSalt: "salt"
};
localStorage.setItem('users', JSON.stringify([user]));
```

### After (Firebase)

```javascript
// Registration - Firebase handles everything
await auth.createUserWithEmailAndPassword(email, password);
// User data automatically stored in Firebase Auth
// Additional data saved to Firestore
```

---

## What You Need to Do

### 1. Set Up Firebase (Required)

Follow **FIREBASE_SETUP_GUIDE.md** to:
1. Create Firebase project
2. Enable Authentication (Email/Password & Google)
3. Set up Firestore database
4. Copy Firebase configuration
5. Update `js/firebase-config.js` with your credentials

**⚠️ Until you complete this, the authentication will not work!**

### 2. Test the System

After Firebase setup:
1. Open your website
2. Try signing up with a new account
3. Check your email for verification link
4. Try signing in
5. Try "Forgot Password"
6. Try Google Sign-In (if enabled)

### 3. Notify Existing Users (If Any)

If you have existing users from the old localStorage system:

**Option A**: Users create new accounts
- Old localStorage data will remain in browser but won't be used
- Users need to sign up again
- Simple but requires user action

**Option B**: Provide migration path
- Use Firebase Admin SDK to import users
- Requires backend setup
- See Firebase documentation for user import

---

## Feature Comparison

| Feature | localStorage (Old) | Firebase (New) |
|---------|-------------------|----------------|
| Password Storage | PBKDF2 (client-side) | Firebase Auth (secure) |
| Session Management | Manual tokens | Automatic |
| Password Reset | Mock flow | Real email sent |
| Email Verification | Not implemented | Automatic |
| Google Sign-In | Partially implemented | Fully working |
| Data Persistence | Browser only | Cloud database |
| Cross-device | ❌ | ✅ |
| Data Loss Risk | High (browser clear) | None |
| Account Recovery | Not possible | Email-based |
| Security | Good for demo | Production-ready |

---

## Authentication Flow Changes

### Registration Flow

**Before**:
1. User fills form
2. Password hashed with PBKDF2
3. User saved to localStorage
4. Session token created
5. Auto-login

**After**:
1. User fills form
2. Firebase creates account (password handled securely)
3. Email verification sent
4. User document created in Firestore
5. Auto-login
6. `onAuthStateChanged` listener updates UI

### Login Flow

**Before**:
1. User enters credentials
2. Password verified against localStorage hash
3. Session token created
4. User data loaded from localStorage

**After**:
1. User enters credentials
2. Firebase validates credentials
3. `onAuthStateChanged` triggered
4. User data loaded from Firestore
5. Session automatically managed

### Password Reset

**Before**:
1. User enters email
2. Mock reset token generated
3. Token logged to console (no actual email)

**After**:
1. User enters email
2. Firebase sends password reset email
3. User clicks link in email
4. Password reset page opens
5. User sets new password

---

## Code Changes Explained

### Constructor

**Before**:
```javascript
constructor() {
    this.currentUser = this.loadFromDatabase('currentUser');
    this.users = this.loadFromDatabase('users') || [];
    this.sessions = this.loadFromDatabase('sessions') || {};
}
```

**After**:
```javascript
constructor() {
    this.currentUser = null; // Will be set by onAuthStateChanged
    this.auth = window.firebaseAuth;
    this.db = window.db; // DatabaseManager

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
        if (user) {
            this.handleAuthStateChange(user);
        }
    });
}
```

### Registration

**Before**:
```javascript
async register(event) {
    // Hash password
    const { hash, salt } = await this.hashPassword(password);

    // Create user object
    const user = { email, passwordHash: hash, passwordSalt: salt };

    // Save to localStorage
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
}
```

**After**:
```javascript
async register(event) {
    // Firebase handles password hashing and storage
    const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);

    // Update profile
    await userCredential.user.updateProfile({ displayName: name });

    // Send verification email
    await userCredential.user.sendEmailVerification();

    // onAuthStateChanged will handle the rest
}
```

### Login

**Before**:
```javascript
async handleLogin(event) {
    // Find user in localStorage
    const user = this.users.find(u => u.email === email);

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);

    // Create session
    const token = this.generateSessionToken();
    this.sessions[token] = { userId: user.id, ... };
}
```

**After**:
```javascript
async handleLogin(event) {
    // Firebase handles everything
    await this.auth.signInWithEmailAndPassword(email, password);

    // Set persistence
    if (rememberMe) {
        await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }

    // onAuthStateChanged will update UI
}
```

### Password Reset

**Before**:
```javascript
async handleForgotPassword(event) {
    // Generate mock token
    const resetToken = Math.random().toString(36);
    console.log('Reset token:', resetToken);

    // No actual email sent
    this.showNotification('Check console for reset token', 'success');
}
```

**After**:
```javascript
async handleForgotPassword(event) {
    // Firebase sends real email
    await this.auth.sendPasswordResetEmail(email);

    this.showNotification('Password reset email sent! Check your inbox.', 'success');
}
```

---

## Removed Features (No Longer Needed)

These features were in the old system but are now handled by Firebase:

- `hashPassword()` - Firebase handles password hashing
- `verifyPassword()` - Firebase handles password verification
- `generateSessionToken()` - Firebase manages sessions
- `validateSession()` - Firebase tracks auth state
- `saveToDatabase()` / `loadFromDatabase()` - Using Firestore now

---

## New Features Available

### Email Verification

```javascript
// Check if email is verified
if (this.currentUser.emailVerified) {
    // Allow access
} else {
    // Prompt to verify email
}

// Resend verification email
await this.auth.currentUser.sendEmailVerification();
```

### Update Profile

```javascript
// Update user profile
await this.auth.currentUser.updateProfile({
    displayName: "New Name",
    photoURL: "https://example.com/photo.jpg"
});
```

### Update Email

```javascript
// Update email (requires recent login)
await this.auth.currentUser.updateEmail("newemail@example.com");
```

### Update Password

```javascript
// Update password (requires recent login)
await this.auth.currentUser.updatePassword("newPassword123");
```

### Reauthentication

```javascript
// For sensitive operations, reauthenticate user
const credential = firebase.auth.EmailAuthProvider.credential(
    email,
    password
);
await this.auth.currentUser.reauthenticateWithCredential(credential);
```

---

## Firestore Data Structure

### User Document (`users/{userId}`)

```javascript
{
    id: "firebase_uid_here",
    name: "John Doe",
    email: "john@example.com",
    provider: "email", // or "google.com"
    emailVerified: true,
    photoURL: "https://...",
    credit: 25.00,
    createdAt: "2025-01-05T10:30:00.000Z",
    lastLogin: "2025-01-05T15:45:00.000Z"
}
```

### Other Collections

The DatabaseManager (`js/database.js`) handles these:
- `bookings` - Room bookings
- `printingOrders` - Print jobs
- `courseEnrollments` - Course registrations
- `cafeteriaOrders` - Food orders
- `paymentHistory` - Payment records
- `settings` - App settings

---

## Rollback (If Needed)

If you need to rollback to localStorage:

1. Restore the old auth.js:
```bash
cp js/auth-localStorage.js.backup js/auth.js
```

2. Remove Firebase scripts from `index.html`:
```html
<!-- Remove these lines -->
<script src="https://www.gstatic.com/firebasejs/..."></script>
<script src="js/firebase-config.js"></script>
<script src="js/database.js"></script>
```

3. Refresh your browser

**Note**: Old localStorage data will still be there.

---

## Testing Checklist

After Firebase setup:

- [ ] Sign up with new account works
- [ ] Email verification received
- [ ] Sign in with email/password works
- [ ] "Remember Me" checkbox works
- [ ] Sign out works
- [ ] "Forgot Password" sends email
- [ ] Password reset link works
- [ ] Google Sign-In works (if enabled)
- [ ] User data appears in Firestore Console
- [ ] Account lockout after 5 failed attempts
- [ ] Session persists on page refresh
- [ ] Session works across tabs
- [ ] Profile page loads user data

---

## Common Issues & Solutions

### "Firebase not initialized"

**Cause**: Firebase configuration not set up
**Solution**: Complete Firebase setup in `FIREBASE_SETUP_GUIDE.md`

### "auth/configuration-not-found"

**Cause**: Invalid Firebase config in `firebase-config.js`
**Solution**: Replace placeholder values with real Firebase credentials

### "Email not verified" warning

**Cause**: Firebase sends verification emails by default
**Solution**: This is normal - users should verify their email

### Old localStorage users can't sign in

**Cause**: Firebase doesn't have their accounts
**Solution**: Users need to sign up again or import via Admin SDK

### Google Sign-In popup blocked

**Cause**: Browser blocking popups
**Solution**: Allow popups or use redirect flow

---

## Next Steps

1. **Complete Firebase Setup**
   - Follow `FIREBASE_SETUP_GUIDE.md`
   - Update `firebase-config.js`

2. **Test Everything**
   - Go through testing checklist above

3. **Update Other Pages**
   - Ensure booking page works with Firebase
   - Update profile page if needed

4. **Add More Features**
   - Profile picture upload (Firebase Storage)
   - Account settings page
   - Email preferences

5. **Deploy to Production**
   - Follow production checklist in setup guide

---

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Verify Firebase configuration is correct
3. Check Firebase Console for auth/database status
4. Review `FIREBASE_SETUP_GUIDE.md`

**Contact**:
- Email: info@sigmastudyhouse.com
- Phone: 00962796101060

---

**Migration Status**: Complete ✅
**Last Updated**: January 2025
**Version**: 3.0.0 (Firebase)
