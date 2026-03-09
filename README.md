# 🍁 Canadian Stamp Identifier

**A comprehensive visual identification tool for Canadian postage stamps (1851–2026)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://adrianspeyer.github.io/canadian-stamp-identifier)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-green?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission**: The most comprehensive visual identification tool for Canadian stamps, making stamp identification accessible to collectors worldwide.

## 🌟 What Makes This Special?

This tool makes stamp identification easy through **visual pattern matching** in a responsive, searchable card grid. Instead of flipping through catalogues:

- **Browse 3,470+ stamps** in a responsive grid that works on every device
- **Filter by decade** with a scrollable pill bar — instantly jump to any era
- **Smart search** across topics, years, colours, denominations, and notes
- **Tap for details** — get ID number, denomination, category, and notes
- **Lazy-loaded images** with visual placeholders — fast on any connection

## 🚀 Try It Now

**👆 [Launch the Stamp Identifier](https://adrianspeyer.github.io/canadian-stamp-identifier)**

No installation needed — works in any modern web browser.

## ✨ Key Features

### 🔍 Search & Filter
- **Instant search**: type a year, topic, colour, or keyword
- **Decade filtering**: scrollable pill bar with stamp counts per era
- **Combined filtering**: search within a decade (e.g., "beaver" in the 1850s)
- **Debounced input**: responsive even with 3,470+ stamps

### 🖼️ Visual Interface
- **Responsive card grid**: adapts from 2 columns on phones to 10+ on ultrawide
- **Decade-coloured placeholders**: loading stamps show topic name on a coloured background with shimmer animation
- **Error states**: failed images show "Image unavailable" — you always know what's loading vs. broken
- **Scroll-to-top button**: quick return to the top of long results

### 📱 Cross-Platform
- **Phone**: 2–3 column grid, touch-friendly cards, sticky search
- **Tablet**: 4–6 columns, smooth scrolling, no crashes
- **Desktop**: 8–10+ columns, hover effects, keyboard navigation
- **One codebase**: no separate mobile/desktop views

### ♿ Accessibility
- **Keyboard navigable**: Tab through cards, Enter to open details
- **ARIA labels**: screen reader support for cards, decade filters, and modal
- **Reduced motion**: respects `prefers-reduced-motion` — disables shimmer and transitions
- **Focus indicators**: visible focus outlines on all interactive elements

### 🔒 Security
- **Content Security Policy**: restricts script/image/font sources
- **No inline handlers**: all events via `addEventListener`
- **Escaped output**: all stamp data inserted via `textContent`, not `innerHTML`
- **No external dependencies**: zero third-party JavaScript

## 📊 Current Statistics

- 🖼️ **Stamps catalogued**: 3,470+ stamps
- 📅 **Years covered**: 1851–2026 (175 years)
- 🔍 **Categories**: 15 top-level categories including Nature & Wildlife, History & Heritage, Holidays & Events, Sports & Recreation, Arts & Culture, and more
- 📱 **Platforms**: Web (fully responsive — phone, tablet, desktop)
- ⚡ **Performance**: Batched rendering, lazy image loading, `content-visibility` optimisation
- 🎯 **Coverage**: Main stamp designs (no varieties, no errors)

## 🛠️ Technical Architecture

**Frontend**: Pure HTML5, CSS3, JavaScript (ES2020+)
- No frameworks or dependencies
- Single responsive card grid with CSS Grid `auto-fill`
- `content-visibility: auto` for off-screen rendering optimisation

**Data**: JSON-based catalogue system
- Simple, human-readable format
- Easy for contributors to edit
- Version controlled with Git

**Performance**:
- Batched card rendering (250 per animation frame with progress bar)
- IntersectionObserver lazy image loading with concurrency queue (max 6 simultaneous)
- `decoding="async"` on images to prevent main thread blocking
- `content-visibility: auto` with `contain-intrinsic-size` for off-screen cards
- Debounced search (180ms)
- Show/hide filtering (no DOM recreation)

**Security**:
- Content Security Policy via `<meta>` tag
- `no-referrer` policy
- All stamp data rendered via DOM API (`createElement` + `textContent`)
- Zero `innerHTML` with user/stamp data

**Hosting**: GitHub Pages
- Free, reliable hosting
- Automatic deployment
- Global CDN distribution

## 🎯 Design Philosophy

### Visual-First Identification
Traditional catalogues require knowing details to find stamps. This tool reverses that — **see the stamp, get the details**.

### One Codebase, Every Device
No separate mobile/desktop views. One responsive grid scales from phone to ultrawide. Every feature works the same everywhere.

### Community-Driven
Open source approach ensures:
- Community ownership
- Transparent development
- Collaborative improvement

### Performance at Scale
Built to handle thousands of stamps smoothly:
- Batched initial render with loading progress
- Concurrency-limited image loading (kind to servers and devices)
- Native browser image cache (no blob URLs)
- Off-screen rendering skip via `content-visibility`

## 🤝 How to Contribute

### 📝 Data Improvements
- Correct stamp details
- Recategorise "Miscellaneous" stamps into proper categories
- Add missing information
- Improve descriptions
- Update colour descriptions

### 💻 Technical Contributions
- Performance optimisations
- New search features
- Accessibility improvements
- Category/filter enhancements

## 📖 Contributing Guide

### Option 1: Simple Contribution
1. **Open an Issue** with your stamp details
2. **Upload image** and provide information
3. **We handle the technical parts**

### Option 2: Direct Contribution
1. **Fork the repository**
2. **Add image** to `images/[decade]/[id]-[topic]-[denomination]-[year].jpg`
3. **Update** `data/stamps.json`:
   ```json
   {
     "id": "001",
     "year": 1851,
     "mainTopic": "Beaver",
     "subTopic": "Nature & Wildlife: Animals",
     "denomination": "3d",
     "color": "red",
     "image": "images/1850s/001-beaver-3d-1851.jpg",
     "notes": "First Canadian stamp"
   }
   ```
4. **Submit pull request**

### SubTopic Categories
When adding stamps, use one of these top-level categories:
- `History & Heritage` (Royalty, War & Military, Indigenous Peoples, Black History, etc.)
- `Nature & Wildlife` (Animals, Plants, Natural Phenomena)
- `Holidays & Events` (Christmas, Lunar New Year, Diwali, Hanukkah, Eid, Greetings)
- `Arts & Culture` (Authors, Visual Arts, Photography, Comics, Opera, Folklore)
- `Sports & Recreation` (Hockey, Motorsport, Olympics, etc.)
- `Transportation` (Ships, Aircraft, Railways, etc.)
- `Postal History` (Coil Stamps, Community Foundation, etc.)
- `Government & National Symbols` (Flags, Parliament, Confederation)
- `Science & Technology` (Industry, Inventions)
- `Architecture & Landmarks` (UNESCO, Lighthouses, etc.)
- `Culture & Society` (Organizations, Traditions)
- `Public Awareness` (Health)

## 📋 Quality Standards

### Images
- **Resolution**: 300+ DPI minimum
- **Format**: JPG preferred, PNG accepted
- **Aspect**: Proper stamp proportions
- **Quality**: Sharp, well-lit, accurate colours

### Data
- **Accuracy**: Verified against reliable sources
- **Completeness**: All available fields populated
- **Consistency**: Standardised terminology and category format

### Code
- **No dependencies**: Pure web technologies
- **Performance**: Optimised for 3,000+ stamps
- **Accessibility**: WCAG-friendly markup and interactions
- **Security**: CSP, no inline handlers, escaped output

## 🗺️ Roadmap

### Completed ✅
- [x] Complete catalogue 1851–2025
- [x] 2026 stamp schedule added
- [x] Unified responsive design (phone/tablet/desktop)
- [x] Decade navigation with counts
- [x] Performance optimisation (batched rendering, lazy loading, content-visibility)
- [x] Accessibility (keyboard nav, ARIA, reduced motion)
- [x] Security hardening (CSP, no innerHTML, no inline handlers)
- [x] Data enrichment (360+ stamps recategorised from Miscellaneous)

### In Progress 🔄
- [ ] Continue recategorising remaining Miscellaneous stamps (~1,240)
- [ ] Add images for 2025 stamps #3441+
- [ ] Add images for 2026 stamps as issued

### Future 🔮
- [ ] Advanced filters (denomination, colour, category)
- [ ] Print-friendly views
- [ ] Bookmark/favourites
- [ ] Wishlist
- [ ] Contributor leaderboard

## 📜 License & Legal

**License**: GNU General Public License v3.0
- Ensures this remains open source forever
- All improvements benefit the community
- Commercial use allowed with attribution

**Images**: Contributors retain copyright, grant usage rights
**Data**: Public domain compilation
**Not affiliated** with Canada Post or official sources

## 🆘 Support & Community

**Technical Issues**: [GitHub Issues](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)
**Feature Requests**: [GitHub Discussions](https://github.com/adrianspeyer/canadian-stamp-identifier/discussions)
**General Questions**: Create an issue with the "question" label

**New to GitHub?** Check the [GitHub Guide](https://guides.github.com/activities/hello-world/)

## 🏆 Contributors

Thanks to everyone who has contributed stamps, data, and code!

<a href="https://github.com/adrianspeyer/canadian-stamp-identifier/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=adrianspeyer/canadian-stamp-identifier" />
</a>

---

## ⭐ Star This Project

**Found this useful?** Star the repository to help others discover this tool!

[![GitHub Stars](https://img.shields.io/github/stars/adrianspeyer/canadian-stamp-identifier?style=social)](https://github.com/adrianspeyer/canadian-stamp-identifier/stargazers)

---

<div align="center">

**🍁 Proudly Canadian • 🌟 Community Driven • 🚀 Built for Collectors**

*The most comprehensive Canadian stamp identification tool on the web*

[**Try It Now →**](https://adrianspeyer.github.io/canadian-stamp-identifier)

</div>
