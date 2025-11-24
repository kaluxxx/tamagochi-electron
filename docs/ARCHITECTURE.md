# Architecture – Tamagotchi Electron

## 1. Organisation générale

```
src/
├── features/
│   ├── animals/
│   │   ├── components/      # AnimalCard, AnimalSprite, AnimalStats
│   │   ├── hooks/           # useAnimals, useAnimalActions, useAnimalTick
│   │   ├── services/        # animalService (Prisma queries)
│   │   └── types/           # Animal, AnimalType, AnimalStats
│   ├── actions/
│   │   ├── components/      # ActionButtons, ActionHistory
│   │   ├── hooks/           # useActions, useRecordAction
│   │   ├── services/        # actionService (Prisma queries)
│   │   └── types/           # Action, ActionType
│   └── stats/
│       ├── components/      # StatsBars, StatsGraph (optionnel)
│       └── utils/           # calculateStatDegradation
├── shared/
│   ├── components/
│   │   ├── ui/              # Button, Card, Progress (basics)
│   │   ├── layout/          # AppLayout, Header
│   │   └── feedback/        # Toast, LoadingSpinner
│   ├── hooks/               # useInterval, useOfflineTime
│   ├── lib/                 # utils, date helpers
│   └── types/               # Types globaux
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Context bridge IPC
│   └── database.ts          # Prisma client + migrations
├── prisma/
│   ├── schema.prisma        # Schéma BDD
│   └── migrations/          # Historique migrations
├── styles/
│   └── index.css            # Tailwind + CSS global
├── App.tsx
└── main.tsx
```

## 2. Stack technique

### Frontend
- **React 18** → Library UI
- **TypeScript** → Typage strict
- **TanStack Query** → State management serveur (cache, mutations)
- **TanStack Router** → Navigation type-safe
- **Tailwind CSS** → Styling
- **Lucide React** → Icônes

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
}

generator client {
  provider = "prisma-client-js"
}

model Animal {
  id        String    @id @default(uuid())
  name      String
  type      String    // "cat", "dog", "alien"
  hunger    Int       @default(100)
  happiness Int       @default(100)
  health    Int       @default(100)
  energy    Int       @default(100)
  age       Int       @default(0) // in hours
  createdAt DateTime  @default(now())
  updatedAt DateTime  @default(now())
  isAlive   Boolean   @default(true)
  actions   Action[]
}

model Action {
  id         String   @id @default(uuid())
  animalId   String
  actionType String   // "feed", "play", "heal", "sleep"
  timestamp  DateTime @default(now())
  animal     Animal   @relation(fields: [animalId], references: [id], onDelete: Cascade)
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
- Gestion du cache des animaux
- Refetch automatique
- Optimistic updates
- Invalidation après mutations

```typescript
// Hook custom
const { data: animals } = useGetAnimals()
const { mutate: feedAnimal } = useFeedAnimal()
```

### Client State (React Context)
- État UI (modal ouvert/fermé)
- Notifications
- Thème (optionnel)

## 6. Système de tick temporel

### Dégradation passive des stats

```typescript
// shared/hooks/useAnimalTick.ts
export const useAnimalTick = (animalId: string) => {
  useInterval(() => {
    // Toutes les 10 secondes
    window.api.animals.tick(animalId)
  }, 10000)
}

// electron/database.ts
export const tickAnimal = async (animalId: string) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } })

  // Calcul du temps écoulé
  const now = new Date()
  const lastUpdate = animal.updatedAt
  const hoursElapsed = (now - lastUpdate) / (1000 * 60 * 60)

  // Dégradation des stats
  const newHunger = Math.max(0, animal.hunger - hoursElapsed * 2)
  const newHappiness = Math.max(0, animal.happiness - hoursElapsed * 1.5)
  const newEnergy = Math.max(0, animal.energy - hoursElapsed * 1)

  // Si faim ou bonheur < 20, santé diminue
  const newHealth = (newHunger < 20 || newHappiness < 20)
    ? Math.max(0, animal.health - hoursElapsed * 3)
    : animal.health

  // Mort si santé = 0
  const isAlive = newHealth > 0

  return prisma.animal.update({
    where: { id: animalId },
    data: {
      hunger: newHunger,
      happiness: newHappiness,
      energy: newEnergy,
      health: newHealth,
      isAlive,
      age: animal.age + hoursElapsed,
      updatedAt: now
    }
  })
}
```

### Temps écoulé offline

Quand l'app redémarre, on calcule le temps écoulé depuis `updatedAt` et on applique la dégradation en une fois.

## 7. Communication IPC (Electron)

### Preload (Context Bridge)

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
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
  actions: {
    getByAnimalId: (animalId: string) => ipcRenderer.invoke('actions:getByAnimalId', animalId),
  }
})
```

### Main Process

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import * as animalService from './database'

ipcMain.handle('animals:getAll', async () => {
  return animalService.getAllAnimals()
})

ipcMain.handle('animals:feed', async (_, animalId: string) => {
  return animalService.feedAnimal(animalId)
})

// ... autres handlers
```

## 8. Feature-based Architecture

### Principe
Chaque fonctionnalité vit dans son propre dossier :
- **components/** : UI uniquement, stateless
- **hooks/** : Logique métier + state
- **services/** : Appels IPC vers Electron
- **types/** : Types TypeScript custom

### Exemple : Feature Animals

```typescript
// features/animals/hooks/use-feed-animal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedAnimal } from '../services/animal-service'

export const useFeedAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: feedAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    }
  })
}

// features/animals/services/animal-service.ts
export const feedAnimal = async (animalId: string) => {
  return window.api.animals.feed(animalId)
}

// features/animals/components/animal-card.tsx
export const AnimalCard = ({ animal }: { animal: Animal }) => {
  const { mutate: feed } = useFeedAnimal()
  
  return (
    <div className="card">
      <AnimalSprite type={animal.type} mood={getMood(animal)} />
      <AnimalStats stats={animal} />
      <button onClick={() => feed(animal.id)}>Nourrir</button>
    </div>
  )
}
```

## 9. Notifications Desktop

```typescript
// electron/main.ts
import { Notification } from 'electron'

export const sendNotification = (title: string, body: string) => {
  new Notification({
    title,
    body
  }).show()
}

// Appelé depuis le tick si stats < 30%
if (animal.hunger < 30) {
  sendNotification(
    `${animal.name} a faim !`,
    'Il est temps de le nourrir 🍖'
  )
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

**Version** : 1.0  
**Date** : 24 novembre 2025