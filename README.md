# 🍁 Canadian Stamp Identifier

**A comprehensive visual identification tool for Canadian postage stamps (1851–2026)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://adrianspeyer.github.io/canadian-stamp-identifier)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-green?style=for-the-badge)](#-how-to-contribute)
[![GitHub Issues](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission**: The most comprehensive visual identification tool for Canadian stamps, making stamp identification accessible to collectors worldwide.

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

**👆 [Launch the Stamp Identifier](https://adrianspeyer.github.io/canadian-stamp-identifier)**

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
| Stamps catalogued | 3,473 |
| Years covered | 1851–2026 (175 years) |
| Categories | 15 top-level, 80+ subcategories |
| Empty notes | 0 — every stamp has historical context |
| Empty colours | 0 — every stamp has a colour description |
| Empty categories | 0 — zero Miscellaneous |
| Platforms | Phone, tablet, desktop |
| Dependencies | 0 |
| Version | v2.1 |

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
| **Improve categories** | ~200 stamps still have legacy subcategories that need normalising |

### Direct Contributions (Pull Request)

1. **Fork** the repository on GitHub
2. **Add images** to `images/[decade]/` using the naming convention below
3. **Update** `data/stamps.json` with stamp details (see [JSON Format Reference](#-json-format-reference))
4. **Submit** a pull request

### Image Guidelines

| Guideline | Details |
|---|---|
| Resolution | 300+ DPI minimum |
| Format | JPG preferred, PNG accepted |
| Content | Main stamp design only (not varieties or errors) |
| Naming | `[id]-[topic]-[denomination]-[year].jpg` |
| Example | `001-beaver-3d-1851.jpg` |

## 📂 Category Reference

When adding or updating stamps, use the `Category: Subcategory` format for the `subTopic` field. Here are the canonical categories:

### History & Heritage (809 stamps)
`Royalty` · `War & Military` · `Indigenous Peoples` · `Black History` · `Civil Rights` · `Political Leaders` · `Prime Ministers` · `Exploration` · `Confederation` · `Anniversaries` · `Notable Canadians` · `International` · `Millennium` · `Maritime` · `Gold Rush` · `Expositions` · `Humanitarian` · `Labour` · `Disasters`

### Nature & Wildlife (611 stamps)
`Animals` · `Plants` · `Flowers` · `Trees` · `Birds` · `Landscapes` · `Parks` · `Mountains` · `Prehistoric` · `Marine Life` · `Fungi` · `Insects` · `Fossils` · `Weather & Sky` · `Natural Phenomena` · `National Parks` · `Seasons`

### Arts & Culture (340 stamps)
`Visual Arts` · `Music` · `Authors` · `Literature` · `Photography` · `Film` · `Film & Television` · `Comics` · `Science Fiction` · `Opera` · `Dance` · `Theatre` · `Crafts` · `Design` · `Folklore` · `Cultural Artifacts` · `Children's Literature`

### Holidays & Events (284 stamps)
`Christmas` · `Lunar New Year` · `Hanukkah` · `Diwali` · `Eid` · `Halloween` · `Valentine's Day` · `Greetings` · `Celebrations`

### Sports & Recreation (283 stamps)
`Hockey` · `Olympics` · `CFL` · `Football` · `Motorsport` · `Figure Skating` · `Baseball` · `Fishing` · `Racing` · `Swimming` · `Skiing` · `Lacrosse` · `Curling` · `Paralympics`

### Transportation (199 stamps)
`Aircraft` · `Airmail` · `Ships & Boats` · `Maritime` · `Trains` · `Railways` · `Automobiles` · `Vehicles` · `Roads` · `Motorcycles` · `Waterways`

### Government & National Symbols (132 stamps)
`Provinces` · `RCMP` · `Justice` · `Heraldry` · `Military` · `Honours` · `Maps`

### Architecture & Landmarks (125 stamps)
`Scenic` · `Heritage Buildings` · `Historic Sites` · `Engineering` · `Lighthouses` · `UNESCO` · `Government` · `Religious` · `Memorials`

### Postal History (106 stamps)
`Postage Due` · `Special Delivery` · `Registered Mail` · `Coil Stamps` · `Post Offices` · `Definitives` · `Community Foundation` · `Collectibles`

### Culture & Society (92 stamps)
`Organizations` · `Education` · `Food & Drink` · `Emergency Services` · `Business & Industry` · `Toys & Games` · `Immigration` · `Youth` · `Traditions`

### Science & Technology (81 stamps)
`Space` · `Inventions` · `Medicine` · `Communications` · `Geology` · `Astronomy` · `Aviation` · `Energy`

### Industry (37 stamps)
`Agriculture` · `Resources` · `Manufacturing` · `Energy` · `Commerce`

### Public Awareness (15 stamps)
`Health` · `Environment`

> **Note**: ~200 stamps still carry legacy subcategories from the original dataset (Latin species names, specific series titles, etc.). These are valid data but don't follow the standardised format above. Normalising them is an open contribution opportunity.

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
| Search | 180ms debounce, indexes all fields |

### Security
- Content Security Policy via `<meta>` tag (`script-src 'self'`, `img-src 'self' data:`, etc.)
- `no-referrer` policy
- All stamp data rendered via `createElement` + `textContent` (zero `innerHTML` with data)
- Zero inline event handlers
- Service worker scoped to same origin

## 🗺️ Roadmap

### Completed ✅
- [x] Complete catalogue 1851–2026 (3,473 stamps)
- [x] Unified responsive design (phone → desktop)
- [x] Decade navigation with chevron arrows
- [x] Service worker, batched rendering, lazy loading, content-visibility
- [x] Concurrency queue with timeout + filter-aware flush
- [x] localStorage + sessionStorage caching
- [x] Accessibility (keyboard nav, ARIA, reduced motion)
- [x] Security (CSP, no innerHTML, no inline handlers)
- [x] Zero Miscellaneous — all stamps categorised
- [x] Zero empty notes — historical context on every stamp
- [x] Zero empty colours — colour on every stamp
- [x] Permanent stamp rate updated to $1.24
- [x] 561 stamps enriched with historical notes
- [x] 9 incorrect colour values fixed
- [x] Duplicate IDs and image path mismatches corrected

### Future 🔮
- [ ] Normalise ~200 legacy subcategories
- [ ] Advanced filters (denomination, colour, category dropdowns)
- [ ] Thumbnail generation for faster grid loading
- [ ] Print-friendly views
- [ ] Bookmark/favourites
- [ ] Contributor leaderboard

## 📜 License & Legal

**License**: [GNU General Public License v3.0](LICENSE)
- Ensures this remains open source forever
- All improvements benefit the community
- Commercial use allowed with attribution

**Images**: Contributors retain copyright, grant usage rights for this project
**Data**: Public domain compilation
**Not affiliated** with Canada Post or any official source

---

<div align="center">

**🍁 Proudly Canadian • 🌟 Community Driven • 🚀 Built for Collectors**

*The most comprehensive Canadian stamp identification tool on the web*

[**Try It Now →**](https://adrianspeyer.github.io/canadian-stamp-identifier)

[![GitHub Stars](https://img.shields.io/github/stars/adrianspeyer/canadian-stamp-identifier?style=social)](https://github.com/adrianspeyer/canadian-stamp-identifier/stargazers)

</div>
