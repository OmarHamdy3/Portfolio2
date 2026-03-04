// ================= MODAL SYSTEM - PRODUCTION READY =================
'use strict';

class ModalSystem {
    constructor() {
        this.activeModal = null;
        this.fullscreenOverlay = null;
        this.isFullscreenActive = false;
        this.videoPlayers = new Map();
        this.modalIds = {
            superstore: 'superstore-modal',
            roadAccident: 'road-accident-modal'
        };
        
        this.init();
    }
    
    init() {
        this.initProjectModals();
        this.initDashboardFullscreen();
        this.initVideoPlayers();
        this.initAccessibility();
        this.hideAllModalsOnLoad();
        this.initModalTriggers(); // Added this method
    }
    
    // Hide all modals initially
    hideAllModalsOnLoad() {
        document.querySelectorAll('.project-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
    
    // ================= NEW METHOD: Initialize all possible modal triggers =================
    initModalTriggers() {
        // Find all possible triggers that might open modals
        const triggers = document.querySelectorAll(
            '[data-modal], ' +
            '[data-modal-target], ' +
            '.open-modal, ' +
            '.view-case-study, ' +
            '.btn-view-case-study, ' +
            'a[href*="#road-accident-modal"], ' +
            'a[href*="#superstore-modal"]'
        );
        
        triggers.forEach(trigger => {
            // Remove any existing listeners to prevent duplicates
            trigger.removeEventListener('click', this.handleTriggerClick);
            
            // Add click handler
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get modal ID from various possible attributes
                let modalId = trigger.getAttribute('data-modal') || 
                             trigger.getAttribute('data-modal-target') ||
                             trigger.getAttribute('href')?.replace('#', '') ||
                             trigger.getAttribute('data-target');
                
                if (modalId) {
                    // Clean up modal ID (remove # if present)
                    modalId = modalId.replace('#', '');
                    
                    // Check if it's one of our known modals
                    if (modalId === 'road-accident-modal' || modalId === 'superstore-modal') {
                        this.openModal(modalId);
                    }
                }
            });
            
            // Keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    
                    let modalId = trigger.getAttribute('data-modal') || 
                                 trigger.getAttribute('data-modal-target') ||
                                 trigger.getAttribute('href')?.replace('#', '') ||
                                 trigger.getAttribute('data-target');
                    
                    if (modalId) {
                        modalId = modalId.replace('#', '');
                        if (modalId === 'road-accident-modal' || modalId === 'superstore-modal') {
                            this.openModal(modalId);
                        }
                    }
                }
            });
        });
        
        console.log('Modal triggers initialized');
    }
    
    // ================= PROJECT MODALS =================
    initProjectModals() {
        // Open Modal Handlers - Using data-modal attribute
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
            
            // Keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const modalId = trigger.getAttribute('data-modal');
                    this.openModal(modalId);
                }
            });
        });
        
        // Also handle legacy onclick attributes
        if (typeof window.openRoadAccidentModal === 'undefined') {
            window.openRoadAccidentModal = () => this.openRoadAccidentModal();
        }
        if (typeof window.openSuperstoreModal === 'undefined') {
            window.openSuperstoreModal = () => this.openSuperstoreModal();
        }
        
        // Close Modal Handlers - For X buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const modal = btn.closest('.project-modal');
                if (modal) this.closeModal(modal);
            });
        });
        
        // Close Modal Handlers - For Back to Portfolio buttons
        document.querySelectorAll('.close-modal-trigger, .btn-portfolio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = btn.closest('.project-modal');
                if (modal) this.closeModal(modal);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.activeModal && 
                e.target.classList.contains('project-modal')) {
                this.closeModal(this.activeModal);
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
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
        
        console.log(`Modal opened: ${modalId}`);
    }
    
    closeModal(modal) {
        if (!modal) return;
        
        // Pause all videos in modal
        modal.querySelectorAll('video').forEach(video => {
            video.pause();
            const playBtn = video.closest('.video-wrapper')?.querySelector('.video-play-btn');
            if (playBtn) {
                playBtn.style.opacity = '1';
                playBtn.style.pointerEvents = 'auto';
            }
        });
        
        // Hide modal
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
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
    
    // Specific open functions for backward compatibility
    openSuperstoreModal() {
        this.openModal(this.modalIds.superstore);
    }
    
    openRoadAccidentModal() {
        this.openModal(this.modalIds.roadAccident);
    }
    
    // ================= DASHBOARD FULLSCREEN FUNCTIONALITY =================
    initDashboardFullscreen() {
        // Create fullscreen overlay if it doesn't exist
        if (!this.fullscreenOverlay) {
            this.createFullscreenOverlay();
        }
        
        // Expand button handlers
        document.addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) {
                e.preventDefault();
                e.stopPropagation();
                const preview = expandBtn.closest('.dashboard-preview');
                if (!preview) return;
                
                const img = preview.querySelector('img.dashboard-image, img');
                if (img) {
                    this.openFullscreenImage(img.src, img.alt);
                }
            }
        });
        
        // Also handle direct image clicks if they have data-fullscreen attribute
        document.addEventListener('click', (e) => {
            const img = e.target.closest('img[data-fullscreen]');
            if (img) {
                e.preventDefault();
                e.stopPropagation();
                this.openFullscreenImage(img.src, img.alt);
            }
        });
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
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFullscreenImage();
        });
        
        // Close on background click
        this.fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === this.fullscreenOverlay) {
                this.closeFullscreenImage();
            }
        });
        
        // Close on Escape key when fullscreen is active
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
        document.body.style.overflow = this.activeModal ? 'hidden' : 'auto';
        
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
        const videos = modal.querySelectorAll('.project-video');
        videos.forEach(video => this.initSingleVideo(video));
    }
    
    initSingleVideo(video) {
        if (this.videoPlayers.has(video)) return;
        
        const wrapper = video.closest('.video-wrapper');
        if (!wrapper) return;
        
        const playBtn = wrapper.querySelector('.video-play-btn');
        const loadingOverlay = wrapper.querySelector('.video-loading');
        
        // Store video instance
        this.videoPlayers.set(video, {
            wrapper,
            playBtn,
            loadingOverlay,
            isPlaying: false
        });
        
        // Ensure no autoplay
        video.removeAttribute('autoplay');
        
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
        
        // Track play state
        video.addEventListener('play', () => {
            const data = this.videoPlayers.get(video);
            if (data) {
                data.isPlaying = true;
                if (data.playBtn) {
                    data.playBtn.style.opacity = '0';
                    data.playBtn.style.pointerEvents = 'none';
                }
            }
        });
        
        video.addEventListener('pause', () => {
            const data = this.videoPlayers.get(video);
            if (data) {
                data.isPlaying = false;
                if (data.playBtn) {
                    data.playBtn.style.opacity = '1';
                    data.playBtn.style.pointerEvents = 'auto';
                }
            }
        });
        
        video.addEventListener('ended', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.playBtn) {
                data.playBtn.style.opacity = '1';
                data.playBtn.style.pointerEvents = 'auto';
            }
        });
        
        // Error handling
        video.addEventListener('error', (e) => {
            console.error('Video error:', video.error);
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span>Video failed to load</span>
                `;
            }
        });
        
        // Keyboard controls
        video.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleVideoPlay(video);
            }
        });
        
        // Chapter navigation
        this.setupChapterNavigation(video);
    }
    
    toggleVideoPlay(video) {
        const data = this.videoPlayers.get(video);
        if (!data) return;
        
        if (video.paused) {
            video.play().catch(error => {
                console.warn('Video play failed:', error);
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
    
    setupChapterNavigation(video) {
        const section = video.closest('.video-section');
        if (!section) return;
        
        const chapterItems = section.querySelectorAll('.chapter-item');
        if (!chapterItems.length) return;
        
        // Chapter click handlers
        chapterItems.forEach(chapter => {
            chapter.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const time = chapter.getAttribute('data-time');
                if (time) {
                    video.currentTime = parseInt(time);
                    
                    // Play video if paused
                    if (video.paused) {
                        video.play();
                    }
                    
                    // Update active chapter
                    chapterItems.forEach(c => c.classList.remove('active'));
                    chapter.classList.add('active');
                }
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
            if (e.key === 'Tab' && this.isFullscreenActive && this.fullscreenOverlay) {
                this.trapFocus(e, this.fullscreenOverlay);
            }
        });
        
        // Add ARIA attributes to modals
        document.querySelectorAll('.project-modal').forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
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
        document.querySelectorAll('.project-modal').forEach(modal => {
            if (modal.style.display === 'block') {
                this.closeModal(modal);
            }
        });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal system
    modalSystem = new ModalSystem();
    
    console.log('Modal system initialized for all projects');
    
    // Expose globally for console access
    window.modalSystem = modalSystem;
    window.openSuperstoreModal = () => modalSystem.openSuperstoreModal();
    window.openRoadAccidentModal = () => modalSystem.openRoadAccidentModal();
    window.openModal = (modalId) => modalSystem.openModal(modalId);
    
    // Also attach to window for legacy onclick handlers
    window.openRoadAccidentModal = window.openRoadAccidentModal || (() => modalSystem.openRoadAccidentModal());
    window.openSuperstoreModal = window.openSuperstoreModal || (() => modalSystem.openSuperstoreModal());
});

// ================= ERROR HANDLING =================
window.addEventListener('error', function(e) {
    console.error('Modal System Error:', e.error);
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

// ================= EXPORT FOR MODULE USAGE =================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalSystem, modalSystem };
}