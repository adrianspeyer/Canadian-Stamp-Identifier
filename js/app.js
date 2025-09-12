// Canadian Stamp Identifier - Complete Optimized Application with Enhanced Navigation
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
        
        // Virtual scrolling/viewport culling
        this.viewportBuffer = 500; // pixels
        this.visibleStamps = new Set();
        this.renderQueue = [];
        this.isRendering = false;
        
        // Image preloading cache
        this.imageCache = new Map();
        this.preloadQueue = [];
        this.maxConcurrentLoads = 6; // Limit concurrent image loads
        this.currentLoads = 0;
        
        // Intersection observer for viewport culling
        this.viewportObserver = null;
        this.lazyLoadObserver = null;
        
        this.stampGrid = document.getElementById('stampGrid');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.searchInput = document.getElementById('searchInput');
        
        this.init();
    }
    
    async init() {
        try {
            this.setupViewportObserver();
            this.setupLazyLoading();
            await this.loadStamps();
            this.renderStampsVirtual();
            this.setupEventListeners();
            this.createNavigationControls();
            this.createMiniMap();
            this.startPreloadingImages();
            
            setTimeout(() => {
                this.setupDraggableSearch();
            }, 100);
            
            this.updateTransform();
        } catch (error) {
            console.error('Failed to initialize:', error);
            document.getElementById('loadingMessage').textContent = 'Failed to load stamps. Please check that data/stamps.json exists.';
        }
    }
    
    createNavigationControls() {
        // Create navigation control panel
        const navControls = document.createElement('div');
        navControls.id = 'navigationControls';
        navControls.className = 'navigation-controls';
        navControls.innerHTML = `
            <div class="nav-buttons">
                <button class="nav-btn" id="navUp" title="Move Up (Arrow Up)">↑</button>
                <div class="nav-row">
                    <button class="nav-btn" id="navLeft" title="Move Left (Arrow Left)">←</button>
                    <button class="nav-btn center-btn" id="navCenter" title="Center View">⌂</button>
                    <button class="nav-btn" id="navRight" title="Move Right (Arrow Right)">→</button>
                </div>
                <button class="nav-btn" id="navDown" title="Move Down (Arrow Down)">↓</button>
            </div>
            <div class="nav-options">
                <label class="nav-toggle">
                    <input type="checkbox" id="panModeToggle">
                    <span>Pan Mode (disable stamps)</span>
                </label>
                <div class="nav-help">
                    Hold Shift: Pan mode<br>
                    Arrow keys: Navigate<br>
                    Right-click: Pan
                </div>
            </div>
        `;
        
        // Add CSS styles
        const navStyles = document.createElement('style');
        navStyles.textContent = `
            .navigation-controls {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                backdrop-filter: blur(5px);
                font-family: system-ui, -apple-system, sans-serif;
            }
            
            .nav-buttons {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .nav-row {
                display: flex;
                gap: 5px;
            }
            
            .nav-btn {
                width: 32px;
                height: 32px;
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.2s;
            }
            
            .nav-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            .nav-btn:active {
                background: #dee2e6;
                transform: scale(0.95);
            }
            
            .center-btn {
                background: #007bff;
                color: white;
                border-color: #0056b3;
            }
            
            .center-btn:hover {
                background: #0056b3;
            }
            
            .nav-options {
                border-top: 1px solid #eee;
                padding-top: 10px;
            }
            
            .nav-toggle {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                cursor: pointer;
                margin-bottom: 8px;
            }
            
            .nav-help {
                font-size: 10px;
                color: #666;
                line-height: 1.3;
            }
            
            body.pan-mode .stamp {
                pointer-events: none !important;
            }
            
            body.pan-mode .canvas-container {
                cursor: grab !important;
            }
            
            body.pan-mode.dragging .canvas-container {
                cursor: grabbing !important;
            }
        `;
        document.head.appendChild(navStyles);
        document.body.appendChild(navControls);
        
        // Add event listeners
        document.getElementById('navUp').addEventListener('click', () => this.navigate(0, 100));
        document.getElementById('navDown').addEventListener('click', () => this.navigate(0, -100));
        document.getElementById('navLeft').addEventListener('click', () => this.navigate(100, 0));
        document.getElementById('navRight').addEventListener('click', () => this.navigate(-100, 0));
        document.getElementById('navCenter').addEventListener('click', () => this.centerView());
        
        document.getElementById('panModeToggle').addEventListener('change', (e) => {
            this.panMode = e.target.checked;
            document.body.classList.toggle('pan-mode', this.panMode);
        });
    }
    
    createMiniMap() {
        // Create minimap container
        const miniMap = document.createElement('div');
        miniMap.id = 'miniMap';
        miniMap.className = 'mini-map';
        miniMap.innerHTML = `
            <div class="mini-map-header">Timeline Overview</div>
            <div class="mini-map-canvas" id="miniMapCanvas">
                <div class="mini-map-viewport" id="miniMapViewport"></div>
                <div class="mini-map-decades" id="miniMapDecades"></div>
            </div>
        `;
        
        // Add minimap CSS
        const miniMapStyles = document.createElement('style');
        miniMapStyles.textContent = `
            .mini-map {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 200px;
                height: 120px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                backdrop-filter: blur(5px);
                overflow: hidden;
            }
            
            .mini-map-header {
                background: #f8f9fa;
                padding: 5px 10px;
                font-size: 11px;
                font-weight: 600;
                border-bottom: 1px solid #eee;
                color: #495057;
            }
            
            .mini-map-canvas {
                position: relative;
                width: 100%;
                height: 92px;
                cursor: pointer;
                overflow: hidden;
            }
            
            .mini-map-viewport {
                position: absolute;
                border: 2px solid #007bff;
                background: rgba(0, 123, 255, 0.1);
                pointer-events: none;
                z-index: 2;
            }
            
            .mini-map-decades {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, 
                    #8B4513 0%, #4B0082 10%, #2F4F4F 20%, #8B0000 30%, 
                    #006400 40%, #B8860B 50%, #800080 60%, #2E8B57 70%, 
                    #1E90FF 80%, #DC143C 90%, #FF1493 100%);
            }
        `;
        document.head.appendChild(miniMapStyles);
        document.body.appendChild(miniMap);
        
        // Add minimap click handler
        document.getElementById('miniMapCanvas').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const totalWidth = this.stamps.length * 120; // Approximate stamp width
            const targetX = -x * totalWidth + this.canvasContainer.clientWidth / 2;
            
            this.translateX = targetX;
            this.updateTransform();
            this.updateMiniMap();
        });
        
        this.updateMiniMap();
    }
    
    updateMiniMap() {
        const viewport = document.getElementById('miniMapViewport');
        if (!viewport) return;
        
        const container = this.canvasContainer;
        const grid = this.stampGrid;
        
        if (!container || !grid) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate approximate total content dimensions
        const totalStamps = this.stamps.length;
        const stampsPerRow = Math.floor(containerWidth / 120); // Approximate
        const totalRows = Math.ceil(totalStamps / stampsPerRow);
        const totalWidth = stampsPerRow * 120;
        const totalHeight = totalRows * 140;
        
        // Calculate viewport position and size relative to total content
        const viewportLeft = (-this.translateX) / (totalWidth * this.scale);
        const viewportTop = (-this.translateY) / (totalHeight * this.scale);
        const viewportWidth = containerWidth / (totalWidth * this.scale);
        const viewportHeight = containerHeight / (totalHeight * this.scale);
        
        // Update viewport indicator
        const miniMapCanvas = document.getElementById('miniMapCanvas');
        const canvasRect = miniMapCanvas.getBoundingClientRect();
        
        viewport.style.left = Math.max(0, Math.min(1, viewportLeft)) * 100 + '%';
        viewport.style.top = Math.max(0, Math.min(1, viewportTop)) * 100 + '%';
        viewport.style.width = Math.max(5, Math.min(100, viewportWidth * 100)) + '%';
        viewport.style.height = Math.max(5, Math.min(100, viewportHeight * 100)) + '%';
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
    
    async loadStamps() {
        try {
            // Add cache busting only in development
            const cacheBust = location.hostname === 'localhost' ? `?v=${Date.now()}` : '';
            
            const response = await fetch(`data/stamps.json${cacheBust}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.stamps = data.stamps || [];
            
            // Sort stamps by year and ID for proper chronological order
            this.stamps.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return parseInt(a.id) - parseInt(b.id);
            });
            
            console.log(`Loaded ${this.stamps.length} stamps`);
            
            // Preprocess stamps for faster searching
            this.preprocessStampsForSearch();
            
        } catch (error) {
            console.error('Error loading stamps:', error);
            this.createSampleData();
        }
    }
    
    preprocessStampsForSearch() {
        // Create searchable text once and cache it
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
        // Observer to track which stamps are in viewport
        this.viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const stampElement = entry.target;
                const stampId = stampElement.dataset.id;
                
                if (entry.isIntersecting) {
                    this.visibleStamps.add(stampId);
                    this.loadImageIfNeeded(stampElement);
                } else {
                    this.visibleStamps.delete(stampId);
                    // Optionally unload image to save memory
                    this.unloadImageIfFaraway(stampElement);
                }
            });
        }, {
            rootMargin: `${this.viewportBuffer}px`,
            threshold: 0
        });
    }
    
    setupLazyLoading() {
        // High-performance lazy loading with priority queue
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.prioritizeImageLoad(img);
                    }
                });
            }, {
                rootMargin: '400px', // Load images further out
                threshold: 0
            });
        }
    }
    
    prioritizeImageLoad(img) {
        const realSrc = img.dataset.src;
        if (!realSrc || img.src === realSrc) return;
        
        // Check cache first
        if (this.imageCache.has(realSrc)) {
            const cachedSrc = this.imageCache.get(realSrc);
            img.src = cachedSrc;
            img.classList.remove('lazy-load');
            return;
        }
        
        // Add to priority queue
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
        // Preload visible images first, then nearby ones
        const visibleImages = Array.from(document.querySelectorAll('.stamp img[data-src]'))
            .slice(0, 50); // Start with first 50
        
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
                // Handle error - show placeholder
                if (item.img) {
                    this.showImagePlaceholder(item.img);
                }
            })
            .finally(() => {
                this.currentLoads--;
                // Process next item
                setTimeout(() => this.processImageQueue(), 10);
            });
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            // Use fetch for better control and caching
            fetch(src, {
                headers: {
                    'Cache-Control': 'public, max-age=86400' // Cache for 1 day
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
                const decade = Math.floor(stamp.year / 10) * 10;
                img.style.display = 'none';
                stampElement.style.background = this.getColorForDecade(decade);
                stampElement.style.color = 'white';
                stampElement.innerHTML += `<div class="placeholder-text" style="display: flex; align-items: center; justify-content: center; height: 80%; font-size: 10px; text-align: center; padding: 5px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);">${stamp.mainTopic}</div>`;
            }
        }
    }
    
    unloadImageIfFaraway(stampElement) {
        // Unload images that are far from viewport to save memory
        const img = stampElement.querySelector('img');
        if (img && img.src && img.src.startsWith('blob:')) {
            const rect = stampElement.getBoundingClientRect();
            const viewportRect = this.canvasContainer.getBoundingClientRect();
            
            const distance = Math.min(
                Math.abs(rect.top - viewportRect.bottom),
                Math.abs(rect.bottom - viewportRect.top),
                Math.abs(rect.left - viewportRect.right),
                Math.abs(rect.right - viewportRect.left)
            );
            
            // Unload if more than 2000px away
            if (distance > 2000) {
                URL.revokeObjectURL(img.src);
                img.src = this.getPlaceholderSrc();
                img.classList.add('lazy-load');
            }
        }
    }
    
    getPlaceholderSrc() {
        // Optimized 1x1 SVG placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
    }
    
    renderStampsVirtual() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        console.log(`Rendering ${this.stamps.length} stamps with virtual scrolling...`);
        
        // Render in chunks using requestAnimationFrame for smooth performance
        this.renderQueue = [...this.stamps];
        this.renderedDecades = new Set();
        this.scheduleRender();
        
        // Update stamp count
        document.getElementById('stampCount').textContent = this.stamps.length;
    }
    
    scheduleRender() {
        if (this.isRendering || this.renderQueue.length === 0) return;
        
        this.isRendering = true;
        
        const renderBatch = () => {
            const startTime = performance.now();
            const batchSize = 25; // Smaller batches for smoother rendering
            
            for (let i = 0; i < batchSize && this.renderQueue.length > 0; i++) {
                const stamp = this.renderQueue.shift();
                const decade = Math.floor(stamp.year / 10) * 10;
                
                // Add decade marker if new decade
                if (!this.renderedDecades.has(decade)) {
                    const decadeMarker = document.createElement('div');
                    decadeMarker.className = 'decade-marker';
                    decadeMarker.textContent = `${decade}s`;
                    this.stampGrid.appendChild(decadeMarker);
                    this.renderedDecades.add(decade);
                }
                
                // Create stamp element
                const stampElement = this.createStampElementOptimized(stamp, decade);
                this.stampGrid.appendChild(stampElement);
                
                // Set up viewport observation
                if (this.viewportObserver) {
                    this.viewportObserver.observe(stampElement);
                }
            }
            
            // Continue rendering if there are more stamps and we haven't exceeded time budget
            if (this.renderQueue.length > 0 && (performance.now() - startTime) < 16) {
                // Continue in same frame if under 16ms (60fps budget)
                renderBatch();
            } else if (this.renderQueue.length > 0) {
                // Schedule next batch for next frame
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
        // Create stamp element with minimal DOM manipulation
        const stampElement = document.createElement('div');
        stampElement.className = 'stamp';
        
        // Use dataset for efficient attribute setting
        Object.assign(stampElement.dataset, {
            id: stamp.id,
            year: stamp.year,
            topic: stamp.mainTopic.toLowerCase(),
            subtopic: (stamp.subTopic || '').toLowerCase(),
            color: (stamp.color || '').toLowerCase()
        });
        
        // Create image element with optimized lazy loading
        const img = document.createElement('img');
        img.src = this.getPlaceholderSrc();
        img.dataset.src = stamp.image;
        img.alt = `${stamp.year} ${stamp.mainTopic}`;
        img.className = 'lazy-load';
        img.loading = 'lazy'; // Native lazy loading as fallback
        
        // Set up intersection observer for lazy loading
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(img);
        }
        
        // Create info element
        const info = document.createElement('div');
        info.className = 'stamp-info';
        info.textContent = `${stamp.id} ${stamp.year}`;
        
        stampElement.appendChild(img);
        stampElement.appendChild(info);
        
        // Add click handler (will be disabled in pan mode)
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
            {
                id: "001",
                year: 1851,
                mainTopic: "Beaver",
                subTopic: "Three Pence",
                denomination: "3d",
                color: "red",
                image: "images/1850s/001-beaver-1851.jpg",
                notes: "First Canadian stamp"
            },
            {
                id: "002",
                year: 1852,
                mainTopic: "Prince Albert",
                subTopic: "Six Pence",
                denomination: "6d",
                color: "purple",
                image: "images/1850s/002-albert-1852.jpg",
                notes: ""
            },
            {
                id: "156",
                year: 1935,
                mainTopic: "Jacques Cartier",
                subTopic: "Explorer Series",
                denomination: "3¢",
                color: "brown",
                image: "images/1930s/156-cartier-1935.jpg",
                notes: "Part of historical series"
            }
        ];
        this.preprocessStampsForSearch();
    }
    
    getColorForDecade(decade) {
        const colors = {
            1850: 'linear-gradient(45deg, #8B4513, #A0522D)',
            1860: 'linear-gradient(45deg, #4B0082, #6A5ACD)',
            1870: 'linear-gradient(45deg, #2F4F4F, #708090)',
            1880: 'linear-gradient(45deg, #8B0000, #DC143C)',
            1890: 'linear-gradient(45deg, #006400, #32CD32)',
            1900: 'linear-gradient(45deg, #B8860B, #DAA520)',
            1910: 'linear-gradient(45deg, #800080, #9932CC)',
            1920: 'linear-gradient(45deg, #2E8B57, #3CB371)',
            1930: 'linear-gradient(45deg, #1E90FF, #4169E1)',
            1940: 'linear-gradient(45deg, #B22222, #DC143C)',
            1950: 'linear-gradient(45deg, #FF4500, #FF6347)',
            1960: 'linear-gradient(45deg, #FF1493, #FF69B4)',
            1970: 'linear-gradient(45deg, #00CED1, #20B2AA)',
            1980: 'linear-gradient(45deg, #9370DB, #BA55D3)',
            1990: 'linear-gradient(45deg, #228B22, #32CD32)',
            2000: 'linear-gradient(45deg, #FF8C00, #FFA500)',
            2010: 'linear-gradient(45deg, #4682B4, #5F9EA0)',
            2020: 'linear-gradient(45deg, #DC143C, #FF1493)'
        };
        return colors[decade] || 'linear-gradient(45deg, #666, #999)';
    }
    
    setupEventListeners() {
        // Zoom and pan
        this.canvasContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvasContainer.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click menu
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeys(e));
        
        // Modal
        document.getElementById('stampModal').addEventListener('click', (e) => {
            if (e.target.id === 'stampModal') this.closeModal();
        });
        
        // Info sections
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
        
        // Close info sections when clicking outside
        document.querySelectorAll('.info-section').forEach(section => {
            section.addEventListener('click', (e) => {
                if (e.target === section) {
                    section.style.display = 'none';
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
            }
        });
    }
    
    handleKeyDown(e) {
        // Track shift key for pan mode
        if (e.key === 'Shift') {
            this.isShiftPressed = true;
            document.body.classList.add('pan-mode');
        }
        
        // Arrow key navigation (only if not in a text input)
        if (!e.target.matches('input, textarea, select')) {
            const moveDistance = e.ctrlKey ? 200 : 100; // Faster with Ctrl
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigate(0, moveDistance);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigate(0, -moveDistance);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigate(moveDistance, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigate(-moveDistance, 0);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.centerView();
                    break;
            }
        }
    }
    
    handleKeyUp(e) {
        // Release shift key
        if (e.key === 'Shift') {
            this.isShiftPressed = false;
            if (!this.panMode) {
                document.body.classList.remove('pan-mode');
            }
        }
    }
    
    setupDraggableSearch() {
        console.log('Setting up draggable search...');
        
        const searchBar = document.getElementById('searchBar');
        const dragHandle = searchBar?.querySelector('.drag-handle');
        
        if (!searchBar || !dragHandle) {
            console.error('Search bar or drag handle not found!');
            return;
        }
        
        console.log('Found search bar and drag handle');
        
        // Position search bar in header area by default
        searchBar.style.top = '15px';
        searchBar.style.right = '20px';
        searchBar.style.left = 'auto'; // Clear any left positioning
        
        let isDragging = false;
        let isResizing = false;
        let startX, startY, initialX, initialY;
        let startWidth, startMouseX;
        
        dragHandle.style.background = '#ccc';
        dragHandle.title = 'Drag to move, drag right edge to resize';
        
        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.title = 'Drag to resize';
        resizeHandle.style.cssText = `
            position: absolute;
            right: 0;
            top: 0;
            width: 10px;
            height: 100%;
            cursor: ew-resize;
            background: transparent;
        `;
        searchBar.appendChild(resizeHandle);
        
        // Drag functionality
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
        
        // Resize functionality
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
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const newX = initialX + deltaX;
                const newY = initialY + deltaY;
                
                // Keep within bounds
                const maxX = window.innerWidth - searchBar.offsetWidth;
                const maxY = window.innerHeight - searchBar.offsetHeight;
                
                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(70, Math.min(newY, maxY));
                
                searchBar.style.left = constrainedX + 'px';
                searchBar.style.top = constrainedY + 'px';
                searchBar.style.right = 'auto'; // Clear right positioning when dragging
            } else if (isResizing) {
                const deltaX = e.clientX - startMouseX;
                const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
                searchBar.style.width = newWidth + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                searchBar.classList.remove('dragging');
            } else if (isResizing) {
                isResizing = false;
                searchBar.classList.remove('resizing');
            }
        });
        
        console.log('Drag and resize setup complete');
    }
    
    // Enhanced Zoom and Pan Methods
    startDrag(e) {
        // Right-click always allows panning
        const isRightClick = e.button === 2;
        
        // Left-click behavior depends on pan mode and shift key
        const shouldPan = isRightClick || this.panMode || this.isShiftPressed || !e.target.closest('.stamp');
        
        if (!shouldPan) return;
        
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvasContainer.style.cursor = 'grabbing';
        document.body.classList.add('dragging');
        
        e.preventDefault(); // Prevent text selection while dragging
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        
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
        
        // Zoom faster with Ctrl/Cmd
        const zoomSpeed = e.ctrlKey || e.metaKey ? 1.2 : 1.1;
        const zoomFactor = e.deltaY > 0 ? 1/zoomSpeed : zoomSpeed;
        
        // Get mouse position for zoom centering
        const rect = this.canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom point
        const beforeZoomX = (mouseX - this.translateX) / this.scale;
        const beforeZoomY = (mouseY - this.translateY) / this.scale;
        
        // Apply zoom
        const newScale = Math.max(0.1, Math.min(5, this.scale * zoomFactor));
        
        if (newScale !== this.scale) {
            this.scale = newScale;
            
            // Adjust translation to zoom toward mouse
            const afterZoomX = beforeZoomX * this.scale;
            const afterZoomY = beforeZoomY * this.scale;
            
            this.translateX = mouseX - afterZoomX;
            this.translateY = mouseY - afterZoomY;
            
            this.updateTransform();
            this.updateMiniMap();
        }
    }
    
    updateTransform() {
        this.stampGrid.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        document.getElementById('scaleInfo').textContent = Math.round(this.scale * 100) + '%';
    }
    
    // Enhanced Search Methods with optimized matching
    handleSearch(query) {
        this.clearSearchHighlights();
        
        if (!query.trim()) {
            this.currentMatches = [];
            this.currentMatchIndex = 0;
            this.updateSearchInfo();
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const matches = [];
        
        // Check if it's a year search first
        const yearMatch = parseInt(query);
        if (!isNaN(yearMatch) && yearMatch >= 1800 && yearMatch <= 2030) {
            matches.push(...this.stamps.filter(stamp => stamp.year === yearMatch));
        } else {
            // Advanced text search using cached search text
            matches.push(...this.stamps.filter(stamp => this.matchesSearchTerm(stamp, searchTerm)));
        }
        
        // Sort matches by relevance (exact matches first, then partial matches)
        matches.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, searchTerm);
            const scoreB = this.calculateRelevanceScore(b, searchTerm);
            if (scoreA !== scoreB) return scoreB - scoreA; // Higher score first
            return a.year - b.year; // Then by year
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
        // Use cached search text for faster matching
        const searchableText = stamp._searchText || '';
        
        // Split search term into individual words for more flexible matching
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        
        // Check if all search words are found (AND logic)
        return searchWords.every(word => {
            // Direct substring match
            if (searchableText.includes(word)) return true;
            
            // Fuzzy matching for common misspellings/variations
            return this.fuzzyMatch(searchableText, word);
        });
    }
    
    calculateRelevanceScore(stamp, searchTerm) {
        let score = 0;
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        
        searchWords.forEach(word => {
            // Exact matches in main topic get highest score
            if ((stamp.mainTopic || '').toLowerCase().includes(word)) {
                score += (stamp.mainTopic || '').toLowerCase() === word ? 100 : 50;
            }
            
            // Exact matches in sub topic
            if ((stamp.subTopic || '').toLowerCase().includes(word)) {
                score += (stamp.subTopic || '').toLowerCase() === word ? 80 : 40;
            }
            
            // Color matches
            if ((stamp.color || '').toLowerCase().includes(word)) {
                score += 30;
            }
            
            // Denomination matches
            if ((stamp.denomination || '').toLowerCase().includes(word)) {
                score += 25;
            }
            
            // Notes matches
            if ((stamp.notes || '').toLowerCase().includes(word)) {
                score += 20;
            }
            
            // ID matches
            if ((stamp.id || '').toLowerCase().includes(word)) {
                score += 15;
            }
            
            // Year matches (partial)
            if (stamp.year?.toString().includes(word)) {
                score += 10;
            }
        });
        
        return score;
    }
    
    fuzzyMatch(text, word) {
        // Handle common stamp collecting terms and their variations
        const synonyms = {
            // Colors
            'red': ['crimson', 'scarlet', 'carmine', 'rose'],
            'blue': ['azure', 'navy', 'ultramarine', 'cobalt'],
            'green': ['emerald', 'forest', 'sage', 'olive'],
            'yellow': ['golden', 'amber', 'lemon'],
            'purple': ['violet', 'magenta', 'mauve'],
            'brown': ['sepia', 'tan', 'bronze', 'chocolate'],
            'black': ['ebony', 'coal'],
            'white': ['ivory', 'cream'],
            'orange': ['vermillion', 'coral'],
            
            // Common subjects
            'queen': ['elizabeth', 'victoria', 'royal', 'monarch'],
            'king': ['george', 'edward', 'royal', 'monarch'],
            'flower': ['floral', 'bloom', 'blossom'],
            'bird': ['avian', 'eagle', 'hawk'],
            'ship': ['vessel', 'boat', 'maritime'],
            'plane': ['aircraft', 'aviation', 'flight'],
            'olympics': ['olympic', 'games', 'sport'],
            'christmas': ['xmas', 'holiday', 'noel'],
            'maple': ['leaf', 'canada'],
            'beaver': ['animal', 'fur'],
            'flag': ['banner', 'ensign'],
            
            // Denominations
            'cent': ['¢', 'cents', 'penny'],
            'dollar': ['$', 'dollars'],
            'pence': ['penny', 'pennies', 'd'],
            
            // Common misspellings
            'cartier': ['carteer', 'cartiar'],
            'centennial': ['centinal', 'centenial'],
            'commemor': ['commem', 'memorial'],
            'definitiv': ['defin', 'regular']
        };
        
        // Check if the word or its synonyms appear in the text
        const wordVariations = [word];
        if (synonyms[word]) {
            wordVariations.push(...synonyms[word]);
        }
        
        // Also check if this word is a synonym for something in the text
        for (const [key, values] of Object.entries(synonyms)) {
            if (values.includes(word) && text.includes(key)) {
                return true;
            }
        }
        
        return wordVariations.some(variation => text.includes(variation));
    }
    
    handleSearchKeys(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                this.previousMatch();
            } else {
                this.nextMatch();
            }
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
                if (index === this.currentMatchIndex) {
                    element.classList.add('search-current');
                } else {
                    element.classList.add('search-match');
                }
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
        
        // Calculate position to center the stamp
        const containerWidth = this.canvasContainer.clientWidth;
        const containerHeight = this.canvasContainer.clientHeight;
        
        // Set appropriate zoom level
        this.scale = Math.max(1, this.scale);
        
        // Get stamp position relative to grid
        const stampRect = element.getBoundingClientRect();
        const gridRect = this.stampGrid.getBoundingClientRect();
        
        const stampX = stampRect.left - gridRect.left;
        const stampY = stampRect.top - gridRect.top;
        
        // Center the stamp
        this.translateX = containerWidth/2 - (stampX * this.scale + stampRect.width * this.scale / 2);
        this.translateY = containerHeight/2 - (stampY * this.scale + stampRect.height * this.scale / 2);
        
        this.updateTransform();
        this.updateMiniMap();
        
        // Update highlight for current match
        this.highlightMatches();
    }
    
    // Modal Methods
    showStampDetails(stamp) {
        document.getElementById('modalId').textContent = stamp.id;
        document.getElementById('modalYear').textContent = stamp.year;
        document.getElementById('modalTopic').textContent = stamp.mainTopic + (stamp.subTopic ? ` - ${stamp.subTopic}` : '');
        document.getElementById('modalDenomination').textContent = stamp.denomination || 'N/A';
        document.getElementById('modalColor').textContent = stamp.color || 'N/A';
        
        const notesContainer = document.getElementById('modalNotesContainer');
        const notesSpan = document.getElementById('modalNotes');
        if (stamp.notes && stamp.notes.trim()) {
            notesSpan.textContent = stamp.notes;
            notesContainer.style.display = 'block';
        } else {
            notesContainer.style.display = 'none';
        }
        
        document.getElementById('modalTitle').textContent = `${stamp.year} - ${stamp.mainTopic}`;
        
        const modalImage = document.getElementById('modalStampImage');
        modalImage.src = stamp.image;
        modalImage.alt = `${stamp.year} ${stamp.mainTopic}`;
        
        document.getElementById('stampModal').style.display = 'flex';
    }
    
    closeModal() {
        document.getElementById('stampModal').style.display = 'none';
    }
    
    showInfo(sectionId) {
        document.getElementById(sectionId).style.display = 'block';
    }
    
    // Era jumping - Updated to handle all the eras in your HTML
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
        
        // Find the first stamp in that era (or closest after)
        const stamp = this.stamps.find(s => s.year >= targetYear);
        if (stamp) {
            this.jumpToStamp(stamp);
        }
    }
    
    // Cleanup method to prevent memory leaks
    destroy() {
        // Revoke all blob URLs
        this.imageCache.forEach(objectUrl => {
            URL.revokeObjectURL(objectUrl);
        });
        
        // Disconnect observers
        if (this.viewportObserver) {
            this.viewportObserver.disconnect();
        }
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
        
        // Clear queues
        this.preloadQueue = [];
        this.renderQueue = [];
        this.imageCache.clear();
        
        // Remove navigation controls
        const navControls = document.getElementById('navigationControls');
        const miniMap = document.getElementById('miniMap');
        if (navControls) navControls.remove();
        if (miniMap) miniMap.remove();
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
    if (stampApp) {
        stampApp.centerView();
    }
}

function jumpToEra(era) {
    if (stampApp) {
        stampApp.jumpToEra(era);
    }
}

function closeModal() {
    if (stampApp) {
        stampApp.closeModal();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    stampApp = new StampIdentifier();
    
    // Also ensure drag setup runs after everything is loaded
    window.addEventListener('load', () => {
        console.log('Window fully loaded, setting up drag...');
        if (stampApp && stampApp.setupDraggableSearch) {
            stampApp.setupDraggableSearch();
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (stampApp && stampApp.destroy) {
            stampApp.destroy();
        }
    });
});