// Booking system functionality
class BookingManager {
    constructor() {
        this.roomPrices = {
            'social': { hourly: 3, daily: 3, description: 'Social Area' },
            'solo': { hourly: 5, period: 6, description: 'Solo Room' },
            'meeting-small': { hourly: 8, description: 'Small Meeting Room (2-4)' },
            'meeting-medium': { hourly: 12, description: 'Medium Meeting Room (4-8)' },
            'meeting-large': { hourly: 18, description: 'Large Meeting Room (8-12)' },
            'class': { hourly: 3, daily: 3, description: 'Class Room' }
        };
        
        this.init();
    }

    init() {
        this.initializeBookingForm();
        this.loadRoomAvailability();
        this.setupRoomTypeChange();
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
            
            // Set default to today
            const now = new Date();
            if (now.getHours() >= 22) { // If it's late, default to tomorrow
                now.setDate(now.getDate() + 1);
            }
            dateInput.value = now.toISOString().split('T')[0];
        }

        // Set default times
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        
        if (startTimeInput && endTimeInput) {
            const now = new Date();
            let startHour = now.getHours() + 1; // Start next hour
            if (startHour > 23) startHour = 9; // If late, start at 9 AM next day
            
            startTimeInput.value = `${startHour.toString().padStart(2, '0')}:00`;
            endTimeInput.value = `${(startHour + 2).toString().padStart(2, '0')}:00`;
        }

        // Update booking summary in real-time
        bookingForm.addEventListener('input', () => this.updateBookingSummary());
        bookingForm.addEventListener('change', () => this.updateBookingSummary());

