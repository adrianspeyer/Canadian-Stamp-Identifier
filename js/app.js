/**
 * Canadian Stamp Identifier — app.js
 * Unified responsive catalogue for 3,475+ stamps.
 * One codebase, one render path, phone → desktop.
 */

class StampIdentifier {

    /* ──────────────────────────────────────────────
       CONFIGURATION
       ────────────────────────────────────────────── */
    static RENDER_BATCH = 250;          // Cards per animation frame during initial load
    static SEARCH_DEBOUNCE = 180;       // ms to wait after typing stops
    static IMAGE_OBSERVER_MARGIN = '600px'; // Load images this far outside viewport
    static SCROLL_TOP_THRESHOLD = 800;  // px scrolled before showing scroll-to-top
    static MAX_CONCURRENT_LOADS = 6;    // Max simultaneous image fetches (kind to server + device)
    static IMAGE_LOAD_TIMEOUT = 15000;  // 15s timeout per image — prevents queue freeze on iPad

    /* ──────────────────────────────────────────────
       CONSTRUCTOR
       ────────────────────────────────────────────── */
    constructor() {
        this.stamps = [];
        this.cardElements = [];              // every card DOM element (handles duplicate stamp IDs)
        this.activeDecade = null;        // null = show all
        this.searchTerm = '';
        this.searchRegex = null;
        this.visibleCount = 0;
        this.imageObserver = null;

        // Image loading queue — limits concurrent fetches to be kind to resources
        this.imageQueue = [];
        this.activeLoads = 0;

        // DOM references
        this.grid = document.getElementById('stampGrid');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.decadeNav = document.getElementById('decadeNav');
        this.resultsCount = document.getElementById('resultsCount');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        this.emptyState = document.getElementById('emptyState');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingBarFill = document.getElementById('loadingBarFill');
        this.loadingCountEl = document.getElementById('loadingCount');
        this.modal = document.getElementById('stampModal');
        this.scrollTopBtn = document.getElementById('scrollTopBtn');

        this.init();
    }

    /* ──────────────────────────────────────────────
       INIT
       ────────────────────────────────────────────── */
    async init() {
        try {
            // Load language preference before anything renders
            I18N.loadSavedLang();
            if (I18N.getLang() === 'fr') await I18N.loadFrenchStamps();

            await this.loadStamps();
            this.preprocessSearch();
            if (I18N.getLang() === 'fr') this.preprocessSearchI18N();
            this.buildDecadeNav();
            this.setupImageObserver();
            await this.renderAllCards();
            this.restoreFilterState();
            this.applyFilters();
            this.bindEvents();
            this.applyLanguage(); // Translate all static UI elements
            this.dismissLoading();
        } catch (err) {
            console.error('Failed to initialise:', err);
            this.loadingCountEl.textContent = 'Failed to load stamps. Check that data/stamps.json exists.';
        }
    }

