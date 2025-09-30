// Authentication system for GastroGlobe
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.loadUsers();
        this.loadCurrentUser();
        this.setupEventListeners();
        this.updateAuthUI();
        this.isInitialized = true;
        
        console.log('AuthManager initialized');
    }


    // Data management
    loadUsers() {
        const savedUsers = StorageManager.get('users', []);
        
        if (savedUsers.length === 0) {
            // Create demo users
            this.users = [
                {
                    id: 1,
                    name: "Jean Dupont",
                    email: "jean@example.com",
                    password: "password123",
                    avatar: "👨‍🍳",
                    memberSince: "2024-01-15",
                    favorites: [1, 3, 5],
                    quizScore: 150,
                    history: [
                        { type: "recipe_view", itemId: 1, date: "2024-01-20" },
                        { type: "quiz_completed", score: 50, date: "2024-01-22" },
                        { type: "recipe_view", itemId: 3, date: "2024-01-25" },
                        { type: "quiz_completed", score: 100, date: "2024-02-01" }
                    ],
                    settings: {
                        language: "fr",
                        notifications: true,
                        theme: "light"
                    }
                },
                {
                    id: 2,
                    name: "Marie Martin",
                    email: "marie@example.com",
                    password: "password123",
                    avatar: "👩‍🍳",
                    memberSince: "2024-02-01",
                    favorites: [2, 4],
                    quizScore: 75,
                    history: [
                        { type: "recipe_view", itemId: 2, date: "2024-02-02" },
                        { type: "quiz_completed", score: 75, date: "2024-02-03" }
                    ],
                    settings: {
                        language: "fr",
                        notifications: false,
                        theme: "dark"
                    }
                }
            ];
            this.saveUsers();
        } else {
            this.users = savedUsers;
        }
    }

    loadCurrentUser() {
        const savedUser = StorageManager.get('current_user');
        if (savedUser) {
            this.currentUser = savedUser;
            console.log('User loaded from storage:', savedUser.name);
        }
    }

    saveUsers() {
        StorageManager.set('users', this.users);
    }

    saveCurrentUser() {
        if (this.currentUser) {
            StorageManager.set('current_user', this.currentUser);
        } else {
            StorageManager.remove('current_user');
        }
    }

    // Event listeners
    setupEventListeners() {
        // Modal triggers
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showRegisterModal());
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Modal switches
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Avatar selection
        this.setupAvatarSelection();

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Password strength indicator
        this.setupPasswordStrength();
    }

    setupAvatarSelection() {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                // Add selected class to clicked option
                option.classList.add('selected');
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    updatePasswordStrength(password) {
        const strength = FormValidator.getPasswordStrength(password);
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
            if (strength.strength > 0) {
                strengthBar.classList.add(`strength-${['weak', 'medium', 'strong', 'strong'][strength.strength - 1]}`);
            }
        }
        
        if (strengthText) {
            strengthText.textContent = strength.label;
        }
    }

    // Modal management
    showLoginModal() {
        this.closeModals();
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('loginEmail').focus();
    }

    showRegisterModal() {
        this.closeModals();
        document.getElementById('registerModal').style.display = 'flex';
        document.getElementById('registerName').focus();
        
        // Reset avatar selection
        const firstAvatar = document.querySelector('.avatar-option');
        if (firstAvatar) {
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            firstAvatar.classList.add('selected');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset forms
        this.resetForms();
    }

    switchToRegister() {
        document.getElementById('loginModal').style.display = 'none';
        this.showRegisterModal();
    }

    switchToLogin() {
        document.getElementById('registerModal').style.display = 'none';
        this.showLoginModal();
    }

    resetForms() {
        document.querySelectorAll('form').forEach(form => {
            form.reset();
            form.querySelectorAll('.error-message').forEach(error => error.remove());
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
            });
        });
        
        // Reset password strength
        const strengthBar = document.querySelector('.strength-bar');
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
            strengthBar.style.width = '0%';
        }
    }

    // Form handling
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Validation
        if (!this.validateLoginForm(email, password)) return;

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call
            await ApiSimulator.simulateRequest(1000);
            
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.login(user);
                showToast(`Bienvenue ${user.name} !`, 'success');
            } else {
                throw new Error('Identifiants incorrects');
            }
        } catch (error) {
            showToast(error.message, 'error');
            this.markFieldAsError(document.getElementById('loginEmail'));
            this.markFieldAsError(document.getElementById('loginPassword'));
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected')?.getAttribute('data-avatar') || '👨‍🍳';
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Validation
        if (!this.validateRegisterForm(name, email, password, confirmPassword)) return;

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call
            await ApiSimulator.simulateRequest(1500);
            
            const user = this.createUser(name, email, password, selectedAvatar);
            this.login(user);
            showToast(`Compte créé avec succès ! Bienvenue ${name}`, 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Validation methods
    validateLoginForm(email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldErrors('loginForm');

        if (!FormValidator.validateEmail(email)) {
            this.markFieldAsError(document.getElementById('loginEmail'), 'Email invalide');
            isValid = false;
        }

        if (!password) {
            this.markFieldAsError(document.getElementById('loginPassword'), 'Mot de passe requis');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(name, email, password, confirmPassword) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldErrors('registerForm');

        if (!FormValidator.validateName(name)) {
            this.markFieldAsError(document.getElementById('registerName'), 'Le nom doit contenir entre 2 et 50 caractères');
            isValid = false;
        }

        if (!FormValidator.validateEmail(email)) {
            this.markFieldAsError(document.getElementById('registerEmail'), 'Email invalide');
            isValid = false;
        } else if (this.userExists(email)) {
            this.markFieldAsError(document.getElementById('registerEmail'), 'Un compte avec cet email existe déjà');
            isValid = false;
        }

        if (!FormValidator.validatePassword(password)) {
            this.markFieldAsError(document.getElementById('registerPassword'), 'Le mot de passe doit contenir au moins 6 caractères');
            isValid = false;
        }

        if (password !== confirmPassword) {
            this.markFieldAsError(document.getElementById('registerConfirmPassword'), 'Les mots de passe ne correspondent pas');
            isValid = false;
        }

        return isValid;
    }

    // User management
    authenticateUser(email, password) {
        return this.users.find(user => 
            user.email === email && user.password === password
        );
    }

    userExists(email) {
        return this.users.some(user => user.email === email);
    }

    createUser(name, email, password, avatar) {
        const newUser = {
            id: Math.max(...this.users.map(u => u.id), 0) + 1,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            avatar: avatar,
            memberSince: new Date().toISOString().split('T')[0],
            favorites: [],
            quizScore: 0,
            history: [],
            settings: {
                language: "fr",
                notifications: true,
                theme: "light"
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return newUser;
    }

    login(user) {
        this.currentUser = user;
        this.saveCurrentUser();
        this.closeModals();
        this.updateAuthUI();
        
        // Dispatch login event
        window.dispatchEvent(new CustomEvent('authChange', { 
            detail: { user: this.currentUser, type: 'login' }
        }));
    }

    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
        this.updateAuthUI();
        showToast('Vous avez été déconnecté avec succès', 'success');
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('authChange', { 
            detail: { user: null, type: 'logout' }
        }));
    }

    // UI updates
    updateAuthUI() {
        const userMenu = document.getElementById('userMenu');
        const authButtons = document.getElementById('authButtons');
        const userAvatarHeader = document.getElementById('userAvatarHeader');
        const userNameHeader = document.getElementById('userNameHeader');

        if (this.currentUser) {
            // User is logged in
            DOMUtils.show(userMenu);
            DOMUtils.hide(authButtons);
            
            if (userAvatarHeader) {
                userAvatarHeader.textContent = this.currentUser.avatar;
            }
            if (userNameHeader) {
                userNameHeader.textContent = this.currentUser.name;
            }
        } else {
            // User is not logged in
            DOMUtils.hide(userMenu);
            DOMUtils.show(authButtons);
        }
    }

    // Utility methods
    markFieldAsError(field, message = '') {
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            
            // Remove existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            if (message) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                formGroup.appendChild(errorElement);
            }
        }
    }

    clearFieldErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                const errorMessage = group.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });
        }
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.classList.remove('btn-loading');
        }
    }

    // Public methods
     getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    showLoginModal() {
        this.closeModals();
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('loginEmail').focus();
    }

    showRegisterModal() {
        this.closeModals();
        document.getElementById('registerModal').style.display = 'flex';
        document.getElementById('registerName').focus();
        
        // Reset avatar selection
        const firstAvatar = document.querySelector('.avatar-option');
        if (firstAvatar) {
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            firstAvatar.classList.add('selected');
        }
    }

    toggleUserFavorite(recipeId) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;
        
        const favoriteIndex = this.users[userIndex].favorites.indexOf(recipeId);
        
        if (favoriteIndex > -1) {
            // Remove from favorites
            this.users[userIndex].favorites.splice(favoriteIndex, 1);
        } else {
            // Add to favorites
            this.users[userIndex].favorites.push(recipeId);
        }
        
        this.currentUser = this.users[userIndex];
        this.saveUsers();
        this.saveCurrentUser();
        
        return true;
    }

    addToHistory(item) {
        if (!this.currentUser) return false;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;
        
        this.users[userIndex].history.unshift({
            ...item,
            date: new Date().toISOString().split('T')[0]
        });
        
        // Keep only last 50 history items
        this.users[userIndex].history = this.users[userIndex].history.slice(0, 50);
        
        this.currentUser = this.users[userIndex];
        this.saveUsers();
        this.saveCurrentUser();
        
        return true;
    }
}

// Créer une instance globale IMMÉDIATEMENT
window.authManager = new AuthManager();

// Pour la compatibilité avec l'ancien code, créer aussi un alias
window.AuthManager = {
    getCurrentUser: () => window.authManager.getCurrentUser(),
    showLoginModal: () => window.authManager.showLoginModal(),
    toggleUserFavorite: (recipeId) => window.authManager.toggleUserFavorite(recipeId),
    addToHistory: (item) => window.authManager.addToHistory(item)
};