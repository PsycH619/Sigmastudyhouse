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
            window.location.href = '../index.html';
            return;
        }

        this.auth = window.firebaseAuth;
        this.db = window.db;
        console.log('✅ ProfileManager initialized');
    }

    async init() {
        // Wait for auth manager to load user
        let attempts = 0;
        while (!window.authManager.currentUser && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.authManager.currentUser) {
            // Not logged in - redirect to home
            alert('Please sign in to view your profile');
            window.location.href = '../index.html';
            return;
        }

        this.currentUser = window.authManager.currentUser;
        await this.loadProfileData();
        await this.loadBookings();
    }

    async loadProfileData() {
        try {
            // Update profile header
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const memberSince = document.getElementById('memberSince');
            const accountBalance = document.getElementById('accountBalance');

            if (profileName) profileName.textContent = this.currentUser.name || 'User';
            if (profileEmail) profileEmail.textContent = this.currentUser.email;

            if (memberSince && this.currentUser.createdAt) {
                const date = new Date(this.currentUser.createdAt);
                memberSince.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                });
            }

            if (accountBalance) {
                const credit = this.currentUser.credit || 25.00;
                accountBalance.textContent = credit.toFixed(2);
            }

            // Calculate stats
            await this.calculateStats();

        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    async calculateStats() {
        try {
            // Get user's bookings
            const bookings = await this.db.query('bookings', [
                ['userId', '==', this.currentUser.id]
            ]);

            // Total bookings
            const totalBookings = document.getElementById('totalBookings');
            if (totalBookings) {
                totalBookings.textContent = bookings.length;
            }

            // Calculate study hours
            let totalHours = 0;
            bookings.forEach(booking => {
                if (booking.duration) {
                    totalHours += booking.duration;
                } else {
                    // Default 2 hours per booking if duration not specified
                    totalHours += 2;
                }
            });

            const studyHours = document.getElementById('studyHours');
            if (studyHours) {
                studyHours.textContent = totalHours;
            }

            // Calculate reward points (10 points per booking)
            const rewardPoints = document.getElementById('rewardPoints');
            if (rewardPoints) {
                rewardPoints.textContent = bookings.length * 10;
            }

        } catch (error) {
            console.error('Error calculating stats:', error);
        }
    }

    async loadBookings() {
        try {
            const bookingsList = document.getElementById('bookingsList');
            if (!bookingsList) return;

            // Get user's bookings
            const bookings = await this.db.query('bookings', [
                ['userId', '==', this.currentUser.id]
            ]);

            if (bookings.length === 0) {
                // Show empty state
                bookingsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <h3>No bookings yet</h3>
                        <p>Start by booking a study room!</p>
                        <br>
                        <a href="booking.html" class="btn">Book Now</a>
                    </div>
                `;
                return;
            }

            // Sort bookings by date (newest first)
            bookings.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateB - dateA;
            });

            // Display bookings
            bookingsList.innerHTML = bookings.slice(0, 10).map(booking => {
                const date = new Date(booking.date || booking.createdAt);
                const dateStr = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                const timeStr = booking.time || date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const status = booking.status || 'confirmed';
                const room = booking.roomName || booking.roomId || 'Study Room';
                const duration = booking.duration || 2;

                return `
                    <div class="booking-item">
                        <div class="booking-info">
                            <h4><i class="fas fa-door-open"></i> ${room}</h4>
                            <p>
                                <i class="fas fa-calendar"></i> ${dateStr} at ${timeStr}
                                • <i class="fas fa-clock"></i> ${duration} hours
                            </p>
                        </div>
                        <div class="booking-status ${status}">
                            ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading bookings:', error);
            const bookingsList = document.getElementById('bookingsList');
            if (bookingsList) {
                bookingsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Error loading bookings</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }
}

// Initialize profile manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.profileManager = new ProfileManager();
});
