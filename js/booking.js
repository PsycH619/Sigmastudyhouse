// Booking Wizard System
const bookingWizard = {
    currentStep: 1,
    totalSteps: 4,
    selectedRoom: null,
    guestCount: 1,
    bookingData: {
        roomType: null,
        date: null,
        startTime: null,
        endTime: null,
        guests: 1,
        specialRequirements: ''
    },

    roomPrices: {
        'social': { hourly: 3, daily: 3, description: 'Social Area', min: 15, max: 40 },
        'solo': { hourly: 5, period: 6, description: 'Solo Room', min: 1, max: 1 },
        'meeting-small': { hourly: 8, description: 'Small Meeting Room', min: 2, max: 4 },
        'meeting-medium': { hourly: 12, description: 'Medium Meeting Room', min: 4, max: 8 },
        'meeting-large': { hourly: 18, description: 'Large Meeting Room', min: 8, max: 12 },
        'class': { hourly: 3, daily: 3, description: 'Class Room', min: 7, max: 14 }
    },

    init() {
        this.setupRoomSelection();
        this.setupDateTimeInputs();
        this.updateProgressIndicator();
        this.checkUrlParameters();
    },

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomType = urlParams.get('room');

        if (roomType && this.roomPrices[roomType]) {
            this.selectRoom(roomType);
        }
    },

    setupRoomSelection() {
        const roomCards = document.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            card.addEventListener('click', () => {
                const roomType = card.getAttribute('data-room');
                this.selectRoom(roomType);
            });
        });
    },

    selectRoom(roomType) {
        // Remove previous selection
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-room="${roomType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.selectedRoom = roomType;
        this.bookingData.roomType = roomType;

        // Update guest count limits
        const roomInfo = this.roomPrices[roomType];
        this.guestCount = roomInfo.min;
        this.bookingData.guests = this.guestCount;

        // Enable next button
        document.getElementById('step1Next').disabled = false;
    },

    setupDateTimeInputs() {
        // Set minimum date to today
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;

            // Set default to today
            const now = new Date();
            if (now.getHours() >= 22) {
                now.setDate(now.getDate() + 1);
            }
            dateInput.value = now.toISOString().split('T')[0];
            dateInput.addEventListener('change', () => this.validateDateTime());
        }

        // Set default times (hourly intervals)
        const startTimeSelect = document.getElementById('startTime');
        const endTimeSelect = document.getElementById('endTime');

        if (startTimeSelect && endTimeSelect) {
            const now = new Date();
            let startHour = now.getHours() + 1;
            if (startHour > 23) startHour = 9;

            let endHour = startHour + 2;
            if (endHour > 23) endHour = endHour - 24;

            startTimeSelect.value = `${startHour.toString().padStart(2, '0')}:00`;
            endTimeSelect.value = `${endHour.toString().padStart(2, '0')}:00`;

            startTimeSelect.addEventListener('change', () => this.validateDateTime());
            endTimeSelect.addEventListener('change', () => this.validateDateTime());
        }
    },

    validateDateTime() {
        const date = document.getElementById('bookingDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        if (!date || !startTime || !endTime) {
            document.getElementById('step2Next').disabled = true;
            document.getElementById('durationInfo').textContent = 'Please select date and time';
            return false;
        }

        // Calculate duration
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        let startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;

        // Handle overnight bookings (if end time is before start time, it means next day)
        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60; // Add 24 hours
        }

        const durationMinutes = endMinutes - startMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        this.bookingData.date = date;
        this.bookingData.startTime = startTime;
        this.bookingData.endTime = endTime;
        this.bookingData.duration = durationMinutes / 60;

        document.getElementById('durationInfo').innerHTML = `<i class="fas fa-check-circle"></i> Duration: ${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ' ' + minutes + ' minutes' : ''}`;
        document.getElementById('step2Next').disabled = false;

        return true;
    },

    incrementGuests() {
        const roomInfo = this.roomPrices[this.selectedRoom];
        if (this.guestCount < roomInfo.max) {
            this.guestCount++;
            this.updateGuestDisplay();
        }
    },

    decrementGuests() {
        const roomInfo = this.roomPrices[this.selectedRoom];
        if (this.guestCount > roomInfo.min) {
            this.guestCount--;
            this.updateGuestDisplay();
        }
    },

    updateGuestDisplay() {
        document.getElementById('guestCount').textContent = this.guestCount;
        this.bookingData.guests = this.guestCount;

        const roomInfo = this.roomPrices[this.selectedRoom];
        document.getElementById('guestRangeInfo').textContent = `Capacity: ${roomInfo.min}-${roomInfo.max} people`;
    },

    nextStep() {
        // Validate current step
        if (this.currentStep === 1 && !this.selectedRoom) {
            showNotification('Please select a room type', 'error');
            return;
        }

        if (this.currentStep === 2 && !this.validateDateTime()) {
            showNotification('Please select valid date and time', 'error');
            return;
        }

        if (this.currentStep === 3) {
            // Save special requirements
            this.bookingData.specialRequirements = document.getElementById('specialRequirements').value;
        }

        // Hide current step
        document.getElementById(`step${this.currentStep}`).classList.remove('active');

        // Mark as completed
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('completed');

        // Show next step
        this.currentStep++;
        document.getElementById(`step${this.currentStep}`).classList.add('active');

        // Update progress indicator
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');
        this.updateProgressIndicator();

        // Initialize step-specific data
        if (this.currentStep === 3) {
            this.updateGuestDisplay();
        } else if (this.currentStep === 4) {
            this.updateSummary();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    previousStep() {
        // Hide current step
        document.getElementById(`step${this.currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.remove('active');

        // Show previous step
        this.currentStep--;
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // Remove completed status
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.remove('completed');

        this.updateProgressIndicator();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateProgressIndicator() {
        const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        document.getElementById('progressLine').style.width = `${progress}%`;
    },

    calculateCost() {
        const roomType = this.bookingData.roomType;
        const duration = this.bookingData.duration;
        const guests = this.bookingData.guests;
        const room = this.roomPrices[roomType];

        if (!room) return 0;

        let cost = 0;

        if (roomType === 'social') {
            // Social area: 15-40 people, per-person pricing
            if (guests >= 15) {
                cost = guests * 2; // 2 JD per person
            } else {
                cost = room.daily; // Fixed daily rate
            }
        } else if (roomType === 'class') {
            // Class room: 7-14 people, per-person pricing
            if (guests >= 7) {
                cost = guests * 2; // 2 JD per person
            } else {
                cost = room.daily; // Fixed daily rate
            }
        } else if (roomType === 'solo') {
            // Solo room: 5 JD per 6-hour period
            const periods = Math.ceil(duration / 6);
            cost = periods * 5; // 5 JOD per 6-hour period
        } else {
            // Meeting rooms: hourly rate
            cost = duration * room.hourly;
        }

        return cost;
    },

    getRateDescription() {
        const roomType = this.bookingData.roomType;
        const duration = this.bookingData.duration;
        const guests = this.bookingData.guests;
        const room = this.roomPrices[roomType];

        if (roomType === 'social' || roomType === 'class') {
            const minGuests = roomType === 'social' ? 15 : 7;
            if (guests >= minGuests) {
                return `${guests} guests × 2 JOD`;
            } else {
                return `${room.daily} JOD / 24h`;
            }
        } else if (roomType === 'solo') {
            const periods = Math.ceil(duration / 6);
            return `${periods} period${periods > 1 ? 's' : ''} × 5 JOD/6h`;
        } else {
            return `${duration}h × ${room.hourly} JOD/h`;
        }
    },

    updateSummary() {
        const roomInfo = this.roomPrices[this.bookingData.roomType];
        const cost = this.calculateCost();

        // Format date
        const dateObj = new Date(this.bookingData.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format duration
        const hours = Math.floor(this.bookingData.duration);
        const minutes = Math.round((this.bookingData.duration % 1) * 60);
        const durationStr = `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;

        // Update summary fields
        document.getElementById('summaryRoomType').textContent = roomInfo.description;
        document.getElementById('summaryDate').textContent = formattedDate;
        document.getElementById('summaryTime').textContent = `${this.bookingData.startTime} - ${this.bookingData.endTime}`;
        document.getElementById('summaryDuration').textContent = durationStr;
        document.getElementById('summaryGuests').textContent = this.bookingData.guests;
        document.getElementById('summaryRate').textContent = this.getRateDescription();
        document.getElementById('summaryTotal').textContent = `${cost.toFixed(2)} JOD`;
    },

    async confirmBooking() {
        // Check if user is logged in
        if (!window.authManager || !window.authManager.currentUser) {
            showNotification('Please sign in to complete your booking', 'error');
            window.authManager?.showLoginModal();
            return;
        }

        const cost = this.calculateCost();

        // Check if user has enough credit
        if (window.authManager.userCredit < cost) {
            showNotification(`Insufficient credit. You need ${cost.toFixed(2)} JOD but have ${window.authManager.userCredit.toFixed(2)} JOD. Please top up your account.`, 'error');
            return;
        }

        // Create booking object
        const booking = {
            id: Date.now(),
            userId: window.authManager.currentUser.id,
            roomType: this.bookingData.roomType,
            roomDescription: this.roomPrices[this.bookingData.roomType].description,
            date: this.bookingData.date,
            startTime: this.bookingData.startTime,
            endTime: this.bookingData.endTime,
            duration: this.bookingData.duration,
            guests: this.bookingData.guests,
            specialRequirements: this.bookingData.specialRequirements,
            totalCost: cost,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        try {
            // Save to database
            if (window.databaseManager) {
                await window.databaseManager.create('bookings', booking);

                // Add to payment history
                await window.databaseManager.create('paymentHistory', {
                    userId: window.authManager.currentUser.id,
                    date: new Date().toISOString(),
                    description: `Booking - ${this.roomPrices[this.bookingData.roomType].description}`,
                    amount: cost,
                    type: 'booking'
                });
            } else {
                // Fallback to localStorage
                const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                bookings.push(booking);
                localStorage.setItem('bookings', JSON.stringify(bookings));

                // Add to payment history
                const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
                paymentHistory.push({
                    userId: window.authManager.currentUser.id,
                    date: new Date().toISOString(),
                    description: `Booking - ${this.roomPrices[this.bookingData.roomType].description}`,
                    amount: cost,
                    type: 'booking'
                });
                localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
            }

            // Deduct credit from user account
            const newCreditAmount = window.authManager.userCredit - cost;
            await window.authManager.updateCredit(newCreditAmount);

            // Show success message
            showNotification(`✓ Booking confirmed! ${cost.toFixed(2)} JOD has been deducted from your account. You now have ${window.authManager.userCredit.toFixed(2)} JOD remaining.`, 'success');

            // Redirect to confirmation page or reset form
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);

        } catch (error) {
            console.error('Booking error:', error);
            showNotification('An error occurred while processing your booking. Please try again.', 'error');
        }
    }
};

// Legacy BookingManager class for backward compatibility
class BookingManager {
    constructor() {
        this.roomPrices = bookingWizard.roomPrices;
        this.init();
    }

    init() {
        // Check if we're on the new wizard page
        if (document.querySelector('.booking-wizard')) {
            bookingWizard.init();
        } else {
            // Legacy form support (if needed)
            this.initializeLegacyForm();
        }
    }

    initializeLegacyForm() {
        // Keep old form functionality for backward compatibility
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm && !document.querySelector('.booking-wizard')) {
            this.initializeBookingForm();
            this.loadRoomAvailability();
            this.setupRoomTypeChange();
        }
    }

    initializeBookingForm() {
        const bookingForm = document.getElementById('bookingForm');
        const confirmBookingBtn = document.getElementById('confirmBookingBtn');

        if (!bookingForm) return;

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            dateInput.min = today;

            const now = new Date();
            if (now.getHours() >= 22) {
                now.setDate(now.getDate() + 1);
            }
            dateInput.value = now.toISOString().split('T')[0];
        }

        // Set default times
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');

        if (startTimeInput && endTimeInput) {
            const now = new Date();
            let startHour = now.getHours() + 1;
            if (startHour > 23) startHour = 9;

            startTimeInput.value = `${startHour.toString().padStart(2, '0')}:00`;
            endTimeInput.value = `${(startHour + 2).toString().padStart(2, '0')}:00`;
        }

        bookingForm.addEventListener('input', () => this.updateBookingSummary());
        bookingForm.addEventListener('change', () => this.updateBookingSummary());
        bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));

        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener('click', () => this.confirmBooking());
        }

        this.checkUrlParameters();
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomType = urlParams.get('room');

        if (roomType && this.roomPrices[roomType]) {
            const roomSelect = document.getElementById('roomType');
            if (roomSelect) {
                roomSelect.value = roomType;
                this.updateBookingSummary();
            }
        }
    }

    setupRoomTypeChange() {
        const roomTypeSelect = document.getElementById('roomType');
        if (roomTypeSelect) {
            roomTypeSelect.addEventListener('change', () => {
                this.updateGuestLimits();
                this.updateBookingSummary();
            });
        }
    }

    updateGuestLimits() {
        const roomType = document.getElementById('roomType')?.value;
        const guestsInput = document.getElementById('guests');

        if (!guestsInput || !roomType) return;

        const limits = {
            'social': { min: 15, max: 40 },
            'solo': { min: 1, max: 1 },
            'meeting-small': { min: 2, max: 4 },
            'meeting-medium': { min: 4, max: 8 },
            'meeting-large': { min: 8, max: 12 },
            'class': { min: 7, max: 14 }
        };

        if (limits[roomType]) {
            guestsInput.min = limits[roomType].min;
            guestsInput.max = limits[roomType].max;

            if (parseInt(guestsInput.value) < limits[roomType].min) {
                guestsInput.value = limits[roomType].min;
            }
            if (parseInt(guestsInput.value) > limits[roomType].max) {
                guestsInput.value = limits[roomType].max;
            }
        }
    }

    updateBookingSummary() {
        const roomType = document.getElementById('roomType')?.value;
        const bookingDate = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const guests = document.getElementById('guests')?.value;

        if (!roomType || !bookingDate || !startTime || !endTime) {
            return;
        }

        const duration = this.calculateDuration(startTime, endTime);
        const cost = this.calculateCost(roomType, duration, parseInt(guests) || 1);
        const room = this.roomPrices[roomType];

        document.getElementById('summaryRoomType').textContent = room.description;
        document.getElementById('summaryDate').textContent = new Date(bookingDate + 'T00:00:00').toLocaleDateString();
        document.getElementById('summaryTime').textContent = `${startTime} - ${endTime}`;
        document.getElementById('summaryDuration').textContent = `${duration} hours`;
        document.getElementById('summaryGuests').textContent = guests || '1';
        document.getElementById('summaryRate').textContent = this.getRateText(roomType, duration, parseInt(guests) || 1);
        document.getElementById('summaryTotal').textContent = `${cost.toFixed(2)} JOD`;

        const confirmBtn = document.getElementById('confirmBookingBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }

    calculateDuration(startTime, endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return (endMinutes - startMinutes) / 60;
    }

    calculateCost(roomType, duration, guests) {
        const room = this.roomPrices[roomType];
        if (!room) return 0;

        let cost = 0;

        if (roomType === 'social') {
            if (guests >= 15) {
                cost = guests * 2;
            } else {
                cost = room.daily;
            }
        } else if (roomType === 'class') {
            if (guests >= 7) {
                cost = guests * 2;
            } else {
                cost = room.daily;
            }
        } else if (roomType === 'solo') {
            const periods = Math.ceil(duration / 6);
            cost = periods * 5; // 5 JOD per 6-hour period
        } else {
            cost = duration * room.hourly;
        }

        return cost;
    }

    getRateText(roomType, duration, guests) {
        const room = this.roomPrices[roomType];

        if (roomType === 'social' || roomType === 'class') {
            const minGuests = roomType === 'social' ? 15 : 7;
            if (guests >= minGuests) {
                return `${guests} guests × 2 JOD`;
            } else {
                return `${room.daily} JOD / 24h`;
            }
        } else if (roomType === 'solo') {
            return `5 JOD / 6 hours`;
        } else {
            return `${room.hourly} JOD / hour`;
        }
    }

    handleBookingSubmit(e) {
        e.preventDefault();

        const roomType = document.getElementById('roomType')?.value;
        const guests = parseInt(document.getElementById('guests')?.value) || 1;

        if (!roomType) {
            showNotification('Please select a room type', 'error');
            return false;
        }

        const minGuests = roomType === 'social' ? 15 : (roomType === 'class' ? 7 : 1);
        if ((roomType === 'social' || roomType === 'class') && guests < minGuests) {
            showNotification(`Minimum ${minGuests} guests required for this room type`, 'error');
            return false;
        }

        this.confirmBooking();
        return false;
    }

    async confirmBooking() {
        if (!window.authManager || !window.authManager.currentUser) {
            showNotification('Please sign in to complete your booking', 'error');
            window.authManager?.showLoginModal();
            return;
        }

        const roomType = document.getElementById('roomType')?.value;
        const bookingDate = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const guests = parseInt(document.getElementById('guests')?.value) || 1;
        const specialRequirements = document.getElementById('specialRequirements')?.value || '';

        const duration = this.calculateDuration(startTime, endTime);
        const cost = this.calculateCost(roomType, duration, guests);

        if (window.authManager.userCredit < cost) {
            showNotification(`Insufficient credit. You need ${cost.toFixed(2)} JOD but have ${window.authManager.userCredit.toFixed(2)} JOD.`, 'error');
            return;
        }

        const booking = {
            id: Date.now(),
            userId: window.authManager.currentUser.id,
            roomType: roomType,
            roomDescription: this.roomPrices[roomType].description,
            date: bookingDate,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            guests: guests,
            specialRequirements: specialRequirements,
            totalCost: cost,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        try {
            if (window.databaseManager) {
                await window.databaseManager.create('bookings', booking);

                // Add to payment history
                await window.databaseManager.create('paymentHistory', {
                    userId: window.authManager.currentUser.id,
                    date: new Date().toISOString(),
                    description: `Booking - ${this.roomPrices[roomType].description}`,
                    amount: cost,
                    type: 'booking'
                });
            } else {
                const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                bookings.push(booking);
                localStorage.setItem('bookings', JSON.stringify(bookings));

                // Add to payment history
                const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
                paymentHistory.push({
                    userId: window.authManager.currentUser.id,
                    date: new Date().toISOString(),
                    description: `Booking - ${this.roomPrices[roomType].description}`,
                    amount: cost,
                    type: 'booking'
                });
                localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
            }

            const newCreditAmount = window.authManager.userCredit - cost;
            await window.authManager.updateCredit(newCreditAmount);

            showNotification(`✓ Booking confirmed! ${cost.toFixed(2)} JOD deducted. Remaining: ${window.authManager.userCredit.toFixed(2)} JOD.`, 'success');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);

        } catch (error) {
            console.error('Booking error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        }
    }

    loadRoomAvailability() {
        // Placeholder for future room availability feature
        console.log('Room availability feature coming soon');
    }
}

// Initialize booking manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bookingManager = new BookingManager();
    });
} else {
    window.bookingManager = new BookingManager();
}
