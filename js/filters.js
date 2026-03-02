// ================= COMPLETE FILTERS FUNCTIONALITY =================
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ================= PROJECTS FILTER =================
    initProjectsFilter();
    
    // ================= CERTIFICATIONS FILTER =================
    initCertificationsFilter();
    
    // ================= INITIALIZE FROM URL =================
    initFiltersFromURL();
    
    // ================= KEYBOARD SHORTCUTS =================
    initKeyboardShortcuts();
});

// ================= PROJECTS FILTER FUNCTION =================
function initProjectsFilter() {
    const projectFilterButtons = document.querySelectorAll('.projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectsGrid = document.querySelector('.projects-grid-three');
    
    if (!projectFilterButtons.length || !projectCards.length) {
        console.log('Projects filter elements not found');
        return;
    }
    
    function filterProjects(category) {
        let visibleCount = 0;
        
        // Remove any existing no results message
        const existingMessage = document.querySelector('.no-projects-message');
        if (existingMessage) existingMessage.remove();
        
        projectCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category');
            if (!cardCategories) return;
            
            const categories = cardCategories.toLowerCase().split(' ');
            const filterCategory = category.toLowerCase();
            
            if (filterCategory === 'all' || categories.includes(filterCategory)) {
                // Show card with animation
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'none'; // Reset transition temporarily
                
                // Force reflow
                void card.offsetWidth;
                
                // Apply animation with stagger
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
            }
        });
        
        // Show no results message if no cards visible
        if (visibleCount === 0 && projectsGrid) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-projects-message';
            noResultsMessage.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No projects found</h3>
                    <p>Try selecting a different filter category</p>
                </div>
            `;
            projectsGrid.appendChild(noResultsMessage);
        }
    }
    
    // Add click handlers to filter buttons
    projectFilterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            projectFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter category
            const category = this.getAttribute('data-filter') || 'all';
            
            // Filter projects
            filterProjects(category);
            
            // Update URL hash without scrolling
            const url = new URL(window.location);
            url.hash = `projects-${category}`;
            history.pushState({}, '', url);
        });
    });
    
    // Initialize with 'all' filter
    const defaultButton = document.querySelector('.projects-filter .filter-btn[data-filter="all"]');
    if (defaultButton) {
        setTimeout(() => {
            defaultButton.click();
        }, 100);
    }
}

// ================= CERTIFICATIONS FILTER FUNCTION =================
function initCertificationsFilter() {
    const certFilterButtons = document.querySelectorAll('.certifications-filter .filter-btn');
    const certificationCards = document.querySelectorAll('.certification-card');
    const certificatesContainer = document.querySelector('.certificates-grid');
    
    if (!certFilterButtons.length || !certificationCards.length) {
        console.log('Certifications filter elements not found');
        return;
    }
    
    function filterCertifications(category) {
        let visibleCount = 0;
        
        // Remove any existing no results message
        const existingMessage = document.querySelector('.no-certificates-message');
        if (existingMessage) existingMessage.remove();
        
        certificationCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category');
            if (!cardCategories) return;
            
            const categories = cardCategories.toLowerCase().split(' ');
            const filterCategory = category.toLowerCase();
            
            if (filterCategory === 'all' || categories.includes(filterCategory)) {
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                card.style.transition = 'none';
                
                // Force reflow
                void card.offsetWidth;
                
                // Apply animation with stagger
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
            }
        });
        
        // Show no results message if no cards visible
        if (visibleCount === 0 && certificatesContainer) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-certificates-message';
            noResultsMessage.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-certificate"></i>
                    <h3>No certificates found</h3>
                    <p>Try selecting a different filter category</p>
                </div>
            `;
            certificatesContainer.appendChild(noResultsMessage);
        }
    }
    
    // Add click handlers to filter buttons
    certFilterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            certFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter category
            const category = this.getAttribute('data-filter') || 'all';
            
            // Filter certifications
            filterCertifications(category);
            
            // Update URL hash without scrolling
            const url = new URL(window.location);
            url.hash = `certifications-${category}`;
            history.pushState({}, '', url);
        });
    });
    
    // Initialize with 'all' filter
    const defaultButton = document.querySelector('.certifications-filter .filter-btn[data-filter="all"]');
    if (defaultButton) {
        setTimeout(() => {
            defaultButton.click();
        }, 100);
    }
}

