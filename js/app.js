// Application principale GastroGlobe
class GastroGlobeApp {
    constructor() {
        this.currentUser = null;
        this.recipes = [];
        this.init();
    }

    async init() {
        // Initialiser l'application
        await this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.loadPopularRecipes();
    }

    async loadData() {
        try {
            // Charger les données des recettes
            const response = await fetch('./data/recipes.json');
            this.recipes = await response.json();
            
            // Mettre à jour les compteurs
            this.updateCounters();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    updateCounters() {
        // Mettre à jour les compteurs sur la page d'accueil
        const recipesCount = document.getElementById('recipesCount');
        const countriesCount = document.getElementById('countriesCount');
        const usersCount = document.getElementById('usersCount');

        if (recipesCount) {
            recipesCount.textContent = `${this.recipes.length}+`;
        }

        if (countriesCount) {
            const uniqueCountries = [...new Set(this.recipes.map(recipe => recipe.country))];
            countriesCount.textContent = `${uniqueCountries.length}+`;
        }

        if (usersCount) {
            // Simuler un nombre d'utilisateurs
            usersCount.textContent = '10K+';
        }
    }

    loadPopularRecipes() {
        const grid = document.getElementById('popularRecipesGrid');
        if (!grid) return;

        // Trier par popularité (simulée)
        const popularRecipes = this.recipes
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6);

        grid.innerHTML = popularRecipes.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fas fa-flag"></i> ${recipe.country}</span>
                        <span><i class="fas fa-star"></i> ${recipe.rating || '4.5'}</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="btn btn-primary btn-sm view-recipe" data-id="${recipe.id}">
                            Voir la recette
                        </button>
                        <button class="btn btn-outline btn-sm add-favorite" data-id="${recipe.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Ajouter les événements
        this.addRecipeEventListeners();
    }

    addRecipeEventListeners() {
        // Événements pour les boutons de recette
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.viewRecipe(recipeId);
            });
        });

        document.querySelectorAll('.add-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.toggleFavorite(recipeId);
            });
        });
    }

    viewRecipe(recipeId) {
        // Rediriger vers la page de détail de la recette
        window.location.href = `pages/recette-detail.html?id=${recipeId}`;
    }

    toggleFavorite(recipeId) {
        if (!this.currentUser) {
            showToast('Veuillez vous connecter pour ajouter aux favoris', 'error');
            AuthManager.showLoginModal();
            return;
        }

        const button = document.querySelector(`.add-favorite[data-id="${recipeId}"]`);
        const isFavorite = button.classList.contains('active');

        if (isFavorite) {
            // Retirer des favoris
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-heart"></i>';
            showToast('Recette retirée des favoris');
        } else {
            // Ajouter aux favoris
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i>';
            showToast('Recette ajoutée aux favoris !');
        }

        // Mettre à jour les données utilisateur
        AuthManager.toggleUserFavorite(recipeId);
    }

    setupEventListeners() {
        // Thème sombre/clair
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const icon = themeToggle.querySelector('i');
                if (document.body.classList.contains('dark-mode')) {
                    icon.className = 'fas fa-sun';
                    localStorage.setItem('gastroglobe-theme', 'dark');
                } else {
                    icon.className = 'fas fa-moon';
                    localStorage.setItem('gastroglobe-theme', 'light');
                }
            });
        }

        // Newsletter
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                this.subscribeNewsletter(email);
            });
        }

        // Menu mobile
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                document.querySelector('.main-nav').classList.toggle('active');
            });
        }
    }

    subscribeNewsletter(email) {
        // Simuler l'abonnement à la newsletter
        showToast('Merci pour votre abonnement à notre newsletter !');
        
        // Réinitialiser le formulaire
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.reset();
        }
    }

    updateUI() {
        // Mettre à jour l'interface en fonction de l'état de connexion
        this.currentUser = AuthManager.getCurrentUser();
        
        if (this.currentUser) {
            document.getElementById('userMenu').style.display = 'flex';
            document.getElementById('authButtons').style.display = 'none';
            
            const userAvatarHeader = document.getElementById('userAvatarHeader');
            const userNameHeader = document.getElementById('userNameHeader');
            
            if (userAvatarHeader && userNameHeader) {
                userAvatarHeader.textContent = this.currentUser.avatar;
                userNameHeader.textContent = this.currentUser.name;
            }
        } else {
            document.getElementById('userMenu').style.display = 'none';
            document.getElementById('authButtons').style.display = 'flex';
        }

        // Appliquer le thème sauvegardé
        const savedTheme = localStorage.getItem('gastroglobe-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.querySelector('i').className = 'fas fa-sun';
            }
        }
    }
}

// Fonction utilitaire pour afficher les notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GastroGlobeApp();
});