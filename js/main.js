// Main application functionality
class SigmaStudyHouse {
    constructor() {
        this.init();
    }

    init() {
        this.initializeTheme();
        this.initializeNavigation();
        this.initializeModals();
        this.initializeVideoCarousel();
        this.initializeAnimations();
        this.initializeNotifications();
    }

    // Theme functionality
    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');
        
        if (!themeToggle || !themeIcon) return;
        
        // Check for saved theme preference or default to light
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                this.showNotification('Dark mode enabled', 'success');
            } else {
                localStorage.setItem('theme', 'light');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                this.showNotification('Light mode enabled', 'success');
            }
        });
    }

    // Navigation functionality
    initializeNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                // Skip empty or just '#' hrefs
                if (!href || href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Close user dropdown when clicking outside
        document.addEventListener('click', (event) => {
            // Only handle user dropdown, not services dropdown
            // Services dropdown is handled by CSS hover
            if (!event.target.closest('.user-profile')) {
                const dropdown = document.querySelector('.user-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });

        // Mobile menu toggle (if needed)
        this.initializeMobileMenu();
    }

    initializeMobileMenu() {
        // Create mobile menu button
        const header = document.querySelector('header .header-container');
        if (!header) return;

        // Check if mobile menu button already exists
        if (document.querySelector('.mobile-menu-btn')) return;

        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.setAttribute('aria-label', 'Toggle mobile menu');

        // Insert before header controls
        const headerControls = header.querySelector('.header-controls');
        if (headerControls) {
            header.insertBefore(mobileMenuBtn, headerControls);
        }

        // Mobile menu toggle functionality
        const nav = document.querySelector('header nav');

        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('mobile-active');
            mobileMenuBtn.classList.toggle('active');

            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (nav.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });

        // Close mobile menu when clicking nav links
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                if (nav.classList.contains('mobile-active')) {
                    nav.classList.remove('mobile-active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                    mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                    document.body.style.overflow = '';
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && nav.classList.contains('mobile-active')) {
                nav.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }

    // Modal functionality
    initializeModals() {
        // Close modal when clicking close button or outside
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }

    // Video carousel functionality
    initializeVideoCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');
        let currentSlide = 0;

        if (slides.length === 0) return;

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        // Dot click events
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        // Auto-advance slides
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);

        // Touch swipe support
        let startX = 0;
        const carousel = document.querySelector('.carousel-container');
        
        if (carousel) {
            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            carousel.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        showSlide(currentSlide + 1);
                    } else {
                        showSlide(currentSlide - 1);
                    }
                }
            });
        }
    }

    // Animation triggers
    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.service-card, .pricing-card, .course-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Notification system
    initializeNotifications() {
        // Notification container will be created when needed
    }

    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const typeConfig = {
            'success': { icon: 'fas fa-check-circle', color: '#28a745' },
            'error': { icon: 'fas fa-exclamation-circle', color: '#dc3545' },
            'warning': { icon: 'fas fa-exclamation-triangle', color: '#ffc107' },
            'info': { icon: 'fas fa-info-circle', color: '#17a2b8' }
        }[type] || { icon: 'fas fa-info-circle', color: '#6c757d' };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; padding: 16px 20px; 
                       background: ${typeConfig.color}15; border: 1px solid ${typeConfig.color}30; 
                       border-radius: 12px; color: var(--text); backdrop-filter: blur(10px);">
                <i class="${typeConfig.icon}" style="color: ${typeConfig.color}; font-size: 1.2rem;"></i>
                <span style="flex: 1; font-weight: 500;">${message}</span>
                <button class="notification-close" style="background: none; border: none; color: var(--text-light); cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutNotification 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-JO', {
            style: 'currency',
            currency: 'JOD'
        }).format(amount);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-JO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-JO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
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

    // Database helper methods
    async saveToDatabase(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            this.showNotification('Error saving data', 'error');
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.sigmaApp = new SigmaStudyHouse();
});

// Global helper functions
function showNotification(message, type = 'info') {
    if (window.sigmaApp) {
        window.sigmaApp.showNotification(message, type);
    }
}

function formatCurrency(amount) {
    if (window.sigmaApp) {
        return window.sigmaApp.formatCurrency(amount);
    }
    return amount + ' JOD';
}