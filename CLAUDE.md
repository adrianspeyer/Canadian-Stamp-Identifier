# Canadian Stamp Identifier — Claude Code Instructions

## Project Summary
Open source bilingual (EN/FR) visual identification tool for Canadian postage stamps, hosted on GitHub Pages.
- **Live:** https://adrianspeyer.github.io/Canadian-Stamp-Identifier
- **License:** AGPL-3.0

## Repo Structure
```
├── index.html              # Single-page app (stamp counts in About EN + FR sections)
├── css/style.css
├── js/
│   ├── app.js              # Main app (stamp count in line 3 comment)
│   └── i18n.js             # Bilingual support module
├── data/
│   ├── stamps.json         # Master data (English) — nested under {"stamps": [...]}
│   └── stamps-fr.json      # French translations — nested under {"stamps": {"id": {...}}}
├── images/
│   └── 2020s/              # Current decade images
├── sw.js                   # Service worker (3 cache version constants at top)
├── qa-images.py            # QA script — run after any changes
├── README.md               # English docs (stamp counts)
├── README-fr.md            # French docs (stamp counts)
├── CHANGELOG.md
└── CLAUDE.md               # This file
```

---

## How to Add New Stamps

You need two things:
1. **Raw stamp images** — already in `images/2020s/` with their original filenames (e.g. `Sugar_Shack_Stamp_Red_400P.jpg`)
2. **Canada Post press release info** — paste the text or provide a URL. This contains the subject, issue date, designer, printer, quantities, denomination, and cultural context.

Claude Code handles everything else: renaming images, assigning IDs, writing descriptions, translating to French, updating counts, bumping caches, running QA, and pushing to GitHub.

### Example prompt
```
I added two new stamp images in images/2020s/:
- Sugar_Shack_Stamp_Red_400P.jpg
- Sugar_Shack_Stamp_Yellow_400P.jpg

Here's the press release:
[paste Canada Post press release text here]

Please add these to the catalogue.
```

---

## What Claude Code Does — Full Workflow

### 1. Read the press release
Extract: subject, issue date, number of designs, designer, illustrator, printer, OFDC location, quantities, denomination, cultural/historical context. If the release mentions multiple designs in one booklet, each design gets its own stamp entry.

### 2. Find the highest existing ID
```bash
python3 -c "
import json
with open('data/stamps.json') as f:
    data = json.load(f)
ids = [int(s['id']) for s in data['stamps'] if s['id'].isdigit()]
print(f'Highest ID: {max(ids)}, Total: {len(data[\"stamps\"])}')
"
```

### 3. Determine correct position (chronological order)
Stamps MUST be in chronological order by issue date. New stamps go:
- **After** all stamps with earlier issue dates
- **Before** any placeholder stamps with later expected dates
- If a placeholder already exists for this subject, **replace** it with the real entry

If inserting before existing entries:
- **Shift ALL subsequent IDs** in BOTH `data/stamps.json` AND `data/stamps-fr.json`
- Update image paths in shifted entries to match new IDs
- Update any cross-references in notes that point to shifted IDs
- **No placeholder images exist on disk** — never try to rename files that aren't there
- If the issue has MORE designs than the placeholder assumed, insert the extra entries and shift everything downstream

### 4. Rename the raw images
The raw images are already in `images/2020s/`. Rename them in place to follow the convention:
```
[id]-[topic-slug]-[denomination]-[year].jpg
```
- All lowercase, hyphens, no spaces
- Denomination: `p` for Permanent™, `3d` for 3 pence, `50` for 50¢, etc.
- Multi-design variants include the variant: `3465-sugar-shacks-red-p-2026.jpg`

```bash
cd images/2020s
mv "Original_Filename.jpg" "3465-sugar-shacks-red-p-2026.jpg"
```

