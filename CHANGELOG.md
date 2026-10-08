# Canadian Stamp Identifier — Changelog

## v2.5 — ID Numbering & Subcategories

### IDs
- **Late-2025 IDs renumbered into issue-date order and gaps closed** (#3442, #3445 and #3450 no longer missing): Diwali 2025 is now #3441, Private Singh #3442, Christmas 2025 #3443–#3446, Hanukkah 2025 #3447, Canadian Graphic Novelists #3448–#3453; every 2026 stamp shifted down by 3 (#3454–#3488). IDs now run #001–#3488 with no gaps.
- Image files renamed to match, and the 2025–2026 images missing a denomination now include it (`-p-`, `-175-`, `-365-`)
- All "See also" cross-references updated in both languages; French references now consistently use "no NNNN", and five French notes missing an English cross-reference (#004, #006, #014, #017, #166) gained it
- Older catalogue order left as-is: the remaining date inversions are definitive sets grouped by series (e.g. #012/#013), not numbering errors

### Categories
- **354 stamps that had only a top-level category now have a subcategory**, and many were moved to the right top-level category (e.g. Postage Due stamps were under Sports & Recreation, "The Flight to Egypt" under Transportation, flag definitives under Government with no subcategory)
- New subcategories (with French translations in `i18n.js`): Flag, Parliament, Canada Day, National Symbols, Bridges, Mail Delivery, Postal Workers, Postal Unions, Basketball, Golf, Athletics, Equestrian, Winter Sports, Recreation; added missing French label for "Law"

---

## v2.4 — Wolves, Quilts & Truth and Reconciliation 2026

### Data
- **Wolves 2026** (#3477–#3480): four stamps — grey wolf, eastern wolf, Arctic grey wolf and coastal grey wolf. Designed by Andrew Perro; printed by Lowe-Martin. Issued Aug. 13, 2026.
- **Quilts 2026** (#3481, #3482): Northern Night (1956) and Log Cabin (c. 1890s) from the Royal Ontario Museum collection. Designed by Shelby Guergis; printed by Lowe-Martin. Issued Sept. 10, 2026.
- **National Day for Truth and Reconciliation 2026** (#3483–#3486): four T-shirt-shaped Orange Shirt stamps — First Nations, Inuit, Métis and Mother Earth. Designed by Blair Thomson (Believe in); printed by Lowe-Martin. Issued Sept. 29, 2026.
- **Placeholders replaced**: "Wolves" and "National Day for Truth and Reconciliation" placeholders replaced with the real entries; remaining placeholders (Jack-O'-Lanterns, Remembrance Day, Diwali, Hanukkah, Christmas) shifted to #3487–#3491 in both stamps.json and stamps-fr.json
- **3,490 stamps** catalogued (was 3,482)

### Data fixes
- **Chronological order**: 1985 stamps #980–#999 (Feb.–June 1985) moved ahead of #1000–#1021 in stamps.json; no IDs changed
- **Image filenames cleaned up**: 947 files renamed — the slugged denomination string (e.g. `-permanent-p-current-monetary-value-092-`, a leftover of the old $0.92 rate) replaced with `-p-` (or `-p-semipostal-`), and repeated hyphens collapsed (e.g. `silver-dart---first-flight` → `silver-dart-first-flight`)
- **English fixes**: #3367–#3368 garbled "Perf:" field replaced with a proper description; #3448 corrected from "Lettermail-rate" to "U.S.-rate" ($1.75)

### French / English parity
- **~1,000 French entries corrected** in `stamps-fr.json` so every stamp has a genuine French title and notes:
  - ~420 French notes that were fully or partly in English retranslated from the English source
  - ~110 half-translated "Franglais" titles fixed (e.g. "Année internationale of Forests" → "Année internationale des forêts", "Red (rivière) Settlement" → "Colonie de la rivière Rouge", "The Nativité" → "La Nativité")
  - ~400 titles left in English but with translatable words now translated (birds, flowers, maples, parks, universities, artworks, etc.); proper names (regiments, ships, bands, film and book titles) kept as-is
  - ~110 English series names inside French notes translated (e.g. "Wildflowers of Canada" → "Fleurs sauvages du Canada", "The Millennium Collection, …" → "Collection du millénaire, …")
- **French formatting normalised**: perforation fields stored as "English = French" reduced to the French side, decimal commas in perforation values (12,5 x 13), "1er" for the first of the month, stray "Inc.." / "Limited.;" punctuation cleaned up
- No French note is now identical to its English counterpart; EN/FR key sets match exactly

### Docs
- README category counts refreshed to match the data (History & Heritage 925, Nature & Wildlife 707, Arts & Culture 380, Culture & Society 119)

### Infrastructure
- Cache version bumped to v11
- Service worker: `stamps-fr.json` is now fetched network-first like `stamps.json` (it was cache-first, so French data updates could be served stale until the next cache bump)
- Stamp counts updated across README.md, README-fr.md, index.html and app.js

---

## v2.3.1 — Spring & Summer 2026 Issues

### Data
- **Canada Post Community Foundation 2026** (#3467): semipostal, Permanent™ + 10¢. Issued May 4, 2026.
- **Places of Pride 2026** (#3468–#3471): Little Sister's Book & Art Emporium (Vancouver), Metamorphosis (Saskatoon), The 519 (Toronto) and The Turret (Halifax) — second and final set. Issued June 5, 2026.
- **Blood Donation** (#3472). Issued June 11, 2026.
- **Indigenous Leaders 2026** (#3473–#3475): Bryan Trottier, Edward Lennie and Chief Wilton Littlechild — fifth set, honouring leaders in sport. Issued June 19, 2026.
- **Royal Canadian Legion centennial** (#3476). Issued July 17, 2026.
- Placeholders replaced and downstream placeholders shifted in both stamps.json and stamps-fr.json
- **3,482 stamps** catalogued (was 3,476)

### Docs
- **`CLAUDE.md` added**: step-by-step workflow for adding new stamps
- `.gitignore` added

### Infrastructure
- Cache version bumped to v9

---

## v2.3 — Sugar Shacks & Data Fixes

### Data
- **Sugar Shacks 2026** (#3465, #3466): two new stamps added — outdoor winter scene (red) and indoor family meal (yellow). Illustrated by Gérard DuBois, designed by Paprika. Issued March 19, 2026.
- **Placeholder expanded**: single "Maple Syrup Season" placeholder (#3465) replaced with two Sugar Shacks entries; all subsequent IDs (#3466–#3476) shifted to #3467–#3477 in both stamps.json and stamps-fr.json
- **Image filenames corrected**: Eid (#3462–#3464) and Sugar Shacks (#3465–#3466) now follow full `[id]-[slug]-[denomination]-[year].jpg` convention with `-p-` for Permanent™
- **3,476 stamps** catalogued (was 3,475)

### QA
- **`qa-images.py` added**: new QA script checking missing images, orphaned files, duplicate paths, empty fields, and duplicate IDs. Run from repo root: `python3 qa-images.py`

### Infrastructure
- Cache version bumped to v8
- Stamp counts updated across all files (README.md, README-fr.md, index.html, app.js, PROJECT-OVERVIEW.md)

---

## v2.2 — Bilingual (EN / FR)

### Bilingual Support
- **EN / FR toggle** in the header — switches language instantly
- **Complete French UI**: all buttons, labels, filters, loading states, empty states, modal labels, About panel, Contribute panel
- **Automatic category translation**: all 15 top-level categories and 100+ subcategories translate via composable lookup (no per-stamp duplication)
- **Automatic colour translation**: all philatelic colour terms (carmin, vermillon, outremer, etc.)
- **French stamp data** (`data/stamps-fr.json`): complete French `mainTopic` and `notes` for all 3,473 stamps
- **Bilingual search**: when in French mode, search indexes both English and French text — "castor" and "beaver" both find #001
- **Language persistence**: preference saved in localStorage
- **i18n architecture**: `js/i18n.js` module with string lookup, category/colour translation tables, and French data loader

### Data
- **336 legacy subcategories normalised**: zero non-canonical remaining — every stamp follows `Category: Subcategory` format

### Infrastructure
- Service worker updated to cache `i18n.js` and `stamps-fr.json`
- Cache version bumped to v4

---

## v2.1 — Data Enrichment & Performance Hardening

### Data
- **Zero empty fields**: every stamp now has category, notes, colour, and denomination filled
- **1,240 → 0 Miscellaneous**: all stamps recategorised into 15+ proper categories
- **561 stamps enriched**: historical context, notable varieties, series information added to notes
- **3,167 colours filled**: classic stamps with philatelic colour names, modern stamps as multicoloured
- **9 incorrect colours fixed**: including Bluenose (#140), postage dues, and others
- **Permanent rate updated**: $0.92/$0.99 → $1.24 across 715 stamps
- **2025 expanded**: 28 → 37 entries (Christmas × 4, Graphic Novelists × 6, etc.)
- **17 new 2026 stamps** added (#3457–3474)
- **Duplicate IDs fixed**: #015a, #019a for colour variants
- **20 image path mismatches corrected** (ID vs filename offset)
- **Scott catalogue references removed** from entire dataset

### Performance
- **Service worker** (`sw.js`): caches app files + up to 500 recently viewed images. Network-first for data, cache-first for images. Especially important on iOS where Safari purges HTTP cache
- **Image load timeout** (15s): prevents hung requests from freezing the queue on iPad
- **Queue flush on filter change**: switching decades drops pending loads for hidden stamps, visible ones load immediately
- **Re-observe on filter change**: flushed cards that become visible again get re-queued
- **localStorage cache** for stamps.json: skip re-parsing 1.4MB on repeat visits
- **sessionStorage filter state**: decade and search survive page refresh
- **JSON preload** hint: browser fetches data before JS parses

### UI
- **Chevron arrows** on decade scroll replacing subtle fade indicators
- **Active decade auto-scrolls** into view when selected
- **Modal footer** clarified: proprietary ID reference, not Scott numbers
- **Version number** (v2.1) shown in header

### Security
- **Content Security Policy** with `worker-src 'self'` for service worker
- **Referrer policy**: `no-referrer`

---

## v2.0 — Master Rebuild

### Architecture Change
Replaced two separate codepaths (desktop canvas + mobile paginated grid) with a single responsive card grid. One codebase, one render path, phone → desktop.

### Performance
| Before | After |
|---|---|
| `* { translate3d }` on 3,447 elements | Zero forced GPU layers, `content-visibility: auto` |
| Synchronous rendering | Batched at 250/frame with progress bar |
| Blob URL cache + cleanup timers | Native browser cache, concurrency queue (max 6) |
| Full DOM rebuild on search | Show/hide existing cards + 180ms debounce |

### New Features
- Responsive card grid (CSS Grid `auto-fill`, 2–10+ columns)
- Decade pill navigation with counts
- Shimmer loading animation (three states: loading/loaded/error)
- Redesigned modal with metadata grid
- Maple leaf loading animation with progress bar
- Scroll-to-top button
- `prefers-reduced-motion` support
- `decoding="async"` on all images
- `destroy()` cleanup on unload

### Removed
- Desktop canvas/zoom/pan system
- Separate mobile view HTML and JS
- Blob URL image cache + cleanup timers
- Device detection (UA sniffing, maxTouchPoints, width checks)
- Draggable/resizable search bar
- Pan mode toggle, timeline mini-map
- CSS nesting (flattened for compatibility)

### Browser Support
- Chrome/Edge 85+, Safari 17.4+, Firefox 124+
- `content-visibility: auto` is progressive enhancement — older browsers render all cards normally
