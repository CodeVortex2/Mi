// Profile management for GastroGlobe
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.recipes = [];
        this.init();
    }

    async init() {
        await this.waitForAuth();
        await this.loadRecipes();
        this.setupEventListeners();
        this.updateProfileUI();
        this.loadCurrentTab();
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.authManager && window.authManager.isInitialized) {
                    this.currentUser = window.authManager.getCurrentUser();
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    async loadRecipes() {
        try {
            const response = await fetch('../data/recipes.json');
            this.recipes = await response.json();
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.recipes = this.getFallbackRecipes();
        }
    }

    getFallbackRecipes() {
        return [
            {
                id: 1,
                name: "Ratatouille",
                country: "France",
                category: "vegan",
                image: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "Un plat traditionnel provençal à base de légumes d'été.",
                time: "45 min",
                difficulty: "moyen",
                rating: 4.7
            },
            {
                id: 2,
                name: "Sushi Variés",
                country: "Japon",
                category: "poisson",
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                description: "Assortiment de sushis traditionnels japonais.",
                time: "60 min",
                difficulty: "difficile",
                rating: 4.8
            }
        ];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });

        // Guest actions
        document.getElementById('guestLoginBtn')?.addEventListener('click', () => {
            window.authManager.showLoginModal();
        });

        document.getElementById('guestRegisterBtn')?.addEventListener('click', () => {
            window.authManager.showRegisterModal();
        });

        // Edit profile
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        // Favorites search and filter
        document.getElementById('favoritesSearch')?.addEventListener('input', (e) => {
            this.filterFavorites(e.target.value);
        });

        document.getElementById('favoritesFilter')?.addEventListener('change', (e) => {
            this.filterFavoritesByCategory(e.target.value);
        });

        // History filter and clear
        document.getElementById('historyTypeFilter')?.addEventListener('change', (e) => {
            this.filterHistory(e.target.value);
        });

        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            this.clearHistory();
        });

        // Settings form
        document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
            this.handleSettingsSave(e);
        });

        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettingsForm();
        });

        // Edit profile modal
        document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
            this.handleEditProfile(e);
        });

        // Auth change listener
        window.addEventListener('authChange', (e) => {
            this.currentUser = e.detail.user;
            this.updateProfileUI();
            this.loadCurrentTab();
        });

        // Avatar selection in modals
        this.setupAvatarSelection();
    }

    setupAvatarSelection() {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', function() {
                const container = this.closest('.avatar-options');
                container.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
    }

    updateProfileUI() {
        const guestSection = document.getElementById('profileGuest');
        const authSection = document.getElementById('profileAuthenticated');

        if (this.currentUser) {
            DOMUtils.show(authSection);
            DOMUtils.hide(guestSection);
            this.updateUserInfo();
        } else {
            DOMUtils.show(guestSection);
            DOMUtils.hide(authSection);
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        // Update header
        document.getElementById('userAvatarLarge').textContent = this.currentUser.avatar;
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;

        // Update stats
        const favoritesCount = this.currentUser.favorites ? this.currentUser.favorites.length : 0;
        const quizScore = this.currentUser.quizScore || 0;
        const memberSince = this.currentUser.memberSince ? 
            new Date(this.currentUser.memberSince).getFullYear() : '-';

        document.getElementById('favoritesCount').textContent = favoritesCount;
        document.getElementById('quizScore').textContent = quizScore;
        document.getElementById('memberSince').textContent = memberSince;

        // Update nav badges
        document.getElementById('favoritesBadge').textContent = favoritesCount;
        
        const unlockedBadges = this.calculateUnlockedBadges();
        document.getElementById('badgesCount').textContent = unlockedBadges;
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    loadCurrentTab() {
        const activeTab = document.querySelector('.nav-item.active');
        if (activeTab) {
            this.loadTabContent(activeTab.getAttribute('data-tab'));
        }
    }

    loadTabContent(tabName) {
        switch(tabName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'favorites':
                this.loadFavorites();
                break;
            case 'history':
                this.loadHistory();
                break;
            case 'achievements':
                this.loadAchievements();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadOverview() {
        if (!this.currentUser) return;

        // Update overview stats
        const favoritesCount = this.currentUser.favorites ? this.currentUser.favorites.length : 0;
        const quizScore = this.currentUser.quizScore || 0;
        const completedQuizzes = this.currentUser.history ? 
            this.currentUser.history.filter(item => item.type === 'quiz_completed').length : 0;
        const viewedRecipes = this.currentUser.history ?
            this.currentUser.history.filter(item => item.type === 'recipe_view').length : 0;

        document.getElementById('overviewScore').textContent = quizScore;
        document.getElementById('overviewFavorites').textContent = favoritesCount;
        document.getElementById('overviewQuizzes').textContent = completedQuizzes;
        document.getElementById('overviewRecipes').textContent = viewedRecipes;

        // Calculate level progress (simplified)
        const level = Math.floor(quizScore / 100) + 1;
        const levelProgress = (quizScore % 100);
        document.getElementById('scoreProgress').style.width = `${levelProgress}%`;
        document.querySelector('.progress-text').textContent = `Niveau ${level}`;

        // Load recent activity
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container || !this.currentUser || !this.currentUser.history) return;

        const recentActivities = this.currentUser.history.slice(0, 5);
        
        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Aucune activité récente</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentActivities.map(activity => {
            const icon = this.getActivityIcon(activity.type);
            const text = this.getActivityText(activity);
            const time = DateUtils.formatRelativeTime(activity.date);

            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${text}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'recipe_view': 'fas fa-utensils',
            'quiz_completed': 'fas fa-trophy',
            'favorite_added': 'fas fa-heart'
        };
        return icons[type] || 'fas fa-circle';
    }

    getActivityText(activity) {
        switch(activity.type) {
            case 'recipe_view':
                const recipe = this.recipes.find(r => r.id === activity.itemId);
                return `Vous avez consulté la recette "${recipe?.name || 'Inconnue'}"`;
            case 'quiz_completed':
                return `Quiz complété - Score: ${activity.score} points`;
            case 'favorite_added':
                const favRecipe = this.recipes.find(r => r.id === activity.itemId);
                return `Recette ajoutée aux favoris: "${favRecipe?.name || 'Inconnue'}"`;
            default:
                return 'Activité inconnue';
        }
    }

    loadFavorites() {
        const container = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyFavorites');

        if (!this.currentUser || !this.currentUser.favorites || this.currentUser.favorites.length === 0) {
            DOMUtils.show(emptyState);
            DOMUtils.hide(container);
            return;
        }

        DOMUtils.hide(emptyState);
        DOMUtils.show(container);

        const favoriteRecipes = this.recipes.filter(recipe => 
            this.currentUser.favorites.includes(recipe.id)
        );

        container.innerHTML = favoriteRecipes.map(recipe => `
            <div class="favorite-item" data-category="${recipe.category}">
                <img src="${recipe.image}" alt="${recipe.name}" class="favorite-image">
                <div class="favorite-content">
                    <h3 class="favorite-title">${recipe.name}</h3>
                    <div class="favorite-meta">
                        <span>${recipe.country}</span>
                        <span>${recipe.time}</span>
                    </div>
                    <div class="favorite-actions">
                        <button class="btn btn-primary btn-sm view-recipe" data-id="${recipe.id}">
                            Voir la recette
                        </button>
                        <button class="btn btn-outline btn-sm remove-favorite" data-id="${recipe.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.view-recipe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.viewRecipe(recipeId);
            });
        });

        container.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.removeFavorite(recipeId);
            });
        });
    }

    filterFavorites(searchTerm) {
        const items = document.querySelectorAll('.favorite-item');
        const lowerSearch = searchTerm.toLowerCase();

        items.forEach(item => {
            const title = item.querySelector('.favorite-title').textContent.toLowerCase();
            const country = item.querySelector('.favorite-meta span:first-child').textContent.toLowerCase();
            
            if (title.includes(lowerSearch) || country.includes(lowerSearch)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    filterFavoritesByCategory(category) {
        const items = document.querySelectorAll('.favorite-item');
        
        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    removeFavorite(recipeId) {
        if (!this.currentUser) return;

        if (window.authManager.toggleFavorite(recipeId)) {
            showToast('Recette retirée des favoris', 'success');
            this.loadFavorites();
            this.updateUserInfo();
            this.loadOverview();
        }
    }

    viewRecipe(recipeId) {
        window.location.href = `recette-detail.html?id=${recipeId}`;
    }

    loadHistory() {
        const container = document.getElementById('historyTimeline');
        const emptyState = document.getElementById('emptyHistory');

        if (!this.currentUser || !this.currentUser.history || this.currentUser.history.length === 0) {
            DOMUtils.show(emptyState);
            DOMUtils.hide(container);
            return;
        }

        DOMUtils.hide(emptyState);
        DOMUtils.show(container);

        container.innerHTML = this.currentUser.history.map(activity => {
            const icon = this.getActivityIcon(activity.type);
            const text = this.getActivityText(activity);
            const time = DateUtils.formatRelativeTime(activity.date);

            return `
                <div class="timeline-item" data-type="${activity.type}">
                    <div class="timeline-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-text">${text}</div>
                        <div class="timeline-meta">
                            <span>${time}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterHistory(type) {
        const items = document.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            const itemType = item.getAttribute('data-type');
            
            if (type === 'all' || itemType === type) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    clearHistory() {
        if (!this.currentUser) return;

        if (confirm('Êtes-vous sûr de vouloir effacer tout votre historique ?')) {
            window.authManager.updateUserProfile({ history: [] });
            showToast('Historique effacé', 'success');
            this.loadHistory();
            this.loadOverview();
        }
    }

    loadAchievements() {
        const container = document.getElementById('achievementsGrid');
        const unlockedCount = this.calculateUnlockedBadges();
        const totalBadges = 12; // Total number of available badges
        const completionRate = Math.round((unlockedCount / totalBadges) * 100);

        // Update stats
        document.getElementById('unlockedBadges').textContent = unlockedCount;
        document.getElementById('totalBadges').textContent = totalBadges;
        document.getElementById('completionRate').textContent = `${completionRate}%`;

        // Load badges
        const badges = this.getAchievementBadges();
        container.innerHTML = badges.map(badge => `
            <div class="achievement-card ${badge.unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">
                    <i class="${badge.icon}"></i>
                </div>
                <h4 class="achievement-title">${badge.title}</h4>
                <p class="achievement-desc">${badge.description}</p>
                <div class="achievement-progress">${badge.unlocked ? 'Débloqué' : 'Verrouillé'}</div>
            </div>
        `).join('');
    }

    calculateUnlockedBadges() {
        if (!this.currentUser) return 0;

        let unlocked = 0;
        const badges = this.getAchievementBadges();
        
        badges.forEach(badge => {
            if (badge.unlocked) unlocked++;
        });

        return unlocked;
    }

    getAchievementBadges() {
        if (!this.currentUser) return [];

        const user = this.currentUser;
        const favoritesCount = user.favorites ? user.favorites.length : 0;
        const quizScore = user.quizScore || 0;
        const completedQuizzes = user.history ? 
            user.history.filter(item => item.type === 'quiz_completed').length : 0;

        return [
            {
                title: "Premiers Pas",
                description: "Complétez votre premier quiz",
                icon: "fas fa-star",
                unlocked: completedQuizzes >= 1
            },
            {
                title: "Gourmet",
                description: "Ajoutez 5 recettes aux favoris",
                icon: "fas fa-heart",
                unlocked: favoritesCount >= 5
            },
            {
                title: "Expert Quiz",
                description: "Atteignez 100 points au quiz",
                icon: "fas fa-trophy",
                unlocked: quizScore >= 100
            },
            {
                title: "Voyageur Culinaire",
                description: "Consultez 10 recettes différentes",
                icon: "fas fa-passport",
                unlocked: user.history && user.history.filter(item => item.type === 'recipe_view').length >= 10
            },
            {
                title: "Collectionneur",
                description: "10 recettes favorites",
                icon: "fas fa-bookmark",
                unlocked: favoritesCount >= 10
            },
            {
                title: "Maître Quiz",
                description: "Atteignez 500 points au quiz",
                icon: "fas fa-crown",
                unlocked: quizScore >= 500
            }
        ];
    }

    loadSettings() {
        if (!this.currentUser) return;

        const settings = this.currentUser.settings || {};

        // Populate form
        document.getElementById('settingsName').value = this.currentUser.name;
        document.getElementById('settingsEmail').value = this.currentUser.email;
        document.getElementById('settingsLanguage').value = settings.language || 'fr';
        document.getElementById('settingsNotifications').checked = settings.notifications !== false;
        document.getElementById('settingsNewsletter').checked = settings.newsletter !== false;

        // Set current avatar
        document.querySelectorAll('#settingsForm .avatar-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-avatar') === this.currentUser.avatar) {
                option.classList.add('selected');
            }
        });
    }

    async handleSettingsSave(e) {
        e.preventDefault();
        
        if (!this.currentUser) return;

        const formData = new FormData(e.target);
        const selectedAvatar = e.target.querySelector('.avatar-option.selected')?.getAttribute('data-avatar') || this.currentUser.avatar;

        const updates = {
            name: document.getElementById('settingsName').value,
            email: document.getElementById('settingsEmail').value,
            avatar: selectedAvatar,
            settings: {
                language: document.getElementById('settingsLanguage').value,
                notifications: document.getElementById('settingsNotifications').checked,
                newsletter: document.getElementById('settingsNewsletter').checked
            }
        };

        // Handle password change if provided
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                showToast('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            if (!currentPassword) {
                showToast('Veuillez entrer votre mot de passe actuel', 'error');
                return;
            }
            if (currentPassword !== this.currentUser.password) {
                showToast('Mot de passe actuel incorrect', 'error');
                return;
            }
            updates.password = newPassword;
        }

        try {
            await ApiSimulator.simulateRequest(1000);
            
            if (window.authManager.updateUserProfile(updates)) {
                showToast('Paramètres sauvegardés avec succès', 'success');
                this.updateUserInfo();
                this.loadSettings(); // Reload form with updated data
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    resetSettingsForm() {
        this.loadSettings();
        showToast('Formulaire réinitialisé', 'info');
    }

    showEditProfileModal() {
        if (!this.currentUser) return;

        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editEmail').value = this.currentUser.email;

        // Set current avatar
        document.querySelectorAll('#editProfileForm .avatar-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-avatar') === this.currentUser.avatar) {
                option.classList.add('selected');
            }
        });

        document.getElementById('editProfileModal').style.display = 'flex';
    }

    async handleEditProfile(e) {
        e.preventDefault();
        
        if (!this.currentUser) return;

        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const currentPassword = document.getElementById('editCurrentPassword').value;
        const selectedAvatar = e.target.querySelector('.avatar-option.selected')?.getAttribute('data-avatar') || this.currentUser.avatar;

        // Validation
        if (currentPassword !== this.currentUser.password) {
            showToast('Mot de passe actuel incorrect', 'error');
            return;
        }

        if (!FormValidator.validateName(name)) {
            showToast('Le nom doit contenir entre 2 et 50 caractères', 'error');
            return;
        }

        if (!FormValidator.validateEmail(email)) {
            showToast('Email invalide', 'error');
            return;
        }

        // Check if email is already used by another user
        if (email !== this.currentUser.email) {
            const emailExists = window.authManager.users.some(user => 
                user.email === email && user.id !== this.currentUser.id
            );
            if (emailExists) {
                showToast('Un compte avec cet email existe déjà', 'error');
                return;
            }
        }

        try {
            await ApiSimulator.simulateRequest(1000);
            
            const updates = {
                name: name,
                email: email,
                avatar: selectedAvatar
            };

            if (window.authManager.updateUserProfile(updates)) {
                showToast('Profil mis à jour avec succès', 'success');
                document.getElementById('editProfileModal').style.display = 'none';
                this.updateUserInfo();
                this.loadSettings();
            }
        } catch (error) {
            showToast('Erreur lors de la mise à jour du profil', 'error');
        }
    }
}

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileGuest') || document.getElementById('profileAuthenticated')) {
        window.profileManager = new ProfileManager();
    }
});