// ================= FILTERS FUNCTIONALITY =================
document.addEventListener('DOMContentLoaded', function() {
    // ================= PROJECTS FILTER =================
    const projectFilterButtons = document.querySelectorAll('.projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('.project-card-premium');
    
    function filterProjects(category) {
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category');
            if (!cardCategories) return;
            
            const categories = cardCategories.split(' ');
            
            if (category === 'all' || categories.includes(category)) {
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                
                // Stagger animation
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // If no cards visible, show message
        const noResultsMessage = document.querySelector('.no-projects-message');
        if (visibleCount === 0) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.className = 'no-projects-message';
                message.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No projects found</h3>
                        <p>Try selecting a different filter category</p>
                    </div>
                `;
                document.querySelector('.projects-grid').appendChild(message);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
    
    // Initialize project filter buttons
    projectFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            projectFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter category
            const category = this.getAttribute('data-filter');
            
            // Filter projects
            filterProjects(category);
            
            // Update URL hash
            window.history.pushState({}, '', `#projects-${category}`);
        });
    });
    
    // ================= CERTIFICATIONS FILTER =================
    const certFilterButtons = document.querySelectorAll('.certifications-filter .filter-btn');
    const certificationCards = document.querySelectorAll('.certification-card');
    
    function filterCertifications(category) {
        let visibleCount = 0;
        
        certificationCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category');
            if (!cardCategories) return;
            
            const categories = cardCategories.split(' ');
            
            if (category === 'all' || categories.includes(category)) {
                card.style.display = 'flex';
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                
                // Stagger animation
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Initialize certification filter buttons
    certFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            certFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter category
            const category = this.getAttribute('data-filter');
            
            // Filter certifications
            filterCertifications(category);
            
            // Update URL hash
            window.history.pushState({}, '', `#certifications-${category}`);
        });
    });
    
    // ================= CERTIFICATE SCROLL FUNCTIONALITY =================
    const scrollContainers = document.querySelectorAll('.certificates-scroll-wrapper');
    
    scrollContainers.forEach(container => {
        const dots = container.parentElement.querySelectorAll('.scroll-dot');
        const progressBar = container.parentElement.querySelector('.scroll-progress');
        
        // Update scroll indicators
        container.addEventListener('scroll', function() {
            const scrollPercentage = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
            
            // Update progress bar
            if (progressBar) {
                progressBar.style.height = scrollPercentage + '%';
            }
            
            // Update active dot
            const itemCount = container.querySelectorAll('.certificate-item').length;
            const visibleItems = Math.floor(container.clientHeight / 80);
            const currentIndex = Math.floor((scrollPercentage / 100) * (itemCount - visibleItems));
            
            dots.forEach((dot, index) => {
                if (index === Math.min(currentIndex, dots.length - 1)) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Show/hide bottom gradient
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
            if (!isAtBottom) {
                container.parentElement.classList.add('scrolled');
            } else {
                container.parentElement.classList.remove('scrolled');
            }
        });
        
        // Click dots to scroll to position
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                const items = container.querySelectorAll('.certificate-item');
                const itemHeight = items[0]?.offsetHeight || 80;
                const gap = 16;
                const scrollTo = index * (itemHeight + gap);
                container.scrollTo({
                    top: scrollTo,
                    behavior: 'smooth'
                });
            });
        });
    });
    
    // ================= INITIALIZE FILTERS FROM URL =================
    function initializeFiltersFromURL() {
        const hash = window.location.hash;
        
        if (hash.startsWith('#projects-')) {
            const category = hash.replace('#projects-', '');
            const button = document.querySelector(`.projects-filter .filter-btn[data-filter="${category}"]`);
            if (button) {
                button.click();
            }
        } else if (hash.startsWith('#certifications-')) {
            const category = hash.replace('#certifications-', '');
            const button = document.querySelector(`.certifications-filter .filter-btn[data-filter="${category}"]`);
            if (button) {
                button.click();
            }
        }
    }
    
    // ================= SEARCH FUNCTIONALITY (OPTIONAL) =================
    function initializeSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm.length < 2) {
                // Reset filters if search term is too short
                document.querySelector('.filter-btn.active').click();
                return;
            }
            
            // Search through projects
            projectCards.forEach(card => {
                const title = card.querySelector('.project-title').textContent.toLowerCase();
                const description = card.querySelector('.project-description p').textContent.toLowerCase();
                const techTags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent.toLowerCase());
                
                const matches = title.includes(searchTerm) || 
                              description.includes(searchTerm) ||
                              techTags.some(tag => tag.includes(searchTerm));
                
                card.style.display = matches ? 'flex' : 'none';
                
                if (matches) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }
            });
        });
    }
    
    // ================= INITIALIZATION =================
    function initializeAllFilters() {
        // Set initial active state
        document.querySelectorAll('.filter-btn[data-filter="all"]').forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.click();
            }
        });
        
        // Initialize from URL
        initializeFiltersFromURL();
        
        // Initialize search
        initializeSearch();
        
        // Add keyboard shortcuts for filters
        document.addEventListener('keydown', function(e) {
            // Alt + Number for filter shortcuts
            if (e.altKey && e.key >= '1' && e.key <= '5') {
                const index = parseInt(e.key) - 1;
                const filterButtons = document.querySelectorAll('.filter-btn');
                if (filterButtons[index]) {
                    filterButtons[index].click();
                    e.preventDefault();
                }
            }
            
            // Escape to reset filters
            if (e.key === 'Escape') {
                document.querySelectorAll('.filter-btn[data-filter="all"]').forEach(btn => {
                    btn.click();
                });
            }
        });
        
        console.log('Filters initialized successfully');
    }
    
    // Initialize when DOM is loaded
    initializeAllFilters();
    
    // Export functions for global use
    window.portfolioFilters = {
        filterProjects,
        filterCertifications,
        initializeAllFilters
    };
});