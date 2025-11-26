# Spécifications fonctionnelles – Tamagotchi Electron

## Objectif

Créer une application desktop (Electron) de gestion d'animaux virtuels type Tamagotchi, où l'utilisateur doit prendre soin de créatures qui évoluent et se dégradent avec le temps. L'application inclut également des mini-jeux (clicker, pêche) et un système d'économie pour acheter des items et équipements.

## Public cible

- Étudiants en développement web
- Développeurs débutants Electron
- Personnes cherchant un projet pédagogique avec gestion d'état et base de données

## Contrainte projet

**Durée initiale** : 3.5 jours
**Contrainte académique** : Au moins 2 entités en base de données
**Réalisé** : 14 entités, 4 features majeures (Animaux, Économie, Pêche, Audio)

---

## User Stories

### Gestion des types d'animaux

**US1 : Voir les types d'animaux disponibles**
En tant qu'utilisateur, je veux voir la liste des types d'animaux disponibles (chat, chien, alien) avec leurs caractéristiques spécifiques (taux de dégradation, emoji)

### Gestion des animaux

**US2 : Création d'un animal**
En tant qu'utilisateur, je veux créer un nouvel animal en choisissant un nom et un type parmi les types disponibles

**US3 : Liste des animaux**
En tant qu'utilisateur, je veux voir la liste de tous mes animaux avec leur type, leurs stats actuelles (vivants et morts séparés)

**US4 : Détail d'un animal**
En tant qu'utilisateur, je veux voir le détail complet d'un animal avec toutes ses stats en temps réel, son type, son âge et son emoji

### Actions de base

**US5 : Nourrir un animal**
En tant qu'utilisateur, je veux nourrir mon animal pour augmenter sa faim (+20), son bonheur (+5) au coût de son énergie (-5)

**US6 : Jouer avec un animal**
En tant qu'utilisateur, je veux jouer avec mon animal pour augmenter son bonheur (+15) au coût de son énergie (-10) et de sa faim (-5)

**US7 : Soigner un animal**
En tant qu'utilisateur, je veux soigner mon animal pour restaurer sa santé (+20)

**US8 : Mettre un animal au repos**
En tant qu'utilisateur, je veux mettre mon animal au repos pour restaurer son énergie (+30) et son bonheur (+5)

### Système d'items

**US9 : Voir l'inventaire d'items**
En tant qu'utilisateur, je veux voir la liste de tous les items disponibles (nourriture, jouets, médicaments) avec leurs effets

**US10 : Filtrer les items par type**
En tant qu'utilisateur, je veux filtrer les items par catégorie (food, toy, medicine) pour trouver facilement ce dont j'ai besoin

**US11 : Utiliser un item sur un animal**
En tant qu'utilisateur, je veux utiliser un item sur mon animal pour appliquer ses effets (boosts de stats) en fonction du type d'item

**US12 : Vérifier le coût énergétique**
En tant qu'utilisateur, je veux être informé si mon animal n'a pas assez d'énergie pour utiliser un item

**US13 : Voir l'historique des items utilisés**
En tant qu'utilisateur, je veux voir dans l'historique des actions quels items ont été utilisés sur mon animal

### Système de temps

**US14 : Dégradation passive des stats**
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent automatiquement avec le temps selon les taux de son type

**US15 : Calcul du temps écoulé offline**
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent même quand l'app est fermée, en fonction du temps réellement écoulé

### Notifications

**US16 : Notifications desktop**
En tant qu'utilisateur, je veux recevoir des notifications quand les stats de mon animal sont critiques (< 30%)

### Statistiques