    /* ──────────────────────────────────────────────
       DATA LOADING (with localStorage cache)
       ────────────────────────────────────────────── */
    async loadStamps() {
        const CACHE_KEY = 'csi_stamps';
        const VERSION_KEY = 'csi_stamps_ver';
        const cacheBust = location.hostname === 'localhost' ? `?v=${Date.now()}` : '';

        try {
            // Try to use cached data while checking for updates
            const cached = localStorage.getItem(CACHE_KEY);
            const cachedVersion = localStorage.getItem(VERSION_KEY);

            // Fetch with cache headers — browser may return 304 Not Modified
            const response = await fetch(`data/stamps.json${cacheBust}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Use ETag or Content-Length as a version fingerprint
            const etag = response.headers.get('ETag') || response.headers.get('Content-Length') || '';

            if (cached && cachedVersion === etag && etag) {
                // Data hasn't changed — use cached version (skips parsing the response)
                this.stamps = JSON.parse(cached);
                console.log(`Loaded ${this.stamps.length} stamps (from cache)`);
            } else {
                // New data — parse, store, and use
                const data = await response.json();
                this.stamps = data.stamps || [];

                // Cache for next visit (try/catch in case storage is full)
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(this.stamps));
                    if (etag) localStorage.setItem(VERSION_KEY, etag);
                } catch (e) {
                    // Storage full or unavailable — not critical, just skip caching
                    console.warn('Could not cache stamps data:', e.message);
                }
                console.log(`Loaded ${this.stamps.length} stamps (from network)`);
            }
        } catch (err) {
            // Network failed — try cache as fallback
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                this.stamps = JSON.parse(cached);
                console.log(`Loaded ${this.stamps.length} stamps (offline, from cache)`);
            } else {
                throw err; // No cache, no network — real failure
            }
        }

        // Sort chronologically, then by ID within each year
        this.stamps.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        });
    }

    preprocessSearch() {
        this.stamps.forEach(stamp => {
            stamp._searchText = [
                stamp.mainTopic || '',
                stamp.subTopic || '',
                stamp.color || '',
                stamp.denomination || '',
                stamp.notes || '',
                stamp.year != null ? String(stamp.year) : '',
                stamp.id || ''
            ].join(' ').toLowerCase();

            stamp._decade = Math.floor(stamp.year / 10) * 10;
        });
    }

    /* ──────────────────────────────────────────────
       DECADE NAVIGATION
       ────────────────────────────────────────────── */
    buildDecadeNav() {
        // Count stamps per decade
        const decadeCounts = new Map();
        let total = this.stamps.length;
        this.stamps.forEach(s => {
            const d = s._decade;
            decadeCounts.set(d, (decadeCounts.get(d) || 0) + 1);
        });

        const decades = [...decadeCounts.keys()].sort((a, b) => a - b);

        // "All" pill
        const allPill = this.createDecadePill(I18N.t('decades.all'), total, null);
        allPill.setAttribute('aria-selected', 'true');
        this.decadeNav.appendChild(allPill);

        // One pill per decade
        decades.forEach(decade => {
            const pill = this.createDecadePill(`${decade}s`, decadeCounts.get(decade), decade);
            this.decadeNav.appendChild(pill);
        });

        // Update year range in header
        if (this.stamps.length > 0) {
            const minYear = this.stamps[0].year;
            const maxYear = this.stamps[this.stamps.length - 1].year;
            const rangeEl = document.getElementById('headerYearRange');
            if (rangeEl) rangeEl.textContent = `${minYear}–${maxYear}`;
        }
    }

    createDecadePill(label, count, decade) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'decade-pill';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', 'false');
        btn.dataset.decade = decade != null ? decade : 'all';

        const labelSpan = document.createTextNode(label + ' ');
        btn.appendChild(labelSpan);

        const countSpan = document.createElement('span');
        countSpan.className = 'decade-count';
        countSpan.textContent = count.toLocaleString();
        btn.appendChild(countSpan);

        return btn;
    }

    setDecadeFilter(decade) {
        if (this.activeDecade === decade) {
            // Clicking active decade toggles it off
            this.activeDecade = null;
        } else {
            this.activeDecade = decade;
        }

        // Update pill states and scroll active into view
        this.decadeNav.querySelectorAll('.decade-pill').forEach(pill => {
            const pillDecade = pill.dataset.decade === 'all' ? null : Number(pill.dataset.decade);
            const isActive = pillDecade === this.activeDecade;
            pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
            if (isActive || (this.activeDecade === null && pill.dataset.decade === 'all')) {
                pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });

        this.applyFilters();
        this.saveFilterState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ──────────────────────────────────────────────
       IMAGE LAZY LOADING (concurrency-limited queue)
       ────────────────────────────────────────────── */
    setupImageObserver() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                this.imageObserver.unobserve(card);

                const img = card.querySelector('img[data-src]');
                if (!img) return;

                const realSrc = img.dataset.src;
                if (!realSrc) return;

                // Queue instead of loading immediately — respects MAX_CONCURRENT_LOADS
                this.imageQueue.push({ img, src: realSrc });
                this.processImageQueue();
            });
        }, {
            rootMargin: StampIdentifier.IMAGE_OBSERVER_MARGIN,
            threshold: 0
        });
    }

    /** Process queued images up to the concurrency limit */
    processImageQueue() {
        while (this.activeLoads < StampIdentifier.MAX_CONCURRENT_LOADS && this.imageQueue.length > 0) {
            const { img, src } = this.imageQueue.shift();
            this.loadImage(img, src);
        }
    }

    /** Load a single image with timeout protection and proper error handling */
    loadImage(img, src) {
        this.activeLoads++;
        let settled = false;

        const settle = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            this.activeLoads--;
            this.processImageQueue();
        };

        const encodedSrc = encodeURI(src);
        img.decoding = 'async';
        img.removeAttribute('data-src');

        img.addEventListener('load', () => {
            img.classList.add('loaded');
            const placeholder = img.parentElement?.querySelector('.stamp-card-placeholder');
            if (placeholder) placeholder.classList.add('hidden');
            settle();
        }, { once: true });

        img.addEventListener('error', () => {
            img.style.display = 'none';
            const placeholder = img.parentElement?.querySelector('.stamp-card-placeholder');
            if (placeholder) placeholder.classList.add('load-error');
            settle();
        }, { once: true });

        // Timeout: if neither load nor error fires, free the slot and move on.
        // This prevents a hung request from freezing the entire queue on iPad Safari.
        const timer = setTimeout(() => {
            if (!settled) {
                console.warn(`Image load timeout: ${src}`);
                // Don't mark as error — it might still load later in the background.
                // Just free the queue slot so other images can proceed.
                settle();
            }
        }, StampIdentifier.IMAGE_LOAD_TIMEOUT);

        img.src = encodedSrc;
    }

    /* ──────────────────────────────────────────────
       CARD RENDERING (batched for responsive load)
       ────────────────────────────────────────────── */
    async renderAllCards() {
        const total = this.stamps.length;
        let rendered = 0;

        while (rendered < total) {
            const batchEnd = Math.min(rendered + StampIdentifier.RENDER_BATCH, total);
            const frag = document.createDocumentFragment();

            for (let i = rendered; i < batchEnd; i++) {
                const stamp = this.stamps[i];
                const card = this.createCard(stamp);
                this.cardElements.push(card);
                frag.appendChild(card);
            }

            this.grid.appendChild(frag);
            rendered = batchEnd;

            // Update loading progress
            const pct = Math.round((rendered / total) * 100);
            this.loadingBarFill.style.width = pct + '%';
            this.loadingCountEl.textContent = `${rendered.toLocaleString()} ${I18N.t('loading.of')} ${total.toLocaleString()}`;

            // Yield to browser for paint between batches
            if (rendered < total) {
                await new Promise(r => requestAnimationFrame(r));
            }
        }
    }

    createCard(stamp) {
        const card = document.createElement('div');
        card.className = 'stamp-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${stamp.year} ${I18N.getStampField(stamp, 'mainTopic')} — #${stamp.id}`);

        // Store data on the element for fast filtering
        card._stamp = stamp;
        card._decade = stamp._decade;
        card._searchText = stamp._searchText;

        // Image area
        const imageArea = document.createElement('div');
        imageArea.className = 'stamp-card-image';

        // Colour placeholder (always present behind image)
        const placeholder = document.createElement('div');
        placeholder.className = 'stamp-card-placeholder';
        placeholder.style.background = this.getDecadeColour(stamp._decade);
        placeholder.textContent = I18N.getStampField(stamp, 'mainTopic') || 'Stamp';
        imageArea.appendChild(placeholder);

        // Lazy image
        const img = document.createElement('img');
        img.alt = `${stamp.year} ${I18N.getStampField(stamp, 'mainTopic')}`;
        img.dataset.src = stamp.image || '';
        img.loading = 'lazy';
        // Start with transparent placeholder so we can transition opacity
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
        imageArea.appendChild(img);

        card.appendChild(imageArea);

        // Info area
        const info = document.createElement('div');
        info.className = 'stamp-card-info';

        const year = document.createElement('span');
        year.className = 'stamp-card-year';
        year.textContent = stamp.year || '—';
        info.appendChild(year);

        const topic = document.createElement('span');
        topic.className = 'stamp-card-topic';
        const topicText = I18N.getStampField(stamp, 'mainTopic') || 'Unknown';
        topic.textContent = topicText;
        topic.title = topicText;
        info.appendChild(topic);

        const id = document.createElement('span');
        id.className = 'stamp-card-id';
        id.textContent = `#${stamp.id}`;
        info.appendChild(id);

        card.appendChild(info);

        // Observe the CARD (not the img) for lazy image loading.
        // content-visibility: auto skips rendering card contents off-screen,
        // so child imgs are invisible to IntersectionObserver. The card
        // itself always has dimensions via contain-intrinsic-size.
        if (this.imageObserver && stamp.image) {
            this.imageObserver.observe(card);
        }

        return card;
    }

    /* ──────────────────────────────────────────────
       FILTERING (show/hide existing cards — fast)
       ────────────────────────────────────────────── */
    applyFilters() {
        const term = this.searchTerm;
        const decade = this.activeDecade;
        const cards = this.cardElements;
        const len = cards.length;
        let count = 0;

        for (let i = 0; i < len; i++) {
            const card = cards[i];
            const matchesDecade = decade === null || card._decade === decade;
            const matchesSearch = !term || this.searchRegex.test(card._searchText);

            if (matchesDecade && matchesSearch) {
                card.removeAttribute('hidden');
                count++;
            } else {
                card.setAttribute('hidden', '');
            }
        }

        // Flush queued images for now-hidden cards so visible stamps load first.
        this.imageQueue = this.imageQueue.filter(item => {
            const card = item.img.closest('.stamp-card');
            return card && !card.hasAttribute('hidden');
        });

        // Re-observe visible cards that still have unloaded images.
        // These are cards that were queued, flushed by a previous filter change,
        // and are now visible again. Without re-observing, they'd stay as shimmer forever.
        if (this.imageObserver) {
            for (let i = 0; i < len; i++) {
                const card = cards[i];
                if (!card.hasAttribute('hidden') && card.querySelector('img[data-src]')) {
                    this.imageObserver.observe(card);
                }
            }
        }

        this.visibleCount = count;
        this.updateFilterInfo();
    }

    updateFilterInfo() {
        const total = this.stamps.length;
        const count = this.visibleCount;
        const hasFilters = this.activeDecade !== null || this.searchTerm !== '';

        if (hasFilters) {
            this.resultsCount.textContent = `${count.toLocaleString()} ${I18N.t('filter.of')} ${total.toLocaleString()} ${I18N.t('filter.stamps')}`;
        } else {
            this.resultsCount.textContent = `${total.toLocaleString()} ${I18N.t('filter.stamps')}`;
        }

        this.clearFiltersBtn.hidden = !hasFilters;
        this.emptyState.hidden = count > 0;
        this.grid.style.display = count > 0 ? '' : 'none';
    }

    clearAllFilters() {
        this.searchTerm = '';
        this.searchRegex = null;
        this.searchInput.value = '';
        this.clearSearchBtn.hidden = true;
        this.activeDecade = null;

        this.decadeNav.querySelectorAll('.decade-pill').forEach(pill => {
            pill.setAttribute('aria-selected', pill.dataset.decade === 'all' ? 'true' : 'false');
        });

        this.applyFilters();
        this.saveFilterState();
    }

    /* ──────────────────────────────────────────────
       FILTER STATE PERSISTENCE (sessionStorage)
       ────────────────────────────────────────────── */
    saveFilterState() {
        try {
            sessionStorage.setItem('csi_decade', this.activeDecade != null ? String(this.activeDecade) : '');
            sessionStorage.setItem('csi_search', this.searchTerm);
        } catch (e) { /* storage unavailable — no problem */ }
    }

    restoreFilterState() {
        try {
            const decade = sessionStorage.getItem('csi_decade');
            const search = sessionStorage.getItem('csi_search');

            if (decade) {
                this.activeDecade = Number(decade);
                this.decadeNav.querySelectorAll('.decade-pill').forEach(pill => {
                    const pillDecade = pill.dataset.decade === 'all' ? null : Number(pill.dataset.decade);
                    const isActive = pillDecade === this.activeDecade;
                    pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    if (isActive) {
                        pill.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
                    }
                });
            }

            if (search) {
                this.searchTerm = search;
                const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                this.searchRegex = new RegExp('\\b' + escaped);
                this.searchInput.value = search;
                this.clearSearchBtn.hidden = false;
            }
        } catch (e) { /* storage unavailable — start fresh */ }
    }

    /* ──────────────────────────────────────────────
       SEARCH
       ────────────────────────────────────────────── */
    handleSearchInput(value) {
        const term = value.toLowerCase().trim();
        this.searchTerm = term;
        // Word-boundary match: "eid" matches "Eid al-Fitr" but not "apartheid"
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        this.searchRegex = term ? new RegExp('\\b' + escaped) : null;
        this.clearSearchBtn.hidden = term.length === 0;
        this.applyFilters();
        this.saveFilterState();
    }

    /* ──────────────────────────────────────────────
       MODAL
       ────────────────────────────────────────────── */
    showDetails(stamp) {
        if (!stamp) return;

        const img = document.getElementById('modalImage');
        const frame = document.getElementById('modalImageFrame');
        const title = document.getElementById('modalTitle');
        const meta = document.getElementById('modalMeta');

        const mainTopic = I18N.getStampField(stamp, 'mainTopic') || 'Unknown';

        // Title
        title.textContent = `${stamp.year || '—'} — ${mainTopic}`;

        // Image
        if (stamp.image && stamp.image.trim()) {
            img.src = encodeURI(stamp.image);
            img.alt = `${stamp.year} ${mainTopic}`;
            img.style.display = '';
            frame.style.display = '';
        } else {
            img.src = '';
            img.style.display = 'none';
            frame.style.display = 'none';
        }

        // Metadata
        const fields = [
            { label: I18N.t('modal.id'), value: stamp.id },
            { label: I18N.t('modal.year'), value: stamp.year },
            { label: I18N.t('modal.denomination'), value: stamp.denomination },
            { label: I18N.t('modal.colour'), value: I18N.translateColour(stamp.color) },
        ];

        const subTopic = stamp.subTopic ? { label: I18N.t('modal.category'), value: I18N.translateCategory(stamp.subTopic) } : null;
        const notesText = I18N.getStampField(stamp, 'notes');
        const notes = notesText && notesText.trim() ? { label: I18N.t('modal.notes'), value: notesText } : null;

        meta.innerHTML = '';

        // Row of 2×2
        const row1 = document.createElement('div');
        row1.className = 'modal-meta-row';
        fields.slice(0, 2).forEach(f => row1.appendChild(this.createMetaItem(f.label, f.value)));
        meta.appendChild(row1);

        const row2 = document.createElement('div');
        row2.className = 'modal-meta-row';
        fields.slice(2, 4).forEach(f => row2.appendChild(this.createMetaItem(f.label, f.value)));
        meta.appendChild(row2);

        if (subTopic) {
            meta.appendChild(this.createMetaItem(subTopic.label, subTopic.value, true));
        }

        if (notes) {
            meta.appendChild(this.createMetaItem(notes.label, notes.value, true));
        }

        // Show modal
        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';

        // Focus the close button for accessibility
        document.getElementById('modalCloseBtn').focus();
    }

    createMetaItem(label, value, fullWidth) {
        const item = document.createElement('div');
        item.className = 'modal-meta-item' + (fullWidth ? ' full-width' : '');
        const lbl = document.createElement('div');
        lbl.className = 'modal-meta-label';
        lbl.textContent = label;
        const val = document.createElement('div');
        val.className = 'modal-meta-value';
        val.textContent = value || 'N/A';
        item.appendChild(lbl);
        item.appendChild(val);
        return item;
    }

    closeModal() {
        this.modal.hidden = true;
        document.body.style.overflow = '';
    }

    /* ──────────────────────────────────────────────
       PANELS (About, Contribute)
       ────────────────────────────────────────────── */
    openPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }

