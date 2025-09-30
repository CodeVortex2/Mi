// Utility functions for GastroGlobe

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast');
        if (!this.container) {
            this.createToastContainer();
        }
    }

    createToastContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast';
        this.container.className = 'toast';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success', duration = 4000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, duration);
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-info-circle';
    }
}

// Create global toast instance
window.toastManager = new ToastManager();

// Shorthand function
function showToast(message, type = 'success', duration = 4000) {
    window.toastManager.show(message, type, duration);
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.length >= 2 && name.length <= 50;
    }

    static getPasswordStrength(password) {
        if (password.length === 0) return { strength: 0, label: '' };
        
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/\d/)) strength += 1;
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;

        const labels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
        return { strength, label: labels[strength] };
    }
}

// Local storage utilities
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(`gastroglobe_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`gastroglobe_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(`gastroglobe_${key}`);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static clear() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('gastroglobe_')
            );
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
}

// Date utilities
class DateUtils {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
        
        return this.formatDate(dateString);
    }
}

// DOM utilities
class DOMUtils {
    static show(element) {
        if (element) element.style.display = 'block';
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static toggle(element, force) {
        if (element) {
            if (force !== undefined) {
                element.style.display = force ? 'block' : 'none';
            } else {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        }
    }

    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    static toggleClass(element, className, force) {
        if (element) element.classList.toggle(className, force);
    }

    static createElement(tag, classes = '', content = '') {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (content) element.innerHTML = content;
        return element;
    }
}

// API simulation utilities
class ApiSimulator {
    static async simulateRequest(delay = 1000, shouldFail = false) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldFail) {
                    reject(new Error('Request failed'));
                } else {
                    resolve({ success: true });
                }
            }, delay);
        });
    }

    static async simulateNetworkError() {
        return this.simulateRequest(800, true);
    }
}

// Export utilities to global scope
window.FormValidator = FormValidator;
window.StorageManager = StorageManager;
window.DateUtils = DateUtils;
window.DOMUtils = DOMUtils;
window.ApiSimulator = ApiSimulator;