**US17 : Historique des actions**
En tant qu'utilisateur, je veux voir l'historique des 20 dernières actions effectuées sur mon animal (type d'action, item utilisé si applicable, timestamp, deltas de stats)

**US18 : Statistiques globales** (optionnel)
En tant qu'utilisateur, je veux voir des statistiques sur tous mes animaux (total créés par type, vivants/morts, actions effectuées, items les plus utilisés)

---

## Système d'économie

### Wallet

**US-ECO-1 : Portefeuille de coins**
En tant qu'utilisateur, je veux avoir un portefeuille de coins visible dans l'interface pour suivre ma monnaie virtuelle

**US-ECO-2 : Génération passive de coins**
En tant qu'utilisateur, je veux gagner 10 coins par heure automatiquement, même quand l'app est fermée

**US-ECO-3 : Récompenses d'actions**
En tant qu'utilisateur, je veux gagner des coins en effectuant des actions sur mes animaux :
- Feed: +2 coins
- Play: +5 coins
- Heal: +3 coins
- Sleep: +8 coins
- Use Item: +1 coin

### Shop

**US-ECO-4 : Boutique d'items**
En tant qu'utilisateur, je veux accéder à une boutique pour acheter des items avec mes coins

**US-ECO-5 : Achat d'items**
En tant qu'utilisateur, je veux acheter des items qui s'ajoutent automatiquement à mon inventaire

---

## Mini-jeu Clicker

**US-CLICK-1 : Gameplay clicker**
En tant qu'utilisateur, je veux jouer à un mini-jeu de clicker pour gagner des coins en cliquant rapidement

**US-CLICK-2 : Système d'upgrades clicker**
En tant qu'utilisateur, je veux acheter des améliorations pour mon clicker :
- Multiplier : ×1.5 par niveau
- Time Bonus : +5 secondes par niveau
- Auto Clicker : +0.2 clicks/seconde par niveau

**US-CLICK-3 : High scores et rewards**
En tant qu'utilisateur, je veux voir mes meilleurs scores et gagner des coins proportionnels à mon score

---

## Mini-jeu de Pêche

### Gameplay de base

**US-FISH-1 : Mécanique de pêche**
En tant qu'utilisateur, je veux lancer ma ligne et attendre qu'un poisson morde pour essayer de l'attraper

**US-FISH-2 : Système QTE (Quick Time Event)**
En tant qu'utilisateur, je veux jouer à un mini-jeu de capture où je dois maintenir la tension dans une zone optimale (40-70) pour remplir une barre de progression et capturer le poisson

### Équipement

**US-FISH-3 : Cannes à pêche**
En tant qu'utilisateur, je veux acheter et équiper différentes cannes à pêche avec des bonus :
- Reel Zone Bonus : Zone optimale plus large
- Catch Rate Bonus : Meilleur taux de capture
- Rarity Bonus : Plus de chances de poissons rares

**US-FISH-4 : Appâts**
En tant qu'utilisateur, je veux acheter et utiliser des appâts pour améliorer mes chances :
- Appâts généraux : Bonus de capture
- Appâts spécialisés : Ciblent certaines raretés ou espèces

**US-FISH-5 : Lieux de pêche**
En tant qu'utilisateur, je veux débloquer différents lieux de pêche (étang, rivière, lac, océan, etc.) avec des poissons différents et des niveaux de difficulté variés

### Catalogue et progression

**US-FISH-6 : Catalogue de poissons**
En tant qu'utilisateur, je veux voir un catalogue de tous les poissons avec :
- Espèces découvertes vs non découvertes
- Rareté (common, uncommon, rare, epic, legendary)
- Statistiques personnelles (nombre attrapé, plus gros)

**US-FISH-7 : Système d'upgrades pêche**
En tant qu'utilisateur, je veux acheter des améliorations permanentes :
- Luck : +5% chances de poissons rares par niveau
- Reflexes : Zone optimale +2 par niveau
- Value : +10% valeur des poissons par niveau
- Bait Efficiency : -5% consommation d'appât par niveau

**US-FISH-8 : Progression et niveaux**
En tant qu'utilisateur, je veux gagner de l'expérience en pêchant et monter de niveau pour débloquer des récompenses

---

## Système Audio

**US-AUDIO-1 : Musique de fond**
En tant qu'utilisateur, je veux avoir de la musique de fond qui change selon la page où je suis (jeu principal, mini-jeux, boutique)

**US-AUDIO-2 : Effets sonores**
En tant qu'utilisateur, je veux entendre des effets sonores pour les actions importantes (achat, capture de poisson, actions sur animal)

**US-AUDIO-3 : Contrôles audio**
En tant qu'utilisateur, je veux pouvoir ajuster le volume de la musique et des effets séparément, et les couper individuellement

---

## Workflows principaux

### 1. Création d'un premier animal

1. L'utilisateur lance l'application
2. Voit un écran vide avec message "Créer ton premier animal"
3. Clique sur "Créer un animal"
4. Remplit le formulaire (nom, type)
5. Valide → animal créé avec stats par défaut (100/100/100/100)
6. Redirection vers la liste des animaux

### 2. Prendre soin d'un animal

1. L'utilisateur sélectionne un animal dans les onglets
2. Accède au détail avec sprite, stats, actions
3. Effectue une action (nourrir, jouer, soigner, dormir)
4. Les stats se mettent à jour + coins gagnés
5. L'action est enregistrée dans l'historique

### 3. Acheter et utiliser un item

1. L'utilisateur accède à la boutique (/shop)
2. Sélectionne un item et l'achète avec ses coins
3. L'item est ajouté à l'inventaire
4. Retour sur la page principale
5. Utilise l'item sur un animal depuis l'inventaire

### 4. Session de pêche

1. L'utilisateur accède aux mini-jeux (/minigames)
2. Sélectionne le jeu de pêche
3. Choisit un lieu et un appât (optionnel)
4. Lance la ligne et attend une touche
5. Mini-jeu QTE pour capturer le poisson
6. Récompense en coins et XP si succès

---

## Règles métier

### Stats

- Toutes les stats sont bornées entre **0 et 100**
- Un animal **meurt** si `sante = 0`
- La **santé** diminue uniquement si une stat < 20

### Actions

| Action | Faim | Bonheur | Énergie | Santé | Durée | Coins |
|--------|------|---------|---------|-------|-------|-------|
| Nourrir | +20 | +5 | -5 | - | 5s | +2 |
| Jouer | -5 | +15 | -10 | - | 20s | +5 |
| Soigner | - | - | - | +20 | 8s | +3 |
| Dormir | - | +5 | +30 | - | 30s | +8 |
| Utiliser Item | Variable | Variable | Variable | Variable | 3s | +1 |

### Dégradation (par heure) - Taux par type d'animal

| Type | Faim | Bonheur | Énergie | Santé |
|------|------|---------|---------|-------|
| **Chat** 🐱 | -2.5 | -1.5 | -0.8 | -3.0 |
| **Chien** 🐶 | -2.0 | -2.0 | -1.2 | -3.0 |
| **Alien** 👽 | -1.5 | -1.0 | -1.5 | -2.5 |

**Règle santé** : La santé diminue uniquement si une stat est critique (< 20).
Le taux de dégradation est **multiplié par le nombre de stats critiques**.

### Économie

| Source | Montant |
|--------|---------|
| Passif | 10 coins/heure |
| Actions | 1-8 coins selon action |
| Clicker | Variable (score-based) |
| Pêche | Variable (rareté + taille) |

### Raretés de poissons

| Rareté | Couleur | Multiplicateur valeur | Probabilité base |
|--------|---------|----------------------|------------------|
| Common | Gris | ×1 | 50% |
| Uncommon | Vert | ×2 | 30% |
| Rare | Bleu | ×3 | 15% |
| Epic | Violet | ×5 | 4% |
| Legendary | Or | ×10 | 1% |

### Coûts exponentiels (upgrades)

```
coût_niveau_n = coût_base × multiplicateur^niveau

Clicker: multiplicateur = 1.6
Fishing: multiplicateur = 1.4 à 1.7 selon l'upgrade
```

---

## Modèle de données

### Tables principales (14 tables)

#### Domaine Animaux
- **AnimalType** : Types d'animaux avec taux de dégradation
- **Animal** : Instances d'animaux avec stats
- **Action** : Historique des actions avec stats before/after
- **Item** : Items disponibles dans le jeu
- **Inventory** : Quantités d'items possédés

#### Domaine Économie
- **Wallet** : Portefeuille unique (singleton)
- **MinigameScore** : Scores des mini-jeux
- **ClickerUpgrade** : Niveaux des upgrades clicker

#### Domaine Pêche
- **FishSpecies** : Espèces de poissons
- **FishCatch** : Historique des captures
- **FishingRod** : Cannes à pêche
- **FishingBait** : Appâts
- **FishingLocation** : Lieux de pêche
- **FishingUpgrade** : Upgrades permanents
- **FishingProgress** : Progression du joueur

---

## Contraintes techniques

### Performance

- Temps de chargement page < 1 seconde
- Tick toutes les **10 secondes** (pas chaque seconde)
- Calcul batch du temps écoulé offline

### Sécurité

- Base de données locale (SQLite) dans dossier utilisateur
- Validation Zod côté backend
- Pas de données sensibles stockées

### Compatibilité

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)
- Résolution minimale : 1280×720

### Accessibilité

- Navigation au clavier possible
- Labels ARIA pour screen readers
- Contraste suffisant (WCAG 2.1 AA)

---

## Critères de succès

### Fonctionnels

- ✅ 14 entités en BDD (objectif: 2)
- ✅ CRUD complet sur les animaux
- ✅ Système de dégradation automatique
- ✅ Persistance entre sessions
- ✅ Notifications desktop natives
- ✅ Système d'économie complet
- ✅ Mini-jeu clicker avec upgrades
- ✅ Mini-jeu de pêche complet
- ✅ Système audio

### Techniques

- ✅ Architecture feature-based
- ✅ TypeScript strict sans `any`
- ✅ TanStack Query pour le state serveur
- ✅ TanStack Router pour la navigation
- ✅ Prisma pour l'ORM
- ✅ Pattern Repository/Controller

### UX

- ✅ Interface claire et intuitive
- ✅ Feedback immédiat (toasts)
- ✅ Barres de stats visuelles
- ✅ Animations fluides
- ✅ Musique et effets sonores

---

**Version** : 3.0
**Date** : 26 novembre 2025
**Statut** : Spécifications mises à jour avec toutes les features implémentées
