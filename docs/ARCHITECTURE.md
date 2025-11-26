# Architecture – Tamagotchi Electron

## 1. Organisation générale

```
src/
├── backend/
│   ├── core/                 # Base classes, erreurs, validation
│   │   ├── base.repository.ts
│   │   ├── errors.ts
│   │   └── validation.ts
│   ├── database/
│   │   └── prisma.ts         # Initialisation Prisma
│   ├── features/
│   │   ├── animals/          # Gestion des animaux
│   │   │   ├── controllers/
│   │   │   └── repositories/
│   │   ├── economy/          # Wallet, Shop, Minigames
│   │   │   ├── controllers/
│   │   │   └── repositories/
│   │   ├── fishing/          # Mini-jeu de pêche
│   │   │   ├── controllers/
│   │   │   └── repositories/
│   │   ├── inventory/        # Items et inventaire
│   │   │   ├── controllers/
│   │   │   └── repositories/
│   │   └── minigames/        # Clicker et autres mini-jeux
│   │       ├── controllers/
│   │       └── repositories/
│   ├── main.ts               # Electron main process, tick system
│   └── preload.ts            # Context bridge IPC (window.api)
├── frontend/
│   ├── features/
│   │   ├── animals/          # Composants, hooks, services animaux
│   │   ├── actions/          # Système d'actions (feed, play, etc.)
│   │   ├── audio/            # Musique et effets sonores
│   │   ├── economy/          # Wallet, shop, rewards
│   │   ├── fishing/          # Mini-jeu de pêche complet
│   │   ├── history/          # Historique des actions
│   │   └── inventory/        # Gestion de l'inventaire
│   ├── shared/
│   │   ├── ui/               # Composants UI réutilisables
│   │   ├── layout/           # game-view.tsx (3 colonnes)
│   │   ├── lib/              # utils.ts
│   │   └── utils/            # sprite-loader.ts
│   ├── routes/
│   │   ├── __root.tsx        # Root layout avec Toaster
│   │   ├── index.tsx         # Page principale (GameView)
│   │   ├── shop.tsx          # Page boutique
│   │   ├── animals/
│   │   │   └── create.tsx    # Page création animal
│   │   └── minigames/
│   │       ├── index.tsx     # Hub des mini-jeux
│   │       ├── clicker.tsx   # Mini-jeu clicker
│   │       └── fishing.tsx   # Mini-jeu pêche
│   ├── styles/
│   │   └── index.css         # Tailwind + CSS global
│   ├── App.tsx               # TanStack Query + Router setup
│   └── main.tsx              # React entry point
prisma/
├── schema.prisma             # Schéma BDD (14 tables)
├── seed.ts                   # Données initiales
└── migrations/               # Historique migrations
```

## 2. Stack technique

### Frontend
- **React 18** → Library UI
- **TypeScript** → Typage strict
- **TanStack Query** → State management serveur (cache, mutations)
- **TanStack Router** → Navigation type-safe (file-based routing)
- **Zustand** → State management client (actions, audio, fishing)
- **Tailwind CSS** → Styling
- **shadcn/ui** → Composants UI (Button, Card, Progress, Input)
- **Lucide React** → Icônes
- **Sonner** → Toast notifications

### Backend/Data
- **Electron** → Application desktop
- **Prisma** → ORM pour SQLite
- **SQLite** → Base de données locale
- **IPC Bridge** → Communication main ↔ renderer
- **Zod** → Validation des inputs

### Build/Dev
- **Vite** → Bundler rapide
- **Vitest** → Tests unitaires
- **React Testing Library** → Tests composants
- **electron-builder** → Packaging de l'app

## 3. Base de données (Prisma Schema)

Le projet utilise **14 tables** organisées en 4 domaines :

### Domaine Animaux (5 tables)

```prisma
model AnimalType {
  id                 String   @id @default(uuid())
  name               String   @unique  // "cat", "dog", "alien"
  displayName        String   // "Chat", "Chien", "Alien"
  hungerDecayRate    Float    @default(2.0)
  happinessDecayRate Float    @default(1.5)
  energyDecayRate    Float    @default(1.0)
  healthDecayRate    Float    @default(3.0)
  emoji              String   // 🐱 🐶 👽
  animals            Animal[]
}

model Animal {
  id          String     @id @default(uuid())
  name        String
  typeId      String
  hunger      Int        @default(100)
  happiness   Int        @default(100)
  health      Int        @default(100)
  energy      Int        @default(100)
  age         Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @default(now())
  isAlive     Boolean    @default(true)
  type        AnimalType @relation
  actions     Action[]
}

model Action {
  id              String   @id @default(uuid())
  animalId        String
  actionType      String   // "feed", "play", "heal", "sleep", "use_item"
  itemId          String?
  timestamp       DateTime @default(now())
  // Stats tracking
  hungerBefore    Int?
  happinessBefore Int?
  healthBefore    Int?
  energyBefore    Int?
  hungerAfter     Int?
  happinessAfter  Int?
  healthAfter     Int?
  energyAfter     Int?
  coinsEarned     Int?
  animal          Animal   @relation(onDelete: Cascade)
  item            Item?    @relation
}

model Item {
  id             String      @id @default(uuid())
  name           String
  type           String      // "food", "toy", "medicine"
  hungerBoost    Int         @default(0)
  happinessBoost Int         @default(0)
  healthBoost    Int         @default(0)
  energyBoost    Int         @default(0)
  energyCost     Int         @default(0)
  price          Int         @default(10)
  emoji          String
  description    String
  actions        Action[]
  inventory      Inventory?
}

model Inventory {
  id       String @id @default(uuid())
  itemId   String @unique
  quantity Int    @default(0)
  item     Item   @relation
}
```

