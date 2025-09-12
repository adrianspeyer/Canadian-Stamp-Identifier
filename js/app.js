// Canadian Stamp Identifier - Main Application
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
        
        // Lazy loading observer
        this.lazyLoadObserver = null;
        
        this.stampGrid = document.getElementById('stampGrid');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.searchInput = document.getElementById('searchInput');
        
        this.init();
    }
    
    async init() {
        try {
            this.setupLazyLoading();
            await this.loadStamps();
            this.renderStamps();
            this.setupEventListeners();
            
            // Add small delay to ensure DOM is ready for drag setup
            setTimeout(() => {
                this.setupDraggableSearch();
            }, 100);
            
            this.updateTransform();
        } catch (error) {
            console.error('Failed to initialize:', error);
            document.getElementById('loadingMessage').textContent = 'Failed to load stamps. Please check that data/stamps.json exists.';
        }
    }
    
    async loadStamps() {
        try {
            const response = await fetch('data/stamps.json');
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
        } catch (error) {
            console.error('Error loading stamps:', error);
            // Create sample data if file doesn't exist
            this.createSampleData();
        }
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
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const realSrc = img.dataset.src;
                        
                        if (realSrc) {
                            img.src = realSrc;
                            img.onload = () => {
                                img.classList.remove('lazy-load');
                            };
                            img.onerror = () => {
                                // Show placeholder on error
                                const stampElement = img.closest('.stamp');
                                const stamp = this.stamps.find(s => s.image === realSrc);
                                if (stamp) {
                                    const decade = Math.floor(stamp.year / 10) * 10;
                                    img.style.display = 'none';
                                    stampElement.style.background = this.getColorForDecade(decade);
                                    stampElement.innerHTML += `<div style="display: flex; align-items: center; justify-content: center; height: 80%; font-size: 10px; text-align: center; padding: 5px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);">${stamp.mainTopic}</div>`;
                                }
                            };
                            this.lazyLoadObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '200px' // Load images 200px before they come into view
            });
        }
    }
    
    renderStamps() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        console.log(`Rendering ${this.stamps.length} stamps with lazy loading...`);
        
        // Instead of rendering all stamps at once, render in batches
        this.renderStampsBatch(0, Math.min(200, this.stamps.length)); // Start with first 200
        
        // Update stamp count
        document.getElementById('stampCount').textContent = this.stamps.length;
    }
    
    renderStampsBatch(startIndex, endIndex) {
        let currentDecade = null;
        
        for (let i = startIndex; i < endIndex && i < this.stamps.length; i++) {
            const stamp = this.stamps[i];
            const decade = Math.floor(stamp.year / 10) * 10;
            
            // Add decade marker if new decade
            if (decade !== currentDecade) {
                const decadeMarker = document.createElement('div');
                decadeMarker.className = 'decade-marker';
                decadeMarker.textContent = `${decade}s`;
                this.stampGrid.appendChild(decadeMarker);
                currentDecade = decade;
            }
            
            // Create stamp element
            const stampElement = this.createStampElement(stamp, decade);
            this.stampGrid.appendChild(stampElement);
        }
        
        // If there are more stamps, render the next batch after a short delay
        if (endIndex < this.stamps.length) {
            setTimeout(() => {
                this.renderStampsBatch(endIndex, Math.min(endIndex + 200, this.stamps.length));
            }, 50); // 50ms delay between batches
        }
    }
    
    createStampElement(stamp, decade) {
        // Create stamp element
        const stampElement = document.createElement('div');
        stampElement.className = 'stamp';
        stampElement.dataset.id = stamp.id;
        stampElement.dataset.year = stamp.year;
        stampElement.dataset.topic = stamp.mainTopic.toLowerCase();
        stampElement.dataset.subtopic = (stamp.subTopic || '').toLowerCase();
        stampElement.dataset.color = (stamp.color || '').toLowerCase();
        
        // Create image element with lazy loading
        const img = document.createElement('img');
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4='; // Tiny placeholder
        img.dataset.src = stamp.image; // Real image URL
        img.alt = `${stamp.year} ${stamp.mainTopic}`;
        img.className = 'lazy-load';
        
        // Set up intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver.observe(img);
        } else {
            // Fallback for older browsers
            img.src = stamp.image;
        }
        
        // Create info element
        const info = document.createElement('div');
        info.className = 'stamp-info';
        info.innerHTML = `${stamp.id}<br>${stamp.year}`;
        
        stampElement.appendChild(img);
        stampElement.appendChild(info);
        
        // Add click handler
        stampElement.onclick = () => this.showStampDetails(stamp);
        
        return stampElement;
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
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeys(e));
        
        // Modal
        document.getElementById('stampModal').addEventListener('click', (e) => {
            if (e.target.id === 'stampModal') this.closeModal();
        });
        
        // Info sections
        document.querySelector('a[href="#about"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.showInfo('about');
        });
        
        document.querySelector('a[href="#contribute"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.showInfo('contribute');
        });
        
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
    
    setupDraggableSearch() {
        console.log('Setting up draggable search...');
        
        const searchBar = document.getElementById('searchBar');
        const dragHandle = searchBar?.querySelector('.drag-handle');
        
        if (!searchBar || !dragHandle) {
            console.error('Search bar or drag handle not found!');
            console.log('searchBar:', searchBar);
            console.log('dragHandle:', dragHandle);
            return;
        }
        
        console.log('Found search bar and drag handle');
        
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        // Add visual indicator that it's ready
        dragHandle.style.background = '#ccc'; // Normal gray color
        dragHandle.title = 'Drag me to move search box';
        
        dragHandle.addEventListener('mousedown', (e) => {
            console.log('Mouse down on drag handle');
            isDragging = true;
            searchBar.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            initialX = searchBar.offsetLeft;
            initialY = searchBar.offsetTop;
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
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
        });
        
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                console.log('Mouse up - stopping drag');
                isDragging = false;
                searchBar.classList.remove('dragging');
            }
        });
        
        console.log('Drag setup complete');
    }
    
    // Zoom and Pan Methods
    startDrag(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvasContainer.style.cursor = 'grabbing';
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
    }
    
    endDrag() {
        this.isDragging = false;
        this.canvasContainer.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));
        this.updateTransform();
    }
    
    updateTransform() {
        this.stampGrid.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        document.getElementById('scaleInfo').textContent = Math.round(this.scale * 100) + '%';
    }
    
    // Search Methods
    handleSearch(query) {
        this.clearSearchHighlights();
        
        if (!query.trim()) {
            this.currentMatches = [];
            this.currentMatchIndex = 0;
            this.updateSearchInfo();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const matches = [];
        
        // Check if it's a year search
        const yearMatch = parseInt(query);
        if (!isNaN(yearMatch)) {
            matches.push(...this.stamps.filter(stamp => stamp.year === yearMatch));
        } else {
            // Text search in topic, subtopic, and color
            matches.push(...this.stamps.filter(stamp => 
                stamp.mainTopic.toLowerCase().includes(searchTerm) ||
                (stamp.subTopic && stamp.subTopic.toLowerCase().includes(searchTerm)) ||
                (stamp.color && stamp.color.toLowerCase().includes(searchTerm))
            ));
        }
        
        this.currentMatches = matches;
        this.currentMatchIndex = 0;
        
        this.highlightMatches();
        
        if (matches.length > 0) {
            this.jumpToStamp(matches[0]);
        }
        
        this.updateSearchInfo();
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
}

// Global zoom functions (called by buttons)
let stampApp;

function zoomIn() {
    if (stampApp) {
        stampApp.scale = Math.min(stampApp.scale * 1.5, 3);
        stampApp.updateTransform();
    }
}

function zoomOut() {
    if (stampApp) {
        stampApp.scale = Math.max(stampApp.scale / 1.5, 0.1);
        stampApp.updateTransform();
    }
}

function resetView() {
    if (stampApp) {
        stampApp.scale = 0.3;
        stampApp.translateX = 0;
        stampApp.translateY = 0;
        stampApp.updateTransform();
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
});