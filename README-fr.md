# 🍁 Identificateur de timbres canadiens

**Un outil complet d'identification visuelle des timbres-poste canadiens (1851–2026)**

[![Démo en direct](https://img.shields.io/badge/Démo-en_direct-blue?style=for-the-badge)](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)
[![Contributeurs bienvenus](https://img.shields.io/badge/Contributeurs-Bienvenus-green?style=for-the-badge)](#-comment-contribuer)
[![Problèmes GitHub](https://img.shields.io/github/issues/adrianspeyer/canadian-stamp-identifier?style=for-the-badge)](https://github.com/adrianspeyer/canadian-stamp-identifier/issues)

> **🎯 Mission** : L'outil d'identification visuelle le plus complet pour les timbres canadiens, rendant l'identification accessible aux collectionneurs du monde entier.

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

- **Parcourez plus de 3 470 timbres** dans une grille adaptative qui fonctionne sur tous les appareils
- **Filtrez par décennie** avec une barre de pastilles défilante — sautez instantanément à n'importe quelle époque
- **Recherche intelligente** par sujet, année, couleur, valeur faciale et notes historiques
- **Touchez pour les détails** — numéro, valeur faciale, catégorie, couleur et contexte historique
- **Chargement progressif des images** avec indicateurs visuels — rapide sur toute connexion

## 🚀 Essayez maintenant

**👆 [Lancer l'Identificateur de timbres](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)**

Aucune installation nécessaire — fonctionne dans tout navigateur moderne. Fonctionne hors ligne après la première visite.

## ✨ Fonctionnalités

### Recherche et filtres
- **Recherche instantanée** : tapez une année, un sujet, une couleur ou un mot-clé — recherche aussi dans les notes
- **Filtrage par décennie** : barre de pastilles défilante avec le nombre de timbres par époque
- **Filtres combinés** : recherchez dans une décennie (p. ex. « castor » dans les années 1850)
- **Saisie avec rebond** : réactif même avec plus de 3 470 timbres

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
- **Traduction automatique des catégories** : les 15 catégories et plus de 100 sous-catégories se traduisent automatiquement
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

## 📊 Statistiques actuelles

| Métrique | Valeur |
|---|---|
| Timbres catalogués | 3 473 |
| Années couvertes | 1851–2026 (175 ans) |
| Catégories | 15 de premier niveau, 100+ sous-catégories, toutes canoniques |
| Notes vides | 0 — chaque timbre a un contexte historique |
| Couleurs vides | 0 — chaque timbre a une description de couleur |
| Catégories non canoniques | 0 — chaque sous-catégorie suit le format `Catégorie : Sous-catégorie` |
| Plateformes | Téléphone, tablette, ordinateur |
| Dépendances | 0 |
| Version | v2.2 |

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

### Directives pour les images

| Directive | Détails |
|---|---|
| Résolution | Minimum 300+ DPI |
| Format | JPG préféré, PNG accepté |
| Contenu | Motif principal du timbre uniquement (pas de variétés ni d'erreurs) |
| Nommage | `[no]-[sujet]-[valeur]-[année].jpg` |
| Exemple | `001-beaver-3d-1851.jpg` |

## 📂 Référence des catégories

Chaque timbre utilise le format `Catégorie : Sous-catégorie` pour le champ `subTopic`. Les données sont stockées en anglais; l'application traduit automatiquement en français via une table de correspondance. Voici les 15 catégories canoniques :

### Histoire et patrimoine (916 timbres)
`Royauté` · `Anniversaires` · `Personnalités` · `Peuples autochtones` · `Millénaire` · `Guerre et militaire` · `Canadiens notables` · `Exploration` · `Dirigeants politiques` · `Premiers ministres` · `International` · `Droits civils` · `Histoire des Noirs` · `Confédération` · `Maritime` · `Ruée vers l'or` · `Humanitaire` · `Travail` · `Catastrophes` · `LGBTQ2+`

### Nature et faune (704 timbres)
`Animaux` · `Plantes` · `Fleurs` · `Arbres` · `Oiseaux` · `Paysages` · `Parcs` · `Parcs nationaux` · `Vie marine` · `Montagnes` · `Préhistorique` · `Insectes` · `Champignons` · `Fossiles` · `Météo et ciel` · `Saisons`

### Arts et culture (378 timbres)
`Arts visuels` · `Musique` · `Auteurs` · `Littérature` · `Photographie` · `Cinéma` · `Cinéma et télévision` · `Bandes dessinées` · `Science-fiction` · `Opéra` · `Danse` · `Théâtre` · `Artisanat` · `Design` · `Folklore` · `Artefacts culturels` · `Littérature jeunesse` · `Musées`

### Fêtes et événements (302 timbres)
`Noël` · `Nouvel An lunaire` · `Halloween` · `Hanoukka` · `Divali` · `Aïd` · `Salutations` · `Célébrations` · `Saint-Valentin`

### Sports et loisirs (303 timbres)
`Hockey` · `Olympiques` · `LCF` · `Sport automobile` · `Patinage artistique` · `Baseball` · `Football` · `Pêche` · `Course` · `Paralympiques` · `Crosse` · `Curling` · `Cyclisme` · `Aviron`

### Transport (205 timbres)
`Aéronefs` · `Poste aérienne` · `Navires et bateaux` · `Maritime` · `Trains` · `Chemins de fer` · `Automobiles` · `Véhicules` · `Routes` · `Motocyclettes` · `Voies navigables`

### Gouvernement et symboles nationaux (133 timbres)
`Provinces` · `GRC` · `Justice` · `Héraldique` · `Militaire` · `Honneurs`

### Architecture et monuments (133 timbres)
`Panoramique` · `Bâtiments patrimoniaux` · `Lieux historiques` · `Ingénierie` · `Phares` · `UNESCO` · `Gouvernement` · `Villes` · `Religieux` · `Mémoriaux`

### Culture et société (118 timbres)
`Organisations` · `Éducation` · `Gastronomie` · `Services d'urgence` · `Zodiaque` · `Attractions routières` · `Patrimoine` · `Jouets et jeux` · `Commerce et industrie` · `Immigration`

### Histoire postale (114 timbres)
`Timbre-taxe` · `Livraison spéciale` · `Courrier recommandé` · `Timbres en rouleau` · `Bureaux de poste` · `Timbres courants` · `Fondation communautaire` · `Objets de collection`

### Science et technologie (89 timbres)
`Espace` · `Inventions` · `Médecine` · `Communications` · `Géologie` · `Astronomie` · `Aviation` · `Énergie`

### Industrie (39 timbres)
`Agriculture` · `Ressources` · `Fabrication` · `Énergie` · `Commerce`

### Organisations (23 timbres)
`Scoutisme et guidisme` · `Postal` · `Santé` · `Nations Unies`

### Sensibilisation publique (16 timbres)
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
| `id` | Numéro de référence exclusif (voir [À propos des numéros](#-à-propos-des-numéros)) | Oui |
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

Les numéros de timbres de ce projet (`#001`, `#002`, etc.) sont des **numéros de référence exclusifs** créés spécifiquement pour cet outil. Ce ne sont **pas** des numéros de catalogue Scott ni d'aucun autre système sous licence.

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
- [x] Catalogue complet 1851–2026 (3 473 timbres)
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
- [ ] Compléter les traductions françaises (mainTopic + notes pour les 3 473 timbres)
- [ ] Vues adaptées à l'impression
- [ ] Signets/favoris
- [ ] Liste de souhaits

## 📜 Licence et mentions légales

**Licence** : [GNU Affero General Public License v3.0](LICENSE)
- Garantit que ce projet reste à code source ouvert pour toujours — y compris l'utilisation en réseau/serveur
- Toutes les améliorations profitent à la communauté
- Utilisation commerciale permise avec attribution

**Images** : Les contributeurs conservent le droit d'auteur et accordent les droits d'utilisation pour ce projet
**Données** : Compilation du domaine public
**Non affilié** à Postes Canada ni à aucune source officielle

---

<div align="center">

**🍁 Fièrement canadien • 🌟 Propulsé par la communauté • 🚀 Conçu pour les collectionneurs**

*L'outil d'identification de timbres canadiens le plus complet sur le Web*

[**Essayez maintenant →**](https://adrianspeyer.github.io/Canadian-Stamp-Identifier)

[![Étoiles GitHub](https://img.shields.io/github/stars/adrianspeyer/canadian-stamp-identifier?style=social)](https://github.com/adrianspeyer/canadian-stamp-identifier/stargazers)

</div>