// ================= INITIALIZE FILTERS FROM URL =================
function initFiltersFromURL() {
    const hash = window.location.hash.substring(1); // Remove the #
    
    if (!hash) return;
    
    // Parse projects filter from URL
    if (hash.startsWith('projects-')) {
        const category = hash.replace('projects-', '');
        const projectButton = document.querySelector(`.projects-filter .filter-btn[data-filter="${category}"]`);
        if (projectButton) {
            setTimeout(() => {
                projectButton.click();
            }, 200);
        }
    }
    
    // Parse certifications filter from URL
    if (hash.startsWith('certifications-')) {
        const category = hash.replace('certifications-', '');
        const certButton = document.querySelector(`.certifications-filter .filter-btn[data-filter="${category}"]`);
        if (certButton) {
            setTimeout(() => {
                certButton.click();
            }, 200);
        }
    }
}

// ================= KEYBOARD SHORTCUTS =================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + Number for project filter shortcuts
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            const key = parseInt(e.key);
            
            if (key >= 1 && key <= 5) {
                e.preventDefault();
                
                // Projects filter shortcuts
                const projectFilterButtons = document.querySelectorAll('.projects-filter .filter-btn');
                if (projectFilterButtons[key - 1]) {
                    projectFilterButtons[key - 1].click();
                }
            }
        }
        
        // Escape key to reset all filters
        if (e.key === 'Escape') {
            // Reset projects filter
            const allProjectButton = document.querySelector('.projects-filter .filter-btn[data-filter="all"]');
            if (allProjectButton && !allProjectButton.classList.contains('active')) {
                allProjectButton.click();
            }
            
            // Reset certifications filter
            const allCertButton = document.querySelector('.certifications-filter .filter-btn[data-filter="all"]');
            if (allCertButton && !allCertButton.classList.contains('active')) {
                allCertButton.click();
            }
        }
    });
}

// ================= RESET FUNCTION =================

// Reset all filters to default state
function resetAllFilters() {
    // Reset projects filter
    const allProjectButton = document.querySelector('.projects-filter .filter-btn[data-filter="all"]');
    if (allProjectButton) {
        allProjectButton.click();
    }
    
    // Reset certifications filter
    const allCertButton = document.querySelector('.certifications-filter .filter-btn[data-filter="all"]');
    if (allCertButton) {
        allCertButton.click();
    }
    
    // Clear URL hash
    history.pushState({}, '', window.location.pathname);
}

// Get current active filter
function getActiveFilter(section = 'projects') {
    if (section === 'projects') {
        const activeButton = document.querySelector('.projects-filter .filter-btn.active');
        return activeButton ? activeButton.getAttribute('data-filter') : 'all';
    } else if (section === 'certifications') {
        const activeButton = document.querySelector('.certifications-filter .filter-btn.active');
        return activeButton ? activeButton.getAttribute('data-filter') : 'all';
    }
    return null;
}

// ================= SEARCH FUNCTIONALITY (OPTIONAL) =================
function initSearch() {
    const searchInput = document.querySelector('.projects-search-input');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const projectCards = document.querySelectorAll('.project-card');
        const activeFilter = getActiveFilter('projects');
        
        if (searchTerm.length < 2) {
            // If search term is too short, just apply current filter
            const activeButton = document.querySelector(`.projects-filter .filter-btn[data-filter="${activeFilter}"]`);
            if (activeButton) {
                activeButton.click();
            }
            return;
        }
        
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.project-description p')?.textContent.toLowerCase() || '';
            const techTags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent.toLowerCase());
            
            const matchesSearch = title.includes(searchTerm) || 
                                 description.includes(searchTerm) ||
                                 techTags.some(tag => tag.includes(searchTerm));
            
            // Check if card matches current filter category
            const cardCategories = card.getAttribute('data-category')?.split(' ') || [];
            const matchesFilter = activeFilter === 'all' || cardCategories.includes(activeFilter);
            
            if (matchesSearch && matchesFilter) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show no results message if needed
        const projectsGrid = document.querySelector('.projects-grid-three');
        const existingMessage = document.querySelector('.no-projects-message');
        
        if (visibleCount === 0 && projectsGrid) {
            if (!existingMessage) {
                const message = document.createElement('div');
                message.className = 'no-projects-message';
                message.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No projects found</h3>
                        <p>No results match "${searchTerm}"</p>
                    </div>
                `;
                projectsGrid.appendChild(message);
            }
        } else if (existingMessage) {
            existingMessage.remove();
        }
    }, 300));
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global use
window.portfolioFilters = {
    filterProjects: initProjectsFilter,
    filterCertifications: initCertificationsFilter,
    resetAllFilters,
    getActiveFilter,
    initSearch
};