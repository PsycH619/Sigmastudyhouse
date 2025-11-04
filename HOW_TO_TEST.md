# 🧪 How to Test the Login & Signup System

## Quick Test Guide

### ✅ **Step 1: Open the Test Page**

I've started a local server for you. Open your browser and go to:

```
http://localhost:8000/test-auth.html
```

This is a **diagnostic page** that will tell you exactly what's working and what's not!

---

### ✅ **Step 2: What You Should See**

The test page will show you 4 sections with status indicators:

1. **✅ Scripts Loading** - Should turn green if JS files loaded
2. **✅ AuthManager** - Should show "AuthManager initialized!"
3. **✅ Auth Buttons** - Should show Sign In and Sign Up buttons
4. **Test Buttons** - Click these to test the modal

**All sections should be GREEN** ✅

---

### ✅ **Step 3: If You See the Buttons**

Click either:
- **Sign In** button (outlined)
- **Sign Up** button (orange)

A modal should pop up with login and registration forms!

---

### ✅ **Step 4: Test the Main Pages**

After confirming the test page works, try these pages:

#### **Demo Page:**
```
http://localhost:8000/auth-demo.html
```
- Has big "Test Login" and "Test Signup" buttons in the center
- Has small "Sign In" / "Sign Up" buttons in header (top-right)

#### **Homepage:**
```
http://localhost:8000/index.html
```
- Should show "Sign In" / "Sign Up" buttons in top-right header

#### **Courses Page:**
```
http://localhost:8000/pages/courses.html
```
- Should show "Sign In" / "Sign Up" buttons in top-right header

---

## 🔍 **Troubleshooting**

### Problem: "No buttons showing"

**Check 1: Is the server running?**
```
The server should be running on port 8000
Go to: http://localhost:8000/test-auth.html
```

**Check 2: Open browser console**
1. Press F12 on your keyboard
2. Click the "Console" tab
3. Look for any red error messages
4. Share them with me!

**Check 3: Check if files exist**
Make sure these files are in your project:
- ✅ js/main.js
- ✅ js/auth.js
- ✅ css/style.css
- ✅ css/auth.css

---

### Problem: "Buttons show but modal doesn't open"

**Solution:**
1. Check if `loginModal` div exists in the HTML
2. Open browser console (F12) and look for errors
3. Make sure you clicked the button (not just hovered)

---

### Problem: "Modal opens but nothing happens when I submit"

**This is NORMAL!** The forms are working. Here's what to do:

**To test Signup:**
1. Click "Sign Up" tab
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123! (watch the strength indicator!)
   - Confirm: Test123!
3. Click "Create Account"
4. You should see a success notification
5. The modal closes and you're logged in!

**To test Login:**
1. After creating an account (above)
2. Click your avatar in header → Logout
3. Click "Sign In" button
4. Enter the same credentials:
   - Email: test@example.com
   - Password: Test123!
5. Click "Sign In"
6. You should be logged back in!

---

## 🎯 **Quick Visual Check**

### What the Header Should Look Like:

**When NOT logged in:**
```
[Logo] [Nav Menu]     [🌙] [EN|AR] [Sign In] [Sign Up]
                                    ^^^^^^^^  ^^^^^^^^^
                                    outlined   orange
```

**When logged in:**
```
[Logo] [Nav Menu]     [🌙] [EN|AR] [25.00 JOD] [👤 Your Name ▼]
                                    ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^
                                    credit        user menu
```

---

## 📋 **Complete Test Checklist**

- [ ] Open http://localhost:8000/test-auth.html
- [ ] All 4 sections show ✅ green checkmarks
- [ ] Click "Test Open Login Modal" button - modal appears
- [ ] Close modal (X button or click outside)
- [ ] See "Sign In" and "Sign Up" buttons in the auth box
- [ ] Click "Sign Up" button
- [ ] Modal opens to signup tab
- [ ] Fill in form and create account
- [ ] See success notification
- [ ] See your name in header (logged in!)
- [ ] Click avatar → Logout
- [ ] Buttons appear again
- [ ] Click "Sign In"
- [ ] Login with same credentials
- [ ] Success!

---

## 🆘 **Still Not Working?**

If you've tried everything above and it's still not working:

1. **Screenshot the test page** (test-auth.html)
   - Show me all 4 sections
   - Show me the console output (bottom section)

2. **Open browser console (F12)**
   - Copy any red error messages
   - Share them with me

3. **Try a different browser**
   - Chrome, Firefox, or Edge
   - Sometimes browser extensions block JavaScript

---

## 🎉 **Expected Behavior**

When everything works correctly:

1. **Page loads** → Buttons appear automatically in header
2. **Click "Sign Up"** → Modal opens instantly
3. **Type password** → Strength bar changes color in real-time
4. **Click eye icon** → Password becomes visible
5. **Submit form** → Spinning icon shows, then success message
6. **Account created** → Auto-login, modal closes, see your name in header
7. **Click avatar** → Dropdown menu appears
8. **Click Logout** → Back to login buttons

That's it! The whole flow should be smooth and instant.

---

## 💻 **Server Commands**

The server is running in the background. To check:

```bash
# Check if server is running
netstat -ano | findstr :8000

# If you need to stop it
# (Find the process ID from the command above, then:)
taskkill /PID <process_id> /F
```

---

**Made for Sigma Study House**
*Last Updated: January 2025*