        // Form submission
        bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));

        // Confirm booking button
        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener('click', () => this.confirmBooking());
        }

        // Check URL parameters for pre-selected room
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

        const limit = limits[roomType] || { min: 1, max: 1 };
        guestsInput.min = limit.min;
        guestsInput.max = limit.max;
        guestsInput.value = limit.min;

        // Update placeholder
        guestsInput.placeholder = `${limit.min}-${limit.max} people`;
    }

    updateBookingSummary() {
        const roomType = document.getElementById('roomType')?.value;
        const date = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const guests = document.getElementById('guests')?.value;

        // Update summary fields
        this.updateSummaryField('summaryRoomType', roomType ? this.roomPrices[roomType]?.description : '-');
        this.updateSummaryField('summaryDate', date ? new Date(date).toLocaleDateString('en-JO') : '-');
        this.updateSummaryField('summaryTime', startTime && endTime ? `${startTime} - ${endTime}` : '-');
        this.updateSummaryField('summaryGuests', guests || '-');

        // Calculate duration and cost
        if (startTime && endTime && roomType) {
            const duration = this.calculateDuration(startTime, endTime);
            const cost = this.calculateCost(roomType, duration, parseInt(guests) || 1);

            if (duration > 0) {
                this.updateSummaryField('summaryDuration', `${duration.toFixed(1)} hours`);
                this.updateSummaryField('summaryRate', `${this.roomPrices[roomType]?.hourly || 0} JOD/hour`);
                this.updateSummaryField('summaryTotal', `${cost.toFixed(2)} JOD`);

                // Enable confirm button if all fields are filled
                this.toggleConfirmButton(roomType && date && startTime && endTime && guests);
            } else {
                this.clearCalculationFields();
            }
        } else {
            this.clearCalculationFields();
        }
    }

    updateSummaryField(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = value;
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        return (end - start) / (1000 * 60 * 60); // Convert to hours
    }

    calculateCost(roomType, duration, guests) {
        const room = this.roomPrices[roomType];
        if (!room) return 0;

        let cost = 0;

        if (roomType === 'social' || roomType === 'class') {
            // Social and Class areas have per-person pricing for groups
            if (guests >= 15) {
                cost = guests * 2; // 2 JD per person
            } else {
                cost = room.daily; // Fixed daily rate for small groups
            }
        } else if (roomType === 'solo') {
            // Solo rooms have fixed 6-hour periods
            const periods = Math.ceil(duration / 6);
            cost = periods * room.hourly * 6;
        } else {
            // Meeting rooms are hourly
            cost = duration * room.hourly;
        }

        return cost;
    }

    clearCalculationFields() {
        this.updateSummaryField('summaryDuration', '-');
        this.updateSummaryField('summaryRate', '-');
        this.updateSummaryField('summaryTotal', '-');
        this.toggleConfirmButton(false);
    }

    toggleConfirmButton(enabled) {
        const confirmBtn = document.getElementById('confirmBookingBtn');
        if (confirmBtn) {
            confirmBtn.disabled = !enabled;
            confirmBtn.style.opacity = enabled ? '1' : '0.6';
        }
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        if (!window.authManager?.currentUser) {
            showNotification('Please sign in to book a room', 'error');
            window.authManager?.showLoginModal();
            return;
        }

        if (!this.validateBookingForm()) {
            return;
        }

        await this.processBooking();
    }

    validateBookingForm() {
        const roomType = document.getElementById('roomType')?.value;
        const date = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const guests = document.getElementById('guests')?.value;

        if (!roomType || !date || !startTime || !endTime || !guests) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        // Check if end time is after start time
        const duration = this.calculateDuration(startTime, endTime);
        if (duration <= 0) {
            showNotification('End time must be after start time', 'error');
            return false;
        }

        // Check minimum booking duration
        if (duration < 1) {
            showNotification('Minimum booking duration is 1 hour', 'error');
            return false;
        }

        // Check room capacity
        const roomCapacity = {
            'social': 40,
            'solo': 1,
            'meeting-small': 4,
            'meeting-medium': 8,
            'meeting-large': 12,
            'class': 14
        };

        if (parseInt(guests) > roomCapacity[roomType]) {
            showNotification(`This room type can only accommodate ${roomCapacity[roomType]} guests`, 'error');
            return false;
        }

        // Check minimum guests for social/class areas
        const minGuests = roomType === 'social' ? 15 : (roomType === 'class' ? 7 : 1);
        if ((roomType === 'social' || roomType === 'class') && parseInt(guests) < minGuests) {
            showNotification(`Minimum ${minGuests} guests required for this room type`, 'error');
            return false;
        }

        return true;
    }

    async processBooking() {
        showNotification('Checking availability...', 'info');

        // Simulate API call
        setTimeout(async () => {
            const isAvailable = await this.checkAvailability();
            
            if (isAvailable) {
                showNotification('Room available! Please confirm your booking.', 'success');
                this.toggleConfirmButton(true);
                
                // Scroll to confirmation button
                document.getElementById('confirmBookingBtn')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            } else {
                showNotification('Sorry, this room is not available for the selected time. Please choose a different time or room type.', 'error');
                this.toggleConfirmButton(false);
            }
        }, 1500);
    }

    async checkAvailability() {
        // Simulate availability check - in real app, this would call an API
        const roomType = document.getElementById('roomType')?.value;
        const date = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        
        // For demo purposes, return true 80% of the time
        return Math.random() > 0.2;
    }

    async confirmBooking() {
        if (!window.authManager?.currentUser) {
            showNotification('Please sign in to confirm booking', 'error');
            window.authManager?.showLoginModal();
            return;
        }

        const roomType = document.getElementById('roomType')?.value;
        const date = document.getElementById('bookingDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const guests = document.getElementById('guests')?.value;
        const specialRequirements = document.getElementById('specialRequirements')?.value;

        const duration = this.calculateDuration(startTime, endTime);
        const totalCost = this.calculateCost(roomType, duration, parseInt(guests));

        // Check if user has enough credit
        if (window.authManager.userCredit < totalCost) {
            showNotification(
                `Insufficient credit. You need ${totalCost.toFixed(2)} JOD but only have ${window.authManager.userCredit.toFixed(2)} JOD. Please add credit to your account.`, 
                'error'
            );
            return;
        }

        // Create booking object
        const booking = {
            id: Date.now(),
            userId: window.authManager.currentUser.id,
            roomType: roomType,
            date: date,
            startTime: startTime,
            endTime: endTime,
            guests: parseInt(guests),
            duration: duration,
            totalCost: totalCost,
            specialRequirements: specialRequirements,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            bookingNumber: 'BK' + Date.now().toString().slice(-6)
        };

        // Save booking
        await this.saveBooking(booking);

        // Deduct cost from credit
        window.authManager.userCredit -= totalCost;
        await window.authManager.saveToDatabase('userCredit', window.authManager.userCredit);

        // Update UI
        window.authManager.updateAuthUI();

        showNotification(
            `Booking confirmed! ${totalCost.toFixed(2)} JOD deducted from your account. Booking #${booking.bookingNumber}`, 
            'success'
        );

        // Reset form
        this.resetBookingForm();

        // Redirect to profile page after 2 seconds
        setTimeout(() => {
            window.location.href = 'profile.html?tab=bookings';
        }, 2000);
    }

    async saveBooking(booking) {
        let bookings = await window.authManager.loadFromDatabase('bookings') || [];
        bookings.push(booking);
        await window.authManager.saveToDatabase('bookings', bookings);
        
        // Also save to user's booking history
        let userBookings = await window.authManager.loadFromDatabase('userBookings') || [];
        userBookings.push(booking);
        await window.authManager.saveToDatabase('userBookings', userBookings);
    }

    resetBookingForm() {
        const form = document.getElementById('bookingForm');
        if (form) form.reset();
        
        this.toggleConfirmButton(false);
        this.updateBookingSummary();
        
        // Reset to default values
        const now = new Date();
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            if (now.getHours() >= 22) {
                now.setDate(now.getDate() + 1);
            }
            dateInput.value = now.toISOString().split('T')[0];
        }
        
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        if (startTimeInput && endTimeInput) {
            let startHour = now.getHours() + 1;
            if (startHour > 23) startHour = 9;
            
            startTimeInput.value = `${startHour.toString().padStart(2, '0')}:00`;
            endTimeInput.value = `${(startHour + 2).toString().padStart(2, '0')}:00`;
        }
    }

    async loadRoomAvailability() {
        // This would typically load from an API
        // For now, we'll simulate some data
        const availability = {
            'social': true,
            'solo': true,
            'meeting-small': true,
            'meeting-medium': true,
            'meeting-large': false, // Simulate one room being unavailable
            'class': true
        };

        this.updateRoomAvailabilityUI(availability);
    }

    updateRoomAvailabilityUI(availability) {
        // Update room options based on availability
        const roomSelect = document.getElementById('roomType');
        if (roomSelect) {
            Array.from(roomSelect.options).forEach(option => {
                if (option.value && availability[option.value] === false) {
                    option.disabled = true;
                    option.textContent += ' (Unavailable)';
                }
            });
        }
    }
}

// Initialize booking manager
document.addEventListener('DOMContentLoaded', function() {
    window.bookingManager = new BookingManager();
});