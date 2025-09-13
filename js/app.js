// Canadian Stamp Identifier - Mobile Fixed Version (Visual Browsing Preserved)
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
        
        // Mobile detection with better memory management
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        this.isTouch = 'ontouchstart' in window;
        
        // CRITICAL FIX: Prevent batch rendering on mobile
        this.maxBatchSize = this.isMobile ? 5 : 25; // Much smaller batches on mobile
        this.renderDelay = this.isMobile ? 50 : 16; // Slower rendering on mobile
        this.maxConcurrentImages = this.isMobile ? 1 : 3; // Only 1 image at a time on mobile
        
        // Progressive rendering state
        this.renderQueue = [];
        this.isRendering = false;
        this.renderedCount = 0;
        
        // Very conservative image handling
        this.imageCache = new Map();
        this.loadingImages = new Set();
        this.maxCacheSize = this.isMobile ? 30 : 100;
        
        // Intersection observer for smart unloading
        this.viewportObserver = null;
        this.unloadThreshold = this.isMobile ? 1 : 2; // More aggressive unloading on mobile
        
        // Throttled functions
        this.throttledUpdateTransform = this.throttle(this.updateTransform.bind(this), this.isMobile ? 50 : 16);
        
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
            console.log('Initializing mobile-safe stamp app:', this.isMobile ? 'MOBILE' : 'DESKTOP');
            
            this.setupMobileOptimizations();
            this.setupViewportObserver();
            await this.loadStamps();
            this.startProgressiveRendering(); // CHANGED: Progressive instead of batch
            this.setupEventListeners();
            this.createNavigationControls();
            this.setupTimelineInteraction();
            
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
            
            // Aggressive memory monitoring on mobile
            this.memoryCheckInterval = setInterval(() => {
                if (this.imageCache.size > this.maxCacheSize * 0.7) {
                    this.emergencyImageCleanup();
                }
            }, 3000);
            
            // Listen for memory pressure events
            if ('onmemorywarning' in window) {
                window.addEventListener('memorywarning', () => {
                    console.log('Memory warning detected - emergency cleanup');
                    this.emergencyImageCleanup();
                });
            }
        }
    }
    
    emergencyImageCleanup() {
        console.log('Emergency image cleanup triggered');
        
        // Get all images that are far from viewport
        const stampElements = this.stampGrid.querySelectorAll('.stamp');
        const viewportHeight = window.innerHeight;
        let cleanedCount = 0;
        
        stampElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const distanceFromViewport = Math.min(
                Math.abs(rect.bottom),
                Math.abs(rect.top - viewportHeight)
            );
            
            // If image is more than 2 screen heights away, unload it
            if (distanceFromViewport > viewportHeight * this.unloadThreshold) {
                const img = element.querySelector('img');
                if (img && img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                    img.src = this.getPlaceholderSrc();
                    cleanedCount++;
                }
            }
        });
        
        // Also clean the cache
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
    
    // CRITICAL CHANGE: Progressive rendering instead of batch rendering
    startProgressiveRendering() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        console.log(`Starting progressive rendering of ${this.stamps.length} stamps`);
        
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'progressive-loading';
        loadingDiv.textContent = 'Loading stamps...';
        loadingDiv.style.cssText = 'color: white; text-align: center; padding: 20px; font-size: 16px;';
        this.stampGrid.appendChild(loadingDiv);
        
        this.renderQueue = [...this.stamps];
        this.renderedDecades = new Set();
        this.renderedCount = 0;
        this.scheduleProgressiveRender();
        
        const stampCountEl = document.getElementById('stampCount');
        if (stampCountEl) {
            stampCountEl.textContent = this.stamps.length;
        }
    }
    
    scheduleProgressiveRender() {
        if (this.isRendering || this.renderQueue.length === 0) {
            if (this.renderQueue.length === 0) {
                // Remove loading message when done
                const loadingDiv = document.getElementById('progressive-loading');
                if (loadingDiv) loadingDiv.remove();
                console.log('Progressive rendering complete');
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
            const startTime = performance.now();
            
            for (let i = 0; i < this.maxBatchSize && this.renderQueue.length > 0; i++) {
                const stamp = this.renderQueue.shift();
                const decade = Math.floor(stamp.year / 10) * 10;
                
                // Add decade marker if needed
                if (!this.renderedDecades.has(decade)) {
                    const decadeMarker = document.createElement('div');
                    decadeMarker.className = 'decade-marker';
                    decadeMarker.textContent = `${decade}s`;
                    this.stampGrid.appendChild(decadeMarker);
                    this.renderedDecades.add(decade);
                }
                
                const stampElement = this.createStampElement(stamp);
                this.stampGrid.appendChild(stampElement);
                
                // Observe for viewport-based image loading
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
            
            // Continue rendering
            if (this.renderQueue.length > 0) {
                this.scheduleProgressiveRender();
            } else {
                // Rendering complete
                if (loadingDiv) loadingDiv.remove();
                this.updateMiniMap();
            }
            
        } catch (error) {
            console.error('Error in progressive rendering:', error);
            this.isRendering = false;
        }
    }
    
    setupViewportObserver() {
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const stampElement = entry.target;
                
                if (entry.isIntersecting) {
                    // Load image when stamp comes into view
                    this.loadImageForStamp(stampElement);
                } else {
                    // Unload image when stamp goes out of view (mobile only)
                    if (this.isMobile) {
                        this.unloadImageForStamp(stampElement);
                    }
                }
            });
        }, {
            rootMargin: this.isMobile ? '100px' : '300px',
            threshold: 0
        });
    }
    
    loadImageForStamp(stampElement) {
        const img = stampElement.querySelector('img[data-src]');
        if (!img || this.loadingImages.has(img)) return;
        
        const imageSrc = img.dataset.src;
        if (!imageSrc || img.src !== this.getPlaceholderSrc()) return;
        
        // Check if we already have it cached
        if (this.imageCache.has(imageSrc)) {
            img.src = this.imageCache.get(imageSrc);
            return;
        }
        
        // Limit concurrent image loads
        if (this.loadingImages.size >= this.maxConcurrentImages) return;
        
        this.loadingImages.add(img);
        
        fetch(imageSrc, {
            headers: { 'Cache-Control': 'public, max-age=86400' }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const objectUrl = URL.createObjectURL(blob);
            
            // Cache it (with size limit)
            if (this.imageCache.size < this.maxCacheSize) {
                this.imageCache.set(imageSrc, objectUrl);
            }
            
            // Set the image
            if (img.dataset.src === imageSrc) { // Make sure it's still the same image
                img.src = objectUrl;
                img.classList.remove('lazy-load');
            }
        })
        .catch(error => {
            console.log('Failed to load image:', imageSrc);
            this.showImagePlaceholder(img);
        })
        .finally(() => {
            this.loadingImages.delete(img);
        });
    }
    
    unloadImageForStamp(stampElement) {
        if (!this.isMobile) return;
        
        const img = stampElement.querySelector('img');
        if (img && img.src && img.src.startsWith('blob:') && img.src !== this.getPlaceholderSrc()) {
            // Check if it's far from viewport
            const rect = stampElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const isFarAway = rect.bottom < -viewportHeight || rect.top > viewportHeight * 2;
            
            if (isFarAway) {
                URL.revokeObjectURL(img.src);
                img.src = this.getPlaceholderSrc();
                img.classList.add('lazy-load');
            }
        }
    }
    
    createStampElement(stamp) {
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
        
        const info = document.createElement('div');
        info.className = 'stamp-info';
        info.textContent = `${stamp.id} ${stamp.year}`;
        
        stampElement.appendChild(img);
        stampElement.appendChild(info);
        
        // Click handler
        stampElement.addEventListener('click', (e) => {
            if (!this.panMode && !this.isShiftPressed && !this.isDragging) {
                e.preventDefault();
                this.showStampDetails(stamp);
            }
        });
        
        return stampElement;
    }
    
    showImagePlaceholder(img) {
        const stampElement = img.closest('.stamp');
        if (!stampElement) return;
        
        const stampId = stampElement.dataset.id;
        const stamp = this.stamps.find(s => s.id === stampId);
        if (!stamp) return;
        
        img.style.display = 'none';
        
        let placeholder = stampElement.querySelector('.placeholder-text');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'placeholder-text';
            placeholder.style.cssText = `
                display: flex; align-items: center; justify-content: center; 
                height: 80%; font-size: 10px; text-align: center; padding: 5px; 
                color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
                background: ${this.getColorForDecade(Math.floor(stamp.year / 10) * 10)};
            `;
            placeholder.textContent = stamp.mainTopic;
            stampElement.appendChild(placeholder);
        }
    }
    
    getPlaceholderSrc() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgODAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
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
            1850: '#8B4513', 1860: '#4B0082', 1870: '#2F4F4F', 1880: '#8B0000', 1890: '#006400',
            1900: '#B8860B', 1910: '#800080', 1920: '#2E8B57', 1930: '#1E90FF', 1940: '#B22222',
            1950: '#FF4500', 1960: '#FF1493', 1970: '#00CED1', 1980: '#9370DB', 1990: '#228B22',
            2000: '#FF8C00', 2010: '#4682B4', 2020: '#DC143C'
        };
        return colors[decade] || '#666';
    }
    
    setupEventListeners() {
        // Touch-optimized event handling
        if (this.isTouch) {
            this.canvasContainer.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
            this.canvasContainer.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
            this.canvasContainer.addEventListener('touchend', () => this.endDrag(), { passive: true });
        } else {
            this.canvasContainer.addEventListener('mousedown', (e) => this.startDrag(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.endDrag());
        }
        
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeys(e));
        
        // Modal and info handlers
        const stampModal = document.getElementById('stampModal');
        if (stampModal) {
            stampModal.addEventListener('click', (e) => { 
                if (e.target.id === 'stampModal') this.closeModal(); 
            });
        }
        
        const aboutLink = document.querySelector('a[href="#about"]');
        if (aboutLink) { 
            aboutLink.addEventListener('click', (e) => { 
                e.preventDefault(); 
                this.showInfo('about'); 
            }); 
        }
        
        const contributeLink = document.querySelector('a[href="#contribute"]');
        if (contributeLink) { 
            contributeLink.addEventListener('click', (e) => { 
                e.preventDefault(); 
                this.showInfo('contribute'); 
            }); 
        }
        
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
            this.updateMiniMap();
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
    
    startDrag(e) {
        const shouldPan = e.button === 2 || this.panMode || this.isShiftPressed || !e.target.closest('.stamp');
        if (!shouldPan) return;
        
        if (e.cancelable) e.preventDefault();
        
        this.isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        this.canvasContainer.style.cursor = 'grabbing';
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
        this.updateMiniMap();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.canvasContainer.style.cursor = this.panMode || this.isShiftPressed ? 'grab' : 'default';
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
            this.updateMiniMap();
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
    
    // Add mobile-specific CSS class
    if (stampApp && stampApp.isMobile) {
        document.body.classList.add('mobile-optimized');
    }
});