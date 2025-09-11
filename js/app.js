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
        
        this.stampGrid = document.getElementById('stampGrid');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.searchInput = document.getElementById('searchInput');
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadStamps();
            this.renderStamps();
            this.setupEventListeners();
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
    
    renderStamps() {
        this.stampGrid.innerHTML = '';
        
        if (this.stamps.length === 0) {
            this.stampGrid.innerHTML = '<div id="loadingMessage">No stamps found. Add stamps to data/stamps.json</div>';
            return;
        }
        
        let currentDecade = null;
        
        this.stamps.forEach((stamp, index) => {
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
            const stampElement = document.createElement('div');
            stampElement.className = 'stamp';
            stampElement.dataset.id = stamp.id;
            stampElement.dataset.year = stamp.year;
            stampElement.dataset.topic = stamp.mainTopic.toLowerCase();
            stampElement.dataset.subtopic = (stamp.subTopic || '').toLowerCase();
            stampElement.dataset.color = (stamp.color || '').toLowerCase();
            
            // Create image element
            const img = document.createElement('img');
            img.src = stamp.image;
            img.alt = `${stamp.year} ${stamp.mainTopic}`;
            img.onerror = () => {
                // If image fails to load, show placeholder
                img.style.display = 'none';
                stampElement.style.background = this.getColorForDecade(decade);
                stampElement.innerHTML += `<div style="display: flex; align-items: center; justify-content: center; height: 80%; font-size: 10px; text-align: center; padding: 5px; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);">${stamp.mainTopic}</div>`;
            };
            
            // Create info element
            const info = document.createElement('div');
            info.className = 'stamp-info';
            info.innerHTML = `${stamp.id}<br>${stamp.year}`;
            
            stampElement.appendChild(img);
            stampElement.appendChild(info);
            
            // Add click handler
            stampElement.onclick = () => this.showStampDetails(stamp);
            
            this.stampGrid.appendChild(stampElement);
        });
        
        // Update stamp count
        document.getElementById('stampCount').textContent = this.stamps.length;
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
        this.canvasContainer.addEventListener('wheel', (e) => this.handleWheel(e));
        
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
        
        const rect = element.getBoundingClientRect();
        const containerRect = this.canvasContainer.getBoundingClientRect();
        
        // Calculate position to center the stamp
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        // Set appropriate zoom level
        this.scale = Math.max(1, this.scale);
        
        // Calculate translation to center the stamp
        const elementRect = element.getBoundingClientRect();
        const stampCenterX = (elementRect.left + elementRect.right) / 2 - containerRect.left;
        const stampCenterY = (elementRect.top + elementRect.bottom) / 2 - containerRect.top;
        
        this.translateX += containerCenterX - stampCenterX;
        this.translateY += containerCenterY - stampCenterY;
        
        this.updateTransform();
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
    
    // Era jumping
    jumpToEra(era) {
        const eraYears = {
            '1930s': 1935,
            '1960s': 1967
        };
        
        const targetYear = eraYears[era];
        if (!targetYear) return;
        
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
    stampApp = new StampIdentifier();
});