# Firebase Setup Guide for Sigma Study House

This guide will help you set up Firebase for your Sigma Study House website, enabling real-time database, authentication, and file storage.

## 📋 Prerequisites

- A Google account
- Your website files ready for deployment
- Basic understanding of Firebase

## 🚀 Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name: `sigma-study-house` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## 🔧 Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app nickname: `Sigma Study House Web`
3. ✅ Check **"Also set up Firebase Hosting"** (optional but recommended)
4. Click **"Register app"**
5. Copy the configuration object - you'll need this next!

## 📝 Step 3: Configure Firebase in Your Code

### A. Add Firebase SDK to Your HTML

Add these scripts to your HTML files **BEFORE** `firebase-config.js`:

```html
<!-- Add to <head> section of index.html and other pages -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>

<!-- Then load your config and other scripts -->
<script src="js/firebase-config.js"></script>
<script src="js/database.js"></script>
<!-- ... other scripts ... -->
```

### B. Update firebase-config.js

Open `js/firebase-config.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",              // ← Your actual API key
    authDomain: "your-project-id.firebaseapp.com",          // ← Your auth domain
    projectId: "your-project-id",                            // ← Your project ID
    storageBucket: "your-project-id.appspot.com",           // ← Your storage bucket
    messagingSenderId: "123456789012",                       // ← Your sender ID
    appId: "1:123456789012:web:abcdef123456",               // ← Your app ID
    measurementId: "G-XXXXXXXXXX"                            // ← Your measurement ID (optional)
};
```

**Where to find these values:**
- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" section
- Click on your web app
- Copy values from the config object

## 🔐 Step 4: Set Up Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable sign-in methods:

### Email/Password Authentication
1. Click **"Email/Password"**
2. Enable **"Email/Password"**
3. (Optional) Enable **"Email link (passwordless sign-in)"**
4. Click **"Save"**

### Google Sign-In
1. Click **"Google"**
2. Enable **"Google"**
3. Select project support email
4. Click **"Save"**
5. Copy the **Web client ID** and update it in `js/auth.js`:

```javascript
// In auth.js, find and update:
google.accounts.id.initialize({
    client_id: "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",  // ← Update this
    callback: this.handleGoogleSignIn.bind(this)
});
```

## 💾 Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add rules next)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

### Set Up Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }

    // Users can read/write their own orders
    match /printingOrders/{orderId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }

    match /cafeteriaOrders/{orderId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }

    match /courseEnrollments/{enrollmentId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }

    // Admin only (update with your admin email)
    match /{document=**} {
      allow read, write: if request.auth != null &&
                            request.auth.token.email == 'admin@sigmastudyhouse.com';
    }
  }
}
```

3. Click **"Publish"**

### Create Indexes (for better performance)

1. Go to **Firestore Database** → **Indexes** tab
2. Click **"Add index"**
3. Create these indexes:

**Bookings Index:**
- Collection ID: `bookings`
- Fields: `userId` (Ascending), `createdAt` (Descending)
- Query scope: Collection

**Orders Index:**
- Collection ID: `printingOrders`
- Fields: `userId` (Ascending), `createdAt` (Descending)
- Query scope: Collection

## 📦 Step 6: Set Up Storage (for File Uploads)

1. In Firebase Console, go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Click **"Next"** → **"Done"**

### Set Up Storage Rules

1. Go to **Storage** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Printing files
    match /printing/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User profile images
    match /profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

3. Click **"Publish"**

## 🌐 Step 7: (Optional) Set Up Hosting

If you want to deploy your website to Firebase Hosting:

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Initialize Firebase Hosting
```bash
cd /path/to/Sigmastudyhouse
firebase login
firebase init hosting
```

Configuration:
- Public directory: `.` (current directory)
- Configure as single-page app: **No**
- Set up automatic builds: **No**

### Deploy
```bash
firebase deploy --only hosting
```

Your site will be live at: `https://your-project-id.web.app`

## ✅ Step 8: Test Your Setup

1. Open your website
2. Check browser console (F12) for:
   ```
   ✅ Firebase initialized successfully
   📊 Using Firebase database
   ```

3. Try these features:
   - Sign up / Sign in
   - Make a test booking
   - Add items to cafeteria cart
   - Submit a printing order

4. Verify data in Firebase Console:
   - Go to **Firestore Database**
   - Check collections: `users`, `bookings`, `printingOrders`, etc.

## 🔧 Troubleshooting

### "Firebase not defined"
- Make sure Firebase SDK scripts are loaded BEFORE `firebase-config.js`
- Check browser console for script loading errors

### "Permission denied" errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify userId matches in security rules

### Google Sign-In not working
- Verify client ID is correct in `auth.js`
- Add your domain to authorized domains in Firebase Console:
  - Authentication → Settings → Authorized domains

### Data not saving
- Check browser console for errors
- Verify Firestore rules allow write access
- Ensure user is authenticated

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## 🛡️ Security Best Practices

1. **Never commit your Firebase config to public repositories**
   - Add to `.gitignore`: `js/firebase-config.js`
   - Use environment variables for sensitive data

2. **Use strong security rules**
   - Never use `allow read, write: if true;` in production
   - Always validate user authentication

3. **Enable App Check** (recommended for production)
   - Go to **Build** → **App Check**
   - Follow setup instructions

4. **Monitor usage**
   - Set up billing alerts
   - Monitor quota usage in Firebase Console

## 💡 Current Setup (Development Mode)

Your project currently uses **localStorage as a fallback** when Firebase is not configured. This means:
- ✅ Everything works locally
- ⚠️ Data is lost when browser cache is cleared
- ⚠️ No data synchronization across devices
- ⚠️ No real authentication security

After setting up Firebase:
- ✅ Real-time data synchronization
- ✅ Persistent data storage
- ✅ Secure authentication
- ✅ Cross-device access
- ✅ File upload support

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration values
3. Review Firebase Console for quota limits
4. Check security rules

Good luck! 🚀
