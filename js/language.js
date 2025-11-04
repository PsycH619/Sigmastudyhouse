// Language management system
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            'en': {
                // Navigation
                'Home': 'Home',
                'About': 'About',
                'Services': 'Services',
                'Courses': 'Courses',
                'Booking': 'Booking',
                'Printing': 'Printing',
                'Cafeteria': 'Cafeteria',
                'Contact': 'Contact',
                
                // Common
                'Book Now': 'Book Now',
                'Learn More': 'Learn More',
                'Enroll Now': 'Enroll Now',
                'Sign In': 'Sign In',
                'Sign Up': 'Sign Up',
                'Logout': 'Logout',
                'Profile': 'Profile',
                'Settings': 'Settings',
                
                // Hero Section
                'Your Ideal Study Environment': 'Your Ideal Study Environment',
                'Sigma Study House provides comfortable, well-equipped spaces for studying, teamwork, and discussions in Amman, Jordan.': 'Sigma Study House provides comfortable, well-equipped spaces for studying, teamwork, and discussions in Amman, Jordan.',
                
                // Sections
                'Discover Sigma Study House': 'Discover Sigma Study House',
                'About Us': 'About Us',
                'Our Services': 'Our Services',
                'Professional Courses': 'Professional Courses',
                'Pricing Plans': 'Pricing Plans',
                
                // Course specific
                'Fundamentals of Cybersecurity': 'Fundamentals of Cybersecurity',
                'Medical Preparation Courses': 'Medical Preparation Courses',
                'Trainer': 'Trainer',
                'Course Plan': 'Course Plan',
                'Live Stream Available': 'Live Stream Available',
                
                // Room Types
                'Social Area': 'Social Area',
                'Solo Rooms': 'Solo Rooms',
                'Meeting Rooms': 'Meeting Rooms',
                'Class Rooms': 'Class Rooms',
                
                // Footer
                'Quick Links': 'Quick Links',
                'Contact Info': 'Contact Info',
                'Open 24/7': 'Open 24/7'
            },
            'ar': {
                // Navigation
                'Home': 'الرئيسية',
                'About': 'من نحن',
                'Services': 'الخدمات',
                'Courses': 'الدورات',
                'Booking': 'الحجز',
                'Printing': 'الطباعة',
                'Cafeteria': 'الكافيتيريا',
                'Contact': 'اتصل بنا',
                
                // Common
                'Book Now': 'احجز الآن',
                'Learn More': 'اعرف المزيد',
                'Enroll Now': 'سجل الآن',
                'Sign In': 'تسجيل الدخول',
                'Sign Up': 'إنشاء حساب',
                'Logout': 'تسجيل الخروج',
                'Profile': 'الملف الشخصي',
                'Settings': 'الإعدادات',
                
                // Hero Section
                'Your Ideal Study Environment': 'بيئتك المثالية للدراسة',
                'Sigma Study House provides comfortable, well-equipped spaces for studying, teamwork, and discussions in Amman, Jordan.': 'سيغما ستادي هاوس توفر مساحات مريحة ومجهزة بشكل كامل للدراسة والعمل الجماعي والمناقشات في عمان، الأردن.',
                
                // Sections
                'Discover Sigma Study House': 'اكتشف سيغما ستادي هاوس',
                'About Us': 'من نحن',
                'Our Services': 'خدماتنا',
                'Professional Courses': 'الدورات المهنية',
                'Pricing Plans': 'باقات الأسعار',
                
                // Course specific
                'Fundamentals of Cybersecurity': 'أساسيات الأمن السيبراني',
                'Medical Preparation Courses': 'دورات التحضير الطبي',
                'Trainer': 'المدرب',
                'Course Plan': 'خطة الدورة',
                'Live Stream Available': 'بث مباشر متاح',
                
                // Room Types
                'Social Area': 'المنطقة الاجتماعية',
                'Solo Rooms': 'غرف فردية',
                'Meeting Rooms': 'غرف الاجتماعات',
                'Class Rooms': 'القاعات الدراسية',
                
                // Footer
                'Quick Links': 'روابط سريعة',
                'Contact Info': 'معلومات الاتصال',
                'Open 24/7': 'مفتوح 24/7'
            }
        };
        
        this.init();
    }

    init() {
        this.initializeToggle();
        this.applyLanguage(this.currentLanguage);
        this.updatePageDirection();
    }

    initializeToggle() {
        const toggle = document.getElementById('languageToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        this.applyLanguage(this.currentLanguage);
        this.updatePageDirection();
        
        // Show notification
        if (window.sigmaApp) {
            const message = this.currentLanguage === 'en' 
                ? 'Language switched to English' 
                : 'تم تغيير اللغة إلى العربية';
            window.sigmaApp.showNotification(message, 'success');
        }
    }

    applyLanguage(lang) {
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const key = element.getAttribute('data-en');
            if (this.translations[lang] && this.translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.placeholder = this.translations[lang][key];
                } else {
                    element.textContent = this.translations[lang][key];
                }
            }
        });

        // Update language toggle
        const toggle = document.getElementById('languageToggle');
        if (toggle) {
            toggle.innerHTML = lang === 'en' 
                ? '<span>EN</span> | <span>AR</span>' 
                : '<span>AR</span> | <span>EN</span>';
        }

        // Update any dynamic content
        this.updateDynamicContent(lang);
    }

    updateDynamicContent(lang) {
        // Update any dynamically generated content here
        // For example, if you have dynamic lists or generated elements
    }

    updatePageDirection() {
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Update CSS variables for RTL if needed
        if (this.currentLanguage === 'ar') {
            document.documentElement.style.setProperty('--text-align', 'right');
            document.documentElement.style.setProperty('--float', 'right');
        } else {
            document.documentElement.style.setProperty('--text-align', 'left');
            document.documentElement.style.setProperty('--float', 'left');
        }
    }

    translate(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize language manager
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
});