// Firebase-Enhanced Authentication System
// Implemented security features:
// ✅ Firebase Authentication (Email/Password & Google Sign-In)
// ✅ Firestore for user data storage
// ✅ Input sanitization and validation
// ✅ Rate limiting for login attempts
// ✅ Account lockout after failed attempts
// ✅ Remember me functionality
// ✅ Secure password reset flow via Firebase
// ✅ Real-time session management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userCredit = 25.00;
        this.db = null;
        this.auth = null;
        this.loginAttempts = {};
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
        this.unsubscribeAuth = null;
        this.authStateReady = false;
        this.authStatePromise = null;
        this.dropdownClickHandler = null; // Store reference to dropdown click handler

        // Create a promise that resolves when auth state is ready
        this.authStatePromise = new Promise((resolve) => {
            this.resolveAuthState = resolve;
        });

        // Wait for Firebase and DatabaseManager to be ready
        this.waitForDependencies().then(() => {
            this.init();
        });
    }

    async waitForDependencies() {
        // Wait for Firebase to be initialized
        let attempts = 0;
        while ((!window.firebaseAuth || !window.db) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.firebaseAuth || !window.db) {
            console.error('⚠️ Firebase not initialized. Check firebase-config.js configuration.');
            console.warn('Falling back to localStorage mode');
            return;
        }

        this.auth = window.firebaseAuth;
        this.db = window.db;
        console.log('✅ AuthManager initialized with Firebase');
    }

    async init() {
        // Hide auth buttons initially to prevent FOUC (Flash of Unauthenticated Content)
        const authButtons = document.getElementById('authButtons');
        if (authButtons) {
            authButtons.style.visibility = 'hidden';
            authButtons.style.opacity = '0';
        }

        // Set up Firebase Auth state listener
        if (this.auth) {
            this.unsubscribeAuth = this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('🔐 User authenticated:', user.email);
                    await this.handleAuthStateChange(user);
                } else {
                    console.log('🔓 User signed out');
                    this.currentUser = null;
                    this.updateAuthUI();

                    // Resolve auth state promise even when no user
                    if (!this.authStateReady) {
                        this.authStateReady = true;
                        if (this.resolveAuthState) {
                            this.resolveAuthState(null);
                        }
                    }
                }
            });
        } else {
            // No Firebase auth available, resolve immediately
            this.authStateReady = true;
            if (this.resolveAuthState) {
                this.resolveAuthState(null);
            }
            // Show auth UI even if Firebase not available
            this.updateAuthUI();
        }

        this.initializeAuthModals();
        this.cleanupOldAttempts();
    }

    async handleAuthStateChange(firebaseUser) {
        try {
            // Fetch user data from Firestore
            const userData = await this.db.get('users', firebaseUser.uid);

            if (userData) {
                // User exists, load their data
                this.currentUser = userData;
                this.userCredit = userData.credit || 25.00;

                // Update last login for existing user
                await this.db.update('users', firebaseUser.uid, {
                    lastLogin: new Date().toISOString()
                });
            } else {
                // Create new user document in Firestore
                this.currentUser = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    email: firebaseUser.email,
                    provider: firebaseUser.providerData[0]?.providerId || 'email',
                    emailVerified: firebaseUser.emailVerified,
                    photoURL: firebaseUser.photoURL,
                    credit: 25.00,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };

                // Create the document (includes lastLogin already)
                await this.db.create('users', this.currentUser);
            }

            this.updateAuthUI();
            this.hideLoginModal();

            // Resolve auth state promise when user is loaded
            if (!this.authStateReady) {
                this.authStateReady = true;
                if (this.resolveAuthState) {
                    this.resolveAuthState(this.currentUser);
                }
            }

        } catch (error) {
            console.error('Error handling auth state change:', error);

            // Resolve auth state promise even on error
            if (!this.authStateReady) {
                this.authStateReady = true;
                if (this.resolveAuthState) {
                    this.resolveAuthState(null);
                }
            }
        }
    }

    // ==================== REGISTRATION ====================

    async register(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            // Get form data
            const name = this.sanitizeInput(form.querySelector('#registerName').value);
            const email = this.sanitizeInput(form.querySelector('#registerEmail').value);
            const password = form.querySelector('#registerPassword').value;
            const confirmPassword = form.querySelector('#confirmPassword').value;

            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }

            const passwordValidation = this.validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                this.showNotification(passwordValidation.errors[0], 'error');
                return;
            }

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            }

            // Create user with Firebase Authentication
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile
            await user.updateProfile({
                displayName: name
            });

            // Send email verification
            await user.sendEmailVerification();

            // Create user document in Firestore (will be handled by onAuthStateChanged)
            this.showNotification('Account created successfully! Please check your email to verify your account.', 'success');

        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = 'Registration failed. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }

            this.showNotification(errorMessage, 'error');

            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span data-en="Create Account" data-ar="إنشاء حساب">Create Account</span>';
            }
        }
    }

    // ==================== LOGIN ====================

    async handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            const email = this.sanitizeInput(form.querySelector('#loginEmail').value);
            const password = form.querySelector('#loginPassword').value;
            const rememberMe = form.querySelector('#rememberMe')?.checked || false;

            if (!email || !password) {
                this.showNotification('Please enter email and password', 'error');
                return;
            }

            // Check if account is locked
            if (this.isAccountLocked(email)) {
                const remainingTime = this.getRemainingLockoutTime(email);
                this.showNotification(`Account locked. Try again in ${remainingTime}`, 'error');
                return;
            }

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            }

            // Sign in with Firebase
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);

            // Set persistence based on "Remember Me"
            if (rememberMe) {
                await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            } else {
                await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }

            // Reset login attempts on successful login
            this.resetLoginAttempts(email);

            this.showNotification('Signed in successfully!', 'success');

        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = 'Sign in failed. Please try again.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
                this.recordFailedAttempt(email);
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled.';
            }

            this.showNotification(errorMessage, 'error');

            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span data-en="Sign In" data-ar="تسجيل الدخول">Sign In</span>';
            }
        }
    }

    // ==================== WAIT FOR AUTH ====================

    async waitForAuthState() {
        return this.authStatePromise;
    }

    async requireAuth() {
        await this.authStatePromise;
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }
        return this.currentUser;
    }

    // ==================== LOGOUT ====================

    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.userCredit = 25.00;
            this.updateAuthUI();
            this.showNotification('Successfully signed out!', 'success');

            // Redirect to home if on protected page
            const protectedPages = ['profile.html', 'booking.html'];
            const currentPage = window.location.pathname.split('/').pop();
            if (protectedPages.includes(currentPage)) {
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error signing out', 'error');
        }
    }

    async silentLogout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.userCredit = 25.00;
            this.updateAuthUI();
        } catch (error) {
            console.error('Silent logout error:', error);
        }
    }

    // ==================== GOOGLE SIGN-IN ====================

    async handleGoogleSignIn() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await this.auth.signInWithPopup(provider);

            // The signed-in user info will be handled by onAuthStateChanged
            this.showNotification('Signed in with Google successfully!', 'success');

        } catch (error) {
            console.error('Google sign-in error:', error);

            let errorMessage = 'Google sign-in failed. Please try again.';

            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in cancelled.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with this email using a different sign-in method.';
            }

            this.showNotification(errorMessage, 'error');
        }
    }

    // ==================== PASSWORD RESET ====================

    async handleForgotPassword(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            const emailInput = form.querySelector('#resetEmail') || form.querySelector('#forgotEmail');
            const email = this.sanitizeInput(emailInput?.value || '');

            if (!email) {
                this.showNotification('Please enter your email address', 'error');
                return;
            }

            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Send password reset email via Firebase
            await this.auth.sendPasswordResetEmail(email);

            this.showNotification('Password reset email sent! Please check your inbox.', 'success');

            // Hide forgot password form and show login form
            setTimeout(() => {
                this.hideLoginModal();
            }, 2000);

        } catch (error) {
            console.error('Password reset error:', error);

            let errorMessage = 'Failed to send reset email. Please try again.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later.';
            }

            this.showNotification(errorMessage, 'error');

            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span data-en="Send Reset Link" data-ar="إرسال رابط إعادة التعيين">Send Reset Link</span>';
        }
    }

    // ==================== ACCOUNT LOCKOUT ====================

    isAccountLocked(email) {
        const attempts = this.loginAttempts[email];
        if (!attempts) return false;

        const now = Date.now();
        const lockoutEnd = attempts.lockedUntil;

        if (lockoutEnd && now < lockoutEnd) {
            return true;
        }

        // Reset if lockout period has passed
        if (lockoutEnd && now >= lockoutEnd) {
            delete this.loginAttempts[email];
        }

        return false;
    }

    recordFailedAttempt(email) {
        if (!this.loginAttempts[email]) {
            this.loginAttempts[email] = {
                count: 0,
                firstAttempt: Date.now()
            };
        }

        this.loginAttempts[email].count++;
        this.loginAttempts[email].lastAttempt = Date.now();

        if (this.loginAttempts[email].count >= this.MAX_LOGIN_ATTEMPTS) {
            this.loginAttempts[email].lockedUntil = Date.now() + this.LOCKOUT_DURATION;
            const minutes = Math.ceil(this.LOCKOUT_DURATION / 60000);
            this.showNotification(`Account locked due to too many failed attempts. Try again in ${minutes} minutes.`, 'error');
        }
    }

    resetLoginAttempts(email) {
        delete this.loginAttempts[email];
    }

    getRemainingLockoutTime(email) {
        const attempts = this.loginAttempts[email];
        if (!attempts || !attempts.lockedUntil) return '0 seconds';

        const remaining = attempts.lockedUntil - Date.now();
        const minutes = Math.ceil(remaining / 60000);

        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    cleanupOldAttempts() {
        const now = Date.now();
        Object.keys(this.loginAttempts).forEach(email => {
            const attempt = this.loginAttempts[email];
            if (attempt.lockedUntil && now >= attempt.lockedUntil) {
                delete this.loginAttempts[email];
            }
        });

        // Run cleanup every minute
        setTimeout(() => this.cleanupOldAttempts(), 60000);
    }

    // ==================== VALIDATION ====================

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePasswordStrength(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        // Remove any HTML tags
        let sanitized = input.replace(/<[^>]*>/g, '');

        // Trim whitespace
        sanitized = sanitized.trim();

        // Limit length
        if (sanitized.length > 500) {
            sanitized = sanitized.substring(0, 500);
        }

        return sanitized;
    }

    // ==================== PASSWORD STRENGTH INDICATOR ====================

    calculatePasswordStrength(password) {
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 10;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

        return strength;
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength-bar');
        const strengthText = document.querySelector('.password-strength-text');

        if (!strengthBar || !strengthText) return;

        const strength = this.calculatePasswordStrength(password);

        // Update bar width
        strengthBar.style.width = `${strength}%`;

        // Update color and text
        strengthBar.classList.remove('strength-weak', 'strength-medium', 'strength-strong', 'strength-very-strong');

        if (strength < 30) {
            strengthBar.classList.add('strength-weak');
            strengthText.textContent = 'Weak';
        } else if (strength < 50) {
            strengthBar.classList.add('strength-medium');
            strengthText.textContent = 'Medium';
        } else if (strength < 70) {
            strengthBar.classList.add('strength-strong');
            strengthText.textContent = 'Strong';
        } else {
            strengthBar.classList.add('strength-very-strong');
            strengthText.textContent = 'Very Strong';
        }
    }

    // ==================== UI MANAGEMENT ====================

    initializeAuthModals() {
        // Sign Up button click
        document.getElementById('signUpBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal('signup');
        });

        // Sign In button click
        document.getElementById('signInBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal('signin');
        });

        // Register form submit
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.register(e));

        // Login form submit
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Forgot password link
        document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal('forgot');
        });

        // Forgot password form submit
        document.getElementById('forgotPasswordForm')?.addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Back to login links
        document.querySelectorAll('.back-to-login').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal('signin');
            });
        });

        // Switch between forms
        document.querySelectorAll('.switch-to-register').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal('signup');
            });
        });

        document.querySelectorAll('.switch-to-login').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal('signin');
            });
        });

        // Google Sign-In button
        document.getElementById('googleSignIn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleGoogleSignIn();
        });

        // Auth tabs switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = tab.getAttribute('data-target');
                if (target) {
                    // Remove active class from all tabs and forms
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

                    // Add active class to clicked tab and target form
                    tab.classList.add('active');
                    document.getElementById(target)?.classList.add('active');
                }
            });
        });

        // Note: User menu dropdown and logout handlers are set up in updateAuthUI()
        // after the user signs in, since the menu doesn't exist until then

        // Close modal
        document.querySelector('.modal-close')?.addEventListener('click', () => this.hideLoginModal());
        document.getElementById('loginModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                this.hideLoginModal();
            }
        });

        // Password strength indicator
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // Password visibility toggles
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    showLoginModal(formType = 'signin') {
        const modal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');

        if (!modal) return;

        // Hide all forms first
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';

        // Show the requested form
        if (formType === 'signin' && loginForm) {
            loginForm.style.display = 'block';
        } else if (formType === 'signup' && registerForm) {
            registerForm.style.display = 'block';
        } else if (formType === 'forgot' && forgotPasswordForm) {
            forgotPasswordForm.style.display = 'block';
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (!modal) return;

        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            // Reset forms
            document.getElementById('loginForm')?.reset();
            document.getElementById('registerForm')?.reset();
            document.getElementById('forgotPasswordForm')?.reset();

            // Reset buttons
            document.querySelectorAll('.submit-btn').forEach(btn => {
                btn.disabled = false;
                const originalText = btn.getAttribute('data-original-text') || 'Submit';
                btn.innerHTML = originalText;
            });
        }, 300);
    }

    updateAuthUI() {
        // Update sign in/up buttons
        const signInBtn = document.getElementById('signInBtn');
        const signUpBtn = document.getElementById('signUpBtn');
        const userMenu = document.getElementById('userMenu');
        const authButtons = document.getElementById('authButtons');

        if (this.currentUser) {
            // User is signed in
            if (signInBtn) signInBtn.style.display = 'none';
            if (signUpBtn) signUpBtn.style.display = 'none';

            if (userMenu) {
                userMenu.style.display = 'flex';
                const userName = userMenu.querySelector('.user-name');
                const userEmail = userMenu.querySelector('.user-email');
                const userAvatar = userMenu.querySelector('.user-avatar');

                if (userName) userName.textContent = this.currentUser.name;
                if (userEmail) userEmail.textContent = this.currentUser.email;

                if (userAvatar && this.currentUser.photoURL) {
                    userAvatar.style.backgroundImage = `url(${this.currentUser.photoURL})`;
                }

                // Set up dropdown toggle (remove old listeners first)
                userMenu.replaceWith(userMenu.cloneNode(true));
                const freshUserMenu = document.getElementById('userMenu');

                freshUserMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dropdown = freshUserMenu.querySelector('.user-dropdown');
                    if (dropdown) {
                        console.log('Toggling dropdown');
                        dropdown.classList.toggle('active');
                    } else {
                        console.log('Dropdown not found');
                    }
                });

                // Logout button click
                const logoutBtn = freshUserMenu.querySelector('#logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.logout();
                    });
                }

                // Remove old dropdown click handler if it exists
                if (this.dropdownClickHandler) {
                    document.removeEventListener('click', this.dropdownClickHandler);
                }

                // Create new dropdown click handler
                this.dropdownClickHandler = (e) => {
                    if (!freshUserMenu.contains(e.target)) {
                        const dropdown = freshUserMenu.querySelector('.user-dropdown');
                        if (dropdown) {
                            dropdown.classList.remove('active');
                        }
                    }
                };

                // Add the new handler
                document.addEventListener('click', this.dropdownClickHandler);
            }
        } else {
            // User is signed out
            if (signInBtn) signInBtn.style.display = 'inline-block';
            if (signUpBtn) signUpBtn.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
        }

        // Show auth buttons with smooth transition (prevent FOUC)
        if (authButtons) {
            authButtons.style.visibility = 'visible';
            authButtons.style.opacity = '1';
            authButtons.style.transition = 'opacity 0.3s ease';
        }

        // Update protected pages
        this.checkPageAccess();
    }

    checkPageAccess() {
        // Only check page access after auth state is resolved
        if (!this.authStateReady) {
            return;
        }

        const protectedPages = ['profile.html', 'booking.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !this.currentUser) {
            console.log('checkPageAccess: Redirecting from protected page');
            // Don't show notification or redirect if we're on profile page
            // Let the ProfileManager handle it with a delay
            if (currentPage !== 'profile.html') {
                this.showNotification('Please sign in to access this page', 'error');
                window.location.href = '../index.html';
            }
        }
    }

    // ==================== CREDIT MANAGEMENT ====================

    async updateCredit(newCreditAmount) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        // Update local state
        this.userCredit = newCreditAmount;
        this.currentUser.credit = newCreditAmount;

        // Update in Firestore if available
        if (this.db && this.auth && this.auth.currentUser) {
            try {
                await this.db.update('users', this.auth.currentUser.uid, {
                    credit: newCreditAmount
                });
                console.log('✅ User credit updated in Firestore:', newCreditAmount);
            } catch (error) {
                console.error('Error updating credit in Firestore:', error);
                // Don't throw - allow local update to succeed even if Firestore fails
            }
        }
    }

    // ==================== PROFILE PAGE ====================

    async initializeProfilePage() {
        if (!this.currentUser) {
            window.location.href = '../index.html';
            return;
        }

        // Populate profile information
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileCredit = document.getElementById('profileCredit');

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;
        if (profileCredit) profileCredit.textContent = `$${this.userCredit.toFixed(2)}`;

        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ==================== CLEANUP ====================

    destroy() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }
}

// Initialize authentication manager when DOM is ready
let authManager;
document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();
    window.authManager = authManager;
});