### Domaine Économie (3 tables)

```prisma
model Wallet {
  id              String   @id @default(uuid())
  coins           Int      @default(100)
  lastPassiveGain DateTime @default(now())
  createdAt       DateTime @default(now())
}

model MinigameScore {
  id          String   @id @default(uuid())
  gameType    String   // "clicker"
  score       Int
  coinsEarned Int
  playedAt    DateTime @default(now())
}

model ClickerUpgrade {
  id        String   @id @default(uuid())
  type      String   @unique // "multiplier", "time_bonus", "auto_clicker"
  level     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Domaine Pêche (6 tables)

```prisma
model FishSpecies {
  id             String      @id @default(uuid())
  name           String      @unique
  displayName    String
  emoji          String
  rarity         String      // "common", "uncommon", "rare", "epic", "legendary"
  baseValue      Int
  difficulty     Int         // 1-10
  minSize        Int
  maxSize        Int
  locations      String      // JSON array
  baitPreference String      // JSON array
  description    String
  catches        FishCatch[]
}

model FishCatch {
  id           String      @id @default(uuid())
  speciesId    String
  size         Int
  coinsEarned  Int
  isFirstCatch Boolean     @default(false)
  caughtAt     DateTime    @default(now())
  locationId   String
  rodId        String
  baitId       String?
  species      FishSpecies @relation
}

model FishingRod {
  id             String  @id @default(uuid())
  name           String  @unique
  displayName    String
  tier           Int     // 1-5
  price          Int
  reelZoneBonus  Float   @default(0)
  catchRateBonus Float   @default(0)
  rarityBonus    Float   @default(0)
  description    String
  isOwned        Boolean @default(false)
  isEquipped     Boolean @default(false)
}

model FishingBait {
  id             String  @id @default(uuid())
  name           String  @unique
  displayName    String
  emoji          String
  price          Int
  catchRateBonus Float   @default(0)
  maxUses        Int     @default(1)
  targetRarity   String?
  targetSpecies  String?
  description    String
  quantity       Int     @default(0)
}

model FishingLocation {
  id            String  @id @default(uuid())
  name          String  @unique
  displayName   String
  emoji         String
  unlockCost    Int
  difficulty    Float   @default(1.0)
  availableFish String  // JSON array
  description   String
  isUnlocked    Boolean @default(false)
  unlockOrder   Int     @default(0)
}

