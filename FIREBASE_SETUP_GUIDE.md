# Firebase Setup Guide for Sigma Study House

## Overview

This guide will walk you through setting up Firebase for your Sigma Study House authentication system. The new Firebase-powered authentication provides:

- Production-ready authentication
- Real-time database with Firestore
- Automatic session management
- Password reset via email
- Google Sign-In support
- Secure cloud storage

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: `sigma-study-house` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click "Create project" and wait for it to complete

---

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Sigma Study House Web`
3. **Check** "Also set up Firebase Hosting" (optional but recommended)
4. Click "Register app"
5. **Copy the Firebase configuration object** - you'll need this in Step 6

The configuration will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## Step 3: Enable Authentication Methods

### Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Email/Password**
3. **Enable** the toggle
4. (Optional) Enable **Email link (passwordless sign-in)**
5. Click **Save**

### Enable Google Sign-In (Optional but Recommended)

1. In the same **Sign-in method** page, click **Google**
2. **Enable** the toggle
3. Enter **Project public-facing name**: `Sigma Study House`
4. Enter **Project support email**: `info@sigmastudyhouse.com`
5. Click **Save**

---

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it later)
4. Choose your database location (select nearest to Jordan: `europe-west1` or `asia-south1`)
5. Click **Enable**

### Set Up Firestore Security Rules

After creating the database, update the security rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // Bookings collection - authenticated users only
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }

    // Printing orders - authenticated users only
    match /printingOrders/{orderId} {
      allow read, write: if request.auth != null;
    }

    // Course enrollments - authenticated users only
    match /courseEnrollments/{enrollmentId} {
      allow read, write: if request.auth != null;
    }

    // Cafeteria orders - authenticated users only
    match /cafeteriaOrders/{orderId} {
      allow read, write: if request.auth != null;
    }

    // Payment history - users can only access their own
    match /paymentHistory/{paymentId} {
      allow read: if request.auth != null &&
                  resource.data.userId == request.auth.uid;
      allow write: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid;
    }

    // Settings - read-only for authenticated users
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only (manage via Firebase Console)
    }
  }
}
```

3. Click **Publish**

---

## Step 5: Set Up Firebase Storage (Optional)

If you plan to allow file uploads (profile pictures, documents, etc.):

1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Select **Start in test mode**
4. Choose the same location as your Firestore database
5. Click **Done**

### Set Up Storage Security Rules

1. Go to **Storage** > **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads - organized by user ID
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Public files (logos, etc.)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Admin only
    }
  }
}
```

3. Click **Publish**

---

## Step 6: Update Firebase Configuration

1. Open `js/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",                    // From Step 2
    authDomain: "your-project.firebaseapp.com",       // From Step 2
    projectId: "your-project-id",                     // From Step 2
    storageBucket: "your-project.appspot.com",        // From Step 2
    messagingSenderId: "123456789012",                // From Step 2
    appId: "1:123456789012:web:abc123",               // From Step 2
    measurementId: "G-XXXXXXXXXX"                     // From Step 2 (optional)
};
```

3. Save the file

---

## Step 7: Configure Email Templates (Optional but Recommended)

Customize the email templates Firebase sends to users:

1. Go to **Authentication** > **Templates** tab
2. Customize each template:

### Email Verification Template

```
Subject: Verify your email for Sigma Study House

Hello,

Thank you for signing up for Sigma Study House!

Please verify your email address by clicking the link below:

%LINK%

If you didn't create an account, you can safely ignore this email.

Best regards,
Sigma Study House Team
info@sigmastudyhouse.com
```

### Password Reset Template

```
Subject: Reset your Sigma Study House password

Hello,

We received a request to reset your password for Sigma Study House.

Click the link below to reset your password:

%LINK%

If you didn't request a password reset, you can safely ignore this email.

