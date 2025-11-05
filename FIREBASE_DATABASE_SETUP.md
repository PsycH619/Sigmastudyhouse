# Firebase Database Setup Guide
## Fixing "No Email Available" Error

## 🔍 The Problem

You're seeing "No email available" because your Firestore database structure isn't properly configured. Here's how to fix it:

---

## 📋 Required Steps

### Step 1: Set Up Firestore Security Rules

**CRITICAL**: Without proper security rules, your app cannot read/write data!

1. Go to [Firebase Console](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules)
2. Click on **Firestore Database** in the left sidebar
3. Go to the **Rules** tab
4. Replace the existing rules with the rules from `firestore.rules` file in your project
5. Click **Publish** to save the rules

**Quick Link to Your Rules**: [Open Firestore Rules](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules)

#### What These Rules Do:
- ✅ Users can only read/write their own data
- ✅ Each collection (users, bookings, cafeteriaOrders, etc.) is protected
- ✅ Only authenticated users can access data
- ✅ Users cannot see other users' data

### Step 2: Create Firestore Collections

Firestore creates collections automatically when you add the first document, but you need to ensure the structure is correct:

#### Required Collections:

1. **users** - User profile data
   ```javascript
   {
     id: "firebase_uid",           // Automatically set by Firebase Auth
     name: "John Doe",              // User's display name
     email: "john@example.com",     // User's email (FROM FIREBASE AUTH)
     provider: "email",             // "email" or "google.com"
     emailVerified: true,           // Email verification status
     photoURL: "https://...",       // Profile photo (optional)
     phone: "+962796101060",        // Phone number (optional)
     studentId: "123456",           // Student ID (optional)
     credit: 25.00,                 // User credit balance
     createdAt: "2025-01-05T10:30:00Z",
     lastLogin: "2025-01-05T15:45:00Z",
     updatedAt: "2025-01-05T15:45:00Z"
   }
   ```

