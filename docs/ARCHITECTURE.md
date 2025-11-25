# Architecture – Tamagotchi Electron

## 1. Organisation générale

```
src/
├── features/
│   ├── animals/
│   │   ├── components/      # AnimalCard, AnimalSprite, AnimalTabs, CreateAnimalForm
│   │   ├── hooks/           # useAnimals, useCreateAnimal
│   │   ├── services/        # animal-api.ts (IPC wrappers)
│   │   ├── schemas/         # Validation Zod
│   │   └── types/           # Animal, AnimalType interfaces
│   ├── actions/
│   │   ├── components/      # ActionsPanel, GameZone
│   │   ├── hooks/           # useActions, useActionProgress
│   │   ├── stores/          # actions-store.ts (Zustand)
│   │   └── types/           # ActionType definitions
│   ├── history/
│   │   ├── components/      # HistoryPanel, HistoryEntry
│   │   ├── hooks/           # useHistory
│   │   ├── services/        # history-api.ts
│   │   └── types/           # ActionWithDelta, StatDelta
│   └── inventory/
│       ├── components/      # InventoryPanel, InventoryItem
│       ├── hooks/           # useInventory
│       ├── services/        # inventory-api.ts
│       └── types/           # Item, InventoryItem, ItemType
├── shared/
│   ├── components/
│   │   ├── ui/              # Button, Card, Progress, Input (shadcn/ui)
│   │   └── layout/          # game-view.tsx (3-column layout)
│   ├── lib/                 # utils.ts
│   ├── types/               # window.d.ts (IPC types)
│   └── utils/               # sprite-loader.ts
├── electron/
│   ├── main.ts              # Electron main process, tick system, notifications
│   ├── preload.ts           # Context bridge IPC (window.api)
│   └── database.ts          # Prisma operations
├── routes/
│   ├── __root.tsx           # Root layout avec Toaster
│   ├── index.tsx            # Page principale (GameView)
│   └── animals/
│       └── create.tsx       # Page création animal
├── styles/
│   └── index.css            # Tailwind + CSS global
├── App.tsx                  # TanStack Query + Router setup
└── main.tsx                 # React entry point
prisma/
├── schema.prisma            # Schéma BDD (5 tables)
├── seed.ts                  # Données initiales
└── migrations/              # Historique migrations
```

## 2. Stack technique

### Frontend
- **React 18** → Library UI
- **TypeScript** → Typage strict
- **TanStack Query** → State management serveur (cache, mutations)
- **TanStack Router** → Navigation type-safe (file-based routing)
- **Zustand** → State management client (actions en cours)
- **Tailwind CSS** → Styling
- **shadcn/ui** → Composants UI (Button, Card, Progress, Input)
- **Lucide React** → Icônes
- **Sonner** → Toast notifications

### Backend/Data
- **Electron** → Application desktop
- **Prisma** → ORM pour SQLite
- **SQLite** → Base de données locale
- **IPC Bridge** → Communication main ↔ renderer

### Build/Dev
- **Vite** → Bundler rapide
- **Vitest** → Tests unitaires
- **React Testing Library** → Tests composants
- **electron-builder** → Packaging de l'app

## 3. Base de données (Prisma Schema)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model AnimalType {
  id                 String   @id @default(uuid())
  name               String   @unique  // "cat", "dog", "alien"
  displayName        String   // "Chat", "Chien", "Alien"
  hungerDecayRate    Float    @default(2.0)    // Cat: 2.5, Dog: 2.0, Alien: 1.5
  happinessDecayRate Float    @default(1.5)    // Cat: 1.5, Dog: 2.0, Alien: 1.0
  energyDecayRate    Float    @default(1.0)    // Cat: 0.8, Dog: 1.2, Alien: 1.5
  healthDecayRate    Float    @default(3.0)    // Cat: 3.0, Dog: 3.0, Alien: 2.5
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
  age         Int        @default(0) // in hours
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @default(now())
  isAlive     Boolean    @default(true)
  type        AnimalType @relation(fields: [typeId], references: [id])
  actions     Action[]
}

model Action {
  id              String   @id @default(uuid())
  animalId        String
  actionType      String   // "feed", "play", "heal", "sleep", "use_item"
  itemId          String?
  timestamp       DateTime @default(now())
  // Stats tracking for history display
  hungerBefore    Int?
  happinessBefore Int?
  healthBefore    Int?
  energyBefore    Int?
  hungerAfter     Int?
  happinessAfter  Int?
  healthAfter     Int?
  energyAfter     Int?
  animal          Animal   @relation(fields: [animalId], references: [id], onDelete: Cascade)
  item            Item?    @relation(fields: [itemId], references: [id])
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
  emoji          String
  description    String
  actions        Action[]
  inventory      Inventory?
}

