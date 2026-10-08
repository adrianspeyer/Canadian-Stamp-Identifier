# 🍁 Canadian Stamp Identifier

**A comprehensive visual identification tool for Canadian postage stamps (1851–2026)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-green?style=for-the-badge)](#-how-to-contribute)
[![GitHub Issues](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission**: The most comprehensive visual identification tool for Canadian stamps, making stamp identification accessible to collectors worldwide.

🇫🇷 [Version française](README-fr.md)

---

## Table of Contents

- [What Makes This Special](#-what-makes-this-special)
- [Try It Now](#-try-it-now)
- [Features](#-features)
- [Current Statistics](#-current-statistics)
- [How to Use](#-how-to-use)
- [How to Contribute](#-how-to-contribute)
- [Category Reference](#-category-reference)
- [JSON Format Reference](#-json-format-reference)
- [Note on IDs](#-note-on-ids)
- [Technical Architecture](#-technical-architecture)
- [Roadmap](#-roadmap)
- [License & Legal](#-license--legal)

---

## 🌟 What Makes This Special

This tool makes stamp identification easy through **visual pattern matching** in a responsive, searchable card grid. Instead of flipping through catalogues:

- **Browse 3,470+ stamps** in a responsive grid that works on every device
- **Filter by decade** with a scrollable pill bar — instantly jump to any era
- **Smart search** across topics, years, colours, denominations, and historical notes
- **Tap for details** — get ID, denomination, category, colour, and historical context
- **Lazy-loaded images** with visual placeholders — fast on any connection

## 🚀 Try It Now

**👆 [Launch the Stamp Identifier](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)**

No installation needed — works in any modern web browser. Works offline after first visit.

## ✨ Features

### Search & Filter
- **Instant search**: type a year, topic, colour, or keyword — searches notes too
- **Decade filtering**: scrollable pill bar with stamp counts per era
- **Combined filtering**: search within a decade (e.g., "beaver" in the 1850s)
- **Debounced input**: responsive even with 3,470+ stamps

### Visual Interface
- **Responsive card grid**: 2 columns on phones → 10+ on ultrawide
- **Shimmer loading**: coloured decade placeholders with animated shimmer while images load
- **Three card states**: loading (shimmer), loaded (fade-in), error ("Image unavailable")
- **Decade navigation**: chevron arrows with active pill auto-scroll
- **Scroll-to-top**: quick return button after scrolling

### Cross-Platform
- **Phone**: 2–3 column grid, touch-friendly, sticky search
- **Tablet**: 4–6 columns, timeout-protected image loading
- **Desktop**: 8–10+ columns, hover effects, keyboard navigation
- **One codebase**: no separate mobile/desktop views

### Performance
- **Service worker**: caches app files and up to 500 recently viewed images
- **Concurrency queue**: max 6 simultaneous image loads with 15s timeout
- **Queue flush on filter**: switching decades immediately prioritises visible stamps
- **localStorage cache**: stamps.json cached locally for instant repeat visits
- **Session persistence**: decade and search filters survive page refresh
- **JSON preload**: browser starts fetching data before JS parses

### Bilingual (EN / FR)
- **Language toggle** in the header — switches instantly between English and French
- **Complete French UI**: all buttons, labels, filters, panels, and error states
- **Automatic category translation**: all 14 categories and 100+ subcategories translate via lookup
- **Colour translation**: all philatelic colour terms translate automatically
- **French stamp data**: `stamps-fr.json` provides translated mainTopics and notes (incremental — falls back to English for untranslated stamps)
- **Persistent**: language preference saved in localStorage

### Accessibility
- Keyboard navigable (Tab + Enter/Space)
- ARIA labels on all interactive elements
- `prefers-reduced-motion` support
- Focus-visible outlines

### Security
- Content Security Policy restricting all sources
- No inline event handlers
- All data via `createElement` + `textContent`
- Zero third-party JavaScript

## 📊 Current Statistics

| Metric | Value |
|---|---|
| Stamps catalogued | 3,488 |
| Years covered | 1851–2026 (175 years) |
| Categories | 15 top-level, 100+ subcategories, all canonical |
| Empty notes | 0 — every stamp has historical context |
| Empty colours | 0 — every stamp has a colour description |
| Non-canonical categories | 0 — every subTopic follows `Category: Subcategory` format |
| Platforms | Phone, tablet, desktop |
| Dependencies | 0 |
| Version | v2.3 |

## 📖 How to Use

1. **Browse by era** — tap a decade pill to filter, tap again to show all
2. **Search** — type a year, topic, colour, or keyword (searches notes too)
3. **Combine filters** — search within a decade for precise results
4. **Compare visually** — scan the grid for your stamp's design
5. **Get details** — tap any stamp for ID, denomination, category, and historical notes
6. **Research further** — use the year, topic, and denomination to cross-reference in official stamp catalogues for varieties and pricing

## 🤝 How to Contribute

Every contribution — a corrected note, a better colour description, a missing image — makes the tool better for collectors everywhere.

### Easy Contributions (No Code Required)

| Contribution | How |
|---|---|
| **Spot an error** | Open a [GitHub Issue](https://github.com/adrianspeyer/canadian-stamp-identifier/issues) with the stamp ID and correction |
| **Have a stamp image** | Upload it in an issue — we'll handle the rest |
| **Refine colours** | Many modern stamps are "multicoloured" — more specific descriptions welcome |
| **Add historical context** | Know the story behind a stamp? Share it in an issue |

### Direct Contributions (Pull Request)

1. **Fork** the repository on GitHub
2. **Add images** to `images/[decade]/` using the naming convention below
3. **Update** `data/stamps.json` with stamp details (see [JSON Format Reference](#-json-format-reference))
4. **Submit** a pull request

### Adding Stamps with Claude Code

This repo includes a [`CLAUDE.md`](CLAUDE.md) file that lets [Claude Code](https://docs.anthropic.com/en/docs/claude-code) automate the entire stamp-addition workflow. To use it:

1. **Install Claude Code** and open the repo
2. **Drop raw stamp images** into `images/2020s/`
3. **Tell Claude Code** what the stamps are — paste the Canada Post press release text or provide a URL
4. Claude Code will: rename images to the project convention, assign sequential IDs in chronological order, write English descriptions, translate to French, pick the right category, update stamp counts across all files, bump the service worker cache, and run QA
5. **Review the summary**, then let it commit and push

### Image Guidelines

| Guideline | Details |
|---|---|
| Resolution | 300+ DPI minimum |
| Format | JPG preferred, PNG accepted |
| Content | Main stamp design only (not varieties or errors) |
| Naming | `[id]-[topic]-[denomination]-[year].jpg` |
| Example | `001-beaver-3d-1851.jpg` |

## 📂 Category Reference

Every stamp uses the `Category: Subcategory` format for the `subTopic` field. Here are all 14 canonical categories with their subcategories:

### History & Heritage (760 stamps)
`Royalty` · `War & Military` · `Millennium` · `Indigenous Peoples` · `Exploration` · `Political Leaders` · `International` · `Black History` · `Prime Ministers` · `Notable Canadians` · `Anniversaries` · `Civil Rights` · `Confederation` · `Canada 150` · `LGBTQ2+` · `People` · `Labour` · `Maritime` · `Gold Rush` · `World Leaders` · `Organizations` · `Humanitarian` · `Disasters`

### Nature & Wildlife (573 stamps)
`Flowers` · `Animals` · `Birds` · `Landscapes` · `Marine Life` · `Trees` · `Prehistoric` · `Insects` · `National Parks` · `Parks` · `Plants` · `Mountains` · `Weather & Sky` · `Fungi` · `Waterfalls`

### Arts & Culture (439 stamps)
`Paintings` · `Visual Arts` · `Music` · `Photography` · `Film & Television` · `Authors` · `Crafts` · `Comics` · `Indigenous Art` · `Cultural Artifacts` · `Folklore` · `Science Fiction` · `Children's Literature` · `Gardens` · `Opera` · `Museums` · `Theatre` · `Dance` · `Circus` · `Design` · `Literature`

### Holidays & Events (376 stamps)
`Christmas` · `Lunar New Year` · `Halloween` · `Greetings` · `Exhibitions` · `Eid` · `Diwali` · `Celebrations` · `Hanukkah`

### Sports & Recreation (341 stamps)
`Hockey` · `Olympics` · `Events` · `CFL` · `Recreation` · `Fishing` · `Golf` · `Motorsport` · `Figure Skating` · `Basketball` · `Swimming` · `Paralympics` · `Equestrian` · `Lacrosse` · `Rowing` · `Athletics` · `Baseball` · `Skiing` · `Curling` · `Cycling` · `Winter Sports` · `Racing`

### Transportation (225 stamps)
`Ships & Boats` · `Aircraft` · `Vehicles` · `Trains` · `Roads` · `Airmail` · `Waterways` · `Motorcycles`

### Government & National Symbols (187 stamps)
`Flag` · `Provinces` · `Parliament` · `National Symbols` · `RCMP` · `Justice` · `Government` · `Honours` · `Heraldry` · `Canada Day` · `Military`

### Architecture & Landmarks (173 stamps)
`Historic Sites` · `Heritage Buildings` · `UNESCO` · `Cities` · `Bridges` · `Lighthouses` · `Scenic` · `Religious` · `Memorials` · `Government` · `Engineering`

### Culture & Society (145 stamps)
`Education` · `Organizations` · `Emergency Services` · `Heritage` · `Roadside Attractions` · `Zodiac` · `Business & Industry` · `Immigration` · `Food & Drink` · `Youth` · `Community` · `Toys & Games`

### Postal History (121 stamps)
`Postage Due` · `Collectibles` · `Community Foundation` · `Mail Delivery` · `Special Delivery` · `Postal Unions` · `Postal Workers` · `Registered Mail` · `Post Offices`

### Science & Technology (96 stamps)
`Science` · `Inventions` · `Medicine` · `Space` · `Communications` · `Geology` · `Astronomy` · `Aviation`

### Industry (33 stamps)
`Resources` · `Agriculture` · `Energy` · `Manufacturing` · `Commerce`

### Organizations (7 stamps)
`Scouting & Girl Guides` · `United Nations`

### Public Awareness (12 stamps)
`Health`

## 📋 JSON Format Reference

Each stamp in `data/stamps.json` has this structure:

```json
{
  "id": "001",
  "year": 1851,
  "mainTopic": "Beaver",
  "subTopic": "Nature & Wildlife: Animals",
  "denomination": "3d",
  "color": "red",
  "image": "images/1850s/001-beaver-3d-1851.jpg",
  "notes": "Canada's first stamp, depicting a beaver. Imperforate. Printed by Rawdon, Wright, Hatch & Edson."
}
```

| Field | Description | Required |
|---|---|---|
| `id` | Proprietary reference number (see [Note on IDs](#-note-on-ids)) | Yes |
| `year` | Year of issue | Yes |
| `mainTopic` | Primary subject/design description | Yes |
| `subTopic` | Category in `Category: Subcategory` format (see [Category Reference](#-category-reference)) | Yes |
| `denomination` | Face value (e.g., `3d`, `5¢`, `PERMANENT™ (P). Current monetary value: $1.24 .`) | Yes |
| `color` | Dominant colour(s) (e.g., `red`, `blue and green`, `multicoloured`) | Yes |
| `image` | Path to image file in `images/[decade]/` | Yes |
| `notes` | Historical context, series info, notable varieties. 1–3 sentences. | Yes |

### Notes Guidelines
- Keep to 1–3 sentences
- Include historical context: what was the occasion, what series is it part of
- Mention notable varieties or errors where known (e.g., "A variety exists with inverted centre")
- Use Canadian English (colour, honour, catalogue)
- **Never include Scott catalogue numbers** (licensing restriction)
- Cross-reference other stamps using proprietary IDs: "See also #140 and #868"

## 🔢 Note on IDs

The stamp IDs in this project (`#001`, `#002`, etc.) are **proprietary reference numbers** created specifically for this tool. They are **not** Scott catalogue numbers or any other licensed numbering system.

For varieties, errors, and detailed pricing, cross-reference the **year**, **topic**, and **denomination** in official stamp catalogues.

## 🛠️ Technical Architecture

### Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES2020+) — zero dependencies
- **Data**: JSON catalogue, Git version controlled
- **Hosting**: GitHub Pages with global CDN
- **Caching**: Service worker + localStorage + browser HTTP cache

### Performance Strategy
| Layer | Technique |
|---|---|
| Rendering | Batched at 250 cards/frame with progress bar |
| Off-screen | `content-visibility: auto` skips rendering hidden cards |
| Image loading | IntersectionObserver → concurrency queue (max 6, 15s timeout) |
| Image decode | `decoding="async"` — off main thread |
| Filtering | Show/hide existing DOM (no recreation), queue flush on filter change |
| Data | localStorage cache, `<link rel="preload">` hint |
| Repeat visits | Service worker: cache-first for images, network-first for data |
| Search | 180ms debounce, indexes all fields including notes |

### Security
- Content Security Policy via `<meta>` tag (`script-src 'self'`, `img-src 'self' data:`, etc.)
- `no-referrer` policy
- All stamp data rendered via `createElement` + `textContent` (zero `innerHTML` with data)
- Zero inline event handlers
- Service worker scoped to same origin

## 🗺️ Roadmap

### Completed ✅
- [x] Complete catalogue 1851–2026 (3,488 stamps)
- [x] Unified responsive design (phone → desktop)
- [x] Decade navigation with chevron arrows
- [x] Service worker, batched rendering, lazy loading, content-visibility
- [x] Concurrency queue with timeout + filter-aware flush
- [x] localStorage + sessionStorage caching
- [x] Accessibility (keyboard nav, ARIA, reduced motion)
- [x] Security (CSP, no innerHTML, no inline handlers)
- [x] All stamps categorised — zero Miscellaneous, zero non-canonical subcategories
- [x] All stamps have historical notes — zero empty
- [x] All stamps have colour descriptions — zero empty
- [x] 561 stamps enriched with historical context and notable varieties
- [x] Permanent stamp rate updated to $1.24
- [x] Duplicate IDs and image path mismatches corrected
- [x] 336 legacy subcategories normalised to canonical format
- [x] Bilingual UI (EN/FR) with language toggle
- [x] Automatic category and colour translation

### Future 🔮
- [ ] Complete French stamp translations (mainTopic + notes for all 3,488 stamps)
- [ ] Print-friendly views
- [ ] Bookmark/favourites
- [ ] Wishlist
- [ ] Refine "multicoloured" with more specific descriptions (community)

## 📜 License & Legal

**License**: [GNU Affero General Public License v3.0](LICENSE)
- Ensures this remains open source forever — including network/server use
- All improvements benefit the community
- Commercial use allowed with attribution

**Images**: Contributors retain copyright, grant usage rights for this project
**Data**: Public domain compilation
**Not affiliated** with Canada Post or any official source

---

<div align="center">

**🍁 Proudly Canadian • 🌟 Community Driven • 🚀 Built for Collectors**

*The most comprehensive Canadian stamp identification tool on the web*

[**Try It Now →**](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)

[![GitHub Stars](https://img.shields.io/github/stars/adrianspeyer/canadian-stamp-identifier?style=social)](https://github.com/adrianspeyer/canadian-stamp-identifier/stargazers)

</div>