2. **bookings** - Room bookings
   ```javascript
   {
     userId: "firebase_uid",        // Reference to users collection
     roomType: "silent",            // Room type
     roomId: "room-a",              // Specific room ID
     date: "2025-01-05",            // Booking date
     startTime: "09:00",            // Start time
     endTime: "11:00",              // End time
     duration: 2.0,                 // Duration in hours
     totalCost: 4.00,               // Total cost
     status: "confirmed",           // Status: confirmed, cancelled, completed
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

3. **printingOrders** - Printing orders
   ```javascript
   {
     userId: "firebase_uid",
     files: [                       // Array of files
       {
         name: "document.pdf",
         pages: 10,
         copies: 1,
         color: false
       }
     ],
     totalPages: 10,
     cost: 2.00,
     status: "pending",            // pending, processing, completed, cancelled
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

4. **cafeteriaOrders** - Cafeteria orders
   ```javascript
   {
     userId: "firebase_uid",
     orderNumber: "ORD-12345",
     items: [
       {
         name: "Coffee",
         price: 2.50,
         quantity: 1
       }
     ],
     total: 2.50,
     status: "pending",            // pending, preparing, ready, completed
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

5. **paymentHistory** - Payment transactions
   ```javascript
   {
     userId: "firebase_uid",
     description: "Credit Top-up",
     amount: 10.00,
     type: "credit",               // credit or debit
     date: "2025-01-05T10:30:00Z",
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

### Step 3: Deploy Security Rules via Firebase CLI (Recommended)

You can deploy the rules from your local `firestore.rules` file:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to the Firebase Console.

---

## 🐛 Why "No Email Available" Appears

The error happens in `profile.js:154`:
```javascript
profileEmailInput.placeholder = this.currentUser.email ? '' : 'No email available';
```

### Root Causes:

1. **User document not created in Firestore**
   - When a user signs up, a document should be created in the `users` collection
   - The document should have an `email` field copied from Firebase Auth

2. **Permission denied reading user data**
   - Firestore security rules are too restrictive or not set up
   - User cannot read their own document from Firestore

3. **Firebase Auth user exists but Firestore document doesn't**
   - The user authenticated successfully with Firebase Auth
   - But the corresponding document in Firestore was never created

### The Fix:

Your code in `auth.js` (lines 98-128) already handles creating the user document:

```javascript
async handleAuthStateChange(firebaseUser) {
  const userData = await this.db.get('users', firebaseUser.uid);

  if (userData) {
    // User exists, load their data
    this.currentUser = userData;
  } else {
    // Create new user document
    this.currentUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,  // ← This should populate the email
      provider: firebaseUser.providerData[0]?.providerId || 'email',
      emailVerified: firebaseUser.emailVerified,
      photoURL: firebaseUser.photoURL,
      credit: 25.00,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await this.db.create('users', this.currentUser);
  }
}
```

**If this isn't working, it means:**
- The `db.create()` call is failing (permissions issue)
- OR the `db.get()` call is failing (permissions issue)

---

## ✅ Verification Steps

### 1. Check Firebase Authentication

1. Go to [Firebase Console > Authentication](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/authentication/users)
2. Verify you have users listed
3. Check that users have email addresses

### 2. Check Firestore Database

1. Go to [Firebase Console > Firestore Database](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/data)
2. Look for a `users` collection
3. Click on it to see user documents
4. Each document should have an `email` field

**If you don't see a `users` collection:**
- The security rules are preventing writes
- OR there's an error in the `db.create()` call

### 3. Check Browser Console

Open your browser's Developer Tools (F12) and look for errors:

**Good signs:**
```
✅ Firebase initialized successfully
✅ AuthManager initialized with Firebase
🔐 User authenticated: user@example.com
```

**Bad signs:**
```
❌ Missing or insufficient permissions
❌ Error creating document in users:
❌ Error handling auth state change:
```

### 4. Test User Creation Manually

Open your browser console and run:

```javascript
// Check current user
console.log('Current user:', window.authManager.currentUser);

// Check Firebase Auth user
console.log('Firebase user:', firebase.auth().currentUser);

// Try to read from Firestore
window.db.get('users', firebase.auth().currentUser.uid)
  .then(user => console.log('User from Firestore:', user))
  .catch(err => console.error('Error reading user:', err));
```

---

## 🔧 Step-by-Step Fix

### Option A: Using Firebase Console (Easiest)

1. **Set Up Rules:**
   - Go to [Firestore Rules](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules)
   - Copy the content from `firestore.rules` in your project
   - Paste it into the rules editor
   - Click **Publish**

2. **Create Test User:**
   - Sign up on your website
   - Check the browser console for errors
   - Go to [Firestore Data](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/data)
   - Verify a document was created in the `users` collection

3. **Verify Email Field:**
   - Click on your user document
   - Verify it has an `email` field with your email address

### Option B: Using Firebase CLI (Recommended)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase (if not done)
firebase init firestore
# - Select your project: sigmastudyhouse-31cc8
# - Accept default file names (firestore.rules, firestore.indexes.json)

# 4. Deploy rules
firebase deploy --only firestore:rules

# 5. Verify deployment
# Go to Firebase Console and check rules are updated
```

---

## 🎯 Testing Your Setup

### Test 1: Sign Up New User

1. Open your website
2. Click "Sign Up"
3. Create a new account with email/password
4. Check browser console for errors
5. Go to Firebase Console > Firestore Database
6. Verify a document was created in `users` collection with your email

### Test 2: Check Profile Page

1. After signing up, go to the Profile page
2. The email field should show your email (not "No email available")
3. All user data should be visible

### Test 3: Update Profile

1. Change your name or phone number
2. Save the profile
3. Refresh the page
4. Verify changes persisted

### Test 4: Create Booking

1. Go to booking page
2. Create a room booking
3. Check Firestore Console for a new document in `bookings` collection
4. Verify it has your `userId`

---

## 📊 Understanding the Data Flow

```
1. User Signs Up
   ↓
2. Firebase Authentication creates user
   ↓
3. auth.js onAuthStateChanged() triggered
   ↓
4. auth.js handleAuthStateChange() called
   ↓
5. database.js get('users', uid) - check if user exists in Firestore
   ↓
6. If not exists: database.js create('users', userData)
   ↓
7. User document created in Firestore with email field
   ↓
8. profile.js loads user data
   ↓
9. Email displayed in profile (not "No email available")
```

**If you see "No email available", the chain broke somewhere between steps 5-7!**

---

## 🚨 Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"

**Cause:** Firestore security rules not set up or too restrictive

**Solution:**
1. Go to [Firestore Rules](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules)
2. Copy rules from `firestore.rules`
3. Click Publish
4. Wait 1 minute for rules to propagate
5. Try again

### Issue 2: User exists in Auth but not in Firestore

**Cause:** Error during user document creation

**Solution:**
1. Open browser console
2. Look for error messages
3. Manually create user document:

```javascript
const user = firebase.auth().currentUser;
window.db.create('users', {
  id: user.uid,
  name: user.displayName || user.email.split('@')[0],
  email: user.email,
  provider: 'email',
  emailVerified: user.emailVerified,
  credit: 25.00,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
}).then(() => {
  console.log('✅ User document created!');
  window.location.reload();
});
```

### Issue 3: Email is undefined in Firestore

**Cause:** Firebase Auth user doesn't have an email (unlikely)

**Solution:**
1. Check Firebase Console > Authentication
2. Verify user has an email
3. If not, user needs to sign up again with email/password

### Issue 4: Rules deployed but still getting errors

**Cause:** Firebase rules cache (takes up to 1 minute to propagate)

**Solution:**
1. Wait 1-2 minutes after deploying rules
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Try again

---

## 📝 Quick Checklist

Before testing your app, verify:

- [ ] Firestore Database is created (not Realtime Database)
- [ ] Security rules are deployed from `firestore.rules`
- [ ] Authentication is enabled (Email/Password and Google)
- [ ] Browser console shows "✅ Firebase initialized successfully"
- [ ] Browser console shows "✅ AuthManager initialized with Firebase"
- [ ] No permission errors in browser console
- [ ] Test user can sign up successfully
- [ ] User document created in Firestore `users` collection
- [ ] User document has `email` field with valid email

---

## 🔗 Quick Links for Your Project

- **Firebase Console**: https://console.firebase.google.com/project/sigmastudyhouse-31cc8
- **Authentication**: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/authentication/users
- **Firestore Database**: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/data
- **Firestore Rules**: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules
- **Project Settings**: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/settings/general

---

## 💡 Pro Tips

1. **Test with new users**: Existing users might have corrupted data. Create a fresh test user.

2. **Use browser console**: Open Developer Tools (F12) to see detailed error messages.

3. **Check Firestore directly**: Always verify data in Firebase Console, not just in your UI.

4. **Enable persistence**: Your app already has Firestore offline persistence enabled (firebase-config.js:48).

5. **Index creation**: Firestore will prompt you to create indexes if needed. Click the link in console errors.

---

## 🎓 Next Steps

Once your database is set up correctly:

1. **Test all features**: Sign up, profile, bookings, cafeteria, printing
2. **Add more users**: Test with multiple accounts
3. **Monitor usage**: Check Firebase Console for usage statistics
4. **Set up indexes**: Create composite indexes as needed
5. **Backup strategy**: Export Firestore data periodically

---

## 📞 Need Help?

If you're still seeing "No email available" after following this guide:

1. Check browser console for specific error messages
2. Share the error messages for detailed help
3. Verify all steps in the checklist above
4. Test with a completely new user account

**Your Firebase Project**: sigmastudyhouse-31cc8

**Quick Test Command** (paste in browser console):
```javascript
firebase.auth().currentUser && console.log('Auth email:', firebase.auth().currentUser.email);
window.authManager?.currentUser && console.log('App email:', window.authManager.currentUser.email);
```

If the first shows an email but the second doesn't, the issue is in the Firestore data sync.

---

**Status**: Database structure defined, rules ready to deploy

**Last Updated**: January 2025

**Next Step**: Deploy firestore.rules to Firebase Console! 🚀