Best regards,
Sigma Study House Team
info@sigmastudyhouse.com
```

---

## Step 8: Set Up Authorized Domains

1. Go to **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domain(s):
   - `localhost` (for testing - should already be there)
   - `sigmastudyhouse.com` (your actual domain)
   - `www.sigmastudyhouse.com`
4. Click **Add domain** for each

---

## Step 9: Test Your Integration

1. Open your website in a browser
2. Open browser console (F12)
3. Look for the success message: `✅ Firebase initialized successfully`

If you see errors, check:
- Firebase configuration in `js/firebase-config.js` is correct
- All Firebase SDK scripts are loaded in `index.html`
- Your Firebase project has the correct services enabled

### Test Authentication Flow

1. **Sign Up**:
   - Click "Sign Up" button
   - Fill in the form with valid data
   - Submit
   - Check console for success message
   - Check your email for verification link

2. **Sign In**:
   - Click "Sign In" button
   - Enter credentials
   - Submit
   - Should see success notification

3. **Google Sign-In**:
   - Click "Sign in with Google" button
   - Select Google account
   - Should see success notification

4. **Password Reset**:
   - Click "Forgot Password?"
   - Enter email
   - Submit
   - Check email for reset link

5. **Check Firestore**:
   - Go to Firebase Console > Firestore Database
   - You should see user documents in the `users` collection

---

## Step 10: Migrate Existing Users (If Needed)

If you have existing users in localStorage, you'll need to have them reset their passwords since Firebase manages authentication differently.

### Option 1: Manual Migration (Not Recommended)

Users will need to sign up again with the same email.

### Option 2: Import Users to Firebase (Recommended)

1. Export existing user data from localStorage
2. Use Firebase Admin SDK to import users with password hashes
3. See [Firebase User Import Documentation](https://firebase.google.com/docs/auth/admin/import-users)

---

## Troubleshooting

### Issue: "Firebase SDK not loaded"

**Solution**: Check that Firebase scripts are included in `index.html` before `firebase-config.js`:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
<script src="js/firebase-config.js"></script>
```

### Issue: "Firebase: Error (auth/configuration-not-found)"

**Solution**: Make sure you've replaced all placeholder values in `firebase-config.js` with your actual Firebase project credentials.

### Issue: "Missing or insufficient permissions"

**Solution**: Check your Firestore security rules. Make sure users are authenticated before accessing data.

### Issue: "This domain is not authorized"

**Solution**: Add your domain to the authorized domains list in Firebase Console > Authentication > Settings.

### Issue: Google Sign-In popup blocked

**Solution**:
1. Allow popups for your domain in browser settings
2. Or use redirect flow instead:

```javascript
await this.auth.signInWithRedirect(provider);
```

---

## Production Checklist

Before launching to production:

- [ ] Replace test mode Firestore rules with production rules
- [ ] Replace test mode Storage rules with production rules
- [ ] Enable Firebase App Check for DDoS protection
- [ ] Set up Firebase monitoring and alerts
- [ ] Configure Firebase Performance Monitoring
- [ ] Enable Cloud Functions for backend logic (if needed)
- [ ] Set up backup strategy for Firestore
- [ ] Configure CORS for Firebase Storage
- [ ] Enable audit logging
- [ ] Set up custom domain for Firebase Hosting (if using)
- [ ] Test all authentication flows in production
- [ ] Set up rate limiting for sensitive operations

---

## Firebase Pricing

Firebase offers a generous free tier:

### Spark Plan (Free)
- **Authentication**: Unlimited users
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 1 GB storage
- **Storage**: 5 GB storage, 1 GB/day transfer
- **Hosting**: 10 GB storage, 360 MB/day transfer

### Blaze Plan (Pay as you go)
Required for:
- More than free tier limits
- Cloud Functions
- More control over quotas

**Estimated cost for small app**: $0-25/month

See [Firebase Pricing](https://firebase.google.com/pricing) for details.

---

## Security Best Practices

1. **Never commit `firebase-config.js` with real credentials to public repos**
   - Add to `.gitignore` if public repo
   - Use environment variables for CI/CD

2. **Use strong Firestore security rules**
   - Never use `allow read, write: if true;` in production
   - Validate data before writing

3. **Enable email verification**
   - Require users to verify email before full access
   - Check `user.emailVerified` in your app

4. **Set up Firebase App Check**
   - Protects against abuse and scrapers
   - Free and easy to set up

5. **Monitor authentication usage**
   - Set up alerts for unusual activity
   - Review Firebase Console regularly

6. **Keep Firebase SDK updated**
   - Check for updates monthly
   - Test before updating in production

---

## Advanced Features

### Multi-Factor Authentication (MFA)

Enable in Firebase Console > Authentication > Sign-in method > Advanced > Multi-factor authentication

### Custom Claims (User Roles)

Use Firebase Admin SDK to add custom claims for roles (admin, moderator, etc.):

```javascript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### Email Action Handlers

Customize the pages users see when clicking email links (verification, password reset).

### Cloud Functions

Add server-side logic triggered by Firebase events:

```javascript
// Automatically add user to Firestore on signup
exports.createUserDocument = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
});
```

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase YouTube Channel](https://www.youtube.com/firebase)
- [Firebase Community Slack](https://firebase.community/)

**Sigma Study House Support**:
- Email: info@sigmastudyhouse.com
- Phone: 00962796101060

---

## Next Steps

After completing Firebase setup:

1. Test all authentication flows thoroughly
2. Migrate or notify existing users
3. Set up monitoring and analytics
4. Consider adding Cloud Functions for backend logic
5. Implement additional features (profile updates, booking system, etc.)

---

**Status**: Firebase Integration Complete ✅
**Last Updated**: January 2025
**Version**: 3.0.0 (Firebase)
