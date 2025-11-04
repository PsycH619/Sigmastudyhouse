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
    apiKey: "YOUR_API_KEY",                           // ⚠️ REPLACE THIS
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",   // ⚠️ REPLACE THIS
    projectId: "YOUR_PROJECT_ID",                     // ⚠️ REPLACE THIS
    storageBucket: "YOUR_PROJECT_ID.appspot.com",    // ⚠️ REPLACE THIS
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",   // ⚠️ REPLACE THIS
    appId: "YOUR_APP_ID",                            // ⚠️ REPLACE THIS
    measurementId: "YOUR_MEASUREMENT_ID"             // ⚠️ REPLACE THIS (optional)
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

        // Optional: Enable offline persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Persistence failed: Multiple tabs open');
                } else if (err.code == 'unimplemented') {
                    console.warn('Persistence not available in this browser');
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
