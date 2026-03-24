// ================= MODAL SYSTEM - FIXED VERSION =================
'use strict';

class ModalSystem {
    constructor() {
        this.activeModal = null;
        this.fullscreenOverlay = null;
        this.isFullscreenActive = false;
        this.videoPlayers = new Map();
        this.isInitialized = false;
        this.modalIds = {
            superstore: 'superstore-modal',
            roadAccident: 'road-accident-modal'
        };

        this.init();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.hideAllModalsImmediately();
        this.initModalTriggers();
        this.initProjectModals();
        this.initDashboardFullscreen();
        this.initVideoPlayers();
        this.initAccessibility();

        console.log('Modal system initialized successfully');
    }

    hideAllModalsImmediately() {
        const modals = document.querySelectorAll('.project-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.style.overflow = 'auto';
    }

    initModalTriggers() {
        const triggers = document.querySelectorAll(
            '[data-modal], [data-modal-target], .open-modal, .view-case-study, .btn-view-case-study'
        );

        triggers.forEach(trigger => {
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);

            newTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                let modalId = newTrigger.getAttribute('data-modal') ||
                              newTrigger.getAttribute('data-modal-target') ||
                              newTrigger.getAttribute('data-target');

                if (modalId) {
                    modalId = modalId.replace('#', '');
                    if (modalId === 'road-accident-modal' || modalId === 'superstore-modal') {
                        this.openModal(modalId);
                    }
                }
            });
        });
    }

    // ================= PROJECT MODALS =================
    initProjectModals() {
        document.querySelectorAll('.close-modal, .close-modal-trigger, .btn-portfolio').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = newBtn.closest('.project-modal');
                if (modal) this.closeModal(modal);
            });
        });

        document.addEventListener('click', (e) => {
            if (this.activeModal &&
                e.target.classList.contains('project-modal') &&
                !e.target.querySelector('.modal-content').contains(e.target)) {
                this.closeModal(this.activeModal);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    openModal(modalId) {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal with ID "${modalId}" not found`);
            return;
        }

        modal.style.display = 'none';
        modal.style.visibility = 'hidden';

        void modal.offsetHeight;

        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-hidden', 'false');

        document.body.style.overflow = 'hidden';
        this.activeModal = modal;

        this.initModalVideo(modal);

        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }

        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        console.log(`Modal opened: ${modalId}`);
    }

    closeModal(modal) {
        if (!modal) return;

        modal.querySelectorAll('video').forEach(video => {
            if (!video.paused) video.pause();
            const playBtn = video.closest('.video-wrapper')?.querySelector('.video-play-btn');
            if (playBtn) {
                playBtn.style.opacity = '1';
                playBtn.style.pointerEvents = 'auto';
            }
        });

        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');

        document.body.style.overflow = 'auto';

        if (this.activeModal === modal) {
            this.activeModal = null;
        }

        const trigger = document.querySelector(`[data-modal="${modal.id}"]`);
        if (trigger && trigger.focus) {
            setTimeout(() => trigger.focus(), 50);
        }
    }

    // ================= DASHBOARD FULLSCREEN =================
    initDashboardFullscreen() {
        if (!this.fullscreenOverlay) {
            this.createFullscreenOverlay();
        }

        document.body.addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) {
                e.preventDefault();
                e.stopPropagation();
                const preview = expandBtn.closest('.dashboard-preview');
                if (preview) {
                    const img = preview.querySelector('img.dashboard-image, img');
                    if (img && img.src) {
                        this.openFullscreenImage(img.src, img.alt);
                    }
                }
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

        const closeBtn = this.fullscreenOverlay.querySelector('.close-fullscreen');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFullscreenImage();
        });

        this.fullscreenOverlay.addEventListener('click', (e) => {
            if (e.target === this.fullscreenOverlay) {
                this.closeFullscreenImage();
            }
        });
    }

    openFullscreenImage(src, alt) {
        if (!this.fullscreenOverlay || !src) return;

        const fullscreenImg = this.fullscreenOverlay.querySelector('.fullscreen-image');
        fullscreenImg.src = src;
        fullscreenImg.alt = alt || 'Fullscreen dashboard preview';

        this.fullscreenOverlay.classList.add('active');
        this.isFullscreenActive = true;
        document.body.style.overflow = 'hidden';

        const closeBtn = this.fullscreenOverlay.querySelector('.close-fullscreen');
        setTimeout(() => closeBtn.focus(), 100);
    }

    closeFullscreenImage() {
        if (!this.fullscreenOverlay || !this.isFullscreenActive) return;

        this.fullscreenOverlay.classList.remove('active');
        this.isFullscreenActive = false;
        document.body.style.overflow = this.activeModal ? 'hidden' : 'auto';

        const fullscreenImg = this.fullscreenOverlay.querySelector('.fullscreen-image');
        if (fullscreenImg) fullscreenImg.src = '';
    }

    // ================= VIDEO PLAYER =================
    initVideoPlayers() {
        document.querySelectorAll('.project-video').forEach(video => {
            this.initSingleVideo(video);
        });
    }

    initModalVideo(modal) {
        const videos = modal.querySelectorAll('.project-video');
        videos.forEach(video => {
            if (!this.videoPlayers.has(video)) {
                this.initSingleVideo(video);
            }
        });
    }

    initSingleVideo(video) {
        if (this.videoPlayers.has(video)) return;

        const wrapper = video.closest('.video-wrapper');
        if (!wrapper) return;

        const playBtn = wrapper.querySelector('.video-play-btn');
        const loadingOverlay = wrapper.querySelector('.video-loading');

        this.videoPlayers.set(video, { wrapper, playBtn, loadingOverlay, isPlaying: false });

        video.removeAttribute('autoplay');
        video.preload = 'metadata';

        if (playBtn) {
            const newPlayBtn = playBtn.cloneNode(true);
            playBtn.parentNode.replaceChild(newPlayBtn, playBtn);

            newPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleVideoPlay(video);
            });

            this.videoPlayers.get(video).playBtn = newPlayBtn;
        }

        video.addEventListener('waiting', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.loadingOverlay) data.loadingOverlay.classList.add('active');
        });

        video.addEventListener('canplay', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.loadingOverlay) data.loadingOverlay.classList.remove('active');
        });

        video.addEventListener('play', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.playBtn) {
                data.playBtn.style.opacity = '0';
                data.playBtn.style.pointerEvents = 'none';
            }
        });

        video.addEventListener('pause', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.playBtn) {
                data.playBtn.style.opacity = '1';
                data.playBtn.style.pointerEvents = 'auto';
            }
        });

        video.addEventListener('ended', () => {
            const data = this.videoPlayers.get(video);
            if (data && data.playBtn) {
                data.playBtn.style.opacity = '1';
                data.playBtn.style.pointerEvents = 'auto';
            }
        });

        video.addEventListener('error', () => {
            console.warn('Video error:', video.error);
            const data = this.videoPlayers.get(video);
            if (data && data.loadingOverlay) {
                data.loadingOverlay.innerHTML = `
                    <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <span>Video failed to load</span>
                `;
            }
        });

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
                        if (data.playBtn) data.playBtn.innerHTML = '<i class="fas fa-play"></i>';
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

        chapterItems.forEach(chapter => {
            const newChapter = chapter.cloneNode(true);
            chapter.parentNode.replaceChild(newChapter, chapter);

            newChapter.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const time = newChapter.getAttribute('data-time');
                if (time && video) {
                    video.currentTime = parseInt(time);
                    if (video.paused) video.play();

                    section.querySelectorAll('.chapter-item').forEach(c => c.classList.remove('active'));
                    newChapter.classList.add('active');
                }
            });
        });
    }

    // ================= ACCESSIBILITY =================
    initAccessibility() {
        document.querySelectorAll('.project-modal').forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeModal) {
                this.trapFocus(e, this.activeModal);
            }
            if (e.key === 'Tab' && this.isFullscreenActive && this.fullscreenOverlay) {
                this.trapFocus(e, this.fullscreenOverlay);
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement  = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); }
        } else {
            if (document.activeElement === lastElement)  { firstElement.focus(); e.preventDefault(); }
        }
    }

    handleEscapeKey() {
        if (this.isFullscreenActive) {
            this.closeFullscreenImage();
        } else if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    // ================= PUBLIC API =================
    open(modalId) { this.openModal(modalId); }

    close() {
        if (this.activeModal) this.closeModal(this.activeModal);
    }

    destroy() {
        this.videoPlayers.forEach((data, video) => { if (video.pause) video.pause(); });
        this.videoPlayers.clear();

        if (this.fullscreenOverlay && this.fullscreenOverlay.parentNode) {
            this.fullscreenOverlay.parentNode.removeChild(this.fullscreenOverlay);
        }

        this.activeModal       = null;
        this.fullscreenOverlay = null;
        this.isFullscreenActive = false;
        this.isInitialized      = false;
    }
}

// ================= INITIALIZATION =================
let modalSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!modalSystem) {
        modalSystem = new ModalSystem();
        window.modalSystem = modalSystem;

        window.openRoadAccidentModal = function () {
            if (modalSystem) modalSystem.openModal('road-accident-modal');
        };

        window.openSuperstoreModal = function () {
            if (modalSystem) modalSystem.openModal('superstore-modal');
        };

        console.log('Modal system ready');
    }
});

window.addEventListener('beforeunload', () => {
    if (modalSystem) modalSystem.destroy();
});