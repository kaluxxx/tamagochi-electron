# Design System – Tamagotchi Electron

## Objectif

Créer une identité visuelle inspirée des Tamagotchi originaux des années 90, tout en apportant une touche moderne et accessible pour une application desktop.

---

## Inspiration : Tamagotchi Original

### Caractéristiques visuelles

- **Pixel art minimaliste** : Sprites simples en noir et blanc (écran LCD monochrome)
- **Formes arrondies et kawaii** : Créatures mignonnes avec de grands yeux
- **Interface simple** : Icônes claires et compréhensibles instantanément
- **Animations basiques** : Mouvements simples mais expressifs
- **Couleurs vives du boîtier** : Rose, bleu, jaune, violet pour l'appareil physique
- **Feedback visuel immédiat** : Étoiles, cœurs, notes de musique pour les actions

---

## Palette de couleurs

### Couleurs principales

```css
/* Primaires */
--primary-pink: #FF69B4      /* Rose Tamagotchi */
--primary-blue: #4A90E2      /* Bleu ciel */
--primary-yellow: #FFD700    /* Jaune vif */
--primary-purple: #9B59B6    /* Violet kawaii */

/* Secondaires */
--success-green: #2ECC71     /* Vert santé */
--warning-orange: #F39C12    /* Orange alerte */
--danger-red: #E74C3C        /* Rouge critique */

/* Neutres */
--bg-light: #F8F9FA          /* Fond clair */
--bg-dark: #2C3E50           /* Fond sombre */
--text-primary: #2C3E50      /* Texte principal */
--text-secondary: #7F8C8D    /* Texte secondaire */
--border: #BDC3C7            /* Bordures */
```

### Couleurs des stats

```css
--stat-high: #2ECC71      /* >60% - Vert */
--stat-medium: #F39C12    /* 30-60% - Orange */
--stat-low: #E74C3C       /* <30% - Rouge */
--stat-bg: #ECF0F1        /* Background barre */
```

### Couleurs de rareté (Pêche)

```css
--rarity-common: #9CA3AF      /* Gris */
--rarity-uncommon: #22C55E    /* Vert */
--rarity-rare: #3B82F6        /* Bleu */
--rarity-epic: #A855F7        /* Violet */
--rarity-legendary: #F59E0B   /* Or */
```

---

## Typographie

### Police principale : "Press Start 2P" (pixel art)

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
font-family: 'Press Start 2P', cursive;
```

**Usage** : Titres, boutons, stats importantes

### Police secondaire : "Nunito" (moderne, arrondie)

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
font-family: 'Nunito', sans-serif;
```

**Usage** : Paragraphes, descriptions, historique

### Hiérarchie

```css
h1: Press Start 2P, 24px
h2: Press Start 2P, 18px
h3: Nunito Bold, 20px
body: Nunito Regular, 16px
small: Nunito Regular, 14px
```

---

## Sprites & Créatures

### Style visuel : Pixel Art Moderne

**Résolution** : 64×64px ou 128×128px

**Caractéristiques** :
- Contours noirs épais (2-3px)
- Formes simples et arrondies
- Grands yeux expressifs (style kawaii)
- Palette limitée (3-5 couleurs par sprite)
- Animations basiques (2-4 frames)

### Types d'animaux

