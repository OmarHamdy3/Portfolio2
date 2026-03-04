// ================= MODAL SYSTEM - PRODUCTION READY =================
'use strict';

class ModalSystem {
    constructor() {
        this.activeModal = null;
        this.fullscreenOverlay = null;
        this.isFullscreenActive = false;
        this.videoPlayers = new Map();
        
        this.init();
    }
    
    init() {
        this.initProjectModals();
        this.initDashboardFullscreen();
        this.initVideoPlayers();
        this.initAccessibility();
        this.initPerformanceMonitoring();
    }
    
    // ================= PROJECT MODALS =================
    initProjectModals() {
        // Open Modal Handlers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
            
            // Add keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const modalId = trigger.getAttribute('data-modal');
                    this.openModal(modalId);
                }
            });
        });
        
        // Close Modal Handlers
        document.querySelectorAll('.close-modal.executive').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.project-modal');
                if (modal) this.closeModal(modal);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.activeModal && 
                e.target.classList.contains('project-modal') &&
                !e.target.closest('.modal-content')) {
                this.closeModal(this.activeModal);
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
        
        // Footer action buttons
        document.querySelectorAll('.modal-footer .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.project-modal');
                if (modal) this.closeModal(modal);
            });
        });
    }
    
    openModal(modalId) {
        // Close any existing modal first
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal with ID "${modalId}" not found`);
            return;
        }
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.activeModal = modal;
        
        // Dispatch custom event
        this.dispatchEvent('modal:open', { modalId, modal });
        
        // Initialize video for this modal
        this.initModalVideo(modal);
        
        // Set focus to close button for accessibility
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
        
        // Add active class for animations
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }
    
    closeModal(modal) {
        if (!modal) return;
        
        // Pause all videos in modal
        modal.querySelectorAll('video').forEach(video => {
            video.pause();
            const playBtn = video.parentElement.querySelector('.video-play-btn');
            if (playBtn) {
                playBtn.classList.remove('playing');
                playBtn.style.opacity = '1';
            }
        });
        
        // Hide modal
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Dispatch custom event
        this.dispatchEvent('modal:close', { modal });
        
        // Clear active modal
        if (this.activeModal === modal) {
            this.activeModal = null;
        }
        
        // Return focus to trigger element
        const trigger = document.querySelector(`[data-modal="${modal.id}"]`);
        if (trigger) {
            setTimeout(() => trigger.focus(), 50);
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.project-modal').forEach(modal => {
            if (modal.style.display === 'block') {
                this.closeModal(modal);
            }
        });
    }
    
    // ================= DASHBOARD FULLSCREEN FUNCTIONALITY =================
    initDashboardFullscreen() {
        // Expand button handlers
        document.addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) {
                e.stopPropagation();
                const preview = expandBtn.closest('.dashboard-preview, .mini-preview');
                const img = preview.querySelector('.dashboard-image');
                this.openFullscreenImage(img.src, img.alt);
            }
        });
        
        // Create fullscreen overlay if it doesn't exist
        if (!this.fullscreenOverlay) {
            this.createFullscreenOverlay();
        }
    }
    
    createFullscreenOverlay() {
        this.fullscreenOverlay = document.createElement('div');
        this.fullscreenOverlay.className = 'fullscreen-overlay';
        this.fullscreenOverlay.setAttribute('role', 'dialog');
        this.fullscreenOverlay.setAttribute('aria-label', 'Fullscreen image viewer');
        this.fullscreenOverlay.setAttribute('aria-modal', 'true');
        
        this.fullscreenOverlay.innerHTML = `
            <button class="close-fullscreen" aria-label="Close fullscreen viewer">
                <i class="fas fa-times"></i>
            </button>
            <img src="" alt="" class="fullscreen-image">
        `;
        
        document.body.appendChild(this.fullscreenOverlay);
        
        // Close button handler
        const closeBtn = this.fullscreenOverlay.querySelector('.close-fullscreen');
        closeBtn.addEventListener('click', () => this.closeFullscreenImage());
        
        // Close on background click
        this.fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === this.fullscreenOverlay) {
                this.closeFullscreenImage();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreenActive) {
                this.closeFullscreenImage();
            }
        });
    }
    
    openFullscreenImage(src, alt) {
        if (!this.fullscreenOverlay) return;
        
        const fullscreenImg = this.fullscreenOverlay.querySelector('.fullscreen-image');
        fullscreenImg.src = src;
        fullscreenImg.alt = alt || 'Fullscreen dashboard preview';
        
        // Preload image for smooth transition
        const img = new Image();
        img.onload = () => {
            this.fullscreenOverlay.classList.add('active');
            this.isFullscreenActive = true;
            document.body.style.overflow = 'hidden';
            
            // Set focus for accessibility
            const closeBtn = this.fullscreenOverlay.querySelector('.close-fullscreen');
            setTimeout(() => closeBtn.focus(), 100);
            
            this.dispatchEvent('fullscreen:open', { src, alt });
        };
        img.src = src;
    }
    
    closeFullscreenImage() {
        if (!this.fullscreenOverlay || !this.isFullscreenActive) return;
        
        this.fullscreenOverlay.classList.remove('active');
        this.isFullscreenActive = false;
        document.body.style.overflow = '';
        
        // Clear image source to free memory
        const fullscreenImg = this.fullscreenOverlay.querySelector('.fullscreen-image');
        fullscreenImg.src = '';
        
        this.dispatchEvent('fullscreen:close');
    }
    
    // ================= VIDEO PLAYER FUNCTIONALITY =================
    initVideoPlayers() {
        // Initialize all existing videos
        document.querySelectorAll('.project-video').forEach(video => {
            this.initSingleVideo(video);
        });
        
        // Observe for dynamically added videos
        this.setupVideoObserver();
    }
    
    initModalVideo(modal) {
        const video = modal.querySelector('.project-video');
        if (video) {
            this.initSingleVideo(video);
        }
    }
    
    initSingleVideo(video) {
        if (this.videoPlayers.has(video)) return;
        
        const wrapper = video.closest('.video-wrapper');
        const playBtn = wrapper?.querySelector('.video-play-btn');
        const loadingOverlay = wrapper?.querySelector('.video-loading');
        const chapterItems = wrapper?.closest('.video-section')?.querySelectorAll('.chapter-item');
        
        // Store video instance
        this.videoPlayers.set(video, {
            wrapper,
            playBtn,
            loadingOverlay,
            chapterItems,
            isPlaying: false
        });
        
        // Ensure no autoplay
        video.removeAttribute('autoplay');
        video.controls = true; // Use native controls for consistency
        
        // Add custom play button functionality
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleVideoPlay(video);
            });
        }
        
        // Loading states
        video.addEventListener('waiting', () => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
        });
        
        video.addEventListener('canplay', () => {
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
            }
        });
        
        // Chapter navigation
        if (chapterItems) {
            this.setupChapterNavigation(video, chapterItems);
        }
        
        // Track play state
        video.addEventListener('play', () => {
            const data = this.videoPlayers.get(video);
            if (data) {
                data.isPlaying = true;
                if (data.playBtn) {
                    data.playBtn.classList.add('playing');
                    data.playBtn.style.opacity = '0';
                }
            }
            this.dispatchEvent('video:play', { video });
        });
        
        video.addEventListener('pause', () => {
            const data = this.videoPlayers.get(video);
            if (data) {
                data.isPlaying = false;
                if (data.playBtn) {
                    data.playBtn.classList.remove('playing');
                    data.playBtn.style.opacity = '1';
                }
            }
            this.dispatchEvent('video:pause', { video });
        });
        
        video.addEventListener('ended', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.playBtn) {
                data.playBtn.style.opacity = '1';
            }
            this.dispatchEvent('video:ended', { video });
        });
        
        // Error handling
        video.addEventListener('error', (e) => {
            console.error('Video error:', video.error);
            this.dispatchEvent('video:error', { video, error: video.error });
            
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span>Video failed to load</span>
                `;
            }
        });
        
        // Accessibility
        video.setAttribute('tabindex', '0');
        video.setAttribute('aria-label', 'Project demonstration video');
        
        // Keyboard controls
        video.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleVideoPlay(video);
            }
        });
    }
    
    toggleVideoPlay(video) {
        const data = this.videoPlayers.get(video);
        if (!data) return;
        
        if (video.paused) {
            video.play().catch(error => {
                console.warn('Video play failed:', error);
                // Fallback: show error message
                if (data.playBtn) {
                    data.playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                    setTimeout(() => {
                        data.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }, 2000);
                }
            });
        } else {
            video.pause();
        }
    }
    
    setupChapterNavigation(video, chapterItems) {
        const updateActiveChapter = () => {
            const currentTime = video.currentTime;
            let activeChapter = null;
            
            chapterItems.forEach(chapter => {
                const chapterTime = parseInt(chapter.getAttribute('data-time'));
                const nextChapter = chapter.nextElementSibling;
                const nextTime = nextChapter ? 
                    parseInt(nextChapter.getAttribute('data-time')) : 
                    video.duration;
                
                if (currentTime >= chapterTime && currentTime < nextTime) {
                    activeChapter = chapter;
                }
                
                chapter.classList.remove('active');
            });
            
            if (activeChapter) {
                activeChapter.classList.add('active');
            }
        };
        
        // Update chapter on time update
        video.addEventListener('timeupdate', updateActiveChapter);
        
        // Chapter click handlers
        chapterItems.forEach(chapter => {
            chapter.addEventListener('click', () => {
                const time = parseInt(chapter.getAttribute('data-time'));
                video.currentTime = time;
                
                // Play video if paused
                if (video.paused) {
                    video.play();
                }
                
                // Update active chapter
                chapterItems.forEach(c => c.classList.remove('active'));
                chapter.classList.add('active');
            });
            
            // Keyboard accessibility
            chapter.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chapter.click();
                }
            });
        });
    }
    
    setupVideoObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const videos = node.querySelectorAll ? node.querySelectorAll('.project-video') : [];
                        videos.forEach(video => this.initSingleVideo(video));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ================= ACCESSIBILITY ENHANCEMENTS =================
    initAccessibility() {
        // Trap focus within modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeModal) {
                this.trapFocus(e, this.activeModal);
            }
        });
        
        // Trap focus within fullscreen overlay
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.isFullscreenActive) {
                this.trapFocus(e, this.fullscreenOverlay);
            }
        });
        
        // Add ARIA attributes to modals
        document.querySelectorAll('.project-modal').forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
        });
        
        // Update ARIA attributes when modal opens/closes
        this.on('modal:open', (data) => {
            data.modal.setAttribute('aria-hidden', 'false');
            document.querySelectorAll('.project-modal').forEach(m => {
                if (m !== data.modal) {
                    m.setAttribute('aria-hidden', 'true');
                }
            });
        });
        
        this.on('modal:close', (data) => {
            data.modal.setAttribute('aria-hidden', 'true');
        });
    }
    
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
    
    // ================= EVENT SYSTEM =================
    on(eventName, callback) {
        document.addEventListener(`modal-system:${eventName}`, (e) => {
            callback(e.detail);
        });
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`modal-system:${eventName}`, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // ================= KEYBOARD HANDLING =================
    handleEscapeKey() {
        // Close fullscreen first if active
        if (this.isFullscreenActive) {
            this.closeFullscreenImage();
            return;
        }
        
        // Then close modal if active
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }
    
    // ================= PERFORMANCE MONITORING =================
    initPerformanceMonitoring() {
        // Log modal open/close times for performance monitoring
        this.on('modal:open', (data) => {
            console.log(`Modal opened: ${data.modalId}`, {
                timestamp: Date.now(),
                element: data.modal
            });
        });
        
        this.on('modal:close', (data) => {
            console.log(`Modal closed`, {
                timestamp: Date.now(),
                element: data.modal
            });
        });
    }
    
    // ================= PUBLIC API =================
    open(modalId) {
        this.openModal(modalId);
    }
    
    close() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }
    
    closeAll() {
        this.closeAllModals();
    }
    
    destroy() {
        // Clean up all event listeners
        document.removeEventListener('click', this.boundClickHandler);
        document.removeEventListener('keydown', this.boundKeydownHandler);
        
        // Clear video players
        this.videoPlayers.forEach((data, video) => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        });
        this.videoPlayers.clear();
        
        // Remove fullscreen overlay
        if (this.fullscreenOverlay && this.fullscreenOverlay.parentNode) {
            this.fullscreenOverlay.parentNode.removeChild(this.fullscreenOverlay);
        }
        
        // Clear references
        this.activeModal = null;
        this.fullscreenOverlay = null;
        this.isFullscreenActive = false;
    }
}

