// Recipes functionality for GastroGlobe
class RecipesManager {
    constructor() {
        this.recipes = [];
        this.filteredRecipes = [];
        this.currentPage = 1;
        this.recipesPerPage = 9;
        this.currentFilters = {
            search: '',
            country: 'all',
            category: 'all',
            difficulty: 'all',
            time: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadRecipes();
        this.setupEventListeners();
        this.displayRecipes();
        this.updateStats();
    }

    async loadRecipes() {
        try {
            const response = await fetch('../data/recipes.json');
            this.recipes = await response.json();
            this.filteredRecipes = [...this.recipes];
        } catch (error) {
            console.error('Error loading recipes:', error);
            showToast('Erreur lors du chargement des recettes', 'error');
        }
    }

    setupEventListeners() {
        // Search
        document.getElementById('recipeSearch')?.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Filters
        document.getElementById('countryFilter')?.addEventListener('change', (e) => {
            this.currentFilters.country = e.target.value;
            this.applyFilters();
        });

        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('difficultyFilter')?.addEventListener('change', (e) => {
            this.currentFilters.difficulty = e.target.value;
            this.applyFilters();
        });

        document.getElementById('timeFilter')?.addEventListener('change', (e) => {
            this.currentFilters.time = e.target.value;
            this.applyFilters();
        });

        // Reset filters
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreRecipes();
        });
    }

    applyFilters() {
        this.filteredRecipes = this.recipes.filter(recipe => {
            // Search filter
            const searchMatch = !this.currentFilters.search || 
                recipe.name.toLowerCase().includes(this.currentFilters.search) ||
                recipe.description.toLowerCase().includes(this.currentFilters.search) ||
                recipe.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(this.currentFilters.search)
                );

            // Country filter
            const countryMatch = this.currentFilters.country === 'all' || 
                recipe.country.toLowerCase() === this.currentFilters.country;

            // Category filter
            const categoryMatch = this.currentFilters.category === 'all' || 
                recipe.category === this.currentFilters.category;

            // Difficulty filter
            const difficultyMatch = this.currentFilters.difficulty === 'all' || 
                recipe.difficulty === this.currentFilters.difficulty;

            // Time filter
            const timeMatch = this.currentFilters.time === 'all' || 
                this.matchesTimeFilter(recipe.time, this.currentFilters.time);

            return searchMatch && countryMatch && categoryMatch && difficultyMatch && timeMatch;
        });

        this.currentPage = 1;
        this.displayRecipes();
        this.updateStats();
    }

    matchesTimeFilter(recipeTime, timeFilter) {
        const time = parseInt(recipeTime);
        if (isNaN(time)) return false;

        switch (timeFilter) {
            case 'rapide':
                return time < 30;
            case 'moyen':
                return time >= 30 && time <= 60;
            case 'long':
                return time > 60;
            default:
                return true;
        }
    }

    resetFilters() {
        document.getElementById('recipeSearch').value = '';
        document.getElementById('countryFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('difficultyFilter').value = 'all';
        document.getElementById('timeFilter').value = 'all';

        this.currentFilters = {
            search: '',
            country: 'all',
            category: 'all',
            difficulty: 'all',
            time: 'all'
        };

        this.applyFilters();
        showToast('Filtres réinitialisés');
    }

    displayRecipes() {
        const grid = document.getElementById('recipesGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.recipesPerPage;
        const endIndex = startIndex + this.recipesPerPage;
        const recipesToShow = this.filteredRecipes.slice(0, endIndex);

        if (recipesToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Aucune recette trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                    <button class="btn btn-primary" id="resetSearch">Réinitialiser la recherche</button>
                </div>
            `;

            document.getElementById('resetSearch')?.addEventListener('click', () => {
                this.resetFilters();
            });
            return;
        }

        grid.innerHTML = recipesToShow.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                <div class="recipe-content">
                    <div class="recipe-header">
                        <h3 class="recipe-title">${recipe.name}</h3>
                        <span class="recipe-country">${recipe.country}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fas fa-fire"></i> ${recipe.difficulty}</span>
                        <span><i class="fas fa-star"></i> ${recipe.rating || '4.5'}</span>
                    </div>
                    <div class="recipe-tags">
                        <span class="tag tag-${recipe.category}">${recipe.category}</span>
                        <span class="tag tag-difficulty-${recipe.difficulty}">${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="btn btn-primary btn-sm view-recipe" data-id="${recipe.id}">
                            Voir la recette
                        </button>
                        <button class="btn btn-outline btn-sm add-favorite ${this.isFavorite(recipe.id) ? 'active' : ''}" data-id="${recipe.id}">
                            <i class="${this.isFavorite(recipe.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.addRecipeEventListeners();

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= this.filteredRecipes.length ? 'none' : 'block';
        }
    }

    addRecipeEventListeners() {
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.viewRecipe(recipeId);
            });
        });

        document.querySelectorAll('.add-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.toggleFavorite(recipeId, e.target);
            });
        });
    }

    isFavorite(recipeId) {
        const user = AuthManager.getCurrentUser();
        return user && user.favorites && user.favorites.includes(recipeId);
    }

    viewRecipe(recipeId) {
        window.location.href = `recette-detail.html?id=${recipeId}`;
    }

    toggleFavorite(recipeId, button) {
        if (!AuthManager.getCurrentUser()) {
            showToast('Veuillez vous connecter pour ajouter aux favoris', 'error');
            AuthManager.showLoginModal();
            return;
        }

        const isFavorite = this.isFavorite(recipeId);
        
        if (isFavorite) {
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-heart"></i>';
            showToast('Recette retirée des favoris');
        } else {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i>';
            showToast('Recette ajoutée aux favoris !');
        }

        AuthManager.toggleUserFavorite(recipeId);
    }

    loadMoreRecipes() {
        this.currentPage++;
        this.displayRecipes();
    }

    updateStats() {
        const totalRecipes = document.getElementById('totalRecipes');
        const totalCountries = document.getElementById('totalCountries');
        const averageTime = document.getElementById('averageTime');

        if (totalRecipes) {
            totalRecipes.textContent = this.filteredRecipes.length;
        }

        if (totalCountries) {
            const uniqueCountries = [...new Set(this.filteredRecipes.map(recipe => recipe.country))];
            totalCountries.textContent = uniqueCountries.length;
        }

        if (averageTime) {
            const totalTime = this.filteredRecipes.reduce((sum, recipe) => {
                const time = parseInt(recipe.time) || 0;
                return sum + time;
            }, 0);
            
            const avgTime = this.filteredRecipes.length > 0 ? 
                Math.round(totalTime / this.filteredRecipes.length) : 0;
            averageTime.textContent = `${avgTime}min`;
        }
    }
}

// Initialize recipes when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('recipesGrid')) {
        window.recipesManager = new RecipesManager();
    }
});