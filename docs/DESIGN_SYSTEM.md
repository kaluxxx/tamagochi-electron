# Design System – Tamagotchi Electron

## Objectif

Créer une identité visuelle inspirée des Tamagotchi originaux des années 90, tout en apportant une touche moderne et accessible pour une application desktop.

---

## 🎨 Inspiration : Tamagotchi Original

### Caractéristiques visuelles des Tamagotchi

Les Tamagotchi originaux (Bandai, 1996) avaient une identité visuelle très reconnaissable :

- **Pixel art minimaliste** : Sprites simples en noir et blanc (écran LCD monochrome)
- **Formes arrondies et kawaii** : Créatures mignonnes avec de grands yeux
- **Interface simple** : Icônes claires et compréhensibles instantanément
- **Animations basiques** : Mouvements simples mais expressifs
- **Couleurs vives du boîtier** : Rose, bleu, jaune, violet pour l'appareil physique
- **Feedback visuel immédiat** : Étoiles, cœurs, notes de musique pour les actions

### Éléments à reprendre

1. **Aesthetic rétro pixel art** mais modernisé
2. **Palette colorée et joyeuse**
3. **Créatures expressives** avec personnalité
4. **UI minimaliste** et intuitive
5. **Animations simples** mais charmantes
6. **Sons nostalgiques** (8-bit style)

---

## 🎨 Palette de couleurs

### Couleurs principales

