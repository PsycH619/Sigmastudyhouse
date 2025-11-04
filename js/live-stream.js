// Live streaming functionality
class LiveStreamManager {
    constructor() {
        this.currentStream = null;
        this.chatMessages = [];
        this.isStreamActive = false;
        this.init();
    }

    init() {
        this.initializeStreamPlayer();
        this.initializeChat();
        this.initializeMaterials();
        this.checkStreamStatus();
    }

    initializeStreamPlayer() {
        // Check URL parameters for specific course
        const urlParams = new URLSearchParams(window.location.search);
        const course = urlParams.get('course');
        
        if (course) {
            this.loadCourseStream(course);
        }

        // Simulate stream status updates
        this.simulateStreamUpdates();
    }

    loadCourseStream(course) {
        const streamInfo = document.getElementById('streamInfo');
        if (!streamInfo) return;

        const courses = {
            'cybersecurity': {
                title: 'Fundamentals of Cybersecurity',
                trainer: 'Oday Jadallah',
                schedule: 'Starts in 15 minutes',
                description: 'Live session covering cybersecurity basics and personal information security.'
            },
            'medical': {
                title: 'Medical Preparation Course',
                trainer: 'Dr. Rashid Halabiya',
                schedule: 'Starts in 30 minutes',
                description: 'Comprehensive medical course session with Q&A.'
            }
        };

        const courseInfo = courses[course] || {
            title: 'Live Learning Session',
            trainer: 'Expert Trainer',
            schedule: 'Starting soon',
            description: 'Join our interactive live learning session.'
        };

        streamInfo.innerHTML = `
            <div style="background: var(--light); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: var(--primary); margin-bottom: 10px;">${courseInfo.title}</h3>
                <p style="margin-bottom: 8px;"><strong>Trainer:</strong> ${courseInfo.trainer}</p>
                <p style="margin-bottom: 8px;"><strong>Schedule:</strong> ${courseInfo.schedule}</p>
                <p style="color: var(--text-light);">${courseInfo.description}</p>
            </div>
        `;

        this.currentStream = course;
    }

    simulateStreamUpdates() {
        // Simulate stream starting
        setTimeout(() => {
            this.startStream();
        }, 10000); // Stream starts after 10 seconds

        // Simulate chat messages
        this.simulateChatMessages();
    }

    startStream() {
        this.isStreamActive = true;
        
        // Update UI
        const liveIndicator = document.querySelector('.live-indicator');
        const videoPlaceholder = document.querySelector('.video-placeholder');
        
        if (liveIndicator) {
            liveIndicator.innerHTML = '<i class="fas fa-circle"></i> LIVE NOW';
        }
        
        if (videoPlaceholder) {
            videoPlaceholder.innerHTML = `
                <div style="text-align: center; color: white;">
                    <i class="fas fa-broadcast-tower floating-element" style="font-size: 4rem; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">Live Stream in Progress</h3>
                    <p>${this.currentStream ? this.getCourseTitle(this.currentStream) : 'Professional Training Session'}</p>
                    <div style="margin-top: 20px;">
                        <div class="viewer-count" style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 20px; display: inline-block;">
                            <i class="fas fa-eye"></i> 127 viewers watching
                        </div>
                    </div>
                </div>
            `;
        }

        // Enable chat
        this.enableChat();
        
        showNotification('Live stream has started!', 'success');
    }

    getCourseTitle(course) {
        const titles = {
            'cybersecurity': 'Fundamentals of Cybersecurity',
            'medical': 'Medical Preparation Course'
        };
        return titles[course] || 'Live Training Session';
    }

