// Admin Dashboard functionality
class AdminManager {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.initializeNavigation();
        this.loadDashboardData();
        this.initializeModals();
        this.initializeDataTables();
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href')?.substring(1);
                
                if (target) {
                    this.switchView(target);
                }
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[href="#${view}"]`)?.classList.add('active');
        
        // Load view-specific data
        this.loadViewData(view);
    }

    async loadDashboardData() {
        // Load overall statistics
        const stats = await this.calculateStatistics();
        this.updateDashboardStats(stats);
        
        // Load recent activity
        const activity = await this.getRecentActivity();
        this.updateRecentActivity(activity);
        
        // Load charts
        this.loadCharts();
    }

    async calculateStatistics() {
        const bookings = await this.loadFromDatabase('bookings') || [];
        const users = await this.loadFromDatabase('users') || [];
        const printingOrders = await this.loadFromDatabase('printingOrders') || [];
        const courses = await this.loadFromDatabase('courseEnrollments') || [];

        const today = new Date().toDateString();
        const thisWeek = this.getWeekRange();
        const thisMonth = new Date().getMonth();

        return {
            totalUsers: users.length,
            activeBookings: bookings.filter(b => b.status === 'confirmed').length,
            monthlyRevenue: this.calculateMonthlyRevenue(bookings),
            courseEnrollments: courses.length,
            newUsersToday: users.filter(u => new Date(u.createdAt).toDateString() === today).length,
            bookingsToday: bookings.filter(b => new Date(b.date).toDateString() === today).length,
            printingOrdersToday: printingOrders.filter(p => new Date(p.createdAt).toDateString() === today).length
        };
    }

    calculateMonthlyRevenue(bookings) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return bookings
            .filter(b => {
                const bookingDate = new Date(b.date);
                return bookingDate.getMonth() === currentMonth && 
                       bookingDate.getFullYear() === currentYear;
            })
            .reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
    }

    getWeekRange() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { start: startOfWeek, end: today };
    }

    updateDashboardStats(stats) {
        // Update stat cards
        this.updateStatCard('stat-users', stats.totalUsers);
        this.updateStatCard('stat-bookings', stats.activeBookings);
        this.updateStatCard('stat-revenue', stats.monthlyRevenue);
        this.updateStatCard('stat-courses', stats.courseEnrollments);
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Check if it's a currency value
            if (elementId === 'stat-revenue') {
                element.textContent = formatCurrency(value);
            } else {
                element.textContent = value.toLocaleString();
            }
        }
    }

    async getRecentActivity() {
        const bookings = await this.loadFromDatabase('bookings') || [];
        const printingOrders = await this.loadFromDatabase('printingOrders') || [];
        const courses = await this.loadFromDatabase('courseEnrollments') || [];

        // Combine and sort by date
        const allActivity = [
            ...bookings.map(b => ({ ...b, type: 'booking' })),
            ...printingOrders.map(p => ({ ...p, type: 'printing' })),
            ...courses.map(c => ({ ...c, type: 'course' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return allActivity.slice(0, 10); // Return last 10 activities
    }

    updateRecentActivity(activities) {
        const container = document.querySelector('.activity-list');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.getActivityTitle(activity)}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.createdAt)}</div>
                </div>
                <div class="activity-amount">
                    ${activity.type === 'booking' ? formatCurrency(activity.totalCost) : 
                      activity.type === 'printing' ? formatCurrency(activity.cost) : 
                      formatCurrency(activity.cost)}
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'booking': 'fas fa-calendar-check',
            'printing': 'fas fa-print',
            'course': 'fas fa-graduation-cap'
        };
        return icons[type] || 'fas fa-circle';
    }

    getActivityTitle(activity) {
        switch (activity.type) {
            case 'booking':
                return `Room booking - ${this.formatRoomType(activity.roomType)}`;
            case 'printing':
                return `Printing order - ${activity.files?.length || 0} files`;
            case 'course':
                return `Course enrollment - ${activity.course || 'Unknown'}`;
            default:
                return 'Unknown activity';
        }
    }

    formatRoomType(roomType) {
        const types = {
            'social': 'Social Area',
            'solo': 'Solo Room',
            'meeting-small': 'Small Meeting Room',
            'meeting-medium': 'Medium Meeting Room',
            'meeting-large': 'Large Meeting Room',
            'class': 'Class Room'
        };
        return types[roomType] || roomType;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    loadCharts() {
        // This would initialize charts using a library like Chart.js
        // For now, we'll just show placeholders
        console.log('Loading charts...');
    }

    initializeModals() {
        // Initialize admin modals for adding/editing data
        this.initializeBookingModal();
        this.initializeUserModal();
        this.initializeCourseModal();
        this.initializeProductModal();
    }

    initializeBookingModal() {
        // Booking modal functionality
    }

    initializeUserModal() {
        // User management modal
    }

    initializeCourseModal() {
        // Course management modal
    }

    initializeProductModal() {
        // Product management modal for cafeteria
    }

    initializeDataTables() {
        // Initialize data tables for bookings, users, etc.
        this.initializeBookingsTable();
        this.initializeUsersTable();
        this.initializeCoursesTable();
    }

    async initializeBookingsTable() {
        const bookings = await this.loadFromDatabase('bookings') || [];
        this.renderBookingsTable(bookings);
    }

    renderBookingsTable(bookings) {
        const table = document.getElementById('bookingsTable');
        if (!table) return;

        // Implementation for bookings table
    }

    async initializeUsersTable() {
        const users = await this.loadFromDatabase('users') || [];
        this.renderUsersTable(users);
    }

    renderUsersTable(users) {
        const table = document.getElementById('usersTable');
        if (!table) return;

        // Implementation for users table
    }

    async initializeCoursesTable() {
        const courses = await this.loadFromDatabase('courseEnrollments') || [];
        this.renderCoursesTable(courses);
    }

    renderCoursesTable(courses) {
        const table = document.getElementById('coursesTable');
        if (!table) return;

        // Implementation for courses table
    }

    // Utility methods
    async loadFromDatabase(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from database:', error);
            return null;
        }
    }

    async saveToDatabase(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            return false;
        }
    }

    // Export functionality
    async exportData(type) {
        let data = [];
        let filename = '';

        switch (type) {
            case 'bookings':
                data = await this.loadFromDatabase('bookings') || [];
                filename = 'bookings_export.json';
                break;
            case 'users':
                data = await this.loadFromDatabase('users') || [];
                filename = 'users_export.json';
                break;
            case 'courses':
                data = await this.loadFromDatabase('courseEnrollments') || [];
                filename = 'courses_export.json';
                break;
            default:
                showNotification('Invalid export type', 'error');
                return;
        }

        this.downloadJSON(data, filename);
        showNotification(`${type} data exported successfully`, 'success');
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Search functionality
    initializeSearch() {
        const searchInput = document.getElementById('adminSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.performSearch(searchInput.value);
            }, 300));
        }
    }

    async performSearch(query) {
        if (!query.trim()) {
            // Reset to current view if search is empty
            this.loadViewData(this.currentView);
            return;
        }

        // Implement search across all data types
        const results = await this.searchAllData(query);
        this.displaySearchResults(results);
    }

    async searchAllData(query) {
        const lowerQuery = query.toLowerCase();
        const [bookings, users, courses, printingOrders] = await Promise.all([
            this.loadFromDatabase('bookings'),
            this.loadFromDatabase('users'),
            this.loadFromDatabase('courseEnrollments'),
            this.loadFromDatabase('printingOrders')
        ]);

        const results = {
            bookings: (bookings || []).filter(b => 
                b.bookingNumber?.toLowerCase().includes(lowerQuery) ||
                b.roomType?.toLowerCase().includes(lowerQuery) ||
                b.status?.toLowerCase().includes(lowerQuery)
            ),
            users: (users || []).filter(u =>
                u.name?.toLowerCase().includes(lowerQuery) ||
                u.email?.toLowerCase().includes(lowerQuery)
            ),
            courses: (courses || []).filter(c =>
                c.course?.toLowerCase().includes(lowerQuery) ||
                c.studentName?.toLowerCase().includes(lowerQuery) ||
                c.studentEmail?.toLowerCase().includes(lowerQuery)
            ),
            printing: (printingOrders || []).filter(p =>
                p.orderNumber?.toLowerCase().includes(lowerQuery) ||
                p.status?.toLowerCase().includes(lowerQuery)
            )
        };

        return results;
    }

    displaySearchResults(results) {
        // Implementation for displaying search results
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    loadViewData(view) {
        switch (view) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'bookings':
                this.initializeBookingsTable();
                break;
            case 'users':
                this.initializeUsersTable();
                break;
            case 'courses':
                this.initializeCoursesTable();
                break;
            case 'finance':
                this.loadFinanceData();
                break;
            case 'inventory':
                this.loadInventoryData();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadFinanceData() {
        // Load financial reports and analytics
        const bookings = await this.loadFromDatabase('bookings') || [];
        const printingOrders = await this.loadFromDatabase('printingOrders') || [];
        const courses = await this.loadFromDatabase('courseEnrollments') || [];

        const revenueData = this.calculateRevenueData(bookings, printingOrders, courses);
        this.renderFinanceCharts(revenueData);
    }

    calculateRevenueData(bookings, printingOrders, courses) {
        // Calculate revenue by source and time period
        return {
            totalRevenue: [
                ...bookings.map(b => b.totalCost || 0),
                ...printingOrders.map(p => p.cost || 0),
                ...courses.map(c => c.cost || 0)
            ].reduce((a, b) => a + b, 0),
            bySource: {
                bookings: bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
                printing: printingOrders.reduce((sum, p) => sum + (p.cost || 0), 0),
                courses: courses.reduce((sum, c) => sum + (c.cost || 0), 0)
            },
            monthlyTrend: this.calculateMonthlyTrend(bookings, printingOrders, courses)
        };
    }

    calculateMonthlyTrend(bookings, printingOrders, courses) {
        // Calculate monthly revenue trend
        const monthlyData = {};
        
        [...bookings, ...printingOrders, ...courses].forEach(item => {
            const date = new Date(item.createdAt || item.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const amount = item.totalCost || item.cost || 0;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }
            monthlyData[monthYear] += amount;
        });

        return monthlyData;
    }

    renderFinanceCharts(revenueData) {
        // Render finance charts
    }

    async loadInventoryData() {
        // Load cafeteria inventory data
        const inventory = await this.loadFromDatabase('cafeteriaInventory') || [];
        this.renderInventoryTable(inventory);
    }

    renderInventoryTable(inventory) {
        // Render inventory table
    }

    loadSettings() {
        // Load admin settings
    }
}

// Initialize admin manager
document.addEventListener('DOMContentLoaded', function() {
    window.adminManager = new AdminManager();
});