Inspirées des boîtiers Tamagotchi originaux (rose, bleu, jaune) avec une touche moderne.

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
--bg-dark: #2C3E50           /* Fond sombre (mode nuit) */
--text-primary: #2C3E50      /* Texte principal */
--text-secondary: #7F8C8D    /* Texte secondaire */
--border: #BDC3C7            /* Bordures */
```

### Dégradés (pour les sprites/backgrounds)

```css
--gradient-happy: linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)
--gradient-sad: linear-gradient(135deg, #4A90E2 0%, #9B59B6 100%)
--gradient-energy: linear-gradient(135deg, #2ECC71 0%, #FFD700 100%)
--gradient-death: linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)
```

### Couleurs des stats

```css
/* Barres de progression */
--stat-high: #2ECC71      /* >60% - Vert */
--stat-medium: #F39C12    /* 30-60% - Orange */
--stat-low: #E74C3C       /* <30% - Rouge */
--stat-bg: #ECF0F1        /* Background barre */
```

---

## 📐 Typographie

### Police principale : "Press Start 2P" (pixel art)

Pour l'ambiance rétro gaming authentique.

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

font-family: 'Press Start 2P', cursive;
```

**Usage** : Titres, boutons, stats importantes

### Police secondaire : "Nunito" (moderne, arrondie)

Pour le contenu texte et une meilleure lisibilité.

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

font-family: 'Nunito', sans-serif;
```

**Usage** : Paragraphes, descriptions, historique

### Hiérarchie typographique

```css
/* Titres */
h1: Press Start 2P, 24px, letter-spacing: 2px
h2: Press Start 2P, 18px, letter-spacing: 1.5px
h3: Nunito Bold, 20px

/* Corps de texte */
body: Nunito Regular, 16px, line-height: 1.6
small: Nunito Regular, 14px
```

---

## 🎭 Sprites & Créatures

### Style visuel : Pixel Art Moderne

**Résolution** : 64×64px ou 128×128px (pour Retina)

**Caractéristiques** :
- Contours noirs épais (2-3px)
- Formes simples et arrondies
- Grands yeux expressifs (style kawaii)
- Palette limitée (3-5 couleurs par sprite)
- Animations basiques (2-4 frames max)

### Types d'animaux

#### 🐱 Chat (Neko)
- **Couleur principale** : Orange/Roux (#FF8C42)
- **Traits distinctifs** : Oreilles triangulaires, moustaches, queue en panache
- **Personnalité** : Indépendant, joueur

#### 🐶 Chien (Inu)
- **Couleur principale** : Marron/Beige (#D4A574)
- **Traits distinctifs** : Oreilles tombantes, langue tirée quand content
- **Personnalité** : Loyal, énergique

#### 👽 Alien (Uchūjin)
- **Couleur principale** : Vert menthe (#7DCEA0)
- **Traits distinctifs** : Antennes, grands yeux noirs, 3 doigts
- **Personnalité** : Curieux, mystérieux

### États émotionnels (expressions)

Chaque animal a **5 états** :

1. **Content** 😊 : Yeux en forme de U, bouche souriante, animation de sautillement
2. **Triste** 😢 : Yeux tombants, larme qui coule, posture affaissée
3. **Affamé** 😫 : Yeux écarquillés, bouche ouverte, ventre qui gargouille (animation)
4. **Endormi** 😴 : Yeux fermés, "ZZZ" au-dessus de la tête, respiration lente
5. **Neutre** 😐 : Expression par défaut, yeux ouverts, posture droite

### Animations

```
Idle (repos) : 2 frames, loop 2s
  Frame 1 : Position normale
  Frame 2 : Légère oscillation

Content : 3 frames, loop 1s
  Frame 1-2 : Sautillement
  Frame 3 : Retour position

Affamé : 2 frames, loop 1.5s
  Frame 1 : Ventre normal
  Frame 2 : Ventre gonflé (effet gargouillis)

Endormi : 2 frames, loop 3s
  Frame 1 : Corps stable
  Frame 2 : Légère montée/descente (respiration)
```

---

## 🧩 Composants UI

### Boutons

**Style** : Gros boutons arrondis avec ombre portée (neumorphism léger)

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
  cursor: pointer;
  transition: transform 0.2s;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 105, 180, 0.4);
}

.button-primary:active {
  transform: translateY(0);
}
```

**Variantes** :
- `.button-feed` : Gradient vert (#2ECC71)
- `.button-play` : Gradient bleu (#4A90E2)
- `.button-heal` : Gradient rouge (#E74C3C)
- `.button-sleep` : Gradient violet (#9B59B6)

### Cards (Cartes animaux)

```css
.animal-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 4px solid var(--primary-pink);
  transition: transform 0.3s, box-shadow 0.3s;
}

.animal-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}
```

### Barres de progression (Stats)

**Design** : Barres arrondies avec animation de remplissage

```css
.stat-bar-container {
  background: var(--stat-bg);
  border-radius: 12px;
  height: 24px;
  overflow: hidden;
  border: 2px solid var(--border);
  position: relative;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease, background-color 0.3s;
  background: linear-gradient(90deg, var(--stat-high) 0%, var(--success-green) 100%);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

/* Couleur selon niveau */
.stat-bar-fill.high { background: var(--stat-high); }
.stat-bar-fill.medium { background: var(--stat-medium); }
.stat-bar-fill.low { background: var(--stat-low); }
```

**Labels** : Icône + nom + valeur numérique

```html
<div class="stat-item">
  <span class="stat-icon">🍖</span>
  <span class="stat-label">Faim</span>
  <div class="stat-bar-container">
    <div class="stat-bar-fill" style="width: 75%"></div>
  </div>
  <span class="stat-value">75%</span>
</div>
```

### Badges de statut

```css
.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  text-transform: uppercase;
}

.badge-alive {
  background: #2ECC71;
  color: white;
}

.badge-dead {
  background: #95A5A6;
  color: white;
}
```

---

## 🎬 Animations & Transitions

### Principes d'animation

1. **Snappy mais smooth** : Durées courtes (0.2-0.5s)
2. **Easing naturel** : `ease-out` pour entrées, `ease-in` pour sorties
3. **Micro-interactions** : Hover, click, success feedback
4. **Pas de surcharge** : Max 2-3 animations simultanées

### Animations clés

**Apparition (fade + slide)** :
```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Bounce (succès d'action)** :
```css
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

**Shake (erreur)** :
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

**Pulse (notification)** :
```css
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## 🔊 Sons (optionnel Phase 2)

### Sound Design : 8-bit/Chiptune

**Actions** :
- Nourrir : "Crunch" 8-bit (miam)
- Jouer : Notes joyeuses ascendantes
- Soigner : "Power-up" style
- Dormir : Mélodie apaisante descendante

**Notifications** :
- Stat critique : Bip d'alerte (3 notes)
- Mort : Mélodie triste descendante
- Création : Jingle de victoire

**Sources** :
- Freesound.org
- Zapsplat.com
- Bfxr.net (générateur en ligne)

---

## 📱 Layout & Grille

### Structure de page

```
┌─────────────────────────────────┐
│         Header (64px)            │
│  Logo | Titre | Bouton Créer     │
├─────────────────────────────────┤
│                                  │
│         Main Content             │
│    (Grid ou Flex selon page)    │
│                                  │
│                                  │
└─────────────────────────────────┘
```

### Grille (liste animaux)

```css
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
}
```

### Espacements (système 8px)

```css
--spacing-xs: 8px;
--spacing-sm: 16px;
--spacing-md: 24px;
--spacing-lg: 32px;
--spacing-xl: 48px;
```

---

## 🌓 Mode sombre (optionnel)

Pour une utilisation le soir sans fatiguer les yeux.

```css
/* Dark mode palette */
--bg-dark: #1A1A2E;
--bg-dark-secondary: #16213E;
--text-dark: #EAEAEA;
--border-dark: #3A3A5A;
```

---

## ♿ Accessibilité

### Contrastes (WCAG 2.1 AA)

- Texte normal : Ratio minimum 4.5:1
- Texte large (>18px) : Ratio minimum 3:1
- Éléments UI : Ratio minimum 3:1

### Navigation clavier

- Tous les boutons accessibles via `Tab`
- Focus visible avec outline coloré (3px solid)
- `Enter` ou `Space` pour activer

### Screen readers

- Labels ARIA sur tous les éléments interactifs
- `alt` text pour les sprites
- Annonces ARIA pour changements d'état

```html
<button 
  aria-label="Nourrir l'animal" 
  aria-describedby="stat-faim"
>
  🍖 Nourrir
</button>

<div 
  role="progressbar" 
  aria-valuenow="75" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="Niveau de faim"
>
  <!-- Barre de progression -->
</div>
```

---

## 📦 Assets à préparer

### Sprites (3 animaux × 5 états = 15 sprites)
- `cat-happy.png` (64×64px)
- `cat-sad.png`
- `cat-hungry.png`
- `cat-sleeping.png`
- `cat-neutral.png`
- `dog-*.png` (×5)
- `alien-*.png` (×5)

### Icônes d'actions (4 icônes)
- `icon-feed.svg` (🍖)
- `icon-play.svg` (🎮)
- `icon-heal.svg` (💊)
- `icon-sleep.svg` (😴)

### UI Elements
- `logo.svg` (logo de l'app)
- `empty-state.svg` (illustration écran vide)
- `tombstone.svg` (pierre tombale pour cimetière)

---

## 🎯 Checklist Design

Avant de lancer le développement :

- [ ] Palette de couleurs validée (8 couleurs principales)
- [ ] Polices chargées (Press Start 2P + Nunito)
- [ ] Sprites des 3 animaux × 5 états (pixel art 64×64)
- [ ] Icônes d'actions (SVG)
- [ ] Composants UI définis (boutons, cards, barres)
- [ ] Animations CSS prêtes (fade, bounce, shake, pulse)
- [ ] Accessibilité vérifiée (contrastes, ARIA)
- [ ] Responsive desktop (1280px minimum)

---

## 🔗 Ressources

### Inspiration visuelle
- Tamagotchi Wiki : https://tamagotchi.fandom.com
- Dribbble : Recherche "tamagotchi UI"
- Pinterest : "pixel art pets"

### Outils
- Piskel : Éditeur pixel art en ligne
- Aseprite : Logiciel pixel art professionnel
- Coolors.co : Générateur de palettes

### Assets gratuits
- OpenGameArt.org : Sprites pixel art
- Kenney.nl : UI elements
- Game-icons.net : Icônes SVG

---

**Version** : 1.0  
**Date** : 24 novembre 2025  
**Statut** : Charte graphique validée