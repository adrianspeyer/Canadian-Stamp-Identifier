// js/app.js
// Canadian Stamp Identifier - With Mobile/Tablet Search + Pagination

class StampIdentifier {
    constructor() {
        this.stamps = [];
        this.scale = 0.3;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentMatches = [];
        this.currentMatchIndex = 0;
        this.renderedDecades = new Set();
        
        // Navigation state
        this.isShiftPressed = false;
        this.panMode = false;
        
        // --- KEY CHANGE: More robust Mobile + Tablet detection ---
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check for phones
        const isPhone = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Check for modern iPads (which identify as Mac)
        const isModernIPad = (
            navigator.platform === 'MacIntel' && 
            navigator.maxTouchPoints > 1 && 
            !window.MSStream // A check to exclude some Windows touch laptops
        );
        
        // Check for older iPads and other tablets
        const isTablet = /(ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk)|(trident.*rv:11.0A)/i.test(userAgent);
        
        // --- THIS IS THE FINAL UPDATED LINE ---
        // If it's a phone, OR any kind of tablet, OR a modern iPad,
        // OR the screen width is 1366px or less (catches 13" iPad Pro landscape)
        this.isMobile = isPhone || isTablet || isModernIPad || window.innerWidth <= 1366;
        
        this.isTouch = 'ontouchstart' in window;

        // --- NEW: Pagination State ---
        this.currentPage = 1;
        this.stampsPerPage = 30; // Show 30 stamps per page
        this.totalPages = 0;
        this.mobileViewMode = 'browse'; // 'browse' or 'search'
        
        // DESKTOP: Keep original fast settings
        this.viewportBuffer = 500;
        this.maxConcurrentLoads = 6;
        this.renderQueue = [];
        this.isRendering = false;
        
        // MOBILE: Add conservative image management only
        if (this.isMobile) {
            this.maxConcurrentLoads = 2; // Reduce concurrent loads
            this.maxCacheSize = 50; // Limit cache size
            this.viewportBuffer = 200; // Smaller viewport buffer
        }
        
        // Image preloading cache
        this.imageCache = new Map();
        this.preloadQueue = [];
        this.currentLoads = 0;
        
        // Intersection observer for viewport culling
        this.viewportObserver = null;
        this.lazyLoadObserver = null;
        
        // Desktop elements
        this.stampGrid = document.getElementById('stampGrid');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.searchInput = document.getElementById('searchInput');
        this.timelineCanvas = document.getElementById('mainTimelineCanvas');
        
        // Mobile elements
        this.mobileSearchInput = document.getElementById('mobile-search-input');
        this.mobileResultsContainer = document.getElementById('mobile-results');
        this.mobilePaginationControls = document.getElementById('mobile-pagination-controls');
        
        // This starts the app
        this.init();
    }
    
    // ---
    // === MODIFIED init() FUNCTION ===
    // This now acts as a "router", sending users to the correct experience.
    // ---
    async init() {
        try {
            // Load stamp data first, as both paths need it
            await this.loadStamps(); 
            
            if (this.isMobile) {
                // --- ADD THIS LINE ---
                document.body.classList.add('is-mobile-device');

                // --- MOBILE / TABLET PATH ---
                console.log("Initializing Mobile/Tablet (Search-First) Experience");
                
                // Calculate total pages
                this.totalPages = Math.ceil(this.stamps.length / this.stampsPerPage);

                // Render the first page
                this.renderMobilePage(1); 
                
                this.initMobileSearch(); 
                this.setupMobileEventListeners();
            } else {
                // --- ADD THIS LINE ---
                document.body.classList.add('is-desktop-device');

                // --- DESKTOP PATH ---
                console.log("Initializing Desktop (Visual-First) Experience");
                this.setupViewportObserver();
                this.setupLazyLoading();
                this.renderStampsVirtual(); // The heavy part, only on desktop
                this.setupDesktopEventListeners(); // The full desktop listeners
                this.createNavigationControls();
                this.setupTimelineInteraction();
                this.startPreloadingImages();
                
                setTimeout(() => {
                    this.setupDraggableSearch();
                }, 100);
                
                this.updateTransform();
            }
        } catch (error) {
            console.error('Failed to initialize:', error);
            if (this.isMobile) {
                 this.mobileResultsContainer.innerHTML = '<p class="info-text">Failed to load stamps. Please try again.</p>';
            } else {
                document.getElementById('loadingMessage').textContent = 'Failed to load stamps. Please check that data/stamps.json exists.';
            }
        }
    }