// ================= INITIALIZATION =================
let modalSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal system
    modalSystem = new ModalSystem();
    
    // Initialize contact form modal if exists
    initContactFormModal();
});

// ================= CONTACT FORM MODAL (if needed) =================
function initContactFormModal() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form validation
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Basic validation
        let isValid = true;
        const errors = [];
        
        if (!name) {
            errors.push('Name is required');
            isValid = false;
        }
        
        if (!email || !isValidEmail(email)) {
            errors.push('Valid email is required');
            isValid = false;
        }
        
        if (!subject) {
            errors.push('Subject is required');
            isValid = false;
        }
        
        if (!message) {
            errors.push('Message is required');
            isValid = false;
        }
        
        if (!isValid) {
            showFormError(errors.join(', '));
            return;
        }
        
        // Show success message
        document.getElementById('contactForm').style.display = 'none';
        const successEl = document.getElementById('formSuccess');
        if (successEl) {
            successEl.style.display = 'flex';
        }
        
        // Reset form
        contactForm.reset();
        
        // Dispatch custom event
        const event = new CustomEvent('contact-form:submit', {
            detail: { name, email, subject, message }
        });
        document.dispatchEvent(event);
    });
    
    // Communication preference selection
    document.querySelectorAll('.preference-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.preference-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        // Keyboard accessibility
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
    
    // Form input validation
    const formInputs = document.querySelectorAll('.professional-form input, .professional-form textarea, .professional-form select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary)';
        });
        
        // Real-time validation for email
        if (input.type === 'email') {
            input.addEventListener('input', function() {
                if (this.value.trim() && !isValidEmail(this.value.trim())) {
                    this.setCustomValidity('Please enter a valid email address');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    });
    
    // Close success message
    window.closeSuccess = function() {
        const successEl = document.getElementById('formSuccess');
        const formEl = document.getElementById('contactForm');
        
        if (successEl) {
            successEl.style.display = 'none';
        }
        
        if (formEl) {
            formEl.style.display = 'block';
            formEl.reset();
        }
    };
}

function validateInput(input) {
    const value = input.value.trim();
    
    if (input.hasAttribute('required') && !value) {
        input.style.borderColor = 'rgba(234, 67, 53, 0.5)';
        input.setCustomValidity('This field is required');
        return false;
    }
    
    if (input.type === 'email' && value && !isValidEmail(value)) {
        input.style.borderColor = 'rgba(234, 67, 53, 0.5)';
        input.setCustomValidity('Please enter a valid email address');
        return false;
    }
    
    input.style.borderColor = 'rgba(251, 237, 82, 0.3)';
    input.setCustomValidity('');
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormError(message) {
    // Create or show error message
    let errorEl = document.querySelector('.form-error');
    
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.cssText = `
            background: rgba(234, 67, 53, 0.1);
            border: 1px solid rgba(234, 67, 53, 0.3);
            color: #ea4335;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        `;
        
        const form = document.getElementById('contactForm');
        if (form) {
            form.insertBefore(errorEl, form.firstChild);
        }
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// ================= EXPORT FOR MODULE USAGE =================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalSystem, modalSystem };
}

// ================= GLOBAL ACCESS (if needed) =================
window.ModalSystem = ModalSystem;
window.modalSystem = modalSystem;

// ================= ERROR HANDLING =================
window.addEventListener('error', function(e) {
    console.error('Modal System Error:', e.error);
    
    // Try to recover by reinitializing
    if (modalSystem) {
        modalSystem.destroy();
    }
    modalSystem = new ModalSystem();
});

// ================= PAGE VISIBILITY API =================
document.addEventListener('visibilitychange', () => {
    if (document.hidden && modalSystem) {
        // Pause videos when page is hidden
        modalSystem.videoPlayers.forEach((data, video) => {
            if (!video.paused) {
                video.pause();
            }
        });
    }
});



// ============================================
// UNIVERSAL MODAL SYSTEM - WORKS FOR ALL PROJECTS
// ============================================

// Configuration - Add all your modal IDs here
const MODAL_IDS = {
    superstore: 'superstore-modal',
    roadAccident: 'road-accident-modal',
    // Add more projects here as needed
    // hrAnalytics: 'hr-analytics-modal',
    // financialDashboard: 'financial-dashboard-modal',
};

// Track currently open modal
let currentOpenModal = null;

// ============================================
// OPEN MODAL FUNCTIONS - Call these from your main page
// ============================================

function openSuperstoreModal() {
    openModal(MODAL_IDS.superstore);
}

function openRoadAccidentModal() {
    openModal(MODAL_IDS.roadAccident);
}

// Generic function to open any modal by ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Close any currently open modal first
        if (currentOpenModal) {
            closeModal(currentOpenModal);
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        currentOpenModal = modal;
        
        // Optional: Add analytics tracking
        console.log(`Modal opened: ${modalId}`);
    }
}

// ============================================
// CLOSE MODAL FUNCTIONALITY
// ============================================

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Pause any playing videos in this modal
        pauseVideosInModal(modal);
        
        if (currentOpenModal === modal) {
            currentOpenModal = null;
        }
    }
}

