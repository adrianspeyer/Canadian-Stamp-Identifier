// Canadian Stamp Identifier - Platform Optimized Version
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
        
        // Platform detection and adaptive settings
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        this.isTouch = 'ontouchstart' in window;
        
        // ADAPTIVE RENDERING: Fast on desktop, safe on mobile
        if (this.isMobile) {
            // Mobile: Progressive rendering to prevent crashes
            this.renderMode = 'progressive';
            this.batchSize = 8;
            this.renderDelay = 75;
            this.maxConcurrentImages = 1;
            this.maxCacheSize = 25;
            this.viewportBuffer = 150;
        } else {
            // Desktop: Fast batch rendering like original
            this.renderMode = 'batch';
            this.batchSize = 30;
            this.renderDelay = 10;
            this.maxConcurrentImages = 6;
            this.maxCacheSize = 200;
            this.viewportBuffer = 500;
        }
        
        // Rendering state
        this.renderQueue = [];
        this.isRendering = false;
        this.renderedCount = 0;
        
        // Image handling
        this.imageCache = new Map();
        this.loadingImages = new Set();
        this.currentLoads = 0;
        
        // Observers
        this.viewportObserver = null;
        this.lazyLoadObserver = null;
        
        // Throttled functions
        this.throttledUpdateTransform = this.throttle(this.updateTransform.bind(this), this.isMobile ? 33 : 16);
        this.throttledUpdateMiniMap = this.throttle(this.updateMiniMap.bind(this), this.isMobile ? 200 : 100);
        
        this.stampGrid = document.getElementById('stampGrid');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.searchInput = document.getElementById('searchInput');
        this.timelineCanvas = document.getElementById('mainTimelineCanvas');
        
        this.init();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    async init() {
        try {
            console.log(`Initializing stamp app - Platform: ${this.isMobile ? 'MOBILE' : 'DESKTOP'}, Render mode: ${this.renderMode}`);
            
            this.setupMobileOptimizations();
            this.setupViewportObserver();
            this.setupLazyLoading();
            await this.loadStamps();
            this.renderStampsAdaptive(); // Adaptive rendering based on platform
            this.setupEventListeners();
            this.createNavigationControls();
            this.setupTimelineInteraction();
            this.startPreloadingImages();
            
            if (!this.isMobile) {
                setTimeout(() => this.setupDraggableSearch(), 100);
            }
            
            this.updateTransform();
            console.log('Initialization complete');
        } catch (error) {
            console.error('Failed to initialize:', error);
            document.getElementById('loadingMessage').textContent = 'Failed to load stamps. Please check that data/stamps.json exists.';
        }
    }
    
    setupMobileOptimizations() {
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            
            // Memory monitoring only on mobile
            this.memoryCheckInterval = setInterval(() => {
                if (this.imageCache.size > this.maxCacheSize * 0.8) {
                    this.emergencyImageCleanup();
                }
            }, 5000);
        }
    }
    
    emergencyImageCleanup() {
        if (!this.isMobile) return;
        
        console.log('Emergency image cleanup triggered');
        
        const stampElements = this.stampGrid.querySelectorAll('.stamp');
        const viewportHeight = window.innerHeight;
        let cleanedCount = 0;
        
        stampElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVeryFar = rect.bottom < -viewportHeight * 2 || rect.top > viewportHeight * 3;
            
            if (isVeryFar) {
                const img = element.querySelector('img');
                if (img && img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                    img.src = this.getPlaceholderSrc();
                    img.classList.add('lazy-load');
                    cleanedCount++;
                }
            }
        });
        
        // Clean cache
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
        
        console.log(`Emergency cleanup: unloaded ${cleanedCount} images, cache size: ${this.imageCache.size}`);
    }
    
    async loadStamps() {
        try {
            const cacheBust = location.hostname === 'localhost' ? `?v=${Date.now()}` : '';
            
            const response = await fetch(`data/stamps.json${cacheBust}`, {
                headers: { 'Accept': 'application/json', 'Cache-Control': 'public, max-age=3600' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.stamps = data.stamps || [];
            
            this.stamps.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return parseInt(a.id) - parseInt(b.id);
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
                stamp.mainTopic || '', stamp.subTopic || '', stamp.color || '',
                stamp.denomination || '', stamp.notes || '', stamp.year?.toString() || '', stamp.id || ''
            ];
            stamp._searchText = searchableFields.join(' ').toLowerCase();
        });
    }
    
    // ADAPTIVE RENDERING: Choose rendering method based on platform
    renderStampsAdaptive() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        if (this.renderMode === 'progressive') {
            this.renderStampsProgressive(); // Mobile: Safe progressive rendering
        } else {
            this.renderStampsBatch(); // Desktop: Fast batch rendering
        }
        
        const stampCountEl = document.getElementById('stampCount');
        if (stampCountEl) {
            stampCountEl.textContent = this.stamps.length;
        }
    }
    
    // DESKTOP: Fast batch rendering (like original)
    renderStampsBatch() {
        console.log(`Fast batch rendering ${this.stamps.length} stamps for desktop`);
        
        this.renderQueue = [...this.stamps];
        this.renderedDecades = new Set();
        this.scheduleBatchRender();
    }
    
    scheduleBatchRender() {
        if (this.isRendering || this.renderQueue.length === 0) {
            if (this.renderQueue.length === 0) {
                console.log('Batch rendering complete');
                this.updateMiniMap();
            }
            return;
        }
        
        this.isRendering = true;
        
        const renderBatch = () => {
            const startTime = performance.now();
            
            // Desktop: Render much larger batches continuously
            for (let i = 0; i < this.batchSize && this.renderQueue.length > 0; i++) {
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
            
            // Desktop: Keep rendering aggressively until done
            if (this.renderQueue.length > 0 && (performance.now() - startTime) < 50) {
                renderBatch(); // Continue immediately if under 50ms
            } else if (this.renderQueue.length > 0) {
                // Very short delay on desktop
                setTimeout(() => {
                    this.isRendering = false;
                    this.scheduleBatchRender();
                }, this.renderDelay);
            } else {
                this.isRendering = false;
                console.log('Batch rendering complete');
                this.updateMiniMap();
            }
        };
        
        // Start immediately on desktop
        renderBatch();
    }
    
    // MOBILE: Progressive rendering to prevent crashes
    renderStampsProgressive() {
        console.log(`Progressive rendering ${this.stamps.length} stamps for mobile`);
        
        // Show loading message on mobile only
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'progressive-loading';
        loadingDiv.textContent = 'Loading stamps...';
        loadingDiv.style.cssText = 'color: white; text-align: center; padding: 20px; font-size: 16px;';
        this.stampGrid.appendChild(loadingDiv);
        
        this.renderQueue = [...this.stamps];
        this.renderedDecades = new Set();
        this.renderedCount = 0;
        this.scheduleProgressiveRender();
    }
    
    scheduleProgressiveRender() {
        if (this.isRendering || this.renderQueue.length === 0) {
            if (this.renderQueue.length === 0) {
                const loadingDiv = document.getElementById('progressive-loading');
                if (loadingDiv) loadingDiv.remove();
                console.log('Progressive rendering complete');
                this.updateMiniMap();
            }
            return;
        }
        
        this.isRendering = true;
        
        setTimeout(() => {
            this.renderProgressiveBatch();
        }, this.renderDelay);
    }
    
    renderProgressiveBatch() {
        try {
            for (let i = 0; i < this.batchSize && this.renderQueue.length > 0; i++) {
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
                
                this.renderedCount++;
            }
            
            // Update loading message
            const loadingDiv = document.getElementById('progressive-loading');
            if (loadingDiv) {
                loadingDiv.textContent = `Loading stamps... ${this.renderedCount}/${this.stamps.length}`;
            }
            
            this.isRendering = false;
            
            if (this.renderQueue.length > 0) {
                this.scheduleProgressiveRender();
            } else {
                if (loadingDiv) loadingDiv.remove();
                this.updateMiniMap();
            }
            
        } catch (error) {
            console.error('Error in progressive rendering:', error);
            this.isRendering = false;
        }
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
    
    setupViewportObserver() {
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const stampElement = entry.target;
                
                if (entry.isIntersecting) {
                    this.loadImageIfNeeded(stampElement);
                } else {
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
        if (!realSrc || img.src === realSrc) return;
        
        if (this.imageCache.has(realSrc)) {
            const cachedSrc = this.imageCache.get(realSrc);
            if (cachedSrc && cachedSrc.startsWith('blob:')) {
                img.src = cachedSrc;
                img.classList.remove('lazy-load');
                return;
            }
        }
        
        // Limit queue size on mobile
        if (this.isMobile && this.loadingImages.size > 5) {
            return;
        }
        
        if (this.loadingImages.has(img) || this.currentLoads >= this.maxConcurrentImages) {
            return;
        }
        
        this.loadingImages.add(img);
        this.currentLoads++;
        
        this.loadImage(realSrc)
            .then(objectUrl => {
                if (this.imageCache.size < this.maxCacheSize) {
                    this.imageCache.set(realSrc, objectUrl);
                }
                
                if (img && img.dataset.src === realSrc) {
                    img.src = objectUrl;
                    img.classList.remove('lazy-load');
                    if (this.lazyLoadObserver) {
                        this.lazyLoadObserver.unobserve(img);
                    }
                }
            })
            .catch(() => {
                if (img) {
                    this.showImagePlaceholder(img);
                }
            })
            .finally(() => {
                this.loadingImages.delete(img);
                this.currentLoads--;
                setTimeout(() => this.processImageQueue(), this.isMobile ? 100 : 10);
            });
    }
    
    loadImageIfNeeded(stampElement) {
        const img = stampElement.querySelector('img[data-src]');
        if (img) {
            this.prioritizeImageLoad(img);
        }
    }
    
    startPreloadingImages() {
        const maxInitialImages = this.isMobile ? 10 : 50;
        const visibleImages = Array.from(document.querySelectorAll('.stamp img[data-src]'))
            .slice(0, maxInitialImages);
        
        visibleImages.forEach(img => {
            const realSrc = img.dataset.src;
            if (realSrc) {
                setTimeout(() => this.prioritizeImageLoad(img), Math.random() * 1000);
            }
        });
    }
    
    processImageQueue() {
        // This method exists for compatibility but actual processing is handled in prioritizeImageLoad
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            fetch(src, {
                headers: { 'Cache-Control': 'public, max-age=86400' },
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(timeoutId);
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
                
                if (!stampElement.querySelector('.placeholder-text')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'placeholder-text';
                    placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 80%; font-size: 10px; text-align: center; padding: 5px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);';
                    placeholder.textContent = stamp.mainTopic;
                    stampElement.appendChild(placeholder);
                }
            }
        }
    }
    
    unloadImageIfFaraway(stampElement) {
        const img = stampElement.querySelector('img');
        if (img && img.src && img.src.startsWith('blob:')) {
            const rect = stampElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            const isFarAway = rect.bottom < -viewportHeight || rect.top > viewportHeight * 2;
            
            if (isFarAway) {
                URL.revokeObjectURL(img.src);
                img.src = this.getPlaceholderSrc();
                img.classList.add('lazy-load');
                
                if (this.lazyLoadObserver) {
                    this.lazyLoadObserver.observe(img);
                }
            }
        }
    }
    
    getPlaceholderSrc() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
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
        const colors = { 
            1850: 'linear-gradient(45deg, #8B4513, #A0522D)', 1860: 'linear-gradient(45deg, #4B0082, #6A5ACD)', 
            1870: 'linear-gradient(45deg, #2F4F4F, #708090)', 1880: 'linear-gradient(45deg, #8B0000, #DC143C)', 
            1890: 'linear-gradient(45deg, #006400, #32CD32)', 1900: 'linear-gradient(45deg, #B8860B, #DAA520)', 
            1910: 'linear-gradient(45deg, #800080, #9932CC)', 1920: 'linear-gradient(45deg, #2E8B57, #3CB371)', 
            1930: 'linear-gradient(45deg, #1E90FF, #4169E1)', 1940: 'linear-gradient(45deg, #B22222, #DC143C)', 
            1950: 'linear-gradient(45deg, #FF4500, #FF6347)', 1960: 'linear-gradient(45deg, #FF1493, #FF69B4)', 
            1970: 'linear-gradient(45deg, #00CED1, #20B2AA)', 1980: 'linear-gradient(45deg, #9370DB, #BA55D3)', 
            1990: 'linear-gradient(45deg, #228B22, #32CD32)', 2000: 'linear-gradient(45deg, #FF8C00, #FFA500)', 
            2010: 'linear-gradient(45deg, #4682B4, #5F9EA0)', 2020: 'linear-gradient(45deg, #DC143C, #FF1493)' 
        };
        return colors[decade] || 'linear-gradient(45deg, #666, #999)';
    }
    
    setupEventListeners() {
        if (this.isTouch) {
            this.canvasContainer.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
            this.canvasContainer.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
            this.canvasContainer.addEventListener('touchend', () => this.endDrag(), { passive: true });
        } else {
            this.canvasContainer.addEventListener('mousedown', (e) => this.startDrag(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.endDrag());
        }
        
        this.canvasContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeys(e));
        
        document.getElementById('stampModal')?.addEventListener('click', (e) => { 
            if (e.target.id === 'stampModal') this.closeModal(); 
        });
        
        document.querySelector('a[href="#about"]')?.addEventListener('click', (e) => { 
            e.preventDefault(); 
            this.showInfo('about'); 
        });
        
        document.querySelector('a[href="#contribute"]')?.addEventListener('click', (e) => { 
            e.preventDefault(); 
            this.showInfo('contribute'); 
        });
        
        document.querySelectorAll('.info-section').forEach(section => { 
            section.addEventListener('click', (e) => { 
                if (e.target === section) { 
                    section.style.display = 'none'; 
                } 
            }); 
        });
        
        document.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape') { 
                this.closeModal(); 
                document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none'); 
            } 
        });
    }
    
    createNavigationControls() {
        document.getElementById('mainNavUp')?.addEventListener('click', () => this.navigate(0, 100));
        document.getElementById('mainNavDown')?.addEventListener('click', () => this.navigate(0, -100));
        document.getElementById('mainNavLeft')?.addEventListener('click', () => this.navigate(100, 0));
        document.getElementById('mainNavRight')?.addEventListener('click', () => this.navigate(-100, 0));
        document.getElementById('mainNavCenter')?.addEventListener('click', () => this.recenterCurrentView());
        
        const panToggle = document.getElementById('panModeToggle');
        if (panToggle) {
            panToggle.addEventListener('change', (e) => {
                this.panMode = e.target.checked;
                document.body.classList.toggle('pan-mode', this.panMode);
            });
        }
    }
    
    setupTimelineInteraction() {
        if (!this.timelineCanvas) return;

        let previewElement = document.createElement('div');
        previewElement.className = 'timeline-preview';
        this.timelineCanvas.appendChild(previewElement);

        if (!this.isMobile) {
            this.timelineCanvas.addEventListener('mousemove', (e) => {
                const rect = this.timelineCanvas.getBoundingClientRect();
                const hoverX = e.clientX - rect.left;
                const viewportWidthPercent = (this.canvasContainer.clientWidth / (this.stampGrid.scrollWidth * this.scale)) * 100;
                previewElement.style.display = 'block';
                previewElement.style.width = `${viewportWidthPercent}%`;
                previewElement.style.left = `${(hoverX / rect.width) * 100}%`;
            }, { passive: true });

            this.timelineCanvas.addEventListener('mouseleave', () => {
                previewElement.style.display = 'none';
            }, { passive: true });
        }

        this.timelineCanvas.addEventListener('click', (e) => {
            const rect = this.timelineCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickPercent = clickX / rect.width;
            const totalContentWidth = this.stampGrid.scrollWidth * this.scale;
            const visibleWidth = this.canvasContainer.clientWidth;
            this.translateX = -clickPercent * (totalContentWidth - visibleWidth);
            this.throttledUpdateTransform();
            this.throttledUpdateMiniMap();
        });
    }
    
    setupDraggableSearch() {
        if (this.isMobile) return;
        
        const searchBar = document.getElementById('searchBar');
        const dragHandle = searchBar?.querySelector('.drag-handle');
        if (!searchBar || !dragHandle) return;
        
        searchBar.style.top = '15px';
        searchBar.style.right = '20px';
        searchBar.style.left = 'auto';
        
        let isDragging = false, isResizing = false;
        let startX, startY, initialX, initialY, startWidth, startMouseX;
        
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.title = 'Drag to resize';
        searchBar.appendChild(resizeHandle);
        
        dragHandle.addEventListener('mousedown', (e) => { 
            isDragging = true; 
            searchBar.classList.add('dragging'); 
            startX = e.clientX; 
            startY = e.clientY; 
            initialX = searchBar.offsetLeft; 
            initialY = searchBar.offsetTop; 
            e.preventDefault(); 
            e.stopPropagation(); 
        });
        
        resizeHandle.addEventListener('mousedown', (e) => { 
            isResizing = true; 
            searchBar.classList.add('resizing'); 
            startMouseX = e.clientX; 
            startWidth = searchBar.offsetWidth; 
            e.preventDefault(); 
            e.stopPropagation(); 
        });
        
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
        
        document.addEventListener('mouseup', () => { 
            isDragging = false; 
            searchBar.classList.remove('dragging'); 
            isResizing = false; 
            searchBar.classList.remove('resizing'); 
        });
    }
    
    updateMiniMap() {
        const viewport = document.getElementById('mainTimelineViewport');
        if (!viewport) return;
        
        const container = this.canvasContainer;
        const grid = this.stampGrid;
        
        if (!container || !grid) return;
        
        const totalContentWidth = grid.scrollWidth * this.scale;
        const visibleWidth = container.clientWidth;
        
        const viewportLeftPercent = (-this.translateX / totalContentWidth) * 100;
        const viewportWidthPercent = (visibleWidth / totalContentWidth) * 100;
        
        viewport.style.left = `${Math.max(0, Math.min(100, viewportLeftPercent))}%`;
        viewport.style.width = `${Math.max(1, Math.min(100, viewportWidthPercent))}%`;
    }
    
    navigate(deltaX, deltaY) {
        this.translateX += deltaX;
        this.translateY += deltaY;
        this.throttledUpdateTransform();
        this.throttledUpdateMiniMap();
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
        
        this.throttledUpdateTransform();
        this.throttledUpdateMiniMap();
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
            this.throttledUpdateTransform();
            this.throttledUpdateMiniMap();
        }
    }
    
    updateTransform() {
        this.stampGrid.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        
        const scaleInfo = document.getElementById('scaleInfo');
        if (scaleInfo) {
            scaleInfo.textContent = Math.round(this.scale * 100) + '%';
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'Shift') { 
            this.isShiftPressed = true; 
            document.body.classList.add('pan-mode'); 
        }
        
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
        if (e.key === 'Shift') { 
            this.isShiftPressed = false; 
            if (!this.panMode) { 
                document.body.classList.remove('pan-mode'); 
            } 
        }
    }
    
    handleSearch(query) {
        this.clearSearchHighlights();
        
        if (!query.trim()) { 
            this.currentMatches = []; 
            this.updateSearchInfo(); 
            return; 
        }
        
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
        
        if (matches.length > 0) { 
            this.jumpToStamp(matches[0]); 
        }
        
        this.updateSearchInfo();
    }
    
    matchesSearchTerm(stamp, searchTerm) {
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        return searchWords.every(word => 
            (stamp._searchText || '').includes(word) || 
            this.fuzzyMatch(stamp._searchText, word)
        );
    }
    
    calculateRelevanceScore(stamp, searchTerm) {
        let score = 0;
        const searchWords = searchTerm.split(/\s+/).filter(w => w.length);
        
        searchWords.forEach(word => {
            if ((stamp.mainTopic || '').toLowerCase().includes(word)) {
                score += (stamp.mainTopic || '').toLowerCase() === word ? 100 : 50;
            }
            if ((stamp.subTopic || '').toLowerCase().includes(word)) {
                score += (stamp.subTopic || '').toLowerCase() === word ? 80 : 40;
            }
            if ((stamp.color || '').toLowerCase().includes(word)) score += 30;
            if ((stamp.denomination || '').toLowerCase().includes(word)) score += 25;
            if ((stamp.notes || '').toLowerCase().includes(word)) score += 20;
            if ((stamp.id || '').toLowerCase().includes(word)) score += 15;
            if (stamp.year?.toString().includes(word)) score += 10;
        });
        
        return score;
    }
    
    fuzzyMatch(text, word) {
        const synonyms = { 
            'red': ['crimson', 'scarlet'], 
            'blue': ['azure', 'navy'], 
            'green': ['emerald', 'forest'], 
            'queen': ['elizabeth', 'victoria'], 
            'king': ['george', 'edward'], 
            'cent': ['¢', 'cents'], 
            'dollar': ['$'] 
        };
        
        const wordVariations = [word, ...(synonyms[word] || [])];
        
        for (const [key, values] of Object.entries(synonyms)) { 
            if (values.includes(word) && text.includes(key)) return true; 
        }
        
        return wordVariations.some(variation => text.includes(variation));
    }
    
    handleSearchKeys(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.shiftKey ? this.previousMatch() : this.nextMatch();
        }
    }
    
    nextMatch() {
        if (this.currentMatches.length === 0) return;
        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentMatches.length;
        this.jumpToStamp(this.currentMatches[this.currentMatchIndex]);
        this.highlightMatches(); 
        this.updateSearchInfo();
    }
    
    previousMatch() {
        if (this.currentMatches.length === 0) return;
        this.currentMatchIndex = (this.currentMatchIndex - 1 + this.currentMatches.length) % this.currentMatches.length;
        this.jumpToStamp(this.currentMatches[this.currentMatchIndex]);
        this.highlightMatches(); 
        this.updateSearchInfo();
    }
    
    highlightMatches() {
        this.clearSearchHighlights();
        
        this.currentMatches.forEach((stamp, index) => {
            const element = document.querySelector(`[data-id="${stamp.id}"]`);
            if (element) { 
                element.classList.add(index === this.currentMatchIndex ? 'search-current' : 'search-match'); 
            }
        });
    }
    
    clearSearchHighlights() {
        document.querySelectorAll('.search-match, .search-current').forEach(el => { 
            el.classList.remove('search-match', 'search-current'); 
        });
    }
    
    updateSearchInfo() {
        const info = document.getElementById('searchInfo');
        if (!info) return;
        
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
        
        const stampX = (stampRect.left - gridRect.left) / this.scale;
        const stampY = (stampRect.top - gridRect.top) / this.scale;
        
        this.translateX = containerWidth/2 - (stampX * this.scale + (stampRect.width / 2));
        this.translateY = containerHeight/2 - (stampY * this.scale + (stampRect.height / 2));
        
        this.updateTransform();
        this.updateMiniMap();
        this.highlightMatches();
    }
    
    showStampDetails(stamp) {
        const modalElements = {
            id: document.getElementById('modalId'),
            year: document.getElementById('modalYear'),
            topic: document.getElementById('modalTopic'),
            denomination: document.getElementById('modalDenomination'),
            color: document.getElementById('modalColor'),
            notes: document.getElementById('modalNotes'),
            notesContainer: document.getElementById('modalNotesContainer'),
            title: document.getElementById('modalTitle'),
            image: document.getElementById('modalStampImage'),
            modal: document.getElementById('stampModal')
        };
        
        if (modalElements.id) modalElements.id.textContent = stamp.id;
        if (modalElements.year) modalElements.year.textContent = stamp.year;
        if (modalElements.topic) modalElements.topic.textContent = stamp.mainTopic + (stamp.subTopic ? ` - ${stamp.subTopic}` : '');
        if (modalElements.denomination) modalElements.denomination.textContent = stamp.denomination || 'N/A';
        if (modalElements.color) modalElements.color.textContent = stamp.color || 'N/A';
        
        if (modalElements.notesContainer) {
            if (stamp.notes && stamp.notes.trim()) { 
                if (modalElements.notes) modalElements.notes.textContent = stamp.notes; 
                modalElements.notesContainer.style.display = 'block'; 
            } else { 
                modalElements.notesContainer.style.display = 'none'; 
            }
        }
        
        if (modalElements.title) modalElements.title.textContent = `${stamp.year} - ${stamp.mainTopic}`;
        
        if (modalElements.image) {
            modalElements.image.src = stamp.image;
            modalElements.image.alt = `${stamp.year} ${stamp.mainTopic}`;
        }
        
        if (modalElements.modal) modalElements.modal.style.display = 'flex';
    }
    
    closeModal() { 
        const modal = document.getElementById('stampModal');
        if (modal) modal.style.display = 'none'; 
    }
    
    showInfo(sectionId) { 
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block'; 
    }
    
    jumpToEra(era) {
        const eraYears = { 
            '1900s': 1900, 
            '1930s': 1930, 
            '1960s': 1960, 
            '1990s': 1990, 
            '2020s': 2020 
        };
        
        const targetYear = eraYears[era];
        if (!targetYear) return;
        
        const stamp = this.stamps.find(s => s.year >= targetYear);
        if (stamp) { 
            this.jumpToStamp(stamp); 
        }
    }
    
    destroy() {
        // Clean up all blob URLs to prevent memory leaks
        this.imageCache.forEach(objectUrl => {
            if (objectUrl && objectUrl.startsWith('blob:')) {
                URL.revokeObjectURL(objectUrl);
            }
        });
        
        // Disconnect observers
        if (this.viewportObserver) this.viewportObserver.disconnect();
        if (this.lazyLoadObserver) this.lazyLoadObserver.disconnect();
        
        // Clear intervals
        if (this.memoryCheckInterval) clearInterval(this.memoryCheckInterval);
        
        // Clear collections
        this.imageCache.clear();
        this.loadingImages.clear();
        
        console.log('Stamp app destroyed and cleaned up');
    }
}

