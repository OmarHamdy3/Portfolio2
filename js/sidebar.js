// ================= MOBILE SIDEBAR =================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Check if elements exist
    if (!mobileSidebar) {
        console.error('Mobile sidebar element not found!');
        return;
    }

    // Open sidebar
    function openSidebar() {
        mobileSidebar.classList.add('active');
        document.body.classList.add('sidebar-open');
        
        // Toggle icons if they exist
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        if (menuIcon && closeIcon) {
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        }
    }

    // Close sidebar
    function closeSidebar() {
        mobileSidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        
        // Toggle icons if they exist
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        
        if (menuIcon && closeIcon) {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    }

    // Toggle sidebar on hamburger click
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileSidebar.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // Close sidebar when clicking close button
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    // Handle navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get target section
            const targetId = item.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;
            
            // Close sidebar
            closeSidebar();
            
            // Scroll to section after a short delay
            setTimeout(() => {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        });
    });

    // Close sidebar with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileSidebar.classList.contains('active') && 
            !mobileSidebar.contains(e.target) && 
            (!hamburger || !hamburger.contains(e.target))) {
            closeSidebar();
        }
    });

    // Handle sidebar contact CTA
    const sidebarContactBtn = document.querySelector('.sidebar-contact .btn');
    if (sidebarContactBtn) {
        sidebarContactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
            
            setTimeout(() => {
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    window.scrollTo({
                        top: contactSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        });
    }

    // Handle sidebar social links
    const sidebarSocialLinks = document.querySelectorAll('.sidebar-socials .social-link');
    sidebarSocialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // For external links, just close sidebar
            if (this.getAttribute('target') === '_blank' || 
                this.getAttribute('href').startsWith('http') ||
                this.getAttribute('href').startsWith('mailto:') ||
                this.getAttribute('href').startsWith('tel:')) {
                closeSidebar();
                // Allow default behavior for external links
                return true;
            }
            
            // For internal anchor links
            e.preventDefault();
            closeSidebar();
            
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                setTimeout(() => {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            }
        });
    });

    // Handle sidebar download button
    const sidebarDownloadBtn = document.querySelector('.sidebar-cv-download .btn');
    if (sidebarDownloadBtn) {
        sidebarDownloadBtn.addEventListener('click', function() {
            closeSidebar();
            // Track download if needed
            console.log('CV download initiated from sidebar');
        });
    }

    // Update active nav item based on scroll position
    function updateActiveNavItem() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navItem = document.querySelector(`.nav-item[href="#${sectionId}"]`);
            
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                navItems.forEach(item => item.classList.remove('active'));
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
        });
    }

    // Listen for scroll events to update active nav item
    window.addEventListener('scroll', updateActiveNavItem);
    
    // Initialize on load
    updateActiveNavItem();
});