    // ---
    // === MODIFIED: initMobileSearch() ===
    // This now handles switching between 'browse' and 'search' modes.
    // ---
    initMobileSearch() {
        // Listen for search input
        this.mobileSearchInput.addEventListener('input', () => {
            const query = this.mobileSearchInput.value.toLowerCase().trim();

            if (query.length < 3) {
                 // If query is cleared and we were in search mode, go back to browse
                if (query.length === 0 && this.mobileViewMode === 'search') {
                     this.mobileViewMode = 'browse';
                     this.renderMobilePage(1); // Go back to page 1
                }
                return;
            }
            
            // --- ENTERING SEARCH MODE ---
            this.mobileViewMode = 'search';

            // Filter stamps using the *exact same* logic as desktop
            const results = this.stamps.filter(stamp => 
                (stamp._searchText || '').includes(query)
            );
            
            // Sort by relevance, same as desktop
            results.sort((a, b) => {
                const scoreA = this.calculateRelevanceScore(a, query);
                const scoreB = this.calculateRelevanceScore(b, query);
                if (scoreA !== scoreB) return scoreB - scoreA;
                
                const yearA = a.year || 0;
                const yearB = b.year || 0;
                if (yearA !== yearB) return yearA - yearB;
                
                const idA = (a.id || "0").toString();
                const idB = (b.id || "0").toString();
                return idA.localeCompare(idB, undefined, {numeric: true});
            });

            this.renderMobileResults(results); // Render just the search results
            this.renderPaginationControls(0, 0, 'search'); // Hide pagination controls
        });

        // Add click listener for showing details (delegated to the container)
        this.mobileResultsContainer.addEventListener('click', (e) => {
            const stampElement = e.target.closest('.mobile-stamp');
            if (!stampElement) return;

            const stampId = stampElement.dataset.id;
            const stampData = this.stamps.find(s => s.id === stampId);
            
            if (stampData) {
                // SUCCESS: No more fallback, this will work directly.
                this.showStampDetails(stampData);
            } else {
                console.error(`Could not find stamp data for ID: ${stampId}`);
            }
        });
    }

    // ---
    // === NEW FUNCTION: renderMobilePage() ===
    // This function handles rendering a specific "page" of stamps.
    // ---
    renderMobilePage(page) {
        if (page < 1 || page > this.totalPages) {
            return; // Page out of bounds
        }
        
        this.currentPage = page;
        this.mobileViewMode = 'browse'; // Ensure we are in browse mode

        // Calculate the slice of stamps to show
        // We show stamps in REVERSE chronological order (newest first)
        const totalStamps = this.stamps.length;
        const startIndex = totalStamps - (page * this.stampsPerPage);
        const endIndex = totalStamps - ((page - 1) * this.stampsPerPage);
        
        // Clamp values to be safe
        const safeStartIndex = Math.max(0, startIndex);
        const safeEndIndex = Math.min(totalStamps, endIndex);

        const pageStamps = this.stamps.slice(safeStartIndex, safeEndIndex).reverse();

        this.renderMobileResults(pageStamps);
        this.renderPaginationControls(this.currentPage, this.totalPages, 'browse');
        
        // Scroll to top of results
        this.mobileResultsContainer.scrollTop = 0;
    }

    // ---
    // === NEW FUNCTION: renderPaginationControls() ===
    // This function draws the "Next" and "Prev" buttons.
    // ---
    renderPaginationControls(currentPage, totalPages, mode) {
        if (mode === 'search' || totalPages <= 1) {
            this.mobilePaginationControls.innerHTML = ''; // Hide for search or if only one page
            return;
        }

        const canGoPrev = currentPage > 1;
        const canGoNext = currentPage < totalPages;

        this.mobilePaginationControls.innerHTML = `
            <button class="page-btn" id="page-prev" ${!canGoPrev ? 'disabled' : ''}>
                &larr; Previous
            </button>
            <span class="page-info">
                Page ${currentPage} of ${totalPages}
            </span>
            <button class="page-btn" id="page-next" ${!canGoNext ? 'disabled' : ''}>
                Next &rarr;
            </button>
        `;

        // Add event listeners to the new buttons
        document.getElementById('page-prev')?.addEventListener('click', () => {
            this.renderMobilePage(this.currentPage - 1);
        });
        
        document.getElementById('page-next')?.addEventListener('click', () => {
            this.renderMobilePage(this.currentPage + 1);
        });
    }


    // ---
    // === MODIFIED: renderMobileResults() ===
    // This function is now simpler and matches your "good" screenshot.
    // ---
    renderMobileResults(stamps) {
        if (!stamps || stamps.length === 0) {
            // Show a different message for search vs. browse
            if (this.mobileViewMode === 'search') {
                this.mobileResultsContainer.innerHTML = '<p class="info-text">No stamps found for your search.</p>';
            } else {
                this.mobileResultsContainer.innerHTML = '<p class="info-text">No stamps to display.</p>';
            }
            return;
        }

        // Create the HTML for each stamp
        this.mobileResultsContainer.innerHTML = stamps.map(stamp => {
            
            const hasImage = (stamp.image && stamp.image.trim().length > 0);
            const topic = stamp.mainTopic || 'Unknown';
            const year = stamp.year || 'N/A';
            const id = stamp.id || 'N/A';

            // IF an image exists, show it
            if (hasImage) {
                const safeImagePath = encodeURI(stamp.image);
                return `
                    <div class="mobile-stamp" data-id="${id}">
                        <img src="${safeImagePath}" 
                             alt="${topic}" 
                             loading="lazy">
                        
                        <div class="stamp-info-bottom">
                            <p class="stamp-title">${topic} (${year})</p>
                            <p class="stamp-id">#${id}</p>
                        </div>
                    </div>
                `;
            } else {
                // ELSE, show the placeholder from the start
                return `
                    <div class="mobile-stamp mobile-placeholder" data-id="${id}">
                        <div class="placeholder-text">
                            ${topic}
                        </div>
                        <p class="placeholder-soon">Coming Soon!</p> 
                    </div>
                `;
            }
        }).join('');
    }