// Global zoom functions (called by buttons)
let stampApp;

function zoomIn() { 
    if (stampApp) { 
        stampApp.scale = Math.min(stampApp.scale * 1.5, 5); 
        stampApp.updateTransform(); 
        stampApp.updateMiniMap(); 
    } 
}

function zoomOut() { 
    if (stampApp) { 
        stampApp.scale = Math.max(stampApp.scale / 1.5, 0.1); 
        stampApp.updateTransform(); 
        stampApp.updateMiniMap(); 
    } 
}

function resetView() { 
    if (stampApp) stampApp.centerView(); 
}

function jumpToEra(era) { 
    if (stampApp) stampApp.jumpToEra(era); 
}

function closeModal() { 
    if (stampApp) stampApp.closeModal(); 
}

document.addEventListener('DOMContentLoaded', () => {
    stampApp = new StampIdentifier();
    
    window.addEventListener('load', () => { 
        if (stampApp && stampApp.setupDraggableSearch) {
            stampApp.setupDraggableSearch(); 
        }
    });
    
    window.addEventListener('beforeunload', () => { 
        if (stampApp && stampApp.destroy) {
            stampApp.destroy(); 
        }
    });
    
    // Add platform-specific CSS class
    if (stampApp && stampApp.isMobile) {
        document.body.classList.add('mobile-optimized');
    }
});