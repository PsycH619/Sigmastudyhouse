// Firebase Configuration
// ⚠️ SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing
// 3. Go to Project Settings > General
// 4. Scroll to "Your apps" section
// 5. Click "Add app" > Web app
// 6. Copy the firebaseConfig object and replace the values below
// 7. Enable Authentication (Email/Password and Google)
// 8. Enable Firestore Database
// 9. Enable Storage (for file uploads)

const firebaseConfig = {
    apiKey: "AIzaSyDpllXWs31QEstBJVD31vMwTizCOS4RGt0",
    authDomain: "sigmastudyhouse-31cc8.firebaseapp.com",
    projectId: "sigmastudyhouse-31cc8",
    storageBucket: "sigmastudyhouse-31cc8.firebasestorage.app",
    messagingSenderId: "18084851101",
    appId: "1:18084851101:web:06c5c3454b71e99bf9d374",
    measurementId: "G-C15TVZCJ42"
};

// Initialize Firebase
let app, auth, db, storage;

try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Add Firebase scripts to your HTML:');
        console.log(`
<!-- Add these before firebase-config.js -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
        `);
    } else {
        // Initialize Firebase app
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();

        console.log('✅ Firebase initialized successfully');

        // Optional: Enable offline persistence with multi-tab support
        // Only enable if not already enabled in another tab
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('✅ Firestore persistence enabled');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    // Multiple tabs open, persistence can only be enabled in one tab at a time
                    console.log('ℹ️ Persistence already enabled in another tab. Using memory cache.');
                } else if (err.code === 'unimplemented') {
                    // Browser doesn't support all features required for persistence
                    console.log('ℹ️ Persistence not supported by this browser. Using memory cache.');
                } else {
                    console.warn('⚠️ Persistence error:', err);
                }
            });
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
    console.error('Make sure to replace the config values in firebase-config.js');
}

// Export for use in other files
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