// Close all close buttons for all modals
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const modal = this.closest('.project-modal');
        closeModal(modal);
    });
});

// Close when clicking outside modal content for ALL modals
document.querySelectorAll('.project-modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this);
        }
    });
});

// ============================================
// ESCAPE KEY HANDLER - Closes current modal
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentOpenModal) {
        closeModal(currentOpenModal);
        // Also close any open fullscreen overlay
        document.querySelectorAll('.fullscreen-overlay.active').forEach(overlay => {
            overlay.classList.remove('active');
        });
    }
});

// ============================================
// FULLSCREEN IMAGE FUNCTIONALITY - Works for all modals
// ============================================

// Get all fullscreen overlays (each modal can have its own)
const fullscreenOverlays = document.querySelectorAll('.fullscreen-overlay');

// Setup expand buttons for all modals
document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Find the closest modal to get its fullscreen overlay
        const modal = this.closest('.project-modal');
        const overlay = modal ? modal.querySelector('.fullscreen-overlay') : document.querySelector('.fullscreen-overlay');
        
        if (overlay) {
            const img = this.closest('.dashboard-preview').querySelector('img');
            const fullscreenImage = overlay.querySelector('.fullscreen-image');
            
            if (img && fullscreenImage) {
                fullscreenImage.src = img.src;
                fullscreenImage.alt = img.alt || 'Fullscreen image';
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        }
    });
});