    initializeChat() {
        const chatForm = document.querySelector('.chat-container form');
        const chatInput = document.querySelector('.chat-container input');
        const chatMessages = document.getElementById('chatMessages');

        if (chatForm && chatInput) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage(chatInput.value);
                chatInput.value = '';
            });
        }

        // Load sample chat messages
        this.loadSampleChat();
    }

    loadSampleChat() {
        const sampleMessages = [
            { user: 'Trainer', message: 'Welcome everyone! We\'ll be starting in a few minutes.', time: '2 min ago', type: 'trainer' },
            { user: 'Ahmed', message: 'Excited for this session!', time: '1 min ago', type: 'student' },
            { user: 'Sarah', message: 'Will the recording be available?', time: '1 min ago', type: 'student' },
            { user: 'Trainer', message: 'Yes, recording will be available for all enrolled students.', time: 'Just now', type: 'trainer' }
        ];

        sampleMessages.forEach(msg => {
            this.addChatMessage(msg.user, msg.message, msg.time, msg.type);
        });
    }

    enableChat() {
        const chatInput = document.querySelector('.chat-container input');
        const sendButton = document.querySelector('.chat-container button');
        
        if (chatInput) chatInput.disabled = false;
        if (sendButton) sendButton.disabled = false;
        
        if (chatInput) {
            chatInput.placeholder = window.languageManager?.translate('Type your message...') || 'Type your message...';
        }
    }

    sendMessage(message) {
        if (!message.trim()) return;

        if (!window.authManager?.currentUser) {
            showNotification('Please sign in to send messages', 'error');
            return;
        }

        const user = window.authManager.currentUser.name;
        const time = 'Just now';
        
        this.addChatMessage(user, message, time, 'student');
        
        // Simulate trainer response
        setTimeout(() => {
            this.simulateTrainerResponse(message);
        }, 2000 + Math.random() * 3000);
    }

    simulateTrainerResponse(userMessage) {
        const responses = [
            "That's a great question!",
            "Thanks for asking that.",
            "I'll cover that in detail shortly.",
            "Good point! Let me explain...",
            "That's exactly what we'll be discussing next."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addChatMessage('Trainer', response, 'Just now', 'trainer');
    }

    addChatMessage(user, message, time, type = 'student') {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.style.cssText = `
            margin-bottom: 15px;
            padding: 12px 15px;
            border-radius: 12px;
            background: ${type === 'trainer' ? 'rgba(255,107,53,0.1)' : 'var(--light)'};
            border-left: 4px solid ${type === 'trainer' ? 'var(--primary)' : 'var(--secondary)'};
        `;

        messageElement.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: flex-start; gap: 10px;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong style="color: ${type === 'trainer' ? 'var(--primary)' : 'var(--text)'};">${user}</strong>
                        <small style="color: var(--text-light); font-size: 0.8rem;">${time}</small>
                    </div>
                    <div style="color: var(--text); line-height: 1.4;">${message}</div>
                </div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to messages array
        this.chatMessages.push({ user, message, time, type });
    }

    simulateChatMessages() {
        if (!this.isStreamActive) return;

        // Simulate occasional chat messages from other students
        setInterval(() => {
            if (this.isStreamActive && Math.random() > 0.7) {
                const students = ['Mohammad', 'Lina', 'Omar', 'Nour', 'Khalid'];
                const messages = [
                    'Great explanation!',
                    'Could you repeat that?',
                    'This is very helpful',
                    'Thanks for the detailed answer',
                    'I have a similar question',
                    'When is the next session?'
                ];
                
                const student = students[Math.floor(Math.random() * students.length)];
                const message = messages[Math.floor(Math.random() * messages.length)];
                
                this.addChatMessage(student, message, 'Just now', 'student');
            }
        }, 10000); // Every 10 seconds
    }

    initializeMaterials() {
        // This would typically load from an API
        const materials = this.getCourseMaterials();
        this.renderMaterials(materials);
    }

    getCourseMaterials() {
        const course = this.currentStream;
        
        const materials = {
            'cybersecurity': [
                { name: 'Cybersecurity Fundamentals Slides', type: 'pdf', size: '2.4 MB', url: '#' },
                { name: 'Security Best Practices Guide', type: 'pdf', size: '1.8 MB', url: '#' },
                { name: 'Practice Exercise Files', type: 'zip', size: '5.2 MB', url: '#' }
            ],
            'medical': [
                { name: 'Medical Terminology Guide', type: 'pdf', size: '3.1 MB', url: '#' },
                { name: 'Anatomy Reference Charts', type: 'pdf', size: '4.5 MB', url: '#' },
                { name: 'Practice Questions Set', type: 'pdf', size: '2.2 MB', url: '#' }
            ]
        };

        return materials[course] || [
            { name: 'Course Materials', type: 'pdf', size: '1.0 MB', url: '#' }
        ];
    }

    renderMaterials(materials) {
        const container = document.querySelector('.material-items');
        if (!container) return;

        container.innerHTML = materials.map(material => `
            <div class="material-item" style="display: flex; justify-content: between; align-items: center; padding: 15px; background: var(--light); border-radius: 8px; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <i class="fas fa-${this.getFileIcon(material.type)}" style="color: var(--primary); font-size: 1.2rem;"></i>
                    <div>
                        <div style="font-weight: 500; color: var(--text);">${material.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">${material.size}</div>
                    </div>
                </div>
                <button class="btn btn-outline" style="padding: 8px 16px;" onclick="this.downloadMaterial('${material.url}')">
                    <i class="fas fa-download"></i>
                    <span>${window.languageManager?.translate('Download') || 'Download'}</span>
                </button>
            </div>
        `).join('');
    }

    getFileIcon(fileType) {
        const icons = {
            'pdf': 'file-pdf',
            'zip': 'file-archive',
            'doc': 'file-word',
            'ppt': 'file-powerpoint'
        };
        return icons[fileType] || 'file';
    }

    downloadMaterial(url) {
        // In a real implementation, this would download the file
        showNotification('Download started...', 'info');
        
        // Simulate download
        setTimeout(() => {
            showNotification('File downloaded successfully', 'success');
        }, 1500);
    }

    checkStreamStatus() {
        // This would typically check with a streaming service API
        // For now, we'll simulate status checks
        setInterval(() => {
            if (this.isStreamActive) {
                this.updateViewerCount();
            }
        }, 30000); // Every 30 seconds
    }

    updateViewerCount() {
        const viewerCount = document.querySelector('.viewer-count');
        if (viewerCount) {
            const currentCount = parseInt(viewerCount.textContent) || 127;
            const newCount = currentCount + Math.floor(Math.random() * 5) - 2; // Random change
            viewerCount.innerHTML = `<i class="fas fa-eye"></i> ${Math.max(100, newCount)} viewers watching`;
        }
    }

    // Quality selector
    initializeQualitySelector() {
        // This would initialize stream quality options
        const qualities = ['Auto', '1080p', '720p', '480p', '360p'];
        // Implementation for quality selector
    }

    // Fullscreen functionality
    initializeFullscreen() {
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            // Add fullscreen button and functionality
        }
    }

    // Recording controls
    initializeRecordingControls() {
        // Controls for pausing, rewinding live stream (if supported)
    }
}

// Initialize live stream manager
document.addEventListener('DOMContentLoaded', function() {
    window.liveStreamManager = new LiveStreamManager();
});