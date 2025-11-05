#!/bin/bash

# Deploy Firestore Rules Script
# This script deploys your Firestore security rules and indexes to Firebase

echo "🚀 Deploying Firestore Rules for Sigma Study House"
echo "=================================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found!"
    echo ""
    echo "Please install Firebase CLI first:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if user is logged in
echo "🔐 Checking Firebase login status..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo ""
    echo "Please login first:"
    echo "  firebase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Firebase"
echo ""

# Show current project
PROJECT=$(firebase use)
echo "📁 Current project: sigmastudyhouse-31cc8"
echo ""

# Deploy rules
echo "📤 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Go to Firebase Console: https://console.firebase.google.com/project/sigmastudyhouse-31cc8/firestore/rules"
    echo "  2. Verify rules are updated"
    echo "  3. Test your app by signing up a new user"
    echo "  4. Check that email appears in profile (not 'No email available')"
    echo ""
else
    echo ""
    echo "❌ Failed to deploy rules"
    echo ""
    echo "Please check:"
    echo "  1. You're connected to the internet"
    echo "  2. You have permission to deploy to sigmastudyhouse-31cc8"
    echo "  3. The firestore.rules file is valid"
    echo ""
    exit 1
fi

# Ask if user wants to deploy indexes too
echo ""
read -p "📊 Do you want to deploy Firestore indexes too? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📤 Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Firestore indexes deployed successfully!"
    else
        echo ""
        echo "⚠️ Failed to deploy indexes (this is optional, app will still work)"
    fi
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Test your app now:"
echo "  1. Sign up a new user"
echo "  2. Check profile page for email"
echo "  3. Try creating bookings, cafeteria orders, etc."
echo ""