### 5. Create stamps.json entries
Add to the `stamps` array in `data/stamps.json` at the correct chronological position. All 8 fields mandatory:
```json
{
  "id": "NEXT_ID",
  "year": 2026,
  "mainTopic": "Subject Name",
  "subTopic": "Category: Subcategory",
  "denomination": "PERMANENT™ (P). Current monetary value: $1.24 .",
  "color": "multicoloured",
  "image": "images/2020s/[id]-[slug]-p-2026.jpg",
  "notes": "Issued: [date]; Qty: [number]; Printer: [name]; Designer: [name]. 1-3 sentences of historical context. Canadian English. See also #XXXX."
}
```

### 6. Create stamps-fr.json entries
Add to the `stamps` dictionary in `data/stamps-fr.json`:
```json
{
  "NEXT_ID": {
    "mainTopic": "Nom du sujet",
    "notes": "Émis le [date]; qté : [nombre]; impression : [nom]; conception : [nom]. 1-3 phrases de contexte historique. Français canadien. Voir aussi no XXXX."
  }
}
```

### 7. Bump the service worker cache version
In `sw.js`, find the current version number and increment all three constants together:
```js
const CACHE_NAME = 'csi-vN';
const DATA_CACHE = 'csi-data-vN';
const IMAGE_CACHE = 'csi-images-vN';
```

### 8. Update stamp counts everywhere
The total count must be updated in ALL of these files:

| File | Format | What to grep for |
|---|---|---|
| `README.md` | `3,476` (EN comma) | Old count with comma |
| `README-fr.md` | `3 476` (FR non-breaking space) | Old count with space |
| `index.html` | Both `3,476` AND `3 476` | Both formats — EN and FR About sections |
| `js/app.js` | `3,476+` | Line 3 comment only |

**Important:** `index.html` has BOTH English and French counts in separate sections. The `<meta>` description uses an approximate "over 3,470" — only update if the count crosses a new hundred.

Use this to find them all:
```bash
OLD=3476
grep -rn "$OLD" README.md README-fr.md index.html js/app.js
grep -rn "$(echo $OLD | sed 's/,/ /g')" README-fr.md index.html
```

### 9. Run QA
```bash
python3 qa-images.py
```
This checks: missing images, orphaned files, duplicate paths, empty fields, duplicate IDs. Placeholder stamps will show as missing images — that's expected. Everything else should pass.

### 10. Show a summary
Before pushing, show a brief summary: what was added, what was shifted, what was renamed, new total count. Let the user confirm.

### 11. Commit and push
```bash
git add -A
git commit -m "Add [stamp subject] [year] (#[first_id]–#[last_id])"
git push origin main
```
GitHub Pages deploys automatically.

---

## Critical Rules

### NEVER include Scott catalogue numbers
The project uses proprietary sequential IDs. This is a licensing requirement. Never reference Scott numbers in notes, data, or code.

### Chronological order
Stamps in `data/stamps.json` must be in chronological order by issue date. When inserting new stamps, find the correct position — don't just append to the end unless the new stamp is the most recent.

### Canadian English in stamps.json
Use: colour, honour, catalogue, defence, centre, programme, metre, licence

### Canadian French in stamps-fr.json
- Postes Canada (not Canada Post)
- timbre-poste (not stamp)
- Proper nouns stay as-is: "Bluenose", "Terry Fox"
- Titles translate: "Queen Elizabeth" → "Reine Elizabeth"
- Common subjects translate: "Beaver" → "Castor"
- Use Canadian French conventions and québécois standard
- French notes should be roughly the same length as English

### All 8 fields are mandatory
Every stamp must have: id, year, mainTopic, subTopic, denomination, color, image, notes. Zero empty fields allowed.

### Permanent stamp rate
Current rate (since January 2025): **$1.24** (booklet/coil)
Denomination string: `PERMANENT™ (P). Current monetary value: $1.24 .`
If Canada Post changes rates, ALL permanent stamps must be updated.

### macOS environment
- `sed -i ''` (empty string arg) for in-place edits, not `sed -i`

---

## Data Formats

### stamps.json
- Array of objects under `{"stamps": [...]}`
- IDs are strings: `"001"`, `"3476"`
- IDs are sequential numeric strings, without letter suffixes. Record colour variants in the main stamp’s notes rather than creating separate entries that reuse its image.
- Array is in chronological order by issue date