// Close fullscreen buttons for all overlays
document.querySelectorAll('.close-fullscreen').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const overlay = this.closest('.fullscreen-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = currentOpenModal ? 'hidden' : 'auto';
        }
    });
});

// Close fullscreen when clicking overlay background
document.querySelectorAll('.fullscreen-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = currentOpenModal ? 'hidden' : 'auto';
        }
    });
});

// ============================================
// VIDEO PLAYER FUNCTIONALITY - Works for all modals
// ============================================

function initializeVideoPlayers(modal = null) {
    const videos = modal ? 
        modal.querySelectorAll('.project-video') : 
        document.querySelectorAll('.project-video');
    
    videos.forEach(video => {
        // Remove existing listeners to prevent duplicates
        const newVideo = video.cloneNode(true);
        video.parentNode.replaceChild(newVideo, video);
        
        setupVideoPlayer(newVideo);
    });
}

function setupVideoPlayer(video) {
    const wrapper = video.closest('.video-wrapper');
    if (!wrapper) return;
    
    const playBtn = wrapper.querySelector('.video-play-btn');
    const loading = wrapper.querySelector('.video-loading');
    
    if (!playBtn) return;
    
    // Play button click
    playBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (video.paused) {
            if (loading) loading.classList.add('active');
            
            video.play()
                .then(() => {
                    if (loading) loading.classList.remove('active');
                    playBtn.style.opacity = '0';
                    playBtn.style.pointerEvents = 'none';
                })
                .catch(error => {
                    console.error('Video playback failed:', error);
                    if (loading) loading.classList.remove('active');
                });
        } else {
            video.pause();
        }
    });
    
    // Video events
    video.addEventListener('pause', () => {
        playBtn.style.opacity = '1';
        playBtn.style.pointerEvents = 'auto';
    });
    
    video.addEventListener('play', () => {
        playBtn.style.opacity = '0';
        playBtn.style.pointerEvents = 'none';
    });
    
    video.addEventListener('waiting', () => {
        if (loading) loading.classList.add('active');
    });
    
    video.addEventListener('canplay', () => {
        if (loading) loading.classList.remove('active');
    });
    
    video.addEventListener('ended', () => {
        playBtn.style.opacity = '1';
        playBtn.style.pointerEvents = 'auto';
    });
    
    // Error handling
    video.addEventListener('error', () => {
        console.error('Video error occurred');
        if (loading) loading.classList.remove('active');
        playBtn.style.opacity = '1';
        playBtn.style.pointerEvents = 'auto';
    });
}