model Inventory {
  id       String @id @default(uuid())
  itemId   String @unique
  quantity Int    @default(0)
  item     Item   @relation(fields: [itemId], references: [id])
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
│  window.api.animals.*                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Main Process (Electron + Prisma)  │
│  Services → Prisma → SQLite          │
└─────────────────────────────────────┘
```

### Flux typique d'une action

**Exemple : Nourrir un animal**

1. **UI** : Utilisateur clique sur "Nourrir"
2. **Hook** : `useFeedAnimal()` appelle `window.api.animals.feed(animalId)`
3. **IPC** : Preload transmet au main process
4. **Service** : `animalService.feed()` met à jour la BDD via Prisma
5. **Response** : Animal mis à jour renvoyé au renderer
6. **Cache** : TanStack Query invalide et refetch
7. **UI** : Stats mises à jour + toast de succès

## 5. State Management

### Server State (TanStack Query)
- Gestion du cache des animaux, items, inventory, history
- Refetch automatique toutes les 10 secondes
- Invalidation après mutations
- staleTime: 5 minutes

```typescript
// Hook custom
const { data: animals } = useAnimals()
const { animal, feedAnimal, playWithAnimal, healAnimal, sleepAnimal } = useAnimals()
```

### Client State (Zustand)
- État des actions en cours (sleeping, playing, feeding, healing, using_item)
- Progression des actions avec durée
- Persistance entre changements d'onglets

```typescript
// Store Zustand
interface ActionsStore {
  activeActions: Map<string, ActiveAction>  // animalId -> action en cours
  startAction: (animalId: string, action: ActionType, duration: number) => void
  completeAction: (animalId: string) => void
}
```

### Durées des actions
- Feed: 5 secondes
- Play: 20 secondes
- Sleep: 30 secondes
- Heal: 8 secondes
- Use Item: 3 secondes

## 6. Système de tick temporel

### Tick dans le Main Process

Le système de tick est géré côté **main process** (pas côté renderer) pour garantir la fiabilité.

```typescript
// src/electron/main.ts
const TICK_INTERVAL = 10000 // 10 secondes

const runTick = async () => {
  const animals = await getAllAnimals()
  const aliveAnimals = animals.filter(a => a.isAlive)

  for (const animal of aliveAnimals) {
    const result = await tickAnimal(animal.id)

    if (result.justDied) {
      sendDeathNotification(animal)
      mainWindow?.webContents.send('animal:died', animal)
    }

    checkCriticalStats(result)  // Notifications si stats < 30%
  }

  mainWindow?.webContents.send('animals:updated')  // Trigger refetch UI
}

setInterval(runTick, TICK_INTERVAL)
```

### Dégradation des stats

```typescript
// src/electron/database.ts
export const tickAnimal = async (animalId: string) => {
  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: { type: true }
  })

  const now = new Date()
  const hoursElapsed = (now.getTime() - animal.updatedAt.getTime()) / (1000 * 60 * 60)

  // Dégradation selon le type d'animal
  const newHunger = Math.max(0, animal.hunger - hoursElapsed * animal.type.hungerDecayRate)
  const newHappiness = Math.max(0, animal.happiness - hoursElapsed * animal.type.happinessDecayRate)
  const newEnergy = Math.max(0, animal.energy - hoursElapsed * animal.type.energyDecayRate)

  // Santé diminue si stats critiques (< 20), MULTIPLIÉE par le nombre de stats critiques
  let criticalCount = 0
  if (newHunger < 20) criticalCount++
  if (newHappiness < 20) criticalCount++
  if (newEnergy < 20) criticalCount++

  const newHealth = criticalCount > 0
    ? Math.max(0, animal.health - hoursElapsed * animal.type.healthDecayRate * criticalCount)
    : animal.health

  const isAlive = newHealth > 0

  return {
    animal: await prisma.animal.update({ ... }),
    justDied: !isAlive && animal.isAlive,
    criticalStats: { hunger: newHunger < 30, happiness: newHappiness < 30, ... }
  }
}
```

### Synchronisation temps offline

Au démarrage de l'app, `syncOfflineTime()` applique la dégradation accumulée :

```typescript
// src/electron/main.ts
const syncOfflineTime = async () => {
  const animals = await getAllAnimals()
  const aliveAnimals = animals.filter(a => a.isAlive)

  for (const animal of aliveAnimals) {
    const result = await tickAnimal(animal.id)
    if (result.justDied) {
      // Notification spéciale "mort pendant ton absence"
      sendDeathNotification(animal, true)
    }
  }
}

app.whenReady().then(() => {
  syncOfflineTime()
  // ... création fenêtre
})
```

### Notifications Desktop

```typescript
// Cooldown de 1 heure par stat par animal
const notificationCooldowns = new Map<string, number>()
const COOLDOWN = 3600000  // 1 heure

