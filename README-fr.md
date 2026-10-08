# 🍁 Identificateur de timbres canadiens

**Un outil d'identification visuelle des timbres-poste canadiens (1851–2026)**

[![Démo en direct](https://img.shields.io/badge/Démo-en_direct-blue?style=for-the-badge)](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)
[![Contributeurs bienvenus](https://img.shields.io/badge/Contributeurs-Bienvenus-green?style=for-the-badge)](#-comment-contribuer)
[![Problèmes GitHub](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission** : Rendre l'identification des timbres canadiens accessible aux collectionneurs du monde entier.

🇬🇧 [English version](README.md)

---

## Table des matières

- [Ce qui rend cet outil spécial](#-ce-qui-rend-cet-outil-spécial)
- [Essayez maintenant](#-essayez-maintenant)
- [Fonctionnalités](#-fonctionnalités)
- [Statistiques actuelles](#-statistiques-actuelles)
- [Comment utiliser](#-comment-utiliser)
- [Comment contribuer](#-comment-contribuer)
- [Référence des catégories](#-référence-des-catégories)
- [Format JSON de référence](#-format-json-de-référence)
- [À propos des numéros](#-à-propos-des-numéros)
- [Architecture technique](#-architecture-technique)
- [Feuille de route](#-feuille-de-route)
- [Licence et mentions légales](#-licence-et-mentions-légales)

---

## 🌟 Ce qui rend cet outil spécial

Cet outil facilite l'identification des timbres grâce à la **correspondance visuelle** dans une grille de cartes adaptative et recherchable. Au lieu de feuilleter des catalogues :

- **Parcourez 3 488 timbres** dans une grille adaptative qui fonctionne sur tous les appareils
- **Filtrez par décennie** avec une barre de pastilles défilante — sautez instantanément à n'importe quelle époque
- **Recherche intelligente** par sujet, année, couleur, valeur faciale et notes historiques
- **Touchez pour les détails** — numéro, valeur faciale, catégorie, couleur et contexte historique
- **Chargement progressif des images** avec indicateurs visuels — rapide sur toute connexion

## 🚀 Essayez maintenant

**👆 [Lancer l'Identificateur de timbres](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)**

Aucune installation nécessaire — fonctionne dans tout navigateur moderne. Les données et images déjà en cache sont consultables hors ligne; les autres images nécessitent une connexion.

## ✨ Fonctionnalités

### Recherche et filtres
- **Recherche instantanée** : tapez une année, un sujet, une couleur ou un mot-clé — recherche aussi dans les notes
- **Filtrage par décennie** : barre de pastilles défilante avec le nombre de timbres par époque
- **Filtres combinés** : recherchez dans une décennie (p. ex. « castor » dans les années 1850)
- **Saisie avec rebond** : réactif même avec 3 488 timbres

### Interface visuelle
- **Grille de cartes adaptative** : de 2 colonnes sur téléphone à 10+ sur écran ultralarge
- **Chargement avec effet de miroitement** : espaces réservés colorés par décennie pendant le chargement
- **Trois états de carte** : chargement (miroitement), chargée (fondu), erreur (« Image non disponible »)
- **Navigation par décennie** : flèches avec défilement automatique de la pastille active
- **Retour en haut** : bouton de retour rapide après défilement

### Multiplateforme
- **Téléphone** : grille de 2–3 colonnes, cartes tactiles, recherche fixe
- **Tablette** : 4–6 colonnes, chargement d'images avec protection de délai d'attente
- **Ordinateur** : 8–10+ colonnes, effets de survol, navigation au clavier
- **Un seul code** : pas de vues séparées pour mobile et ordinateur

### Bilingue (EN / FR)
- **Sélecteur de langue** dans l'en-tête — bascule instantanément entre l'anglais et le français
- **Interface française complète** : tous les boutons, libellés, filtres et panneaux
- **Traduction automatique des catégories** : les 14 catégories et plus de 100 sous-catégories se traduisent automatiquement
- **Traduction des couleurs** : tous les termes philatéliques se traduisent automatiquement
- **Persistant** : la préférence de langue est sauvegardée

### Performance
- **Service worker** : met en cache les fichiers de l'application et jusqu'à 500 images consultées récemment
- **File d'attente de concurrence** : maximum 6 chargements d'images simultanés avec délai d'attente de 15 s
- **Vidage de file d'attente au filtrage** : le changement de décennie priorise immédiatement les timbres visibles
- **Cache localStorage** : stamps.json mis en cache localement pour des visites instantanées
- **Persistance de session** : les filtres de décennie et de recherche survivent au rafraîchissement de la page

### Accessibilité
- Navigable au clavier (Tab + Entrée/Espace)
- Étiquettes ARIA sur tous les éléments interactifs
- Prise en charge de `prefers-reduced-motion`
- Indicateurs de focus visibles

### Sécurité
- Politique de sécurité du contenu restreignant toutes les sources
- Aucun gestionnaire d'événement en ligne
- Toutes les données via `createElement` + `textContent`
- Zéro JavaScript tiers

Les notes facilitent l’identification visuelle; elles ne constituent pas un service d’authentification ou d’évaluation. Les nuances et variétés spécialisées peuvent nécessiter des références indépendantes. Signalez les corrections avec une source et le numéro du projet.

## 📊 Statistiques actuelles

| Métrique | Valeur |
|---|---|
| Timbres catalogués | 3 488 |
| Années couvertes | 1851–2026 (175 ans) |
| Catégories | 14 de premier niveau, 100+ sous-catégories, toutes canoniques |
| Notes vides | 0 — chaque entrée a des notes descriptives ou des renseignements d’émission |
| Couleurs vides | 0 — chaque timbre a une description de couleur |
| Catégories non canoniques | 0 — chaque sous-catégorie suit le format `Catégorie : Sous-catégorie` |
| Plateformes | Téléphone, tablette, ordinateur |
| Dépendances | 0 |
| Version | v2.7 |

## 📖 Comment utiliser

1. **Parcourir par époque** — touchez une pastille de décennie pour filtrer, touchez à nouveau pour tout afficher
2. **Rechercher** — tapez une année, un sujet, une couleur ou un mot-clé (recherche aussi dans les notes)
3. **Combiner les filtres** — recherchez dans une décennie pour des résultats précis
4. **Comparer visuellement** — balayez la grille pour trouver le motif de votre timbre
5. **Obtenir les détails** — touchez un timbre pour voir son numéro, sa valeur faciale, sa catégorie et ses notes historiques
6. **Approfondir** — utilisez l'année, le sujet et la valeur faciale pour consulter les catalogues officiels pour les variétés et les prix

## 🤝 Comment contribuer

Chaque contribution — une note corrigée, une meilleure description de couleur, une image manquante — améliore l'outil pour les collectionneurs partout.

### Contributions faciles (sans code)

| Contribution | Comment |
|---|---|
| **Vous trouvez une erreur** | Ouvrez un [ticket GitHub](https://github.com/adrianspeyer/canadian-stamp-identifier/issues) avec le numéro du timbre et la correction |
| **Vous avez une image de timbre** | Téléversez-la dans un ticket — nous nous occupons du reste |
| **Préciser les couleurs** | Plusieurs timbres modernes sont décrits comme « multicolore » — des descriptions plus précises sont les bienvenues |
| **Ajouter du contexte historique** | Vous connaissez l'histoire derrière un timbre? Partagez-la dans un ticket |
| **Traductions françaises** | Aidez à compléter les traductions de `mainTopic` et `notes` dans `stamps-fr.json` |

### Contributions directes (Pull Request)

1. **Fourchez** le dépôt sur GitHub
2. **Ajoutez des images** dans `images/[décennie]/` selon la convention de nommage ci-dessous
3. **Mettez à jour** `data/stamps.json` avec les détails du timbre (voir [Format JSON de référence](#-format-json-de-référence))
4. **Soumettez** un pull request

### Ajout de timbres avec Claude Code

Ce dépôt inclut un fichier [`CLAUDE.md`](CLAUDE.md) permettant à [Claude Code](https://docs.anthropic.com/en/docs/claude-code) d'automatiser l'ajout de timbres. Pour l'utiliser :

1. **Installez Claude Code** et ouvrez le dépôt
2. **Déposez les images brutes** dans `images/2020s/`
3. **Décrivez les timbres** à Claude Code — collez le communiqué de presse de Postes Canada (texte ou URL)
4. Claude Code se charge de : renommer les images selon la convention du projet, attribuer les numéros en ordre chronologique, rédiger les descriptions en anglais, traduire en français, choisir la bonne catégorie, mettre à jour les compteurs dans tous les fichiers, incrémenter le cache du service worker et lancer le contrôle qualité
5. **Vérifiez le résumé**, puis laissez-le valider et pousser les changements

### Directives pour les images

| Directive | Détails |
|---|---|
| Résolution | Minimum 300+ DPI |
| Format | JPG préféré, PNG accepté |
| Contenu | Motif principal du timbre uniquement (pas de variétés ni d'erreurs) |
| Nommage | `[no]-[sujet]-[valeur]-[année].jpg` |
| Exemple | `001-beaver-3d-1851.jpg` |

## 📂 Référence des catégories

Chaque timbre utilise le format `Catégorie : Sous-catégorie` pour le champ `subTopic`. Les données sont stockées en anglais; l'application traduit automatiquement en français via une table de correspondance. Voici les 14 catégories canoniques :

### Histoire et patrimoine (760 timbres)
`Royauté` · `Guerre et militaire` · `Millénaire` · `Peuples autochtones` · `Exploration` · `Dirigeants politiques` · `International` · `Histoire des Noirs` · `Premiers ministres` · `Canadiens notables` · `Anniversaires` · `Droits civils` · `Confédération` · `Canada 150` · `LGBTQ2+` · `Personnalités` · `Travail` · `Maritime` · `Ruée vers l'or` · `Dirigeants mondiaux` · `Organisations` · `Humanitaire` · `Catastrophes`

### Nature et faune (573 timbres)
`Fleurs` · `Animaux` · `Oiseaux` · `Paysages` · `Vie marine` · `Arbres` · `Préhistorique` · `Insectes` · `Parcs nationaux` · `Parcs` · `Plantes` · `Montagnes` · `Météo et ciel` · `Champignons` · `Chutes d'eau`

### Arts et culture (439 timbres)
`Peintures` · `Arts visuels` · `Musique` · `Photographie` · `Cinéma et télévision` · `Auteurs` · `Artisanat` · `Bandes dessinées` · `Art autochtone` · `Artefacts culturels` · `Folklore` · `Science-fiction` · `Littérature jeunesse` · `Jardins` · `Opéra` · `Musées` · `Théâtre` · `Danse` · `Cirque` · `Design` · `Littérature`

### Fêtes et événements (376 timbres)
`Noël` · `Nouvel An lunaire` · `Halloween` · `Salutations` · `Expositions` · `Aïd` · `Divali` · `Célébrations` · `Hanoukka`

### Sports et loisirs (341 timbres)
`Hockey` · `Olympiques` · `Événements` · `LCF` · `Loisirs` · `Pêche` · `Golf` · `Sport automobile` · `Patinage artistique` · `Basketball` · `Natation` · `Paralympiques` · `Sports équestres` · `Crosse` · `Aviron` · `Athlétisme` · `Baseball` · `Ski` · `Curling` · `Cyclisme` · `Sports d'hiver` · `Course`

### Transport (225 timbres)
`Navires et bateaux` · `Aéronefs` · `Véhicules` · `Trains` · `Routes` · `Poste aérienne` · `Voies navigables` · `Motocyclettes`

### Gouvernement et symboles nationaux (187 timbres)
`Drapeau` · `Provinces` · `Parlement` · `Symboles nationaux` · `GRC` · `Justice` · `Gouvernement` · `Honneurs` · `Héraldique` · `Fête du Canada` · `Militaire`

### Architecture et monuments (173 timbres)
`Lieux historiques` · `Bâtiments patrimoniaux` · `UNESCO` · `Villes` · `Ponts` · `Phares` · `Panoramique` · `Religieux` · `Mémoriaux` · `Gouvernement` · `Ingénierie`

### Culture et société (145 timbres)
`Éducation` · `Organisations` · `Services d'urgence` · `Patrimoine` · `Attractions routières` · `Zodiaque` · `Commerce et industrie` · `Immigration` · `Gastronomie` · `Jeunesse` · `Communauté` · `Jouets et jeux`

### Histoire postale (121 timbres)
`Timbre-taxe` · `Objets de collection` · `Fondation communautaire` · `Livraison du courrier` · `Livraison spéciale` · `Unions postales` · `Travailleurs des postes` · `Courrier recommandé` · `Bureaux de poste`

### Science et technologie (96 timbres)
`Science` · `Inventions` · `Médecine` · `Espace` · `Communications` · `Géologie` · `Astronomie` · `Aviation`

### Industrie (33 timbres)
`Ressources` · `Agriculture` · `Énergie` · `Fabrication` · `Commerce`

### Organisations (7 timbres)
`Scoutisme et guidisme` · `Nations Unies`

### Sensibilisation publique (12 timbres)
`Santé`

> **Note** : Les valeurs de sous-catégorie sont stockées en anglais dans `stamps.json` et traduites automatiquement par l'application. Les contributeurs doivent utiliser les valeurs anglaises lors de l'ajout de données. Consultez le [README anglais](README.md) pour les valeurs exactes.

## 📋 Format JSON de référence

Chaque timbre dans `data/stamps.json` a cette structure :

```json
{
  "id": "001",
  "year": 1851,
  "mainTopic": "Beaver",
  "subTopic": "Nature & Wildlife: Animals",
  "denomination": "3d",
  "color": "red",
  "image": "images/1850s/001-beaver-3d-1851.jpg",
  "notes": "Canada's first stamp, depicting a beaver."
}
```

| Champ | Description | Obligatoire |
|---|---|---|
| `id` | Numéro de référence propre au projet (voir [À propos des numéros](#-à-propos-des-numéros)) | Oui |
| `year` | Année d'émission | Oui |
| `mainTopic` | Sujet/motif principal (en anglais) | Oui |
| `subTopic` | Catégorie au format `Category: Subcategory` (en anglais) | Oui |
| `denomination` | Valeur faciale | Oui |
| `color` | Couleur(s) dominante(s) (en anglais) | Oui |
| `image` | Chemin vers le fichier image | Oui |
| `notes` | Contexte historique (en anglais). 1 à 3 phrases. | Oui |

### Traductions françaises
Les traductions françaises sont stockées séparément dans `data/stamps-fr.json`. Ce fichier contient uniquement les champs `mainTopic` et `notes` traduits. Tout timbre absent de ce fichier affiche automatiquement le texte anglais.

## 🔢 À propos des numéros

Les numéros de timbres de ce projet (`#001`, `#002`, etc.) sont des **numéros de référence propres à cet outil**. Ce ne sont **pas** des numéros de catalogue Scott ni d'aucun autre système sous licence.

Pour les variétés, erreurs et prix détaillés, consultez l'**année**, le **sujet** et la **valeur faciale** dans les catalogues officiels de timbres.

## 🛠️ Architecture technique

### Pile technologique
- **Interface** : HTML5, CSS3, JavaScript (ES2020+) pur — zéro dépendance
- **Données** : catalogue JSON, versionné avec Git
- **Hébergement** : GitHub Pages avec CDN mondial
- **Mise en cache** : service worker + localStorage + cache HTTP du navigateur
- **Internationalisation** : module `i18n.js` avec traduction automatique des catégories et couleurs

### Stratégie de performance
| Couche | Technique |
|---|---|
| Rendu | Par lots de 250 cartes/trame avec barre de progression |
| Hors écran | `content-visibility: auto` saute le rendu des cartes cachées |
| Chargement d'images | IntersectionObserver → file d'attente (max 6, délai 15 s) |
| Décodage | `decoding="async"` — hors fil principal |
| Filtrage | Afficher/masquer le DOM existant, vidage de file au changement de filtre |
| Données | Cache localStorage, indice `<link rel="preload">` |
| Visites ultérieures | Service worker : cache d'abord pour les images, réseau d'abord pour les données |
| Recherche | Rebond de 180 ms, indexe tous les champs y compris les notes |

## 🗺️ Feuille de route

### Complété ✅
- [x] Catalogue couvrant la période 1851–2026 (3 488 timbres)
- [x] Design adaptatif unifié (téléphone → ordinateur)
- [x] Navigation par décennie avec flèches
- [x] Service worker, rendu par lots, chargement progressif, content-visibility
- [x] File d'attente avec délai + vidage selon les filtres
- [x] Cache localStorage + sessionStorage
- [x] Accessibilité (navigation clavier, ARIA, mouvement réduit)
- [x] Sécurité (CSP, pas de innerHTML, pas de gestionnaires en ligne)
- [x] Tous les timbres catégorisés — zéro Divers, zéro sous-catégorie non canonique
- [x] Tous les timbres ont des notes historiques — zéro vide
- [x] Tous les timbres ont des descriptions de couleur — zéro vide
- [x] Taux du timbre permanent mis à jour à 1,24 $
- [x] Interface bilingue (EN/FR) avec sélecteur de langue
- [x] Traduction automatique des catégories et des couleurs

### Futur 🔮
- [ ] Réviser et améliorer les titres et notes en français
- [ ] Vues adaptées à l'impression
- [ ] Signets/favoris
- [ ] Liste de souhaits

## 📜 Licence et mentions légales

**Licence du code** : [GNU Affero General Public License v3.0](LICENSE). Consultez le texte intégral pour les conditions d’utilisation, de modification et de distribution.

**Images et sources** : Les motifs de timbres, photographies et autres éléments provenant de tiers peuvent être soumis à des droits distincts. Ce dépôt ne fournit pas de relevé complet des droits de chaque image et n’établit pas que tous les textes du catalogue appartiennent au domaine public. Les contributions doivent préciser les sources, crédits et autorisations ou conditions de réutilisation. Conservez les crédits existants.

**Non affilié** à Postes Canada ni à aucune source officielle

---

<div align="center">

**🍁 Fièrement canadien • 🌟 Propulsé par la communauté • 🚀 Conçu pour les collectionneurs**

*Explorez l’histoire postale canadienne, un timbre à la fois*

[**Essayez maintenant →**](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)

[![Étoiles GitHub](https://img.shields.io/github/stars/adrianspeyer/canadian-stamp-identifier?style=social)](https://github.com/adrianspeyer/canadian-stamp-identifier/stargazers)

</div>