model FishingUpgrade {
  id        String   @id @default(uuid())
  type      String   @unique // "luck", "reflexes", "value", "bait_efficiency"
  level     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model FishingProgress {
  id              String   @id @default(uuid())
  level           Int      @default(1)
  experience      Int      @default(0)
  totalFishCaught Int      @default(0)
  largestFishId   String?
  largestFishSize Int?
  currentStreak   Int      @default(0)
  bestStreak      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 4. Flux de données

### Architecture en couches

```
┌─────────────────────────────────────┐
│      UI Layer (React + Tailwind)    │
│  Components → Hooks → Services       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     IPC Bridge (Electron Preload)   │
│  window.api.* (animals, wallet,     │
│  shop, fishing, minigame, etc.)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Main Process (Electron + Prisma)  │
│  Controllers → Repositories → DB     │
└─────────────────────────────────────┘
```

### Pattern Repository

Le backend utilise un pattern Repository avec classes de base :

```typescript
// Base Repository (CRUD complet)
class BaseRepository<T, CreateInput, UpdateInput> {
  findMany(), findById(), create(), update(), delete()
}

// Read-Only Repository (entités statiques)
class ReadOnlyRepository<T> {
  findMany(), findById()
}

// Singleton Repository (une seule entrée)
class SingletonRepository<T, UpdateInput> {
  get(), update(), getOrCreate()
}
```

## 5. State Management

### Server State (TanStack Query)

Gestion du cache pour toutes les données serveur :

```typescript
// Query keys principaux
['animals']
['animal-types']
['shop-items']
['wallet']
['inventory']
['history', animalId]
['fishing', 'species']
['fishing', 'rods']
['fishing', 'baits']
['fishing', 'locations']
['fishing', 'upgrades']
['fishing', 'progress']
['clicker-upgrades']
```

### Client State (Zustand)

**3 stores Zustand :**

1. **actions-store.ts** - État des actions en cours
```typescript
interface ActionsStore {
  activeActions: Map<string, ActiveAction>
  startAction: (animalId, type, duration) => void
  completeAction: (animalId) => void
}
```

2. **audio-store.ts** - Paramètres audio (persisté)
```typescript
interface AudioStore {
  musicVolume: number
  sfxVolume: number
  isMusicMuted: boolean
  isSfxMuted: boolean
}
```

3. **fishing.store.ts** - État du jeu de pêche
```typescript
interface FishingStore {
  gameState: 'idle' | 'casting' | 'waiting' | 'bite' | 'catching' | 'success' | 'failure'
  selectedLocationId: string | null
  selectedBaitId: string | null
  tension: number
  catchProgress: number
  qteConfig: QTEConfig
}
```

## 6. Communication IPC

### API Surface (preload.ts)

```typescript
window.api = {
  // Animaux
  animalTypes: { getAll, getById },
  animals: { getAll, getById, create, feed, play, heal, sleep, tick },
  actions: { getByAnimalId },

  // Items & Inventaire
  items: { getAll, getById, getByType, useItem },
  inventory: { getAll, getByType },
  history: { getByAnimalId },

  // Économie
  wallet: { get, collectPassive, addCoins },
  shop: { getItems, purchase },
  minigame: { saveScore, getHighScores },
  clickerUpgrades: { getAll, purchase, getGameStats },

  // Pêche (~20 méthodes)
  fishing: {
    // Espèces
    getAllSpecies, getSpeciesById,
    // Catalogue
    getCaughtFish, getCaughtSpeciesIds,
    // Actions de jeu
    selectRandomFish, catchFish, failCatch,
    // Équipement
    getRods, getEquippedRod, purchaseRod, equipRod,
    getBaits, purchaseBait,
    getLocations, unlockLocation,
    // Progression
    getUpgrades, purchaseUpgrade, getStats, getUpgradesWithDetails,
    getProgress
  },

  // Events (Main → Renderer)
  onAnimalsUpdated: (callback) => void,
  onAnimalDied: (callback) => void,
  onWalletUpdated: (callback) => void
}
```

## 7. Système de tick temporel

### Tick dans le Main Process

```typescript
const TICK_INTERVAL = 10000 // 10 secondes

const runTick = async () => {
  // 1. Dégradation des stats des animaux
  const animals = await getAllAnimals()
  for (const animal of animals.filter(a => a.isAlive)) {
    const result = await tickAnimal(animal.id)
    if (result.justDied) sendDeathNotification(animal)
    checkCriticalStats(result)
  }

  // 2. Collecte passive des coins
  await collectPassiveCoins()

  // 3. Notifier le renderer
  mainWindow?.webContents.send('animals:updated')
  mainWindow?.webContents.send('wallet:updated', wallet)
}

setInterval(runTick, TICK_INTERVAL)
```

### Dégradation des stats

- **Hunger, Happiness, Energy** : Diminuent selon le type d'animal
- **Health** : Diminue si une stat < 20, multiplié par le nombre de stats critiques

### Économie passive

- **10 coins/heure** générés automatiquement
- Collectés lors du tick ou manuellement

## 8. Système d'économie

### Sources de revenus

| Source | Coins |
|--------|-------|
| Passif | 10/heure |
| Feed | +2 |
| Play | +5 |
| Heal | +3 |
| Sleep | +8 |
| Use Item | +1 |
| Clicker | Variable |
| Fishing | Variable (basé sur rareté et taille) |

### Coûts

- Items de shop : 10-50 coins
- Cannes à pêche : 0-500 coins
- Appâts : 5-20 coins
- Déblocage lieux : 100-1000 coins
- Upgrades : Coût exponentiel (base × 1.4-1.7^level)

## 9. Mini-jeu de pêche

### États du jeu

```
idle → casting → waiting → bite → catching → success/failure → reward
```

### Mécanique QTE

- **Tension** : 0-100, zone optimale 40-70
- **Progress** : Remplir la barre pour capturer
- Paramètres ajustables via `qteConfig`

### Système de rareté

| Rareté | Couleur | Multiplicateur valeur |
|--------|---------|----------------------|
| Common | Gris | ×1 |
| Uncommon | Vert | ×2 |
| Rare | Bleu | ×3 |
| Epic | Violet | ×5 |
| Legendary | Or | ×10 |

## 10. Routing

```
/                       → GameView principal
/shop                   → Boutique d'items
/animals/create         → Création d'animal
/minigames              → Hub des mini-jeux
/minigames/clicker      → Jeu clicker
/minigames/fishing      → Jeu de pêche (tabs: game, equipment, upgrades, catalog)
```

## 11. Notifications Desktop

- **Mort** : Notification immédiate
- **Stats critiques** (< 30%) : Avec cooldown 1h par stat par animal
- **Mort offline** : Message spécifique au démarrage

## 12. Principes clés

### Separation of Concerns
- **Components** : UI seulement
- **Hooks** : Logique métier
- **Services** : Communication IPC
- **Controllers** : Business logic backend
- **Repositories** : Accès données

### Type Safety
- TypeScript strict
- Types Prisma auto-générés
- Validation Zod côté backend

### Performance
- TanStack Query cache intelligent
- Tick toutes les 10s
- Calcul batch du temps offline

---

**Version** : 3.0
**Date** : 26 novembre 2025
