# 🍁 Canadian Stamp Identifier

**A community-driven visual identification tool for Canadian postage stamps (1851-2025)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://adrianspeyer.github.io/canadian-stamp-identifier)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome-green?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Issues](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission**: Create the most comprehensive visual identification tool for Canadian stamps, making stamp identification accessible to collectors worldwide.

## 🌟 What Is This?

This project helps stamp collectors identify Canadian stamps through visual pattern matching. Instead of flipping through catalogs, users can:

- **Browse a visual timeline** of Canadian stamps from 1851 to today
- **Search by topic, year, or keyword** (beaver, olympics, 1935, etc.)
- **Zoom and navigate** through thousands of stamps in a single interface
- **Get instant identification** with our unique numbering system
- **Continue research** using the ID in traditional catalogs

## 🚀 Try It Now

**👆 [Launch the Stamp Identifier](https://adrianspeyer.github.io/canadian-stamp-identifier)**

No installation needed - works in any modern web browser!

## 🤝 How You Can Help

This is a **community project** and we need your help to make it amazing! Here's how you can contribute:

### 🖼️ Add Stamp Images
**We need high-quality images of Canadian stamps!**

**What we're looking for:**
- High-resolution scans (300+ DPI)
- Main stamp designs (not varieties or errors)
- Clear, well-lit images
- Any Canadian stamp from 1851-2025

**Current priorities:**
- [ ] 1851-1900 early issues
- [ ] 1920s-1940s commemoratives  
- [ ] 1960s-1980s definitives
- [ ] 2000s-2025 modern issues

### 📝 Improve Data
**Help us complete the catalog information!**

- Add missing stamp details
- Correct existing information
- Provide historical context
- Suggest better descriptions

### 🐛 Report Issues
**Found a problem? Let us know!**

- Broken functionality
- Missing stamps
- Incorrect information
- Suggestions for improvement

### 💻 Code Contributions
**Developers welcome!**

- Performance improvements
- New search features
- Mobile optimization
- Accessibility enhancements

## 📖 Quick Start for Contributors

### Option 1: Simple Contribution (No Technical Skills Required)

1. **Create a GitHub account** (free)
2. **Click "Issues"** tab above
3. **Click "New Issue"** 
4. **Upload your stamp image** and provide details:
   - Year issued
   - Main topic/subject
   - Denomination (if known)
   - Any other details
5. **Submit** - we'll handle the technical part!

### Option 2: Direct Contribution (Basic Git Skills)

1. **Fork this repository**
2. **Add your stamp image** to the appropriate decade folder:
   ```
   images/1930s/156-cartier-1935.jpg
   ```
3. **Update the catalog** in `data/stamps.json`:
   ```json
   {
     "id": "156",
     "year": 1935,
     "mainTopic": "Jacques Cartier",
     "subTopic": "Explorer Series",
     "denomination": "3¢",
     "color": "brown",
     "image": "images/1930s/156-cartier-1935.jpg",
     "notes": "Part of historical series"
   }
   ```
4. **Submit a pull request**

## 📋 Contribution Guidelines

### Image Standards
- **Format**: JPG or PNG
- **Size**: Minimum 300x375 pixels (4:5 ratio preferred)
- **Quality**: Sharp, clear scans
- **Naming**: `XXX-topic-year.jpg` (e.g., `156-cartier-1935.jpg`)

### Data Standards
- **Accuracy**: Verify information before submitting
- **Completeness**: Include all available details
- **Consistency**: Follow existing format and style
- **Sources**: Mention reference materials when possible

### What We DON'T Include
- Stamp varieties (perforations, watermarks, shades)
- Errors and freaks (unless historically significant)
- Revenues, locals, or non-postal stamps
- Copyrighted catalog images

## 🏆 Contributors

**Thank you to all contributors who help build this resource!**

<!-- Contributors will be automatically listed here -->
<a href="https://github.com/adrianspeyer/canadian-stamp-identifier/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=adrianspeyer/canadian-stamp-identifier" />
</a>

*[Become a contributor!](CONTRIBUTING.md)*

## 📊 Project Status

**Current Statistics:**
- 🖼️ **Stamps cataloged**: 30+ (and growing!)
- 📅 **Years covered**: 1851-2023
- 🔍 **Search features**: Year, topic, color
- 📱 **Platforms**: Web (mobile responsive)

**Roadmap:**
- [ ] **Phase 1**: 1851-1950 coverage (early stamps)
- [ ] **Phase 2**: 1951-1999 coverage (modern classics)  
- [ ] **Phase 3**: 2000-2025 coverage (contemporary issues)

## 🛠️ Technical Details

**Built with:**
- Pure HTML5, CSS3, JavaScript (no frameworks!)
- JSON database for easy contributions
- GitHub Pages for free hosting
- Responsive design for all devices

**Performance:**
- Fast loading and smooth zooming
- Handles thousands of stamps efficiently
- Works offline after initial load

## 📜 License & Usage

**Open Source**: This project is free to use and modify
**Images**: Contributors retain copyright, grant usage rights
**Data**: Public domain where possible
**Commercial Use**: Allowed with attribution

**Not Affiliated**: This is an independent project, not affiliated with any official postal service or catalog publisher.

## 🆘 Need Help?

**New to GitHub?** Check out [GitHub's Guide](https://guides.github.com/activities/hello-world/)

**Questions about stamps?** Ask in [Discussions](https://github.com/adrianspeyer/canadian-stamp-identifier/discussions)

**Technical issues?** Open an [Issue](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

---

## ⭐ Star This Project

If you find this useful, **please star the repository!** It helps others discover the project and shows your support for the community.

**[⭐ Click here to star](https://github.com/adrianspeyer/canadian-stamp-identifier)**

---

<div align="center">

**🍁 Proudly Canadian • 🌟 Community Driven • 🚀 Always Improving**

*Made with ❤️ by stamp collectors, for stamp collectors*

</div>
