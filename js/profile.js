// Profile Page JavaScript
// Handles loading and displaying user profile, bookings, and credit information

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.auth = null;

        // Wait for dependencies
        this.waitForDependencies().then(() => {
            this.init();
        });
    }

    async waitForDependencies() {
        let attempts = 0;
        while ((!window.authManager || !window.db) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.authManager || !window.db) {
            console.error('⚠️ Dependencies not loaded');
            return;
        }

        this.auth = window.firebaseAuth;
        this.db = window.db;
        console.log('✅ ProfileManager initialized');
    }

    async init() {
        // Wait for auth state to be resolved
        console.log('Waiting for auth state...');
        await window.authManager.authStatePromise;

        // Check if user is authenticated
        if (!window.authManager.currentUser) {
            // Not logged in - redirect to home
            console.log('User not authenticated, redirecting to home');
            if (window.authManager.showNotification) {
                window.authManager.showNotification('Please sign in to view your profile', 'error');
            }
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            return;
        }

        console.log('User authenticated:', window.authManager.currentUser.email);
        this.currentUser = window.authManager.currentUser;

        // Load profile data
        await this.loadProfileData();

        // Set up profile navigation
        this.setupProfileNavigation();

        // Set up form handlers
        this.setupFormHandlers();

        // Load all data
        await this.loadBookingHistory();
        await this.loadPrintingOrders();
        await this.loadPaymentHistory();
    }

    async loadProfileData() {
        try {
            // Update profile header
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');

            if (userName) userName.textContent = this.currentUser.name || 'User';
            if (userEmail) userEmail.textContent = this.currentUser.email;

            // Update profile avatar
            const profileAvatar = document.getElementById('profileAvatar');
            if (profileAvatar) {
                if (this.currentUser.photoURL) {
                    profileAvatar.innerHTML = `<img src="${this.currentUser.photoURL}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                } else {
                    const initial = (this.currentUser.name || this.currentUser.email || 'U')[0].toUpperCase();
                    profileAvatar.innerHTML = `<div style="width: 100%; height: 100%; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 600;">${initial}</div>`;
                }
            }

            // Populate form fields
            const fullNameInput = document.getElementById('fullName');
            const profileEmailInput = document.getElementById('profileEmail');
            const phoneInput = document.getElementById('phone');
            const studentIdInput = document.getElementById('studentId');

            if (fullNameInput) fullNameInput.value = this.currentUser.name || '';
            if (profileEmailInput) profileEmailInput.value = this.currentUser.email || '';
            if (phoneInput) phoneInput.value = this.currentUser.phone || '';
            if (studentIdInput) studentIdInput.value = this.currentUser.studentId || '';

            // Update credit displays
            this.updateCreditDisplay();

        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    updateCreditDisplay() {
        if (!this.currentUser) return;

        const credit = this.currentUser.credit || 25.00;
        const balanceElements = document.querySelectorAll('#currentBalance, #creditBalance');

        balanceElements.forEach(el => {
            if (el) el.textContent = `${credit.toFixed(2)} JOD`;
        });
    }

    setupProfileNavigation() {
        const navLinks = document.querySelectorAll('.profile-nav a');
        const sections = document.querySelectorAll('.profile-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetSection = link.getAttribute('data-section');

                // Remove active class from all links and sections
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                // Add active class to clicked link and target section
                link.classList.add('active');
                const section = document.getElementById(targetSection);
                if (section) section.classList.add('active');
            });
        });
    }

    setupFormHandlers() {
        // Personal info form
        const personalInfoForm = document.getElementById('personalInfoForm');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updatePersonalInfo();
            });
        }

        // Add credit button
        const addCreditBtn = document.getElementById('addCreditBtn');
        if (addCreditBtn) {
            addCreditBtn.addEventListener('click', async () => {
                await this.addCredit();
            });
        }
    }

    async updatePersonalInfo() {
        try {
            const updates = {
                name: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                studentId: document.getElementById('studentId').value
            };

            await this.db.update('users', this.currentUser.id, updates);

            // Update local user object
            this.currentUser = { ...this.currentUser, ...updates };
            window.authManager.currentUser = this.currentUser;

            // Update UI
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = this.currentUser.name || 'User';

            if (window.authManager.showNotification) {
                window.authManager.showNotification('Personal information updated successfully!', 'success');
            } else {
                alert('Personal information updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (window.authManager.showNotification) {
                window.authManager.showNotification('Failed to update profile', 'error');
            } else {
                alert('Failed to update profile');
            }
        }
    }

    async addCredit() {
        const amount = parseFloat(document.getElementById('creditAmount').value) || 0;

        if (amount < 5) {
            if (window.authManager.showNotification) {
                window.authManager.showNotification('Minimum credit amount is 5 JOD', 'error');
            } else {
                alert('Minimum credit amount is 5 JOD');
            }
            return;
        }

        try {
            const newCredit = (this.currentUser.credit || 25.00) + amount;

            // Update user credit in Firebase
            await this.db.update('users', this.currentUser.id, { credit: newCredit });

            // Add to payment history
            await this.db.create('paymentHistory', {
                userId: this.currentUser.id,
                date: new Date().toISOString(),
                description: 'Credit Top-up',
                amount: amount,
                type: 'credit'
            });

            // Update local user object
            this.currentUser.credit = newCredit;
            window.authManager.currentUser.credit = newCredit;
            window.authManager.userCredit = newCredit;

            this.updateCreditDisplay();
            await this.loadPaymentHistory();

            if (window.authManager.showNotification) {
                window.authManager.showNotification(`Successfully added ${amount.toFixed(2)} JOD to your account!`, 'success');
            } else {
                alert(`Successfully added ${amount.toFixed(2)} JOD to your account!`);
            }
        } catch (error) {
            console.error('Error adding credit:', error);
            if (window.authManager.showNotification) {
                window.authManager.showNotification('Failed to add credit', 'error');
            } else {
                alert('Failed to add credit');
            }
        }
    }

    async loadBookingHistory() {
        if (!this.currentUser) return;

        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        try {
            const bookings = await this.db.query('bookings', [
                ['userId', '==', this.currentUser.id]
            ]);

            if (bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No bookings found</td></tr>';
                return;
            }

            // Sort by date (newest first)
            bookings.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

            tbody.innerHTML = bookings.map(booking => {
                const date = new Date(booking.date || booking.createdAt);
                return `
                    <tr>
                        <td>${date.toLocaleDateString('en-JO')}</td>
                        <td>${this.formatRoomType(booking.roomType || booking.roomId)}</td>
                        <td>${booking.startTime || 'N/A'} - ${booking.endTime || 'N/A'}</td>
                        <td>${(booking.duration || 2).toFixed(1)} hours</td>
                        <td>${(booking.totalCost || 0).toFixed(2)} JOD</td>
                        <td><span class="status-${booking.status || 'confirmed'}">${booking.status || 'confirmed'}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading bookings:', error);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Error loading bookings</td></tr>';
        }
    }

    async loadPrintingOrders() {
        if (!this.currentUser) return;

        const tbody = document.getElementById('printingTableBody');
        if (!tbody) return;

        try {
            const orders = await this.db.query('printingOrders', [
                ['userId', '==', this.currentUser.id]
            ]);

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No printing orders found</td></tr>';
                return;
            }

            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${new Date(order.createdAt).toLocaleDateString('en-JO')}</td>
                    <td>${(order.files?.length || 0)} file(s)</td>
                    <td>${order.totalPages || 0}</td>
                    <td>${(order.cost || 0).toFixed(2)} JOD</td>
                    <td><span class="status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading printing orders:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Error loading printing orders</td></tr>';
        }
    }

    async loadPaymentHistory() {
        if (!this.currentUser) return;

        const tbody = document.getElementById('paymentHistoryBody');
        if (!tbody) return;

        try {
            let payments = await this.db.query('paymentHistory', [
                ['userId', '==', this.currentUser.id]
            ]);

            // Sort by date (newest first)
            payments.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No payment history found</td></tr>';
                return;
            }

            tbody.innerHTML = payments.map(payment => `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString('en-JO')}</td>
                    <td>${payment.description}</td>
                    <td style="color: ${payment.type === 'credit' ? 'var(--success)' : 'var(--accent)'}">
                        ${payment.type === 'credit' ? '+' : '-'}${payment.amount.toFixed(2)} JOD
                    </td>
                    <td><span class="status-${payment.type}">${payment.type}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading payment history:', error);
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Error loading payment history</td></tr>';
        }
    }

    formatRoomType(roomType) {
        const types = {
            'silent': 'Silent Room',
            'solo': 'Solo Room',
            'meeting-small': 'Small Meeting Room',
            'meeting-medium': 'Medium Meeting Room',
            'meeting-large': 'Large Meeting Room'
        };
        return types[roomType] || roomType;
    }
}

// Initialize profile manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.profileManager = new ProfileManager();
});
