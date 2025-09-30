// Map functionality for GastroGlobe
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentFilters = {
            continent: 'all',
            dishType: 'all',
            difficulty: 'all'
        };
        this.init();
    }

    init() {
        this.initMap();
        this.loadDishes();
        this.setupEventListeners();
    }

    initMap() {
        // Initialize the map
        this.map = L.map('worldMap').setView([20, 0], 2);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add scale control
        L.control.scale().addTo(this.map);
    }

    async loadDishes() {
        try {
            const response = await fetch('../data/recipes.json');
            const dishes = await response.json();
            this.addDishesToMap(dishes);
            this.displayDishesGrid(dishes);
        } catch (error) {
            console.error('Error loading dishes:', error);
        }
    }

    addDishesToMap(dishes) {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        dishes.forEach(dish => {
            // Generate random coordinates for demo (in real app, use actual coordinates)
            const lat = this.getRandomInRange(-60, 70, 3);
            const lng = this.getRandomInRange(-180, 180, 3);

            const markerColor = this.getMarkerColor(dish.category);
            
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(this.map);

            const popupContent = `
                <div class="popup-content">
                    <h3>${dish.name}</h3>
                    <p><strong>${dish.country}</strong> - ${dish.region || ''}</p>
                    <p>${dish.description}</p>
                    <div class="dish-meta">
                        <span><i class="fas fa-clock"></i> ${dish.time}</span>
                        <span><i class="fas fa-fire"></i> ${dish.difficulty}</span>
                        <span class="dish-type">${dish.category}</span>
                    </div>
                    <div class="popup-actions">
                        <button class="btn btn-primary btn-sm view-recipe" data-id="${dish.id}">
                            Voir la recette
                        </button>
                        <button class="btn btn-outline btn-sm add-favorite" data-id="${dish.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push(marker);

            // Add event listeners to popup buttons
            marker.on('popupopen', () => {
                const popup = marker.getPopup();
                const element = popup.getElement();
                
                element.querySelector('.view-recipe')?.addEventListener('click', () => {
                    this.viewRecipe(dish.id);
                });
                
                element.querySelector('.add-favorite')?.addEventListener('click', () => {
                    this.toggleFavorite(dish.id);
                });
            });
        });
    }

    getMarkerColor(category) {
        const colors = {
            'entree': '#2ecc71',
            'plat': '#e74c3c',
            'dessert': '#f39c12',
            'boisson': '#3498db',
            'vegan': '#27ae60',
            'seafood': '#2980b9'
        };
        return colors[category] || '#95a5a6';
    }

    getRandomInRange(min, max, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    displayDishesGrid(dishes) {
        const grid = document.getElementById('dishesGrid');
        if (!grid) return;

        grid.innerHTML = dishes.map(dish => `
            <div class="dish-card" data-continent="${dish.continent || 'europe'}" data-type="${dish.category}" data-difficulty="${dish.difficulty}">
                <img src="${dish.image}" alt="${dish.name}" class="dish-image">
                <div class="dish-content">
                    <div class="dish-header">
                        <div>
                            <h3 class="dish-title">${dish.name}</h3>
                            <div class="dish-country">${dish.country}</div>
                        </div>
                        <span class="dish-type">${dish.category}</span>
                    </div>
                    <p class="dish-description">${dish.description}</p>
                    <div class="dish-meta">
                        <span><i class="fas fa-clock"></i> ${dish.time}</span>
                        <span><i class="fas fa-fire"></i> ${dish.difficulty}</span>
                        <span><i class="fas fa-star"></i> ${dish.rating || '4.5'}</span>
                    </div>
                    <div class="dish-actions">
                        <button class="btn btn-primary btn-sm view-recipe" data-id="${dish.id}">
                            Voir la recette
                        </button>
                        <button class="btn btn-outline btn-sm add-favorite" data-id="${dish.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.addGridEventListeners();
    }

    addGridEventListeners() {
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

    viewRecipe(recipeId) {
        window.location.href = `recette-detail.html?id=${recipeId}`;
    }

    toggleFavorite(recipeId, button = null) {
        if (!AuthManager.getCurrentUser()) {
            showToast('Veuillez vous connecter pour ajouter aux favoris', 'error');
            AuthManager.showLoginModal();
            return;
        }

        if (button) {
            const isFavorite = button.classList.contains('active');
            
            if (isFavorite) {
                button.classList.remove('active');
                button.innerHTML = '<i class="far fa-heart"></i>';
                showToast('Recette retirée des favoris');
            } else {
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                showToast('Recette ajoutée aux favoris !');
            }
        }

        AuthManager.toggleUserFavorite(recipeId);
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('continentFilter')?.addEventListener('change', (e) => {
            this.currentFilters.continent = e.target.value;
            this.applyFilters();
        });

        document.getElementById('dishTypeFilter')?.addEventListener('change', (e) => {
            this.currentFilters.dishType = e.target.value;
            this.applyFilters();
        });

        document.getElementById('difficultyFilter')?.addEventListener('change', (e) => {
            this.currentFilters.difficulty = e.target.value;
            this.applyFilters();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    applyFilters() {
        const dishCards = document.querySelectorAll('.dish-card');
        
        dishCards.forEach(card => {
            const continent = card.getAttribute('data-continent');
            const type = card.getAttribute('data-type');
            const difficulty = card.getAttribute('data-difficulty');
            
            const continentMatch = this.currentFilters.continent === 'all' || continent === this.currentFilters.continent;
            const typeMatch = this.currentFilters.dishType === 'all' || type === this.currentFilters.dishType;
            const difficultyMatch = this.currentFilters.difficulty === 'all' || difficulty === this.currentFilters.difficulty;
            
            if (continentMatch && typeMatch && difficultyMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Also filter map markers (simplified version)
        this.filterMapMarkers();
    }

    filterMapMarkers() {
        // In a real implementation, you would filter the markers on the map
        // For this demo, we'll just show a message
        console.log('Filters applied:', this.currentFilters);
    }

    resetFilters() {
        document.getElementById('continentFilter').value = 'all';
        document.getElementById('dishTypeFilter').value = 'all';
        document.getElementById('difficultyFilter').value = 'all';
        
        this.currentFilters = {
            continent: 'all',
            dishType: 'all',
            difficulty: 'all'
        };
        
        this.applyFilters();
        showToast('Filtres réinitialisés');
    }
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('worldMap')) {
        window.mapManager = new MapManager();
    }
});