| Type | Couleur | Emoji |
|------|---------|-------|
| **Chat** | Orange (#FF8C42) | 🐱 |
| **Chien** | Marron (#D4A574) | 🐶 |
| **Alien** | Vert menthe (#7DCEA0) | 👽 |

### États émotionnels (12 états par animal)

**États d'action** (priorité maximale) :
1. `sleeping` - Yeux fermés, "ZZZ"
2. `playing` - Animation joyeuse
3. `feeding` - Animation mastication
4. `healing` - Animation soin
5. `using_item` - Animation utilisation

**États basés sur les stats** :
6. `sick` - si santé < 30%
7. `tired` - si énergie < 30%
8. `hungry` - si faim < 30%
9. `sad` - si bonheur < 30%

**États positifs** :
10. `happy` - si bonheur > 60% ET faim > 60%

**État par défaut** :
11. `neutral` - Expression par défaut

**État terminal** :
12. `dead` - Yeux en croix, grisé

---

## Pages & Layouts

### Page principale (GameView)

```
┌─────────────────────────────────────────────────────────────┐
│                    Header / Tabs animaux                      │
├──────────────┬──────────────────────┬───────────────────────┤
│  Left Panel  │    Center Zone       │    Right Panel         │
│ (collapsible)│    (Game View)       │   (collapsible)        │
│              │                      │                        │
│ - StatsPanel │  - AnimalSprite      │  - ActionsPanel        │
│ - HistoryPanel│  - Coin Display     │  - InventoryPanel      │
│              │  - Death message     │                        │
└──────────────┴──────────────────────┴───────────────────────┘
```

### Page Shop

```
┌─────────────────────────────────────────────────────────────┐
│  🛒 Boutique                              💰 Coins: XXX      │
├─────────────────────────────────────────────────────────────┤
│  [Tous] [Nourriture] [Jouets] [Médicaments]                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Item   │  │  Item   │  │  Item   │  │  Item   │        │
│  │  Card   │  │  Card   │  │  Card   │  │  Card   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Page Minigames Hub

```
┌─────────────────────────────────────────────────────────────┐
│                     🎮 Mini-jeux                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────────────┐      ┌─────────────────┐             │
│    │   🖱️ Clicker    │      │   🎣 Pêche      │             │
│    │                 │      │                 │             │
│    │  Gagne des      │      │  Attrape des    │             │
│    │  coins en       │      │  poissons       │             │
│    │  cliquant !     │      │  rares !        │             │
│    └─────────────────┘      └─────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Page Fishing (4 tabs)

```
┌─────────────────────────────────────────────────────────────┐
│  🎣 Pêche                               Niveau X | XP: XXX   │
├─────────────────────────────────────────────────────────────┤
│  [Jeu] [Équipement] [Améliorations] [Catalogue]             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tab: Jeu        → Zone de pêche interactive                │
│  Tab: Équipement → Cannes, Appâts, Lieux                    │
│  Tab: Améliorations → Upgrades permanents                   │
│  Tab: Catalogue  → Collection de poissons                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Composants UI

### Boutons

**Style** : Gros boutons arrondis avec ombre portée

```css
.button-primary {
  background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
  border-radius: 16px;
  padding: 12px 24px;
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: white;
  box-shadow: 0 4px 8px rgba(255, 105, 180, 0.3);
  border: 3px solid white;
}
```

**Variantes** :
- `.button-feed` : Gradient vert
- `.button-play` : Gradient bleu
- `.button-heal` : Gradient rouge
- `.button-sleep` : Gradient violet

### Cards

```css
.animal-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 4px solid var(--primary-pink);
}
```

### Barres de progression

```css
.stat-bar-container {
  background: var(--stat-bg);
  border-radius: 12px;
  height: 24px;
  overflow: hidden;
  border: 2px solid var(--border);
}

.stat-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.stat-bar-fill.high { background: var(--stat-high); }
.stat-bar-fill.medium { background: var(--stat-medium); }
.stat-bar-fill.low { background: var(--stat-low); }
```

### Coin Display

```css
.coin-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Press Start 2P', cursive;
  color: var(--primary-yellow);
}
```

### Audio Controls

```css
.audio-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.volume-slider {
  width: 100%;
  accent-color: var(--primary-pink);
}

.toggle-switch {
  /* Style toggle mute/unmute */
}
```

### Fish Catalog Card

```css
.fish-card {
  border: 3px solid;
  border-radius: 12px;
  padding: 16px;
}

.fish-card.common { border-color: var(--rarity-common); }
.fish-card.uncommon { border-color: var(--rarity-uncommon); }
.fish-card.rare { border-color: var(--rarity-rare); }
.fish-card.epic { border-color: var(--rarity-epic); }
.fish-card.legendary {
  border-color: var(--rarity-legendary);
  box-shadow: 0 0 10px var(--rarity-legendary);
}
```

### QTE Minigame (Fishing)

```css
.tension-bar {
  width: 100%;
  height: 30px;
  background: linear-gradient(to right,
    var(--danger-red) 0%,
    var(--danger-red) 40%,
    var(--success-green) 40%,
    var(--success-green) 70%,
    var(--danger-red) 70%,
    var(--danger-red) 100%
  );
  border-radius: 15px;
  position: relative;
}

.tension-indicator {
  position: absolute;
  width: 4px;
  height: 100%;
  background: white;
  border: 2px solid black;
}

.catch-progress-bar {
  width: 100%;
  height: 20px;
  background: var(--stat-bg);
  border-radius: 10px;
}
```

---

## Animations

### Principes

- **Snappy** : Durées 0.2-0.5s
- **Easing** : `ease-out` pour entrées, `ease-in` pour sorties
- **Micro-interactions** : Hover, click, success

### Animations clés

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes fishBite {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

---

## Sons (Système Audio)

### Catégories

**Musique de fond** (par route) :
- Page principale : Mélodie calme, loop
- Mini-jeux : Mélodie énergique
- Shop : Mélodie shopping

**Effets sonores** :
- Achat : "Cha-ching"
- Action réussie : Note positive
- Capture poisson : Splash + fanfare
- Échec : Note négative

### Format

- MP3 ou OGG pour compatibilité
- Volume normalisé
- Loop sans coupure pour musiques

---

## Espacement

```css
--spacing-xs: 8px;
--spacing-sm: 16px;
--spacing-md: 24px;
--spacing-lg: 32px;
--spacing-xl: 48px;
```

---

## Accessibilité

### Contrastes (WCAG 2.1 AA)

- Texte normal : Ratio minimum 4.5:1
- Texte large (>18px) : Ratio minimum 3:1
- Éléments UI : Ratio minimum 3:1

### Navigation clavier

- Tous les boutons accessibles via `Tab`
- Focus visible avec outline coloré
- `Enter` ou `Space` pour activer

### Screen readers

- Labels ARIA sur tous les éléments interactifs
- `alt` text pour les sprites
- Annonces ARIA pour changements d'état

---

## Assets requis

### Sprites (36 sprites = 3 animaux × 12 états)

- `{animal}-happy.svg`
- `{animal}-sad.svg`
- `{animal}-hungry.svg`
- `{animal}-tired.svg`
- `{animal}-sick.svg`
- `{animal}-neutral.svg`
- `{animal}-sleeping.svg`
- `{animal}-playing.svg`
- `{animal}-feeding.svg`
- `{animal}-healing.svg`
- `{animal}-using-item.svg`
- `{animal}-dead.svg`

### Icônes

- Actions : feed, play, heal, sleep
- Items : food, toy, medicine
- UI : coin, settings, sound, mute

### Fishing assets

- Sprites poissons (par rareté)
- Icônes cannes à pêche
- Icônes appâts
- Illustrations lieux de pêche

---

**Version** : 3.0
**Date** : 26 novembre 2025