    closePanel(panel) {
        if (panel) {
            panel.hidden = true;
            document.body.style.overflow = '';
        }
    }

    /* ──────────────────────────────────────────────
       LOADING DISMISSAL
       ────────────────────────────────────────────── */
    dismissLoading() {
        this.loadingOverlay.classList.add('done');
        setTimeout(() => {
            this.loadingOverlay.remove();
        }, 500);
    }

    /* ──────────────────────────────────────────────
       EVENT BINDING
       ────────────────────────────────────────────── */
    bindEvents() {
        // --- Search (debounced) ---
        let searchTimer = null;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.handleSearchInput(this.searchInput.value);
            }, StampIdentifier.SEARCH_DEBOUNCE);
        });

        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.clearSearchBtn.hidden = true;
            this.handleSearchInput('');
            this.searchInput.focus();
        });

        this.clearFiltersBtn.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // --- Decade pills (event delegation) ---
        this.decadeNav.addEventListener('click', (e) => {
            const pill = e.target.closest('.decade-pill');
            if (!pill) return;
            const decade = pill.dataset.decade === 'all' ? null : Number(pill.dataset.decade);
            this.setDecadeFilter(decade);
        });

        // --- Card clicks (event delegation on grid) ---
        this.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.stamp-card');
            if (card && card._stamp) this.showDetails(card._stamp);
        });

        this.grid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.stamp-card');
                if (card && card._stamp) {
                    e.preventDefault();
                    this.showDetails(card._stamp);
                }
            }
        });

        // --- Modal ---
        document.getElementById('modalCloseBtn').addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // --- Panels ---
        document.getElementById('aboutBtn').addEventListener('click', () => this.openPanel('aboutPanel'));
        document.getElementById('contributeBtn').addEventListener('click', () => this.openPanel('contributePanel'));

        document.querySelectorAll('.panel-backdrop').forEach(panel => {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) this.closePanel(panel);
            });
            panel.querySelectorAll('[data-close-panel]').forEach(closeBtn => {
                closeBtn.addEventListener('click', () => this.closePanel(panel));
            });
        });

        // --- Keyboard ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!this.modal.hidden) {
                    this.closeModal();
                } else {
                    document.querySelectorAll('.panel-backdrop:not([hidden])').forEach(p => this.closePanel(p));
                }
            }
        });

        // --- Scroll to top ---
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    this.scrollTopBtn.hidden = window.scrollY < StampIdentifier.SCROLL_TOP_THRESHOLD;
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        this.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // --- Language toggle ---
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
        });

        // --- Decade scroll arrows ---
        const decadeWrapper = document.getElementById('decadeScrollWrapper');
        const arrowLeft = document.getElementById('decadeArrowLeft');
        const arrowRight = document.getElementById('decadeArrowRight');

        if (decadeWrapper && arrowLeft && arrowRight) {
            const SCROLL_STEP = 200;

            const updateArrows = () => {
                const scrollLeft = decadeWrapper.scrollLeft;
                const maxScroll = decadeWrapper.scrollWidth - decadeWrapper.clientWidth;
                arrowLeft.hidden = scrollLeft < 8;
                arrowRight.hidden = scrollLeft > maxScroll - 8;
            };

            arrowLeft.addEventListener('click', () => {
                decadeWrapper.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
            });

            arrowRight.addEventListener('click', () => {
                decadeWrapper.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
            });

            decadeWrapper.addEventListener('scroll', updateArrows, { passive: true });
            requestAnimationFrame(updateArrows);
        }
    }

    /* ──────────────────────────────────────────────
       UTILITIES
       ────────────────────────────────────────────── */
    getDecadeColour(decade) {
        const colours = {
            1850: 'linear-gradient(135deg, #78350F, #A16207)',
            1860: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
            1870: 'linear-gradient(135deg, #1E3A5F, #3B82F6)',
            1880: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
            1890: 'linear-gradient(135deg, #14532D, #22C55E)',
            1900: 'linear-gradient(135deg, #78350F, #D97706)',
            1910: 'linear-gradient(135deg, #581C87, #A855F7)',
            1920: 'linear-gradient(135deg, #065F46, #10B981)',
            1930: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
            1940: 'linear-gradient(135deg, #7F1D1D, #EF4444)',
            1950: 'linear-gradient(135deg, #9A3412, #F97316)',
            1960: 'linear-gradient(135deg, #831843, #EC4899)',
            1970: 'linear-gradient(135deg, #115E59, #14B8A6)',
            1980: 'linear-gradient(135deg, #5B21B6, #A78BFA)',
            1990: 'linear-gradient(135deg, #166534, #4ADE80)',
            2000: 'linear-gradient(135deg, #92400E, #FBBF24)',
            2010: 'linear-gradient(135deg, #1E3A5F, #60A5FA)',
            2020: 'linear-gradient(135deg, #9F1239, #FB7185)',
        };
        return colours[decade] || 'linear-gradient(135deg, #525252, #A3A3A3)';
    }

    /* ──────────────────────────────────────────────
       LANGUAGE SWITCHING (EN / FR)
       ────────────────────────────────────────────── */

    /** Switch language — save and reload for clean render */
    async setLanguage(lang) {
        if (lang === I18N.getLang()) return;
        I18N.setLang(lang);
        window.location.reload();
    }

    /** Translate all static UI elements marked with data-i18n */
    applyLanguage() {
        const lang = I18N.getLang();

        // Update toggle button state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (el.tagName === 'INPUT') {
                el.placeholder = I18N.t(key);
            } else {
                el.textContent = I18N.t(key);
            }
        });

        // Update ARIA labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            el.setAttribute('aria-label', I18N.t(el.dataset.i18nAria));
        });

        // Update grid ARIA label
        this.grid.setAttribute('aria-label', I18N.t('grid.label'));

        // Show/hide language-specific panels
        document.querySelectorAll('[data-panel-lang]').forEach(el => {
            el.hidden = el.dataset.panelLang !== lang;
        });

        // Update "All" pill text
        const allPill = this.decadeNav.querySelector('[data-decade="all"]');
        if (allPill) {
            const countSpan = allPill.querySelector('.decade-count');
            const count = countSpan ? countSpan.textContent : '';
            allPill.firstChild.textContent = I18N.t('decades.all') + ' ';
        }
    }

    /** Update all card text with current language */
    updateCardText() {
        for (const card of this.cardElements) {
            const stamp = card._stamp;
            if (!stamp) continue;
            const topicText = I18N.getStampField(stamp, 'mainTopic') || 'Unknown';
            const topicEl = card.querySelector('.stamp-card-topic');
            if (topicEl) {
                topicEl.textContent = topicText;
                topicEl.title = topicText;
            }
            const placeholder = card.querySelector('.stamp-card-placeholder');
            if (placeholder) placeholder.textContent = topicText;
            card.setAttribute('aria-label', `${stamp.year} ${topicText} — #${stamp.id}`);
        }
    }

    /** Build search index including translated fields */
    preprocessSearchI18N() {
        this.stamps.forEach(stamp => {
            const topic = I18N.getStampField(stamp, 'mainTopic') || '';
            const notes = I18N.getStampField(stamp, 'notes') || '';
            const cat = I18N.translateCategory(stamp.subTopic || '');
            const colour = I18N.translateColour(stamp.color || '');
            stamp._searchText = [
                stamp.mainTopic || '',    // Always include English for search
                topic,                    // French topic (if available)
                stamp.subTopic || '',     // English category
                cat,                      // French category
                stamp.color || '',        // English colour
                colour,                   // French colour
                stamp.denomination || '',
                stamp.notes || '',        // English notes
                notes,                    // French notes
                stamp.year != null ? String(stamp.year) : '',
                stamp.id || ''
            ].join(' ').toLowerCase();
        });
    }

    /* ──────────────────────────────────────────────
       CLEANUP
       ────────────────────────────────────────────── */
    destroy() {
        if (this.imageObserver) this.imageObserver.disconnect();
        this.imageQueue.length = 0;
        this.cardElements.length = 0;
    }
}

/* ──────────────────────────────────────────────
   BOOT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const app = new StampIdentifier();
    window.addEventListener('beforeunload', () => app.destroy());
});

/* Register service worker for offline caching (especially iOS) */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            /* Service worker not supported or blocked — app works fine without it */
        });
    });
}
