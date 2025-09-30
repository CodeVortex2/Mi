// Recipes functionality for GastroGlobe - CORRECTED VERSION
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
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing RecipesManager...');
        await this.loadRecipes();
        this.setupEventListeners();
        this.setupMobileFilters();
        this.displayRecipes();
        this.updateStats();
    }

    async loadRecipes() {
        console.log('📥 Loading recipes...');
        this.isLoading = true;
        
        try {
            // Show loading state immediately
            this.showLoading(true);
            
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const response = await fetch('../data/recipes.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Recipes loaded:', data.length);
            
            this.recipes = data;
            this.filteredRecipes = [...this.recipes];
            
        } catch (error) {
            console.error('❌ Error loading recipes:', error);
            showToast('Erreur lors du chargement des recettes', 'error');
            
            // Fallback to demo data
            this.recipes = this.getDemoRecipes();
            this.filteredRecipes = [...this.recipes];
            console.log('🔄 Using demo recipes:', this.recipes.length);
            
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    getDemoRecipes() {
        return [
            {
                "id": 1,
                "name": "Ratatouille Provençale",
                "country": "France",
                "category": "vegan",
                "difficulty": "moyen",
                "time": "45 min",
                "image": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Un plat traditionnel provençal à base de légumes d'été frais.",
                "rating": 4.7,
                "ingredients": ["Aubergines", "Courgettes", "Poivrons", "Tomates"]
            },
            {
                "id": 2,
                "name": "Sushi Assorti",
                "country": "Japon",
                "category": "poisson", 
                "difficulty": "difficile",
                "time": "60 min",
                "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Assortiment de sushis traditionnels japonais.",
                "rating": 4.8,
                "ingredients": ["Riz à sushi", "Saumon", "Thon", "Avocat"]
            },
            {
                "id": 3,
                "name": "Pizza Margherita",
                "country": "Italie",
                "category": "vegetarien",
                "difficulty": "facile", 
                "time": "30 min",
                "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Pizza traditionnelle avec tomate, mozzarella et basilic.",
                "rating": 4.6,
                "ingredients": ["Pâte à pizza", "Sauce tomate", "Mozzarella", "Basilic"]
            },
            {
                "id": 4,
                "name": "Tacos Mexicains",
                "country": "Mexique",
                "category": "viande",
                "difficulty": "facile",
                "time": "25 min", 
                "image": "https://images.unsplash.com/photo-1565299585323-38174c13fae8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Tacos garnis de viande épicée et légumes frais.",
                "rating": 4.5,
                "ingredients": ["Tortillas", "Boeuf haché", "Oignons", "Tomates"]
            },
            {
                "id": 5,
                "name": "Pad Thaï",
                "country": "Thaïlande", 
                "category": "poisson",
                "difficulty": "moyen",
                "time": "35 min",
                "image": "https://images.unsplash.com/photo-1559314809-0f155186bb2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Nouilles de riz sautées avec crevettes et arachides.",
                "rating": 4.7,
                "ingredients": ["Nouilles de riz", "Crevettes", "Arachides", "Germes de soja"]
            },
            {
                "id": 6,
                "name": "Tiramisu",
                "country": "Italie",
                "category": "dessert",
                "difficulty": "moyen",
                "time": "40 min",
                "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "description": "Dessert italien au café et mascarpone.",
                "rating": 4.9,
                "ingredients": ["Mascarpone", "Café", "Biscuits", "Cacao"]
            }
        ];
    }

    showLoading(show) {
        const grid = document.getElementById('recipesGrid');
        if (!grid) {
            console.error('❌ recipesGrid element not found!');
            return;
        }

        if (show) {
            grid.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1;">
                    <div class="spinner"></div>
                    <p>Chargement des recettes...</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Search with debounce
        let searchTimeout;
        const searchInput = document.getElementById('recipeSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value.toLowerCase();
                    console.log('🔍 Search:', this.currentFilters.search);
                    this.applyFilters();
                }, 300);
            });
        } else {
            console.error('❌ recipeSearch input not found!');
        }

        // Filters
        const filters = {
            'countryFilter': 'country',
            'categoryFilter': 'category', 
            'difficultyFilter': 'difficulty',
            'timeFilter': 'time'
        };

        Object.entries(filters).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[key] = e.target.value;
                    console.log(`🎯 Filter ${key}:`, this.currentFilters[key]);
                    this.applyFilters();
                });
            } else {
                console.error(`❌ ${id} not found!`);
            }
        });

        // Reset filters
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreRecipes();
            });
        }

        console.log('✅ Event listeners setup complete');
    }

    applyFilters() {
        if (this.isLoading) {
            console.log('⏳ Skipping filter - still loading');
            return;
        }

        console.log('🎛️ Applying filters:', this.currentFilters);
        
        this.filteredRecipes = this.recipes.filter(recipe => {
            const matches = this.matchesSearch(recipe) &&
                           this.matchesCountry(recipe) &&
                           this.matchesCategory(recipe) &&
                           this.matchesDifficulty(recipe) &&
                           this.matchesTime(recipe);
            
            return matches;
        });

        console.log('📊 Filtered results:', this.filteredRecipes.length);

        this.currentPage = 1;
        this.displayRecipes();
        this.updateStats();
    }

    matchesSearch(recipe) {
        if (!this.currentFilters.search) return true;
        
        const searchTerm = this.currentFilters.search.toLowerCase();
        return recipe.name.toLowerCase().includes(searchTerm) ||
               recipe.description.toLowerCase().includes(searchTerm) ||
               (recipe.ingredients && recipe.ingredients.some(ingredient => 
                   ingredient.toLowerCase().includes(searchTerm)
               )) ||
               recipe.country.toLowerCase().includes(searchTerm);
    }

    matchesCountry(recipe) {
        return this.currentFilters.country === 'all' || 
               recipe.country.toLowerCase() === this.currentFilters.country;
    }

    matchesCategory(recipe) {
        return this.currentFilters.category === 'all' || 
               recipe.category === this.currentFilters.category;
    }

    matchesDifficulty(recipe) {
        return this.currentFilters.difficulty === 'all' || 
               recipe.difficulty === this.currentFilters.difficulty;
    }

    matchesTime(recipe) {
        if (this.currentFilters.time === 'all') return true;
        
        const time = parseInt(recipe.time);
        if (isNaN(time)) return false;

        switch (this.currentFilters.time) {
            case 'rapide': return time < 30;
            case 'moyen': return time >= 30 && time <= 60;
            case 'long': return time > 60;
            default: return true;
        }
    }

    resetFilters() {
        console.log('🔄 Resetting filters');
        
        // Reset form elements
        const searchInput = document.getElementById('recipeSearch');
        if (searchInput) searchInput.value = '';
        
        document.getElementById('countryFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('difficultyFilter').value = 'all';
        document.getElementById('timeFilter').value = 'all';

        // Reset state
        this.currentFilters = {
            search: '',
            country: 'all',
            category: 'all',
            difficulty: 'all',
            time: 'all'
        };

        this.applyFilters();
        showToast('Filtres réinitialisés', 'success');
    }

    displayRecipes() {
        const grid = document.getElementById('recipesGrid');
        if (!grid) {
            console.error('❌ recipesGrid element not found for display!');
            return;
        }

        const startIndex = (this.currentPage - 1) * this.recipesPerPage;
        const endIndex = startIndex + this.recipesPerPage;
        const recipesToShow = this.filteredRecipes.slice(0, endIndex);

        console.log('🖼️ Displaying recipes:', recipesToShow.length);

        if (recipesToShow.length === 0) {
            grid.innerHTML = this.getNoResultsHTML();
            return;
        }

        grid.innerHTML = recipesToShow.map(recipe => this.getRecipeCardHTML(recipe)).join('');
        this.addRecipeEventListeners();
        this.updateLoadMoreButton(endIndex);
        
        // Add entrance animation
        this.animateRecipeCards();
    }

    getNoResultsHTML() {
        return `
            <div class="no-results" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>Aucune recette trouvée</h3>
                <p>Essayez de modifier vos critères de recherche ou réinitialisez les filtres</p>
                <button class="btn btn-primary" id="resetSearch">
                    <i class="fas fa-redo"></i> Réinitialiser la recherche
                </button>
            </div>
        `;
    }

    getRecipeCardHTML(recipe) {
        const isFavorite = this.isFavorite(recipe.id);
        
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" loading="lazy">
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
                        <button class="btn btn-outline btn-sm add-favorite ${isFavorite ? 'active' : ''}" data-id="${recipe.id}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    animateRecipeCards() {
        const cards = document.querySelectorAll('.recipe-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    addRecipeEventListeners() {
        // View recipe buttons
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.viewRecipe(recipeId);
            });
        });

        // Favorite buttons
        document.querySelectorAll('.add-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                this.toggleFavorite(recipeId, e.target.closest('.add-favorite'));
            });
        });

        // Reset search button
        const resetSearchBtn = document.getElementById('resetSearch');
        if (resetSearchBtn) {
            resetSearchBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    isFavorite(recipeId) {
        const user = AuthManager.getCurrentUser();
        return user && user.favorites && user.favorites.includes(parseInt(recipeId));
    }

    viewRecipe(recipeId) {
        console.log('👀 Viewing recipe:', recipeId);
        
        // Add to history if user is logged in
        const user = AuthManager.getCurrentUser();
        if (user) {
            AuthManager.addToHistory({
                type: "recipe_view",
                itemId: parseInt(recipeId)
            });
        }
        
        window.location.href = `recette-detail.html?id=${recipeId}`;
    }

    toggleFavorite(recipeId, button) {
        if (!AuthManager.getCurrentUser()) {
            showToast('Veuillez vous connecter pour ajouter aux favoris', 'error');
            AuthManager.showLoginModal();
            return;
        }

        const isFavorite = this.isFavorite(recipeId);
        
        // Animation
        button.style.transform = 'scale(0.8)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        if (isFavorite) {
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-heart"></i>';
            showToast('Recette retirée des favoris');
        } else {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i>';
            showToast('Recette ajoutée aux favoris !');
            
            // Add to history
            AuthManager.addToHistory({
                type: "favorite_added",
                itemId: parseInt(recipeId)
            });
        }

        AuthManager.toggleUserFavorite(parseInt(recipeId));
    }

    updateLoadMoreButton(endIndex) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            const hasMore = endIndex < this.filteredRecipes.length;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            
            if (!hasMore && this.filteredRecipes.length > this.recipesPerPage) {
                showToast('Toutes les recettes sont chargées', 'info');
            }
        }
    }

    loadMoreRecipes() {
        console.log('📖 Loading more recipes...');
        this.currentPage++;
        this.displayRecipes();
        
        // Smooth scroll to new recipes
        setTimeout(() => {
            const newRecipes = document.querySelectorAll('.recipe-card');
            if (newRecipes.length > 0) {
                const lastRecipe = newRecipes[newRecipes.length - 1];
                lastRecipe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
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

    setupMobileFilters() {
        // This will be implemented for mobile view
        console.log('📱 Mobile filters setup');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM loaded, initializing RecipesManager...');
    
    // Wait a bit for auth to initialize
    setTimeout(() => {
        if (document.getElementById('recipesGrid')) {
            console.log('🎯 Found recipesGrid, starting...');
            window.recipesManager = new RecipesManager();
        } else {
            console.error('❌ recipesGrid not found on page!');
        }
    }, 100);
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipes);
} else {
    initRecipes();
}

function initRecipes() {
    if (document.getElementById('recipesGrid') && !window.recipesManager) {
        window.recipesManager = new RecipesManager();
    }
}