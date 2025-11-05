// Authentication state management
// ⚠️ SECURITY WARNING: This is a demo implementation only!
// - Passwords are stored in plain text (should be hashed with bcrypt/argon2)
// - Using localStorage (should use HTTP-only cookies with server-side sessions)
// - No input sanitization (vulnerable to XSS)
// - Google Client ID is a placeholder - update on line 150
// - No server-side validation (all auth logic is client-side and bypassable)
// 🔒 For production: Implement proper server-side authentication!

class AuthManager {
    constructor() {
        this.currentUser = this.loadFromDatabase('currentUser');
        this.userCredit = this.loadFromDatabase('userCredit') || 25.00;
        this.users = this.loadFromDatabase('users') || [];
        this.init();
    }

    init() {
        this.updateAuthUI();
        this.initializeGoogleSignIn();
        this.initializeAuthModals();
        
        // Check if we're on the profile page
        if (window.location.pathname.includes('profile.html')) {
            this.initializeProfilePage();
        }
    }

    // Update authentication UI
    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        
        if (!authButtons) return;
        
        if (this.currentUser) {
            const userName = this.currentUser.name || this.currentUser.email || 'User';
            authButtons.innerHTML = `
                <div class="user-credit">${formatCurrency(this.userCredit)}</div>
                <div class="user-profile">
                    <div class="user-avatar">${userName.charAt(0).toUpperCase()}</div>
                    <div class="user-name">${userName}</div>
                    <div class="user-dropdown">
                        <a href="pages/profile.html">
                            <i class="fas fa-user"></i>
                            <span data-en="My Profile" data-ar="الملف الشخصي">My Profile</span>
                        </a>
                        <a href="pages/profile.html?tab=bookings">
                            <i class="fas fa-history"></i>
                            <span data-en="Booking History" data-ar="سجل الحجوزات">Booking History</span>
                        </a>
                        <a href="pages/profile.html?tab=credit">
                            <i class="fas fa-credit-card"></i>
                            <span data-en="Add Credit" data-ar="إضافة رصيد">Add Credit</span>
                        </a>
                        <a href="#" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span data-en="Logout" data-ar="تسجيل الخروج">Logout</span>
                        </a>
                    </div>
                </div>
            `;
            
            // Add event listeners for user dropdown and logout
            const userProfile = document.querySelector('.user-profile');
            if (userProfile) {
                userProfile.addEventListener('click', (e) => {
                    if (!e.target.closest('.user-dropdown')) {
                        document.querySelector('.user-dropdown').classList.toggle('active');
                    }
                });
            }
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="loginBtn">
                    <span data-en="Sign In" data-ar="تسجيل الدخول">Sign In</span>
                </button>
                <button class="btn btn-primary" id="signupBtn">
                    <span data-en="Sign Up" data-ar="إنشاء حساب">Sign Up</span>
                </button>
            `;
            
            document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
            document.getElementById('signupBtn')?.addEventListener('click', () => this.showLoginModal());
        }
    }

    // Show login modal
    showLoginModal() {
        document.getElementById('loginModal')?.classList.add('active');
    }

    hideLoginModal() {
        document.getElementById('loginModal')?.classList.remove('active');
    }

    // Authentication functions
    async login(userData) {
        this.currentUser = userData;
        await this.saveToDatabase('currentUser', this.currentUser);
        this.updateAuthUI();
        this.hideLoginModal();
        showNotification(
            window.languageManager?.translate('Welcome back!') || 'Welcome back!', 
            'success'
        );
    }

    async logout() {
        this.currentUser = null;
        await this.saveToDatabase('currentUser', null);
        this.updateAuthUI();
        showNotification(
            window.languageManager?.translate('Successfully signed out!') || 'Successfully signed out!', 
            'info'
        );
        
        // Redirect to home if on profile page
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = '../index.html';
        }
    }

    async register(userData) {
        // Check if user already exists
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            showNotification('User with this email already exists', 'error');
            return false;
        }

        // Add new user
        userData.id = Date.now();
        userData.createdAt = new Date().toISOString();
        this.users.push(userData);
        
        await this.saveToDatabase('users', this.users);
        await this.login(userData);
        
        showNotification('Account created successfully!', 'success');
        return true;
    }

    // Google Sign-In
    initializeGoogleSignIn() {
        if (!window.google) {
            console.warn('Google Identity Services not loaded');
            return;
        }
        
        window.google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID", // ⚠️ REPLACE THIS: Get your Client ID from https://console.cloud.google.com/
            callback: (response) => this.handleGoogleSignIn(response)
        });
        
        // Render Google Sign-In button
        const googleSignInBtn = document.getElementById('googleSignIn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => {
                window.google.accounts.id.prompt();
            });
        }
    }

    handleGoogleSignIn(response) {
        try {
            // Decode the credential response
            const responsePayload = JSON.parse(atob(response.credential.split('.')[1]));
            
            const userData = {
                id: responsePayload.sub,
                name: responsePayload.name,
                email: responsePayload.email,
                picture: responsePayload.picture,
                provider: 'google'
            };
            
            this.login(userData);
        } catch (error) {
            console.error('Error handling Google Sign-In:', error);
            showNotification('Error signing in with Google', 'error');
        }
    }

    // Initialize auth modals and forms
    initializeAuthModals() {
        const loginModal = document.getElementById('loginModal');
        if (!loginModal) return;

        // Tab switching
        const tabs = loginModal.querySelectorAll('.auth-tab');
        const forms = loginModal.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-target');

                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                loginModal.querySelector(`#${target}`).classList.add('active');
            });
        });

        // Add "switch to register" and "switch to login" functionality
        const switchToRegister = loginModal.querySelectorAll('.switch-to-register');
        const switchToLogin = loginModal.querySelectorAll('.switch-to-login');

        switchToRegister.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                const registerTab = loginModal.querySelector('[data-target="registerForm"]');
                const registerFormEl = loginModal.querySelector('#registerForm');

                if (registerTab) registerTab.classList.add('active');
                if (registerFormEl) registerFormEl.classList.add('active');
            });
        });

        switchToLogin.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                const loginTab = loginModal.querySelector('[data-target="loginForm"]');
                const loginFormEl = loginModal.querySelector('#loginForm');

                if (loginTab) loginTab.classList.add('active');
                if (loginFormEl) loginFormEl.classList.add('active');
            });
        });

        // Password strength indicator
        const registerPassword = loginModal.querySelector('#registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password visibility toggle
        this.initializePasswordToggles();
    }

    // Password strength calculator
    updatePasswordStrength(password) {
        const strengthIndicator = document.querySelector('.password-strength > div');
        if (!strengthIndicator) return;

        const strength = this.calculatePasswordStrength(password);

        // Remove all strength classes
        strengthIndicator.className = '';

        if (password.length === 0) {
            strengthIndicator.className = 'strength-weak';
            return;
        }

        if (strength < 30) {
            strengthIndicator.className = 'strength-weak';
        } else if (strength < 50) {
            strengthIndicator.className = 'strength-medium';
        } else if (strength < 70) {
            strengthIndicator.className = 'strength-strong';
        } else {
            strengthIndicator.className = 'strength-very-strong';
        }
    }

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

    // Initialize password visibility toggles
    initializePasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            // Skip if already has toggle
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('password-toggle')) {
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'password-toggle';
            toggle.innerHTML = '<i class="fas fa-eye"></i>';
            toggle.style.cssText = 'position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-light); cursor: pointer; font-size: 1rem; padding: 5px;';

            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    toggle.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });

            wrapper.appendChild(toggle);
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-en="Signing in..." data-ar="جاري تسجيل الدخول...">Signing in...</span>';

            const formData = new FormData(form);
            const email = formData.get('email')?.trim();
            const password = formData.get('password');

            // Validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!this.validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Simulate network delay (remove in production)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Find user in database
            const user = this.users.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.password === password
            );

            if (user) {
                await this.login(user);
                form.reset();
            } else {
                showNotification('Invalid email or password. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            showNotification('An error occurred during login. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-en="Creating account..." data-ar="جاري إنشاء الحساب...">Creating account...</span>';

            const formData = new FormData(form);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            // Comprehensive validation
            if (!name || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (name.length < 2) {
                showNotification('Name must be at least 2 characters long', 'error');
                return;
            }

            if (!this.validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Password must be at least 6 characters long', 'error');
                return;
            }

            // Check password strength
            const strength = this.calculatePasswordStrength(password);
            if (strength < 30) {
                showNotification('Please use a stronger password (mix of uppercase, lowercase, numbers, and symbols)', 'warning');
                return;
            }

            // Simulate network delay (remove in production)
            await new Promise(resolve => setTimeout(resolve, 500));

            const userData = {
                name,
                email: email.toLowerCase(),
                password,
                provider: 'email'
            };

            const success = await this.register(userData);
            if (success) {
                form.reset();
                // Reset password strength indicator
                const strengthIndicator = document.querySelector('.password-strength > div');
                if (strengthIndicator) {
                    strengthIndicator.className = 'strength-weak';
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred during registration. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    // Profile page functionality
    initializeProfilePage() {
        if (!this.currentUser) {
            window.location.href = '../index.html';
            return;
        }
        
        this.loadProfileData();
        this.setupProfileNavigation();
        this.setupProfileForms();
    }

    loadProfileData() {
        // Populate user info
        const displayName = this.currentUser.name || this.currentUser.email || 'User';

        const userName = document.getElementById('userName');
        if (userName) userName.textContent = displayName;

        const userEmail = document.getElementById('userEmail');
        if (userEmail) userEmail.textContent = this.currentUser.email;

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) profileAvatar.textContent = displayName.charAt(0).toUpperCase();
        
        // Update credit display
        this.updateCreditDisplay();
        
        // Load user data
        this.loadBookingHistory();
        this.loadPrintingOrders();
        this.loadPaymentHistory();
    }

    setupProfileNavigation() {
        const profileSections = document.querySelectorAll('.profile-section');
        const profileNavLinks = document.querySelectorAll('.profile-nav a');
        
        const showProfileSection = (sectionId) => {
            profileSections.forEach(section => {
                section.classList.remove('active');
            });
            
            profileNavLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            const targetSection = document.getElementById(sectionId);
            const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
            
            if (targetSection) targetSection.classList.add('active');
            if (targetLink) targetLink.classList.add('active');
        };
        
        // Set up navigation
        profileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showProfileSection(sectionId);
                
                // Update URL without reloading
                const url = new URL(window.location);
                url.searchParams.set('tab', sectionId);
                window.history.pushState({}, '', url);
            });
        });
        
        // Check URL for tab parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && document.getElementById(tab)) {
            showProfileSection(tab);
        } else {
            showProfileSection('personal-info');
        }
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            if (tab && document.getElementById(tab)) {
                showProfileSection(tab);
            }
        });
    }

    setupProfileForms() {
        // Personal info form
        const personalInfoForm = document.getElementById('personalInfoForm');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePersonalInfo(new FormData(e.target));
            });
        }

        // Add credit functionality
        const addCreditBtn = document.getElementById('addCreditBtn');
        if (addCreditBtn) {
            addCreditBtn.addEventListener('click', () => {
                this.addCredit();
            });
        }
    }

    async updatePersonalInfo(formData) {
        // Update user information
        this.currentUser = {
            ...this.currentUser,
            name: formData.get('name') || this.currentUser.name,
            phone: formData.get('phone') || this.currentUser.phone,
            studentId: formData.get('studentId') || this.currentUser.studentId
        };

        await this.saveToDatabase('currentUser', this.currentUser);
        
        // Update UI
        this.updateAuthUI();
        this.loadProfileData();
        
        showNotification('Personal information updated successfully!', 'success');
    }

    async addCredit() {
        const amountInput = document.getElementById('creditAmount');
        const amount = parseFloat(amountInput?.value) || 0;
        
        if (amount >= 5) {
            this.userCredit += amount;
            await this.saveToDatabase('userCredit', this.userCredit);
            
            // Add to payment history
            const payment = {
                date: new Date().toISOString(),
                description: 'Credit Top-up',
                amount: amount,
                type: 'credit'
            };
            
            let paymentHistory = await this.loadFromDatabase('paymentHistory') || [];
            paymentHistory.push(payment);
            await this.saveToDatabase('paymentHistory', paymentHistory);
            
            this.updateCreditDisplay();
            this.loadPaymentHistory();
            
            showNotification(`Successfully added ${formatCurrency(amount)} to your account!`, 'success');
            
            // Clear input
            if (amountInput) amountInput.value = '';
        } else {
            showNotification('Minimum credit amount is 5 JOD', 'error');
        }
    }

    updateCreditDisplay() {
        const creditDisplay = document.querySelector('.credit-amount');
        if (creditDisplay) {
            creditDisplay.textContent = formatCurrency(this.userCredit);
        }
        
        // Also update the credit in the header
        const headerCredit = document.querySelector('.user-credit');
        if (headerCredit) {
            headerCredit.textContent = formatCurrency(this.userCredit);
        }
    }

    // Data loading methods for profile
    async loadBookingHistory() {
        const bookings = await this.loadFromDatabase('userBookings') || [];
        const tbody = document.getElementById('bookingsTableBody');
        
        if (!tbody) return;
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-light);">No bookings found</td></tr>';
            return;
        }
        
        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td>${this.formatDate(booking.date)}</td>
                <td>${this.formatRoomType(booking.roomType)}</td>
                <td>${booking.startTime} - ${booking.endTime}</td>
                <td>${booking.duration?.toFixed(1) || 'N/A'} hours</td>
                <td>${formatCurrency(booking.totalCost || 0)}</td>
                <td><span class="status-${booking.status || 'confirmed'}">${booking.status || 'confirmed'}</span></td>
            </tr>
        `).join('');
    }

    async loadPrintingOrders() {
        const orders = await this.loadFromDatabase('printingOrders') || [];
        const tbody = document.getElementById('printingTableBody');
        
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-light);">No printing orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${this.formatDate(order.createdAt)}</td>
                <td>${order.files?.length || 0} file(s)</td>
                <td>${order.totalPages || 0}</td>
                <td>${formatCurrency(order.cost || 0)}</td>
                <td><span class="status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            </tr>
        `).join('');
    }

    async loadPaymentHistory() {
        let payments = await this.loadFromDatabase('paymentHistory') || [];
        const tbody = document.getElementById('paymentHistoryBody');
        
        if (!tbody) return;
        
        // Add sample data if empty
        if (payments.length === 0) {
            payments = [
                {
                    date: new Date(Date.now() - 86400000).toISOString(),
                    description: 'Room Booking - Silent Room',
                    amount: -9.00,
                    type: 'debit'
                },
                {
                    date: new Date(Date.now() - 172800000).toISOString(),
                    description: 'Credit Top-up',
                    amount: 25.00,
                    type: 'credit'
                },
                {
                    date: new Date(Date.now() - 259200000).toISOString(),
                    description: 'Printing Services',
                    amount: -3.50,
                    type: 'debit'
                }
            ];
            await this.saveToDatabase('paymentHistory', payments);
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${this.formatDate(payment.date)}</td>
                <td>${payment.description}</td>
                <td style="color: ${payment.type === 'credit' ? 'var(--success)' : 'var(--danger)'}; font-weight: 500;">
                    ${payment.type === 'credit' ? '+' : ''}${formatCurrency(payment.amount)}
                </td>
                <td><span class="status-${payment.type}">${payment.type}</span></td>
            </tr>
        `).join('');
    }

    // Utility methods
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-JO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatRoomType(roomType) {
        const types = {
            'silent': 'Silent Room',
            'solo': 'Solo Room',
            'meeting-small': 'Small Meeting Room',
            'meeting-medium': 'Medium Meeting Room',
            'meeting-large': 'Large Meeting Room',
            'social': 'Social Area',
            'class': 'Class Room'
        };
        return types[roomType] || roomType;
    }

    // Database methods
    async saveToDatabase(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            showNotification('Error saving data', 'error');
            return false;
        }
    }

    async loadFromDatabase(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from database:', error);
            return null;
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});