    // ---
    // === MODIFIED: setupMobileEventListeners() ===
    // No longer needs the click handler, as it's part of initMobileSearch
    // ---
    setupMobileEventListeners() {
        // Modal closing listeners
        document.getElementById('stampModal').addEventListener('click', (e) => { 
            if (e.target.id === 'stampModal') this.closeModal(); 
        });
        
        document.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape') { 
                this.closeModal(); 
            } 
        });
    }


    // ===============================================
    //
    //  ALL YOUR EXISTING DESKTOP CODE IS BELOW
    //
    // ===============================================

    setupMobileOptimizations() {
        // This is no longer the primary mobile strategy,
        // but it doesn't hurt to leave it.
        document.body.classList.add('mobile-device');
        
        // Aggressive cleanup on mobile only
        this.cleanupInterval = setInterval(() => {
            this.aggressiveMobileCleanup();
        }, 3000);
    }
    
    aggressiveMobileCleanup() {
        if (!this.isMobile) return;
        if (!this.stampGrid) return; // Exit if grid doesn't exist
        
        // Clean up distant images more aggressively on mobile
        const stampElements = this.stampGrid.querySelectorAll('.stamp');
        const viewportHeight = window.innerHeight;
        let cleanedCount = 0;
        
        stampElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            // Mobile: More aggressive unloading (1 screen height vs 2)
            const isFarAway = rect.bottom < -viewportHeight || rect.top > viewportHeight * 2;
            
            if (isFarAway) {
                const img = element.querySelector('img');
                if (img && img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                    img.src = this.getPlaceholderSrc();
                    img.classList.add('lazy-load');
                    cleanedCount++;
                    
                    // Re-observe for lazy loading
                    if (this.lazyLoadObserver) {
                        this.lazyLoadObserver.observe(img);
                    }
                }
            }
        });
        
        // Limit cache size on mobile
        if (this.imageCache.size > this.maxCacheSize) {
            const entries = Array.from(this.imageCache.entries());
            const toDelete = entries.slice(0, Math.floor(entries.length / 3));
            
            toDelete.forEach(([key, value]) => {
                if (value && value.startsWith('blob:')) {
                    URL.revokeObjectURL(value);
                }
                this.imageCache.delete(key);
            });
        }
        
        if (cleanedCount > 0) {
            // console.log(`Mobile cleanup: unloaded ${cleanedCount} images, cache size: ${this.imageCache.size}`);
        }
    }
    
    createNavigationControls() {
        // Wire up navigation buttons
        document.getElementById('mainNavUp')?.addEventListener('click', () => this.navigate(0, 100));
        document.getElementById('mainNavDown')?.addEventListener('click', () => this.navigate(0, -100));
        document.getElementById('mainNavLeft')?.addEventListener('click', () => this.navigate(100, 0));
        document.getElementById('mainNavRight')?.addEventListener('click', () => this.navigate(-100, 0));
        document.getElementById('mainNavCenter')?.addEventListener('click', () => this.recenterCurrentView());
        
        // Wire up pan mode toggle
        const panToggle = document.getElementById('panModeToggle');
        if (panToggle) {
            panToggle.addEventListener('change', (e) => {
                this.panMode = e.target.checked;
                document.body.classList.toggle('pan-mode', this.panMode);
            });
        }
    }

    // Interactive Timeline (Mini-map) Logic
    setupTimelineInteraction() {
        if (!this.timelineCanvas) return;

        let previewElement = document.createElement('div');
        previewElement.className = 'timeline-preview';
        this.timelineCanvas.appendChild(previewElement);

        this.timelineCanvas.addEventListener('mousemove', (e) => {
            const rect = this.timelineCanvas.getBoundingClientRect();
            const hoverX = e.clientX - rect.left;
            
            // Ensure grid has dimensions
            if (!this.stampGrid || this.stampGrid.scrollWidth === 0) return;
            
            const viewportWidthPercent = (this.canvasContainer.clientWidth / (this.stampGrid.scrollWidth * this.scale)) * 100;

            previewElement.style.display = 'block';
            previewElement.style.width = `${viewportWidthPercent}%`;
            previewElement.style.left = `${(hoverX / rect.width) * 100}%`;
        });

        this.timelineCanvas.addEventListener('mouseleave', () => {
            previewElement.style.display = 'none';
        });

        this.timelineCanvas.addEventListener('click', (e) => {
            const rect = this.timelineCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickPercent = clickX / rect.width;

            // Ensure grid has dimensions
            if (!this.stampGrid || this.stampGrid.scrollWidth === 0) return;

            const totalContentWidth = this.stampGrid.scrollWidth * this.scale;
            const visibleWidth = this.canvasContainer.clientWidth;

            this.translateX = -clickPercent * (totalContentWidth - visibleWidth);
            
            this.updateTransform();
            this.updateMiniMap();
        });
    }
    
    updateMiniMap() {
        const viewport = document.getElementById('mainTimelineViewport');
        if (!viewport) return;
        
        const container = this.canvasContainer;
        const grid = this.stampGrid;
        
        if (!container || !grid || grid.scrollWidth === 0) return;
        
        const totalContentWidth = grid.scrollWidth * this.scale;
        const visibleWidth = container.clientWidth;
        
        // Prevent division by zero if totalContentWidth is 0
        if (totalContentWidth === 0) return;

        const viewportLeftPercent = (-this.translateX / totalContentWidth) * 100;
        const viewportWidthPercent = (visibleWidth / totalContentWidth) * 100;
        
        viewport.style.left = `${viewportLeftPercent}%`;
        viewport.style.width = `${viewportWidthPercent}%`;
    }
    
    navigate(deltaX, deltaY) {
        this.translateX += deltaX;
        this.translateY += deltaY;
        this.updateTransform();
        this.updateMiniMap();
    }
    
    centerView() {
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 0.3;
        this.updateTransform();
        this.updateMiniMap();
    }

    recenterCurrentView() {
        const viewportCenterX = this.canvasContainer.clientWidth / 2;
        const viewportCenterY = this.canvasContainer.clientHeight / 2;

        let closestStamp = null;
        let minDistance = Infinity;

        const stampElements = this.stampGrid.querySelectorAll('.stamp');
        stampElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { 
                const elementCenterX = rect.left + rect.width / 2;
                const elementCenterY = rect.top + rect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(elementCenterX - viewportCenterX, 2) +
                    Math.pow(elementCenterY - viewportCenterY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestStamp = element;
                }
            }
        });
        
        if (closestStamp) {
            const stampRect = closestStamp.getBoundingClientRect();
            const gridRect = this.stampGrid.getBoundingClientRect();
            
            const stampX = (stampRect.left - gridRect.left) / this.scale;
            const stampY = (stampRect.top - gridRect.top) / this.scale;
            
            this.translateX = viewportCenterX - (stampX * this.scale + (stampRect.width / 2 / this.scale) * this.scale);
            this.translateY = viewportCenterY - (stampY * this.scale + (stampRect.height / 2 / this.scale) * this.scale);
            
            this.updateTransform();
            this.updateMiniMap();
        }
    }
    
    async loadStamps() {
        try {
            const cacheBust = location.hostname === 'localhost' ? `?v=${Date.now()}` : '';
            
            const response = await fetch(`data/stamps.json${cacheBust}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.stamps = data.stamps || [];
            
            this.stamps.sort((a, b) => {
                const yearA = a.year || 0;
                const yearB = b.year || 0;
                if (yearA !== yearB) return yearA - yearB;
                
                // Use localeCompare for robust ID sorting (handles "100" vs "100a")
                const idA = (a.id || "0").toString();
                const idB = (b.id || "0").toString();
                return idA.localeCompare(idB, undefined, {numeric: true});
            });
            
            console.log(`Loaded ${this.stamps.length} stamps`);
            
            this.preprocessStampsForSearch();
            
        } catch (error) {
            console.error('Error loading stamps:', error);
            this.createSampleData();
        }
    }
    
    preprocessStampsForSearch() {
        this.stamps.forEach(stamp => {
            const searchableFields = [
                stamp.mainTopic || '',
                stamp.subTopic || '',
                stamp.color || '',
                stamp.denomination || '',
                stamp.notes || '',
                stamp.year?.toString() || '',
                stamp.id || ''
            ];
            stamp._searchText = searchableFields.join(' ').toLowerCase();
        });
    }
    
    setupViewportObserver() {
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const stampElement = entry.target;
                
                if (entry.isIntersecting) {
                    this.loadImageIfNeeded(stampElement);
                } else {
                    // Only unload on mobile
                    if (this.isMobile) {
                        this.unloadImageIfFaraway(stampElement);
                    }
                }
            });
        }, {
            rootMargin: `${this.viewportBuffer}px`,
            threshold: 0
        });
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.prioritizeImageLoad(img);
                    }
                });
            }, {
                rootMargin: this.isMobile ? '200px' : '400px',
                threshold: 0
            });
        }
    }
    
    prioritizeImageLoad(img) {
        const realSrc = img.dataset.src;
        if (!realSrc || (img.src && !img.src.startsWith('data:image'))) return;
        
        if (this.imageCache.has(realSrc)) {
            const cachedSrc = this.imageCache.get(realSrc);
            img.src = cachedSrc;
            img.classList.remove('lazy-load');
            if (this.lazyLoadObserver) {
                this.lazyLoadObserver.unobserve(img);
            }
            return;
        }
        
        this.preloadQueue.unshift({ img, src: realSrc, priority: 'high' });
        this.processImageQueue();
    }
    
    loadImageIfNeeded(stampElement) {
        const img = stampElement.querySelector('img[data-src]');
        if (img) {
            this.prioritizeImageLoad(img);
        }
    }
    
    startPreloadingImages() {
        const maxImages = this.isMobile ? 20 : 50;
        const visibleImages = Array.from(document.querySelectorAll('.stamp img[data-src]'))
            .slice(0, maxImages);
        
        visibleImages.forEach(img => {
            const realSrc = img.dataset.src;
            if (realSrc) {
                this.preloadQueue.push({ img, src: realSrc, priority: 'medium' });
            }
        });
        
        this.processImageQueue();
    }
    
    processImageQueue() {
        if (this.currentLoads >= this.maxConcurrentLoads || this.preloadQueue.length === 0) {
            return;
        }
        
        const item = this.preloadQueue.shift();
        this.currentLoads++;
        
        this.loadImage(item.src)
            .then(objectUrl => {
                this.imageCache.set(item.src, objectUrl);
                if (item.img && item.img.dataset.src === item.src) {
                    item.img.src = objectUrl;
                    item.img.classList.remove('lazy-load');
                    if (this.lazyLoadObserver) {
                        this.lazyLoadObserver.unobserve(item.img);
                    }
                }
            })
            .catch(() => {
                if (item.img) {
                    this.showImagePlaceholder(item.img);
                }
            })
            .finally(() => {
                this.currentLoads--;
                setTimeout(() => this.processImageQueue(), this.isMobile ? 50 : 10);
            });
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            fetch(encodeURI(src), { // Use encodeURI here
                headers: {
                    'Cache-Control': 'public, max-age=86400'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.blob();
            })
            .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                resolve(objectUrl);
            })
            .catch(reject);
        });
    }
    
    showImagePlaceholder(img) {
        const stampElement = img.closest('.stamp');
        if (stampElement) {
            const stamp = this.stamps.find(s => s.image === img.dataset.src);
            if (stamp) {
                img.style.display = 'none';
                stampElement.style.background = this.getColorForDecade(Math.floor(stamp.year / 10) * 10);
                stampElement.style.color = 'white';
                // Remove existing placeholder text if any
                const existingPlaceholder = stampElement.querySelector('.placeholder-text');
                if (existingPlaceholder) existingPlaceholder.remove();
                
                stampElement.innerHTML += `<div class="placeholder-text" style="display: flex; align-items: center; justify-content: center; height: 80%; font-size: 10px; text-align: center; padding: 5px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);">${stamp.mainTopic}</div>`;
            }
        }
    }
    
    unloadImageIfFaraway(stampElement) {
        const img = stampElement.querySelector('img');
        if (img && img.src && img.src.startsWith('blob:')) {
            const rect = stampElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Mobile: More aggressive unloading
            const threshold = this.isMobile ? 1 : 2;
            const isFarAway = rect.bottom < -viewportHeight * threshold || rect.top > viewportHeight * (threshold + 1);

            if (isFarAway) {
                URL.revokeObjectURL(img.src);
                img.src = this.getPlaceholderSrc();
                img.classList.add('lazy-load');
                
                // Re-observe for lazy loading if it scrolls back into view
                if (this.lazyLoadObserver) {
                    this.lazyLoadObserver.observe(img);
                }
            }
        }
    }
    
    getPlaceholderSrc() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
    }
    
    renderStampsVirtual() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        console.log(`Rendering ${this.stamps.length} stamps with virtual scrolling...`);
        
        this.renderQueue = [...this.stamps];
        this.renderedDecades = new Set();
        this.scheduleRender();
        
        document.getElementById('stampCount').textContent = this.stamps.length;
    }
    
    scheduleRender() {
        if (this.isRendering || this.renderQueue.length === 0) return;
        
        this.isRendering = true;
        
        const renderBatch = () => {
            const startTime = performance.now();
            const batchSize = 25; // Original batch size
            
            for (let i = 0; i < batchSize && this.renderQueue.length > 0; i++) {
                const stamp = this.renderQueue.shift();
                const decade = Math.floor(stamp.year / 10) * 10;
                
                if (!this.renderedDecades.has(decade)) {
                    const decadeMarker = document.createElement('div');
                    decadeMarker.className = 'decade-marker';
                    decadeMarker.textContent = `${decade}s`;
                    this.stampGrid.appendChild(decadeMarker);
                    this.renderedDecades.add(decade);
                }
                
                const stampElement = this.createStampElementOptimized(stamp, decade);
                this.stampGrid.appendChild(stampElement);
                
                if (this.viewportObserver) {
                    this.viewportObserver.observe(stampElement);
                }
            }
            
            // Original timing logic
            if (this.renderQueue.length > 0 && (performance.now() - startTime) < 16) {
                renderBatch();
            } else if (this.renderQueue.length > 0) {
                requestAnimationFrame(() => {
                    this.isRendering = false;
                    this.scheduleRender();
                });
            } else {
                this.isRendering = false;
                console.log('Rendering complete');
                this.updateMiniMap();
            }
        };
        
        requestAnimationFrame(renderBatch);
    }
    
    createStampElementOptimized(stamp, decade) {
        const stampElement = document.createElement('div');
        stampElement.className = 'stamp';
        
        Object.assign(stampElement.dataset, {
            id: stamp.id,
            year: stamp.year,
            topic: stamp.mainTopic.toLowerCase(),
            subtopic: (stamp.subTopic || '').toLowerCase(),
            color: (stamp.color || '').toLowerCase()
        });
        
        const img = document.createElement('img');
        img.src = this.getPlaceholderSrc();
        img.dataset.src = stamp.image;
        img.alt = `${stamp.year} ${stamp.mainTopic}`;
        img.className = 'lazy-load';
        img.loading = 'lazy';
        
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(img);
        }
        
        const info = document.createElement('div');
        info.className = 'stamp-info';
        info.textContent = `${stamp.id} ${stamp.year}`;
        
        stampElement.appendChild(img);
        stampElement.appendChild(info);
        
        stampElement.onclick = () => {
            if (!this.panMode && !this.isShiftPressed) {
                this.showStampDetails(stamp);
            }
        };
        
        return stampElement;
    }
    
    createSampleData() {
        console.log('Creating sample data...');
        this.stamps = [
            { id: "001", year: 1851, mainTopic: "Beaver", subTopic: "Three Pence", denomination: "3d", color: "red", image: "images/1850s/001-beaver-1851.jpg", notes: "First Canadian stamp" },
            { id: "002", year: 1852, mainTopic: "Prince Albert", subTopic: "Six Pence", denomination: "6d", color: "purple", image: "images/1850s/002-albert-1852.jpg", notes: "" },
            { id: "156", year: 1935, mainTopic: "Jacques Cartier", subTopic: "Explorer Series", denomination: "3¢", color: "brown", image: "images/1930s/156-cartier-1935.jpg", notes: "Part of historical series" }
        ];
        this.preprocessStampsForSearch();
    }
    
    getColorForDecade(decade) {
        const colors = { 1850: 'linear-gradient(45deg, #8B4513, #A0522D)', 1860: 'linear-gradient(45deg, #4B0082, #6A5ACD)', 1870: 'linear-gradient(45deg, #2F4F4F, #708090)', 1880: 'linear-gradient(45deg, #8B0000, #DC143C)', 1890: 'linear-gradient(45deg, #006400, #32CD32)', 1900: 'linear-gradient(45deg, #B8860B, #DAA520)', 1910: 'linear-gradient(45deg, #800080, #9932CC)', 1920: 'linear-gradient(45deg, #2E8B57, #3CB371)', 1930: 'linear-gradient(45deg, #1E90FF, #4169E1)', 1940: 'linear-gradient(45deg, #B22222, #DC143C)', 1950: 'linear-gradient(45deg, #FF4500, #FF6347)', 1960: 'linear-gradient(45deg, #FF1493, #FF69B4)', 1970: 'linear-gradient(45deg, #00CED1, #20B2AA)', 1980: 'linear-gradient(45deg, #9370DB, #BA55D3)', 1990: 'linear-gradient(45deg, #228B22, #32CD32)', 2000: 'linear-gradient(45deg, #FF8C00, #FFA500)', 2010: 'linear-gradient(45deg, #4682B4, #5F9EA0)', 2020: 'linear-gradient(45deg, #DC143C, #FF1493)' };
        return colors[decade] || 'linear-gradient(45deg, #666, #999)';
    }
    
    // This function is for DESKTOP listeners
    setupDesktopEventListeners() {
        this.canvasContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvasContainer.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        this.canvasContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeys(e));
        document.getElementById('stampModal').addEventListener('click', (e) => { if (e.target.id === 'stampModal') this.closeModal(); });
        const aboutLink = document.querySelector('a[href="#about"]');
        if (aboutLink) { aboutLink.addEventListener('click', (e) => { e.preventDefault(); this.showInfo('about'); }); }
        const contributeLink = document.querySelector('a[href="#contribute"]');
        if (contributeLink) { contributeLink.addEventListener('click', (e) => { e.preventDefault(); this.showInfo('contribute'); }); }
        document.querySelectorAll('.info-section').forEach(section => { section.addEventListener('click', (e) => { if (e.target === section) { section.style.display = 'none'; } }); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this.closeModal(); document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none'); } });
    }
    
    handleKeyDown(e) {
        if (e.key === 'Shift') { this.isShiftPressed = true; document.body.classList.add('pan-mode'); }
        if (!e.target.matches('input, textarea, select')) {
            const moveDistance = e.ctrlKey ? 200 : 100;
            switch(e.key) {
                case 'ArrowUp': e.preventDefault(); this.navigate(0, moveDistance); break;
                case 'ArrowDown': e.preventDefault(); this.navigate(0, -moveDistance); break;
                case 'ArrowLeft': e.preventDefault(); this.navigate(moveDistance, 0); break;
                case 'ArrowRight': e.preventDefault(); this.navigate(-moveDistance, 0); break;
                case 'Home': e.preventDefault(); this.centerView(); break;
            }
        }
    }
    
    handleKeyUp(e) {
        if (e.key === 'Shift') { this.isShiftPressed = false; if (!this.panMode) { document.body.classList.remove('pan-mode'); } }
    }
    
    setupDraggableSearch() {
        if (this.isMobile) return; // Skip draggable search on mobile
        
        const searchBar = document.getElementById('searchBar');
        const dragHandle = searchBar?.querySelector('.drag-handle');
        if (!searchBar || !dragHandle) { console.error('Search bar or drag handle not found!'); return; }
        searchBar.style.top = '15px';
        searchBar.style.right = '20px';
        searchBar.style.left = 'auto';
        let isDragging = false, isResizing = false;
        let startX, startY, initialX, initialY, startWidth, startMouseX;
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.title = 'Drag to resize';
        searchBar.appendChild(resizeHandle);
        dragHandle.addEventListener('mousedown', (e) => { isDragging = true; searchBar.classList.add('dragging'); startX = e.clientX; startY = e.clientY; initialX = searchBar.offsetLeft; initialY = searchBar.offsetTop; e.preventDefault(); e.stopPropagation(); });
        resizeHandle.addEventListener('mousedown', (e) => { isResizing = true; searchBar.classList.add('resizing'); startMouseX = e.clientX; startWidth = searchBar.offsetWidth; e.preventDefault(); e.stopPropagation(); });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newX = initialX + e.clientX - startX;
                const newY = initialY + e.clientY - startY;
                const maxX = window.innerWidth - searchBar.offsetWidth;
                const maxY = window.innerHeight - searchBar.offsetHeight;
                searchBar.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
                searchBar.style.top = `${Math.max(70, Math.min(newY, maxY))}px`;
                searchBar.style.right = 'auto';
            } else if (isResizing) {
                searchBar.style.width = `${Math.max(200, Math.min(600, startWidth + e.clientX - startMouseX))}px`;
            }
        });
        document.addEventListener('mouseup', () => { isDragging = false; searchBar.classList.remove('dragging'); isResizing = false; searchBar.classList.remove('resizing'); });
    }
    
    startDrag(e) {
        const isRightClick = e.button === 2;
        const shouldPan = isRightClick || this.panMode || this.isShiftPressed || !e.target.closest('.stamp');
        if (!shouldPan) return;
        if (e.cancelable) e.preventDefault();
        this.isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.canvasContainer.style.cursor = 'grabbing';
        document.body.classList.add('dragging');
    }
    
    drag(e) {
        if (!this.isDragging) return;
        if (e.cancelable) e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        this.translateX += touch.clientX - this.lastX;
        this.translateY += touch.clientY - this.lastY;
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.updateTransform();
        this.updateMiniMap();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.canvasContainer.style.cursor = this.panMode || this.isShiftPressed ? 'grab' : 'default';
        document.body.classList.remove('dragging');
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomSpeed = e.ctrlKey || e.metaKey ? 1.2 : 1.1;
        const zoomFactor = e.deltaY > 0 ? 1/zoomSpeed : zoomSpeed;
        const rect = this.canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const beforeZoomX = (mouseX - this.translateX) / this.scale;
        const beforeZoomY = (mouseY - this.translateY) / this.scale;
        const newScale = Math.max(0.1, Math.min(5, this.scale * zoomFactor));
        if (newScale !== this.scale) {
            this.scale = newScale;
            this.translateX = mouseX - (beforeZoomX * this.scale);
            this.translateY = mouseY - (beforeZoomY * this.scale);
            this.updateTransform();
            this.updateMiniMap();
        }
    }
    
    updateTransform() {
        if(this.isMobile) return; // Don't do this on mobile
        this.stampGrid.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        
        const scaleInfo = document.getElementById('scaleInfo');
        if (scaleInfo) {
            scaleInfo.textContent = Math.round(this.scale * 100) + '%';
        }
    }
    
    handleSearch(query) {
        this.clearSearchHighlights();
        if (!query.trim()) { this.currentMatches = []; this.updateSearchInfo(); return; }
        const searchTerm = query.toLowerCase().trim();
        let matches = [];
        const yearMatch = parseInt(query);
        if (!isNaN(yearMatch) && yearMatch >= 1800 && yearMatch <= 2030) {
            matches = this.stamps.filter(stamp => stamp.year === yearMatch);
        } else {
            matches = this.stamps.filter(stamp => this.matchesSearchTerm(stamp, searchTerm));
        }
        matches.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, searchTerm);
            const scoreB = this.calculateRelevanceScore(b, searchTerm);
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.year - b.year;
        });
        this.currentMatches = matches;
        this.currentMatchIndex = 0;
        this.highlightMatches();
        if (matches.length > 0) { this.jumpToStamp(matches[0]); }
        this.updateSearchInfo();
    }
    
    matchesSearchTerm(stamp, searchTerm) {
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        return searchWords.every(word => (stamp._searchText || '').includes(word) || this.fuzzyMatch(stamp._searchText, word));
    }
    
    calculateRelevanceScore(stamp, searchTerm) {
        let score = 0;
        const searchWords = searchTerm.split(/\s+/).filter(w => w.length);
        searchWords.forEach(word => {
            if ((stamp.mainTopic || '').toLowerCase().includes(word)) score += (stamp.mainTopic || '').toLowerCase() === word ? 100 : 50;
            if ((stamp.subTopic || '').toLowerCase().includes(word)) score += (stamp.subTopic || '').toLowerCase() === word ? 80 : 40;
            if ((stamp.color || '').toLowerCase().includes(word)) score += 30;
            if ((stamp.denomination || '').toLowerCase().includes(word)) score += 25;
            if ((stamp.notes || '').toLowerCase().includes(word)) score += 20;
            if ((stamp.id || '').toLowerCase().includes(word)) score += 15;
            if (stamp.year?.toString().includes(word)) score += 10;
        });
        return score;
    }
    
    fuzzyMatch(text, word) {
        const synonyms = { 'red':['crimson','scarlet'],'blue':['azure','navy'],'green':['emerald','forest'],'queen':['elizabeth','victoria'],'king':['george','edward'],'cent':['¢','cents'],'dollar':['$'] };
        const wordVariations = [word, ...(synonyms[word] || [])];
        for (const [key, values] of Object.entries(synonyms)) { if (values.includes(word) && text.includes(key)) return true; }
        return wordVariations.some(variation => text.includes(variation));
    }
    
    handleSearchKeys(e) {
        if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? this.previousMatch() : this.nextMatch(); }
    }
    
    nextMatch() {
        if (this.currentMatches.length === 0) return;
        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentMatches.length;
        this.jumpToStamp(this.currentMatches[this.currentMatchIndex]);
        this.highlightMatches(); this.updateSearchInfo();
    }
    
    previousMatch() {
        if (this.currentMatches.length === 0) return;
        this.currentMatchIndex = (this.currentMatchIndex - 1 + this.currentMatches.length) % this.currentMatches.length;
        this.jumpToStamp(this.currentMatches[this.currentMatchIndex]);
        this.highlightMatches(); this.updateSearchInfo();
    }
    
    highlightMatches() {
        this.clearSearchHighlights();
        this.currentMatches.forEach((stamp, index) => {
            const element = document.querySelector(`[data-id="${stamp.id}"]`);
            if (element) { element.classList.add(index === this.currentMatchIndex ? 'search-current' : 'search-match'); }
        });
    }
    
    clearSearchHighlights() {
        document.querySelectorAll('.search-match, .search-current').forEach(el => { el.classList.remove('search-match', 'search-current'); });
    }
    
    updateSearchInfo() {
        const info = document.getElementById('searchInfo');
        if(!info) return; // Exit if desktop search info isn't there
        if (this.currentMatches.length > 0) {
            info.textContent = `${this.currentMatchIndex + 1} of ${this.currentMatches.length}`;
            info.style.display = 'block';
        } else if (this.searchInput.value.trim()) {
            info.textContent = 'No matches found';
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    }
    
    jumpToStamp(stamp) {
        const element = document.querySelector(`[data-id="${stamp.id}"]`);
        if (!element) return;
        const containerWidth = this.canvasContainer.clientWidth;
        const containerHeight = this.canvasContainer.clientHeight;
        this.scale = Math.max(1, this.scale);
        const stampRect = element.getBoundingClientRect();
        const gridRect = this.stampGrid.getBoundingClientRect();
        
        // Check for valid rects
        if(!gridRect || gridRect.width === 0 || gridRect.height === 0) return;

        const stampX = (stampRect.left - gridRect.left) / this.scale;
        const stampY = (stampRect.top - gridRect.top) / this.scale;
        this.translateX = containerWidth/2 - (stampX * this.scale + (stampRect.width / 2));
        this.translateY = containerHeight/2 - (stampY * this.scale + (stampRect.height / 2));
        this.updateTransform();
        this.updateMiniMap();
        this.highlightMatches();
    }
    
    showStampDetails(stamp) {
        document.getElementById('modalId').textContent = stamp.id || 'N/A';
        document.getElementById('modalYear').textContent = stamp.year || 'N/A';
        document.getElementById('modalTopic').textContent = (stamp.mainTopic || 'N/A') + (stamp.subTopic ? ` - ${stamp.subTopic}` : '');
        document.getElementById('modalDenomination').textContent = stamp.denomination || 'N/A';
        document.getElementById('modalColor').textContent = stamp.color || 'N/A';
        const notesContainer = document.getElementById('modalNotesContainer');
        if (stamp.notes && stamp.notes.trim()) { document.getElementById('modalNotes').textContent = stamp.notes; notesContainer.style.display = 'block'; } else { notesContainer.style.display = 'none'; }
        document.getElementById('modalTitle').textContent = `${stamp.year || '----'} - ${stamp.mainTopic || 'Unknown Topic'}`;
        const modalImage = document.getElementById('modalStampImage');
        
        if (stamp.image && stamp.image.trim().length > 0) {
            modalImage.src = encodeURI(stamp.image);
            modalImage.alt = `${stamp.year} ${stamp.mainTopic}`;
            modalImage.style.display = 'block';
            modalImage.parentElement.style.display = 'flex'; // Show the frame
        } else {
            // Hide image if there isn't one
            modalImage.src = '';
            modalImage.alt = 'No image available';
            modalImage.style.display = 'none';
            modalImage.parentElement.style.display = 'none'; // Hide the frame
        }
        
        document.getElementById('stampModal').style.display = 'flex';
    }
    
    closeModal() { document.getElementById('stampModal').style.display = 'none'; }
    
    showInfo(sectionId) { document.getElementById(sectionId).style.display = 'block'; }
    
    jumpToEra(era) {
        const eraYears = { '1900s': 1900, '1930s': 1930, '1960s': 1960, '1990s': 1990, '2020s': 2020 };
        const targetYear = eraYears[era];
        if (!targetYear) return;
        const stamp = this.stamps.find(s => s.year >= targetYear);
        if (stamp) { this.jumpToStamp(stamp); }
    }
    
    destroy() {
        this.imageCache.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
        if (this.viewportObserver) this.viewportObserver.disconnect();
        if (this.lazyLoadObserver) this.lazyLoadObserver.disconnect();
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        this.preloadQueue = []; this.renderQueue = []; this.imageCache.clear();
    }
}

// Global zoom functions (called by buttons)
let stampApp;
function zoomIn() { if (stampApp) { stampApp.scale = Math.min(stampApp.scale * 1.5, 5); stampApp.updateTransform(); stampApp.updateMiniMap(); } }
function zoomOut() { if (stampApp) { stampApp.scale = Math.max(stampApp.scale / 1.5, 0.1); stampApp.updateTransform(); stampApp.updateMiniMap(); } }
function resetView() { if (stampApp) stampApp.centerView(); }
function jumpToEra(era) { if (stampApp) stampApp.jumpToEra(era); }
function closeModal() { if (stampApp) stampApp.closeModal(); }

document.addEventListener('DOMContentLoaded', () => {
    stampApp = new StampIdentifier();
    // We only set up desktop-specific listeners if we are NOT on mobile
    if (!stampApp.isMobile) {
        window.addEventListener('load', () => { if (stampApp && stampApp.setupDraggableSearch) stampApp.setupDraggableSearch(); });
    }
    window.addEventListener('beforeunload', () => { if (stampApp && stampApp.destroy) stampApp.destroy(); });
});