const checkCriticalStats = (result: TickResult) => {
  const { animal, criticalStats } = result

  for (const [stat, isCritical] of Object.entries(criticalStats)) {
    if (isCritical) {
      const key = `${animal.id}-${stat}`
      const lastNotif = notificationCooldowns.get(key) || 0

      if (Date.now() - lastNotif > COOLDOWN) {
        new Notification({ title: `${animal.name} a besoin de toi !`, body: `...` }).show()
        notificationCooldowns.set(key, Date.now())
      }
    }
  }
}
```

## 7. Communication IPC (Electron)

### Preload (Context Bridge)

```typescript
// src/electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Animal Types
  animalTypes: {
    getAll: () => ipcRenderer.invoke('animalTypes:getAll'),
    getById: (id: string) => ipcRenderer.invoke('animalTypes:getById', id),
  },

  // Animals
  animals: {
    getAll: () => ipcRenderer.invoke('animals:getAll'),
    getById: (id: string) => ipcRenderer.invoke('animals:getById', id),
    create: (data: CreateAnimalDto) => ipcRenderer.invoke('animals:create', data),
    feed: (id: string) => ipcRenderer.invoke('animals:feed', id),
    play: (id: string) => ipcRenderer.invoke('animals:play', id),
    heal: (id: string) => ipcRenderer.invoke('animals:heal', id),
    sleep: (id: string) => ipcRenderer.invoke('animals:sleep', id),
    tick: (id: string) => ipcRenderer.invoke('animals:tick', id),
  },

  // Actions
  actions: {
    getByAnimalId: (animalId: string) => ipcRenderer.invoke('actions:getByAnimalId', animalId),
  },

  // Items
  items: {
    getAll: () => ipcRenderer.invoke('items:getAll'),
    getById: (id: string) => ipcRenderer.invoke('items:getById', id),
    getByType: (type: string) => ipcRenderer.invoke('items:getByType', type),
    useItem: (animalId: string, itemId: string) => ipcRenderer.invoke('items:useItem', animalId, itemId),
  },

  // Inventory
  inventory: {
    getAll: () => ipcRenderer.invoke('inventory:getAll'),
    getByType: (type: string) => ipcRenderer.invoke('inventory:getByType', type),
  },

  // History
  history: {
    getByAnimalId: (animalId: string, limit?: number) =>
      ipcRenderer.invoke('history:getByAnimalId', animalId, limit),
  },

  // Event listeners (Main → Renderer)
  onAnimalsUpdated: (callback: () => void) => {
    ipcRenderer.on('animals:updated', callback)
    return () => ipcRenderer.removeListener('animals:updated', callback)
  },
  onAnimalDied: (callback: (animal: Animal) => void) => {
    ipcRenderer.on('animal:died', (_, animal) => callback(animal))
    return () => ipcRenderer.removeListener('animal:died', callback)
  },
})
```

### Main Process Handlers

```typescript
// src/electron/main.ts
import { ipcMain } from 'electron'
import * as db from './database'

// AnimalTypes
ipcMain.handle('animalTypes:getAll', () => db.getAllAnimalTypes())
ipcMain.handle('animalTypes:getById', (_, id) => db.getAnimalTypeById(id))

// Animals
ipcMain.handle('animals:getAll', () => db.getAllAnimals())
ipcMain.handle('animals:getById', (_, id) => db.getAnimalById(id))
ipcMain.handle('animals:create', (_, data) => db.createAnimal(data))
ipcMain.handle('animals:feed', (_, id) => db.feedAnimal(id))
ipcMain.handle('animals:play', (_, id) => db.playWithAnimal(id))
ipcMain.handle('animals:heal', (_, id) => db.healAnimal(id))
ipcMain.handle('animals:sleep', (_, id) => db.sleepAnimal(id))
ipcMain.handle('animals:tick', (_, id) => db.tickAnimal(id))

// Actions
ipcMain.handle('actions:getByAnimalId', (_, animalId) => db.getActionsByAnimalId(animalId))

// Items
ipcMain.handle('items:getAll', () => db.getAllItems())
ipcMain.handle('items:getById', (_, id) => db.getItemById(id))
ipcMain.handle('items:getByType', (_, type) => db.getItemsByType(type))
ipcMain.handle('items:useItem', (_, animalId, itemId) => db.useItem(animalId, itemId))

// Inventory
ipcMain.handle('inventory:getAll', () => db.getInventory())
ipcMain.handle('inventory:getByType', (_, type) => db.getInventoryByType(type))

