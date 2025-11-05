# Quick Fix: "No Email Available" Error

## 🎯 The Problem
You're seeing "No email available" in the profile page because your Firestore database rules aren't set up properly.

## ⚡ Quick Solution (5 minutes)

### Method 1: Using Firebase Console (Easiest)

1. **Go to Firestore Rules**:
   - Open: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules

2. **Copy Your Rules**:
   - Open the file `firestore.rules` in your project
   - Copy all the content

3. **Paste and Publish**:
   - Paste into the Firebase Console rules editor
   - Click **Publish**
   - Wait 1 minute for rules to propagate

4. **Test**:
   - Create a new user account on your website
   - Check if email appears in profile page

### Method 2: Using Command Line (Recommended)

```bash
# If you have Firebase CLI installed:
firebase deploy --only firestore:rules

# If you don't have Firebase CLI:
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Or use the deployment script:
```bash
./deploy-firestore.sh
```

---

## 🔍 What Happens Behind the Scenes

When a user signs up:
1. ✅ Firebase Authentication creates the user account
2. ❌ **BUT** your app can't write to Firestore (no rules = permission denied)
3. ❌ User document never created in Firestore
4. ❌ Profile page can't read user data
5. ❌ Shows "No email available"

**After deploying rules:**
1. ✅ Firebase Authentication creates the user account
2. ✅ Your app writes user data to Firestore (rules allow it)
3. ✅ User document created with email, name, credit, etc.
4. ✅ Profile page reads user data successfully
5. ✅ Shows user's email address

---

## 📋 Verify It's Fixed

### Test 1: Browser Console
Open Developer Tools (F12) and check for errors:

**Before fix:**
```
❌ Missing or insufficient permissions
❌ Error creating document in users
```

**After fix:**
```
✅ Firebase initialized successfully
✅ AuthManager initialized with Firebase
🔐 User authenticated: user@example.com
```

### Test 2: Firestore Database
1. Go to: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/data
2. Look for `users` collection
3. Click on a user document
4. Verify it has an `email` field with the user's email

### Test 3: Profile Page
1. Sign up a new user
2. Go to profile page
3. Email field should show the user's email (not "No email available")

---

## 🚨 Still Not Working?

### Check 1: Rules Deployed?
Go to: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules

The rules should look like this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }
    // ... more rules ...
  }
}
```

### Check 2: Wait for Propagation
After deploying rules, wait 1-2 minutes for them to take effect globally.

### Check 3: Clear Cache
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Or clear browser cache completely

### Check 4: Test with New User
Existing users might have corrupted data. Create a completely new test account.

### Check 5: Firebase CLI Login
If using CLI, make sure you're logged in:
```bash
firebase login
firebase use sigmastudyhouse-31cc8
firebase deploy --only firestore:rules
```

---

## 📖 Want More Details?

Read the comprehensive guide:
- **FIREBASE_DATABASE_SETUP.md** - Complete explanation and troubleshooting

---

## 🎉 Success!

Once fixed, you should see:
- ✅ User email in profile page
- ✅ User name and details
- ✅ Credit balance (25.00 JOD for new users)
- ✅ Bookings, orders, and payment history (when created)
- ✅ No permission errors in console

Your database is now properly configured! 🚀

---

**Quick Links:**
- [Firebase Console](https://console.firebase.google.com/project/sigmastudyhouse-31cc8)
- [Firestore Rules](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules)
- [Firestore Data](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/data)
- [Authentication Users](https://console.firebase.google.com/project/sigmastudyhouse-31cc8/authentication/users)
