// Gallery functionality for GastroGlobe
class GalleryManager {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentPage = 1;
        this.imagesPerPage = 12;
        this.currentFilters = {
            continent: 'all',
            category: 'all'
        };
        this.currentImageIndex = 0;
        this.init();
    }

    async init() {
        await this.loadImages();
        this.setupEventListeners();
        this.displayImages();
    }

    async loadImages() {
        try {
            const response = await fetch('../data/gallery.json');
            this.images = await response.json();
            this.filteredImages = [...this.images];
        } catch (error) {
            console.error('Error loading gallery images:', error);
            // Fallback data
            this.images = this.getFallbackImages();
            this.filteredImages = [...this.images];
        }
    }

    getFallbackImages() {
        return [
            {
                id: 1,
                title: "Sushi Japonais",
                description: "Assortiment de sushis traditionnels japonais",
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "Japon",
                category: "plat",
                continent: "asia"
            },
            {
                id: 2,
                title: "Pizza Italienne",
                description: "Pizza Margherita traditionnelle avec basilic frais",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "Italie",
                category: "plat",
                continent: "europe"
            },
            {
                id: 3,
                title: "Tacos Mexicains",
                description: "Tacos street food avec garnitures fraîches",
                image: "https://images.unsplash.com/photo-1565299585323-38174c13fae8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "Mexique",
                category: "plat",
                continent: "americas"
            },
            {
                id: 4,
                title: "Croissant Français",
                description: "Croissant beurré traditionnel français",
                image: "https://images.unsplash.com/photo-1555507036-ab794f27d2e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "France",
                category: "dessert",
                continent: "europe"
            },
            {
                id: 5,
                title: "Pad Thaï",
                description: "Nouilles sautées thaïlandaises",
                image: "https://images.unsplash.com/photo-1559314809-0f155186bb2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "Thaïlande",
                category: "plat",
                continent: "asia"
            },
            {
                id: 6,
                title: "Couscous Marocain",
                description: "Plat traditionnel marocain avec semoule et légumes",
                image: "https://images.unsplash.com/photo-1543339302-43ffd0e0b79e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                country: "Maroc",
                category: "plat",
                continent: "africa"
            }
        ];
    }

    setupEventListeners() {
        // Filters
        document.getElementById('continentFilter')?.addEventListener('change', (e) => {
            this.currentFilters.continent = e.target.value;
            this.applyFilters();
        });

        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreImages();
        });

        // Lightbox
        this.setupLightboxEvents();
    }

    applyFilters() {
        this.filteredImages = this.images.filter(image => {
            const continentMatch = this.currentFilters.continent === 'all' || 
                image.continent === this.currentFilters.continent;
            const categoryMatch = this.currentFilters.category === 'all' || 
                image.category === this.currentFilters.category;
            
            return continentMatch && categoryMatch;
        });

        this.currentPage = 1;
        this.displayImages();
    }

    resetFilters() {
        document.getElementById('continentFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        
        this.currentFilters = {
            continent: 'all',
            category: 'all'
        };
        
        this.applyFilters();
        showToast('Filtres réinitialisés');
    }

    displayImages() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.imagesPerPage;
        const endIndex = startIndex + this.imagesPerPage;
        const imagesToShow = this.filteredImages.slice(0, endIndex);

        if (imagesToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--dark); margin-bottom: 0.5rem;">Aucune image trouvée</h3>
                    <p style="color: var(--text-light); margin-bottom: 1.5rem;">Essayez de modifier vos critères de filtrage</p>
                    <button class="btn btn-primary" id="resetSearch">Réinitialiser les filtres</button>
                </div>
            `;

            document.getElementById('resetSearch')?.addEventListener('click', () => {
                this.resetFilters();
            });
            return;
        }

        grid.innerHTML = imagesToShow.map((image, index) => `
            <div class="gallery-item" data-index="${index}" data-continent="${image.continent}" data-category="${image.category}">
                <img src="${image.image}" alt="${image.title}" class="gallery-image">
                <div class="gallery-overlay">
                    <h3 class="gallery-title">${image.title}</h3>
                    <div class="gallery-meta">
                        <span>${image.country}</span>
                        <span>${image.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.addImageEventListeners();

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= this.filteredImages.length ? 'none' : 'block';
        }
    }

    addImageEventListeners() {
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openLightbox(index);
            });
        });
    }

    setupLightboxEvents() {
        const lightbox = document.getElementById('lightbox');
        const closeLightbox = document.querySelector('.close-lightbox');
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');

        closeLightbox?.addEventListener('click', () => {
            this.closeLightbox();
        });

        lightbox?.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });

        prevBtn?.addEventListener('click', () => {
            this.showPreviousImage();
        });

        nextBtn?.addEventListener('click', () => {
            this.showNextImage();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.showPreviousImage();
                    break;
                case 'ArrowRight':
                    this.showNextImage();
                    break;
            }
        });
    }

    openLightbox(index) {
        this.currentImageIndex = index;
        this.updateLightbox();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    showPreviousImage() {
        this.currentImageIndex = this.currentImageIndex > 0 ? 
            this.currentImageIndex - 1 : this.filteredImages.length - 1;
        this.updateLightbox();
    }

    showNextImage() {
        this.currentImageIndex = this.currentImageIndex < this.filteredImages.length - 1 ? 
            this.currentImageIndex + 1 : 0;
        this.updateLightbox();
    }

    updateLightbox() {
        const image = this.filteredImages[this.currentImageIndex];
        if (!image) return;

        document.getElementById('lightboxImage').src = image.image;
        document.getElementById('lightboxImage').alt = image.title;
        document.getElementById('lightboxTitle').textContent = image.title;
        document.getElementById('lightboxDescription').textContent = image.description;
        document.getElementById('lightboxCountry').textContent = image.country;
        document.getElementById('lightboxCategory').textContent = image.category;
    }

    loadMoreImages() {
        this.currentPage++;
        this.displayImages();
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galleryGrid')) {
        window.galleryManager = new GalleryManager();
    }
});