// History
ipcMain.handle('history:getByAnimalId', (_, animalId, limit) => db.getActionHistory(animalId, limit))
```

## 8. Feature-based Architecture

### Principe
Chaque fonctionnalité vit dans son propre dossier :
- **components/** : UI uniquement
- **hooks/** : Logique métier + TanStack Query
- **services/** : Wrappers IPC (`window.api.*`)
- **stores/** : État local Zustand (si nécessaire)
- **types/** : Types TypeScript custom
- **schemas/** : Validation Zod (si nécessaire)

### Exemple : Feature Animals

```typescript
// features/animals/services/animal-api.ts
export const animalApi = {
  getAllAnimals: () => window.api.animals.getAll(),
  getAnimalById: (id: string) => window.api.animals.getById(id),
  createAnimal: (data: CreateAnimalDto) => window.api.animals.create(data),
  feedAnimal: (id: string) => window.api.animals.feed(id),
  playWithAnimal: (id: string) => window.api.animals.play(id),
  healAnimal: (id: string) => window.api.animals.heal(id),
  sleepAnimal: (id: string) => window.api.animals.sleep(id),
}

// features/animals/hooks/use-animals.ts
export const useAnimals = () => {
  const queryClient = useQueryClient()

  const { data: animals } = useQuery({
    queryKey: ['animals'],
    queryFn: animalApi.getAllAnimals,
    refetchInterval: 10000,  // Sync avec le tick
  })

  // Écoute des événements IPC
  useEffect(() => {
    const unsubscribe = window.api.onAnimalsUpdated(() => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    })
    return unsubscribe
  }, [])

  return { animals }
}

// features/actions/stores/actions-store.ts
import { create } from 'zustand'

interface ActionsStore {
  activeActions: Map<string, ActiveAction>
  startAction: (animalId: string, type: ActionType, duration: number) => void
  completeAction: (animalId: string) => void
  getActiveAction: (animalId: string) => ActiveAction | undefined
}

export const useActionsStore = create<ActionsStore>((set, get) => ({
  activeActions: new Map(),
  startAction: (animalId, type, duration) => {
    set(state => {
      const newMap = new Map(state.activeActions)
      newMap.set(animalId, { type, startTime: Date.now(), duration })
      return { activeActions: newMap }
    })
  },
  // ...
}))
```

## 9. Notifications Desktop

Les notifications sont gérées dans le main process avec un système de cooldown.

```typescript
// src/electron/main.ts
import { Notification } from 'electron'

// Notification de mort
const sendDeathNotification = (animal: Animal, wasOffline = false) => {
  new Notification({
    title: `${animal.name} est mort...`,
    body: wasOffline
      ? `${animal.name} est décédé pendant ton absence 😢`
      : `${animal.name} n'a pas survécu... 😢`
  }).show()
}

// Notifications stats critiques (< 30%) avec cooldown 1h
const notificationCooldowns = new Map<string, number>()
const COOLDOWN = 3600000  // 1 heure

const checkCriticalStats = (result: TickResult) => {
  const { animal, criticalStats } = result

  const messages = {
    hunger: { title: `${animal.name} a faim !`, body: 'Il est temps de le nourrir 🍖' },
    happiness: { title: `${animal.name} s'ennuie !`, body: 'Joue avec lui 🎮' },
    energy: { title: `${animal.name} est fatigué !`, body: 'Laisse-le dormir 😴' },
    health: { title: `${animal.name} est malade !`, body: 'Soigne-le vite 💊' },
  }

  for (const [stat, isCritical] of Object.entries(criticalStats)) {
    if (isCritical && messages[stat]) {
      const key = `${animal.id}-${stat}`
      const lastNotif = notificationCooldowns.get(key) || 0

      if (Date.now() - lastNotif > COOLDOWN) {
        new Notification(messages[stat]).show()
        notificationCooldowns.set(key, Date.now())
      }
    }
  }
}
```

## 10. Tests

### Tests unitaires (Vitest)
- Fonctions pures dans `lib/`
- Utils de calcul de stats
- Helpers

### Tests composants (React Testing Library)
- Rendu des composants
- Interactions utilisateur
- Intégration avec hooks

### Tests d'intégration
- Flux complets (créer animal → nourrir → vérifier stats)

## 11. Principes clés

### Separation of Concerns
- **Components** : UI seulement
- **Hooks** : Logique métier
- **Services** : Communication IPC
- **Lib** : Fonctions pures

### Type Safety
- TypeScript strict
- Types Prisma auto-générés
- Validation Zod côté frontend

### Performance
- TanStack Query cache intelligent
- Tick toutes les 10s (pas chaque seconde)
- Calcul batch du temps écoulé offline

### Developer Experience
- Hot reload (Vite)
- Fast tests (Vitest)
- Type-safety complet

---

**Version** : 2.0
**Date** : 25 novembre 2025