// Initialize all video players on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeVideoPlayers();
});

// ============================================
// VIDEO CHAPTERS FUNCTIONALITY
// ============================================

document.querySelectorAll('.chapter-item').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const time = this.getAttribute('data-time');
        const modal = this.closest('.project-modal');
        const video = modal ? modal.querySelector('.project-video') : document.querySelector('.project-video');
        
        if (video && time) {
            video.currentTime = parseInt(time);
            video.play().catch(error => {
                console.log('Video playback requires user interaction first');
            });
        }
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Pause all videos in a specific modal
function pauseVideosInModal(modal) {
    if (!modal) return;
    
    const videos = modal.querySelectorAll('.project-video');
    videos.forEach(video => {
        if (!video.paused) {
            video.pause();
        }
    });
}

// Reset modal state when closed (optional)
function resetModalState(modal) {
    if (!modal) return;
    
    // Reset any forms, scroll positions, etc.
    const scrollableContent = modal.querySelector('.modal-body');
    if (scrollableContent) {
        scrollableContent.scrollTop = 0;
    }
    
    // Remove any active states
    const activeElements = modal.querySelectorAll('.active');
    activeElements.forEach(el => el.classList.remove('active'));
}

// Extend closeModal to include reset
const originalCloseModal = closeModal;
closeModal = function(modal) {
    originalCloseModal(modal);
    resetModalState(modal);
};

// ============================================
// THEME TOGGLE SUPPORT (if needed)
// ============================================

const themeToggle = document.querySelector('[data-theme-toggle]');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.dataset.theme;
        document.body.dataset.theme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Optional: Save preference to localStorage
        localStorage.setItem('theme', document.body.dataset.theme);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    }
}

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Hide all modals initially (in case any are visible)
    document.querySelectorAll('.project-modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Ensure body overflow is auto
    document.body.style.overflow = 'auto';
    
    console.log('Modal system initialized for all projects');
});

// ============================================
// DEBUGGING HELPER (remove in production)
// ============================================

function getCurrentModalInfo() {
    return {
        currentOpenModal: currentOpenModal ? currentOpenModal.id : null,
        modalCount: document.querySelectorAll('.project-modal').length,
        fullscreenActive: document.querySelector('.fullscreen-overlay.active') !== null
    };
}

// Expose useful functions globally
window.modalSystem = {
    openSuperstore: openSuperstoreModal,
    openRoadAccident: openRoadAccidentModal,
    openModal: openModal,
    closeCurrentModal: () => currentOpenModal && closeModal(currentOpenModal),
    getInfo: getCurrentModalInfo
};