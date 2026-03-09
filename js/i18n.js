/**
 * Canadian Stamp Identifier — i18n.js
 * Bilingual support (English / French).
 * Categories translate automatically via lookup. Stamp-level
 * translations (mainTopic, notes) come from data/stamps-fr.json.
 */

const I18N = {

    /* Current language */
    _lang: 'en',

    /* Stamp-level French translations (loaded from stamps-fr.json) */
    _frenchStamps: null,

    /* ──────────────────────────────────────────────
       UI STRINGS
       ────────────────────────────────────────────── */
    strings: {
        // Header
        'site.title':           { en: 'Canadian Stamp Identifier',          fr: 'Identificateur de timbres canadiens' },
        'site.subtitle':        { en: 'Visual identification tool',         fr: 'Outil d\'identification visuelle' },
        'nav.about':            { en: 'About',                              fr: 'À propos' },
        'nav.contribute':       { en: 'Contribute',                         fr: 'Contribuer' },

        // Search
        'search.placeholder':   { en: 'Search: beaver, 1935, olympics...',  fr: 'Recherche\u00a0: castor, 1935, olympiques...' },
        'search.clear':         { en: 'Clear search',                       fr: 'Effacer la recherche' },

        // Decades
        'decades.all':          { en: 'All',                                fr: 'Tout' },
        'decades.scrollLeft':   { en: 'Scroll decades left',               fr: 'Défiler les décennies vers la gauche' },
        'decades.scrollRight':  { en: 'Scroll decades right',              fr: 'Défiler les décennies vers la droite' },

        // Filters
        'filter.stamps':        { en: 'stamps',                             fr: 'timbres' },
        'filter.of':            { en: 'of',                                 fr: 'sur' },
        'filter.clear':         { en: 'Clear filters',                      fr: 'Effacer les filtres' },

        // Loading
        'loading.text':         { en: 'Loading stamps',                     fr: 'Chargement des timbres' },
        'loading.of':           { en: 'of',                                 fr: 'sur' },

        // Empty state
        'empty.title':          { en: 'No stamps match your filters',       fr: 'Aucun timbre ne correspond à vos filtres' },
        'empty.desc':           { en: 'Try different keywords or clear your filters.', fr: 'Essayez d\'autres mots-clés ou effacez vos filtres.' },

        // Scroll
        'scroll.top':           { en: 'Scroll to top',                      fr: 'Retour en haut' },

        // Modal
        'modal.close':          { en: 'Close',                              fr: 'Fermer' },
        'modal.id':             { en: 'ID',                                 fr: 'No.' },
        'modal.year':           { en: 'Year',                               fr: 'Année' },
        'modal.denomination':   { en: 'Denomination',                       fr: 'Valeur faciale' },
        'modal.colour':         { en: 'Colour',                             fr: 'Couleur' },
        'modal.category':       { en: 'Category',                           fr: 'Catégorie' },
        'modal.notes':          { en: 'Notes',                              fr: 'Notes' },
        'modal.footer':         { en: 'This is a Canadian Stamp Identifier reference number. For varieties and detailed pricing, cross-reference the year, topic, and denomination in official stamp catalogues.',
                                  fr: 'Ceci est un numéro de référence de l\'Identificateur de timbres canadiens. Pour les variétés et les prix détaillés, consultez l\'année, le sujet et la valeur faciale dans les catalogues officiels.' },

        // Cards
        'card.unavailable':     { en: 'Image unavailable',                  fr: 'Image non disponible' },

        // Grid
        'grid.label':           { en: 'Stamp catalogue',                    fr: 'Catalogue de timbres' },
    },

    /* ──────────────────────────────────────────────
       CATEGORY TRANSLATIONS
       ────────────────────────────────────────────── */
    categories: {
        // Top-level
        'History & Heritage':           'Histoire et patrimoine',
        'Nature & Wildlife':            'Nature et faune',
        'Arts & Culture':               'Arts et culture',
        'Holidays & Events':            'Fêtes et événements',
        'Sports & Recreation':          'Sports et loisirs',
        'Transportation':               'Transport',
        'Government & National Symbols': 'Gouvernement et symboles nationaux',
        'Architecture & Landmarks':     'Architecture et monuments',
        'Postal History':               'Histoire postale',
        'Culture & Society':            'Culture et société',
        'Science & Technology':         'Science et technologie',
        'Industry':                     'Industrie',
        'Public Awareness':             'Sensibilisation publique',
        'Organizations':                'Organisations',
    },

    subcategories: {
        // History & Heritage
        'Royalty':              'Royauté',
        'War & Military':      'Guerre et militaire',
        'War/military':        'Guerre et militaire',
        'Indigenous Peoples':  'Peuples autochtones',
        'Aboriginals':         'Autochtones',
        'Black History':       'Histoire des Noirs',
        'Civil Rights':        'Droits civils',
        'Political Leaders':   'Dirigeants politiques',
        'Prime Ministers':     'Premiers ministres',
        'Exploration':         'Exploration',
        'Explorers':           'Explorateurs',
        'Confederation':       'Confédération',
        'Anniversaries':       'Anniversaires',
        'Notable Canadians':   'Canadiens notables',
        'People':              'Personnalités',
        'International':       'International',
        'Millennium':          'Millénaire',
        'Maritime':            'Maritime',
        'Gold Rush':           'Ruée vers l\'or',
        'Humanitarian':        'Humanitaire',
        'Expositions':         'Expositions',
        'World Leaders':       'Dirigeants mondiaux',
        'Landmarks':           'Monuments',
        'Monuments':           'Monuments',
        'Labour':              'Travail',
        'Disasters':           'Catastrophes',
        'LGBTQ2+':             'LGBTQ2+',
        'Canada 150':          'Canada 150',
        'Politics':            'Politique',

        // Nature & Wildlife
        'Animals':             'Animaux',
        'Plants':              'Plantes',
        'Flowers':             'Fleurs',
        'Trees':               'Arbres',
        'Birds':               'Oiseaux',
        'Landscapes':          'Paysages',
        'Parks':               'Parcs',
        'National Parks':      'Parcs nationaux',
        'Marine Life':         'Vie marine',
        'Fish & Marine life':  'Poissons et vie marine',
        'Mountains':           'Montagnes',
        'Prehistoric':         'Préhistorique',
        'Insects':             'Insectes',
        'Fungi':               'Champignons',
        'Fossils':             'Fossiles',
        'Weather & Sky':       'Météo et ciel',
        'Seasons':             'Saisons',
        'Natural Phenomena':   'Phénomènes naturels',
        'Waterfalls':          'Chutes d\'eau',

        // Arts & Culture
        'Visual Arts':         'Arts visuels',
        'Music':               'Musique',
        'Authors':             'Auteurs',
        'Literature':          'Littérature',
        'Photography':         'Photographie',
        'Film':                'Cinéma',
        'Film & Television':   'Cinéma et télévision',
        'Comics':              'Bandes dessinées',
        'Science Fiction':     'Science-fiction',
        'Opera':               'Opéra',
        'Dance':               'Danse',
        'Theatre':             'Théâtre',
        'Crafts':              'Artisanat',
        'Handicrafts':         'Artisanat',
        'Design':              'Design',
        'Folklore':            'Folklore',
        'Cultural Artifacts':  'Artefacts culturels',
        'Children\'s Literature': 'Littérature jeunesse',
        'Art':                 'Art',
        'Artists':             'Artistes',
        'Paintings':           'Peintures',
        'Allegory':            'Allégorie',
        'Indigenous Art':      'Art autochtone',
        'Museums':             'Musées',
        'Events':              'Événements',
        'Gardens':             'Jardins',
        'Circus':              'Cirque',

        // Holidays & Events
        'Christmas':           'Noël',
        'Lunar New Year':      'Nouvel An lunaire',
        'Halloween':           'Halloween',
        'Hanukkah':            'Hanoukka',
        'Diwali':              'Divali',
        'Eid':                 'Aïd',
        'Greetings':           'Salutations',
        'Celebrations':        'Célébrations',
        'Valentine\'s Day':    'Saint-Valentin',
        'Exhibitions':         'Expositions',
        'Political':           'Politique',

        // Sports & Recreation
        'Hockey':              'Hockey',
        'Olympics':            'Olympiques',
        'CFL':                 'LCF',
        'Motorsport':          'Sport automobile',
        'Figure Skating':      'Patinage artistique',
        'Baseball':            'Baseball',
        'Football':            'Football',
        'Fishing':             'Pêche',
        'Racing':              'Course',
        'Paralympics':         'Paralympiques',
        'Swimming':            'Natation',
        'Skiing':              'Ski',
        'Lacrosse':            'Crosse',
        'Curling':             'Curling',
        'Cycling':             'Cyclisme',
        'Rowing':              'Aviron',

        // Transportation
        'Aircraft':            'Aéronefs',
        'Airmail':             'Poste aérienne',
        'Ships & Boats':       'Navires et bateaux',
        'Airplanes/helicopters': 'Avions et hélicoptères',
        'Trains':              'Trains',
        'Railways':            'Chemins de fer',
        'Automobiles':         'Automobiles',
        'Vehicles':            'Véhicules',
        'Roads':               'Routes',
        'Motorcycles':         'Motocyclettes',
        'Waterways':           'Voies navigables',

        // Government & National Symbols
        'Provinces':           'Provinces',
        'RCMP':                'GRC',
        'Justice':             'Justice',
        'Heraldry':            'Héraldique',
        'Military':            'Militaire',
        'Honours':             'Honneurs',
        'Maps':                'Cartes',

        // Architecture & Landmarks
        'Scenic':              'Panoramique',
        'Heritage Buildings':  'Bâtiments patrimoniaux',
        'Historic Sites':      'Lieux historiques',
        'Engineering':         'Ingénierie',
        'Lighthouses':         'Phares',
        'UNESCO':              'UNESCO',
        'Government':          'Gouvernement',
        'Cities':              'Villes',
        'Religious':           'Religieux',
        'Memorials':           'Mémoriaux',

        // Postal History
        'Postage Due':         'Timbre-taxe',
        'Special Delivery':    'Livraison spéciale',
        'Registered Mail':     'Courrier recommandé',
        'Coil Stamps':         'Timbres en rouleau',
        'Post Offices':        'Bureaux de poste',
        'Definitives':         'Timbres courants',
        'Community Foundation': 'Fondation communautaire',
        'Collectibles':        'Objets de collection',

        // Culture & Society
        'Organizations':       'Organisations',
        'Education':           'Éducation',
        'Food & Drink':        'Gastronomie',
        'Emergency Services':  'Services d\'urgence',
        'Zodiac':              'Zodiaque',
        'Roadside Attractions':'Attractions routières',
        'Heritage':            'Patrimoine',
        'Toys & Games':        'Jouets et jeux',
        'Business & Industry': 'Commerce et industrie',
        'Immigration':         'Immigration',
        'Youth':               'Jeunesse',
        'Traditions':          'Traditions',
        'Community':           'Communauté',
        'Health':              'Santé',

        // Science & Technology
        'Space':               'Espace',
        'Inventions':          'Inventions',
        'Inventors':           'Inventeurs',
        'Medicine':            'Médecine',
        'Communications':      'Communications',
        'Geology':             'Géologie',
        'Astronomy':           'Astronomie',
        'Aviation':            'Aviation',
        'Energy':              'Énergie',
        'Science':             'Science',

        // Industry
        'Agriculture':         'Agriculture',
        'Resources':           'Ressources',
        'Manufacturing':       'Fabrication',
        'Commerce':            'Commerce',

        // Organizations
        'Scouting & Girl Guides': 'Scoutisme et guidisme',
        'Postal':              'Postal',
        'United Nations':      'Nations Unies',
        'R.C.M.P.':           'G.R.C.',
    },

    /* ──────────────────────────────────────────────
       COLOUR TRANSLATIONS
       ────────────────────────────────────────────── */
    colours: {
        'red': 'rouge', 'blue': 'bleu', 'green': 'vert', 'black': 'noir',
        'brown': 'brun', 'orange': 'orange', 'violet': 'violet', 'yellow': 'jaune',
        'grey': 'gris', 'white': 'blanc', 'pink': 'rose', 'purple': 'pourpre',
        'carmine': 'carmin', 'vermilion': 'vermillon', 'bistre': 'bistre',
        'sepia': 'sépia', 'lavender': 'lavande', 'slate': 'ardoise',
        'olive green': 'vert olive', 'dark blue': 'bleu foncé', 'dark violet': 'violet foncé',
        'red brown': 'brun rouge', 'brown red': 'rouge brun', 'brown violet': 'brun violet',
        'rose': 'rose', 'deep rose': 'rose foncé', 'rose red': 'rouge rosé',
        'yellow green': 'vert jaunâtre', 'blue green': 'vert bleuté',
        'olive yellow': 'jaune olive', 'yellow brown': 'brun jaunâtre',
        'orange yellow': 'jaune orangé', 'red violet': 'rouge violet',
        'reddish purple': 'pourpre rougeâtre', 'slate violet': 'violet ardoise',
        'deep blue': 'bleu foncé', 'dull blue': 'bleu terne',
        'black brown': 'brun noir', 'black and carmine': 'noir et carmin',
        'ultramarine': 'outremer', 'gold': 'or', 'silver': 'argent',
        'multicoloured': 'multicolore',
    },

    /* ──────────────────────────────────────────────
       PUBLIC API
       ────────────────────────────────────────────── */

    /** Get a translated UI string */
    t(key) {
        const entry = this.strings[key];
        if (!entry) return key;
        return entry[this._lang] || entry.en || key;
    },

    /** Translate a category string like "History & Heritage: War & Military" */
    translateCategory(subTopic) {
        if (this._lang === 'en' || !subTopic) return subTopic;
        const parts = subTopic.split(':');
        const top = parts[0].trim();
        const sub = parts.length > 1 ? parts[1].trim() : null;
        const topFr = this.categories[top] || top;
        if (sub) {
            const subFr = this.subcategories[sub] || sub;
            return `${topFr}\u00a0: ${subFr}`;
        }
        return topFr;
    },

    /** Translate a colour */
    translateColour(colour) {
        if (this._lang === 'en' || !colour) return colour;
        return this.colours[colour.toLowerCase()] || colour;
    },

    /** Get French stamp fields (mainTopic, notes) with English fallback */
    getStampField(stamp, field) {
        if (this._lang === 'en') return stamp[field] || '';
        // Try French override
        if (this._frenchStamps && this._frenchStamps[stamp.id]) {
            const fr = this._frenchStamps[stamp.id][field];
            if (fr) return fr;
        }
        // Fallback to English
        return stamp[field] || '';
    },

    /** Get current language */
    getLang() {
        return this._lang;
    },

    /** Set language and persist */
    setLang(lang) {
        this._lang = lang;
        document.documentElement.lang = lang;
        try { localStorage.setItem('csi_lang', lang); } catch (e) { /* ok */ }
    },

    /** Load saved language preference */
    loadSavedLang() {
        try {
            const saved = localStorage.getItem('csi_lang');
            if (saved === 'fr' || saved === 'en') {
                this._lang = saved;
            }
        } catch (e) { /* default to en */ }
        document.documentElement.lang = this._lang;
        return this._lang;
    },

    /** Load French stamp translations */
    async loadFrenchStamps() {
        if (this._frenchStamps) return; // Already loaded
        try {
            const resp = await fetch('data/stamps-fr.json');
            if (resp.ok) {
                const data = await resp.json();
                this._frenchStamps = data.stamps || {};
                console.log(`Loaded ${Object.keys(this._frenchStamps).length} French stamp translations`);
            }
        } catch (e) {
            console.warn('Could not load French translations:', e.message);
            this._frenchStamps = {};
        }
    },
};