### stamps-fr.json
- Flat dictionary under `{"stamps": {"id": {mainTopic, notes}}}`
- Keyed by stamp ID strings
- Only contains `mainTopic` and `notes` — all other fields stay in stamps.json

---

## Canonical Categories (14 top-level)

Always use `Top-Level: Subcategory` format. The approved top-level categories are:
- History & Heritage
- Nature & Wildlife
- Arts & Culture
- Holidays & Events
- Sports & Recreation
- Transportation
- Government & National Symbols
- Architecture & Landmarks
- Culture & Society
- Postal History
- Science & Technology
- Industry
- Organizations
- Public Awareness

Each has specific subcategories. Check existing entries in `data/stamps.json` for the right subcategory match. If unsure, look at similar stamps in the data.

---

## Multi-Design Issues

Canada Post often releases multiple designs in one booklet (e.g. Eid 2026 had 3, Sugar Shacks 2026 had 2). Placeholders often undercount — always check the press release for the actual number of designs. Rules:
- Each design gets its own sequential ID
- Append variant in parentheses: `"Sugar Shacks (Red)"`, `"Sugar Shacks (Yellow)"`
- French follows same pattern: `"Cabanes à sucre (rouge)"`, `"Cabanes à sucre (jaune)"`
- Describe specific colour palette instead of just `"multicoloured"`
- Cross-reference variants in notes: `"See also #3466."` / `"Voir aussi no 3466."`
- First stamp gets the fullest notes; subsequent variants can be briefer

---

## Image Naming Convention

Format: `[id]-[topic-slug]-[denomination]-[year].jpg`

Examples:
- `001-beaver-3d-1851.jpg`
- `3462-eid-green-p-2026.jpg`
- `3465-sugar-shacks-red-p-2026.jpg`

Some legacy entries are missing the denomination — that's fine since filenames are unique, but all new entries MUST include it.

---

## Colour Values

### Classic stamps (pre-1972)
Use philatelic colour names: red, blue, green, carmine, vermilion, bistre, sepia, olive green, dark blue, dark violet, brown, violet, orange, yellow, grey, black, rose, slate, ultramarine, lavender

### Modern stamps (1972+)
Usually `multicoloured`. Exception: multi-design colour-variant issues should describe the specific palette for each design rather than defaulting to `multicoloured`.

---

## Placeholder / Unreleased Stamps

The catalogue includes entries for stamps that have been announced but not yet released. Key rules:
- **No images exist on disk for placeholders** — image paths point to filenames that will be created at release
- Placeholder notes use `"Expected: [month/season] [year]"` / `"Attendu : [mois/saison] [année]"` format
- When a placeholder becomes real, replace it with full data from the press release
- If the real issue has more designs than the placeholder, insert extras and shift all downstream IDs
- **ID shifts cascade** — every downstream ID, image path, and cross-reference in both JSON files must shift

---

## Useful Commands

### Count stamps
```bash
python3 -c "import json; print(len(json.load(open('data/stamps.json'))['stamps']))"
```

### Check stamps-fr.json completeness
```bash
python3 -c "
import json
en = {s['id'] for s in json.load(open('data/stamps.json'))['stamps']}
fr = set(json.load(open('data/stamps-fr.json'))['stamps'].keys())
missing = sorted(en - fr, key=lambda x: int(x) if x.isdigit() else 0)
print(f'Missing from French: {len(missing)}')
if missing: print(missing[:20])
"
```

### Find all stamp count references
```bash
OLD=3476
grep -rn "$OLD" README.md README-fr.md index.html js/app.js
grep -rn "$(echo $OLD | sed 's/,/ /g')" README-fr.md index.html
```

### Show last 5 stamps
```bash
python3 -c "
import json
with open('data/stamps.json') as f:
    data = json.load(f)
for s in data['stamps'][-5:]:
    print(f'{s[\"id\"]} | {s[\"mainTopic\"]} | {s[\"image\"]}')
"
```

### Run full QA
```bash
python3 qa-images.py
```
