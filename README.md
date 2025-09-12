# 🍁 Canadian Stamp Identifier

**A comprehensive visual identification tool for Canadian postage stamps (1851-2025)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://adrianspeyer.github.io/canadian-stamp-identifier)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-green?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission**: The most comprehensive visual identification tool for Canadian stamps, making stamp identification accessible to collectors worldwide.

## 🌟 What Makes This Special?

This tool revolutionizes stamp identification through **visual pattern matching** in a zoomable, interactive interface. Instead of flipping through catalogs:

- **Browse 3,777+ stamps** in one massive, zoomable timeline mosaic
- **Smart search** with fuzzy matching, synonyms, and multi-field queries
- **Instant visual identification** - zoom, click, get details
- **Drag & resize interface** - customize your workspace
- **Era jumping** - instantly navigate to 1900s, 1930s, 1960s, 1990s, 2020s
- **Mobile responsive** - works perfectly on all devices

## 🚀 Try It Now

**👆 [Launch the Stamp Identifier](https://adrianspeyer.github.io/canadian-stamp-identifier)**

No installation needed - works in any modern web browser!

## ✨ Key Features

### 🔍 Advanced Search
- **Smart text matching**: "queen red" finds red stamps with queens
- **Synonym recognition**: "olympics" also finds "games", "sport"
- **Multi-word search**: "cartier 1935" finds Jacques Cartier from 1935
- **Fuzzy matching**: handles common misspellings
- **All field search**: searches topics, colors, denominations, notes, years

### 🖼️ Visual Interface
- **Million Dollar Homepage style**: 3,777 stamps in one zoomable grid
- **Lazy loading**: fast performance with thousands of images
- **Drag & drop search**: moveable, resizable search box
- **Era navigation**: quick jump buttons for major time periods
- **Responsive zoom**: smooth navigation from overview to detail

### 📱 User Experience
- **Mobile optimized**: full functionality on phones and tablets
- **Keyboard shortcuts**: Enter/Shift+Enter to navigate search results
- **Visual feedback**: highlighted search matches, hover effects
- **Accessibility**: proper contrast, semantic markup

## 📊 Current Statistics

- 🖼️ **Stamps cataloged**: 3,777 stamps
- 📅 **Years covered**: 1851-2025 (174 years)
- 🔍 **Search accuracy**: Multi-field fuzzy matching
- 📱 **Platforms**: Web (fully responsive)
- ⚡ **Performance**: Lazy loading, batch rendering
- 🎯 **Coverage**: Main stamp designs (no varieties)

## 🤝 How to Contribute

### 🖼️ Add Missing Stamps
**Help us reach 100% coverage!**

**Priority areas:**
- Early provincial issues (1851-1900)
- Commemorative series gaps
- Modern definitives (2020-2025)
- Regional issues

### 📝 Data Improvements
- Correct stamp details
- Add missing information
- Improve descriptions
- Update color descriptions

### 💻 Technical Contributions
- Performance optimizations
- New search features
- Accessibility improvements
- Mobile enhancements

## 📖 Contributing Guide

### Option 1: Simple Contribution
1. **Open an Issue** with your stamp details
2. **Upload image** and provide information
3. **We handle the technical parts**

### Option 2: Direct Contribution
1. **Fork the repository**
2. **Add image** to `images/[decade]/[id]-[topic]-[year].jpg`
3. **Update** `data/stamps.json`:
   ```json
   {
     "id": "001",
     "year": 1851,
     "mainTopic": "Beaver",
     "subTopic": "Three Pence",
     "denomination": "3d",
     "color": "red",
     "image": "images/1850s/001-beaver-1851.jpg",
     "notes": "First Canadian stamp"
   }
   ```
4. **Submit pull request**

## 🛠️ Technical Architecture

**Frontend**: Pure HTML5, CSS3, JavaScript
- No frameworks or dependencies
- Intersection Observer API for lazy loading
- Canvas-based zoom and pan interactions
- Responsive flexbox layout

**Data**: JSON-based catalog system
- Simple, human-readable format
- Easy for contributors to edit
- Version controlled with Git

**Performance**: 
- Lazy image loading
- Batch rendering (200 stamps at a time)
- Debounced search with relevance scoring
- Optimized for 3,000+ stamps

**Hosting**: GitHub Pages
- Free, reliable hosting
- Automatic deployment
- Global CDN distribution

## 🎯 Design Philosophy

### Visual-First Identification
Traditional catalogs require knowing details to find stamps. This tool reverses that - **see the stamp, get the details**.

### Community-Driven
Open source approach ensures:
- No vendor lock-in
- Community ownership
- Transparent development
- Collaborative improvement

### Performance Focus
Built to handle thousands of stamps smoothly:
- Sub-5 second initial load
- Smooth 60fps zooming
- Responsive search results
- Minimal memory usage

## 📋 Quality Standards

### Images
- **Resolution**: 300+ DPI minimum
- **Format**: JPG preferred, PNG accepted
- **Aspect**: Proper stamp proportions
- **Quality**: Sharp, well-lit, accurate colors

### Data
- **Accuracy**: Verified against reliable sources
- **Completeness**: All available fields populated
- **Consistency**: Standardized terminology
- **Documentation**: Sources noted when possible

### Code
- **No dependencies**: Pure web technologies
- **Accessibility**: WCAG compliant
- **Performance**: Optimized for scale
- **Documentation**: Comprehensive comments

## 🗺️ Roadmap

### Phase 1: Coverage Completion
- [ ] Fill remaining gaps in 1851-1950
- [ ] Complete commemorative series
- [ ] Add recent definitives (2020-2025)

### Phase 2: Enhanced Features  
- [ ] Advanced filters (denomination, color, era)
- [ ] Comparison mode (side-by-side stamps)
- [ ] Print-friendly views
- [ ] Bookmark/favorites system

### Phase 3: Community Features
- [ ] User contributions workflow
- [ ] Discussion system for stamp details
- [ ] Rating/verification system
- [ ] API for developers

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
