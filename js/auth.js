// Gestionnaire d'authentification
class AuthManager {
    static users = [];
    static currentUser = null;

    static init() {
        // Charger les utilisateurs depuis le localStorage
        const savedUsers = localStorage.getItem('gastroglobe-users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }

        // Charger l'utilisateur actuel
        const savedCurrentUser = localStorage.getItem('gastroglobe-current-user');
        if (savedCurrentUser) {
            this.currentUser = JSON.parse(savedCurrentUser);
        }

        this.setupAuthEventListeners();
    }

    static setupAuthEventListeners() {
        // Modals
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const closeModals = document.querySelectorAll('.close-modal');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        const logoutBtn = document.getElementById('logoutBtn');

        // Boutons d'ouverture des modals
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showRegisterModal());

        // Fermeture des modals
        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.style.display = 'none';
                registerModal.style.display = 'none';
            });
        });

        // Navigation entre modals
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.style.display = 'none';
                registerModal.style.display = 'flex';
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.style.display = 'none';
                loginModal.style.display = 'flex';
            });
        }

        // Déconnexion
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Formulaires
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Sélection d'avatar
        this.setupAvatarSelection();
    }

    static setupAvatarSelection() {
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    static showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
    }

    static showRegisterModal() {
        document.getElementById('registerModal').style.display = 'flex';
    }

    static handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('gastroglobe-current-user', JSON.stringify(user));
            
            document.getElementById('loginModal').style.display = 'none';
            showToast('Connexion réussie ! Bienvenue sur GastroGlobe.');
            
            // Mettre à jour l'UI
            if (window.app) {
                window.app.updateUI();
            }
        } else {
            showToast('Email ou mot de passe incorrect.', 'error');
        }
    }

    static handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected')?.getAttribute('data-avatar') || '👨‍🍳';

        // Validation
        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Le mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            showToast('Un compte avec cet email existe déjà.', 'error');
            return;
        }

        // Créer un nouvel utilisateur
        const newUser = {
            id: this.users.length + 1,
            name: name,
            email: email,
            password: password,
            avatar: selectedAvatar,
            memberSince: new Date().toISOString().split('T')[0],
            favorites: [],
            quizScore: 0,
            history: [],
            settings: {
                language: "fr",
                notifications: true
            }
        };

        this.users.push(newUser);
        this.currentUser = newUser;

        localStorage.setItem('gastroglobe-users', JSON.stringify(this.users));
        localStorage.setItem('gastroglobe-current-user', JSON.stringify(newUser));

        document.getElementById('registerModal').style.display = 'none';
        showToast('Inscription réussie ! Bienvenue sur GastroGlobe.');

        // Mettre à jour l'UI
        if (window.app) {
            window.app.updateUI();
        }
    }

    static logout() {
        this.currentUser = null;
        localStorage.removeItem('gastroglobe-current-user');
        showToast('Vous avez été déconnecté avec succès.');
        
        // Mettre à jour l'UI
        if (window.app) {
            window.app.updateUI();
        }
    }

    static getCurrentUser() {
        return this.currentUser;
    }

    static toggleUserFavorite(recipeId) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        const favoriteIndex = this.users[userIndex].favorites.indexOf(recipeId);
        
        if (favoriteIndex > -1) {
            // Retirer des favoris
            this.users[userIndex].favorites.splice(favoriteIndex, 1);
        } else {
            // Ajouter aux favoris
            this.users[userIndex].favorites.push(recipeId);
        }

        // Mettre à jour l'utilisateur actuel
        this.currentUser = this.users[userIndex];
        
        // Sauvegarder
        localStorage.setItem('gastroglobe-users', JSON.stringify(this.users));
        localStorage.setItem('gastroglobe-current-user', JSON.stringify(this.currentUser));
    }

    static updateUserQuizScore(score) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        this.users[userIndex].quizScore += score;
        this.currentUser = this.users[userIndex];

        localStorage.setItem('gastroglobe-users', JSON.stringify(this.users));
        localStorage.setItem('gastroglobe-current-user', JSON.stringify(this.currentUser));
    }
}

// Initialiser l'authentification
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});