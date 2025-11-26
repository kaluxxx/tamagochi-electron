# Contributing – Tamagotchi Electron

Ce document décrit les conventions à respecter pour garantir un code maintenable, testé et cohérent.

## Architecture feature-based

Chaque fonctionnalité vit dans son propre dossier :

### Backend (`src/backend/features/`)

```
features/
├── animals/
│   ├── controllers/      # Logique métier
│   └── repositories/     # Accès données Prisma
├── economy/
│   ├── controllers/
│   └── repositories/
├── fishing/
│   ├── controllers/
│   └── repositories/
├── inventory/
│   ├── controllers/
│   └── repositories/
└── minigames/
    ├── controllers/
    └── repositories/
```

### Frontend (`src/frontend/features/`)

```
features/
├── animals/
│   ├── components/       # UI (stateless)
│   ├── hooks/            # Logique métier + state
│   ├── services/         # Appels IPC
│   └── types/            # Types TypeScript
├── actions/
│   ├── components/
│   ├── hooks/
│   ├── stores/           # Zustand store
│   └── types/
├── audio/
│   ├── components/
│   ├── hooks/
│   ├── services/         # Audio manager
│   └── stores/           # Audio store (persisté)
├── economy/
│   ├── components/
│   ├── hooks/
│   └── services/
├── fishing/
│   ├── components/
│   │   ├── game-states/  # Composants par état de jeu
│   │   └── equipment/    # Composants équipement
│   ├── hooks/
│   ├── services/
│   ├── stores/           # Fishing store (QTE state)
│   ├── constants/
│   ├── utils/
│   └── types/
├── history/
│   ├── components/
│   ├── hooks/
│   └── services/
└── inventory/
    ├── components/
    ├── hooks/
    └── services/
```

### Règles d'or

- `components/` → UI uniquement, stateless
- `hooks/` → Logique métier, TanStack Query
- `services/` → Wrapper IPC vers main process
- `stores/` → État client Zustand
- `types/` → Types custom
- `controllers/` → Business logic backend
- `repositories/` → Accès données

## Conventions de code

### Langage

- TypeScript strict (`"strict": true`)
- Pas de `any` sauf cas exceptionnel documenté

### Imports

Chemins absolus avec alias : `@/features/...`, `@/shared/...`

**Ordre des imports :**
1. React et libraries externes
2. TanStack packages
3. Composants internes (`@/shared`, `@/features`)
4. Stores Zustand
5. Types
6. Styles

```typescript
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/button'
import { useAnimals } from '@/features/animals/hooks/use-animals'
import { useFishingStore } from '@/features/fishing/stores/fishing.store'
import type { Animal } from '@prisma/client'
```

### Nommage

- **Fichiers** : `kebab-case.tsx` / `kebab-case.ts`
- **Composants** : `PascalCase`
- **Hooks** : `useCamelCase`
- **Services** : `camelCase`
- **Stores** : `camelCase.store.ts`
- **Types** : `PascalCase`
- **Constantes** : `UPPER_SNAKE_CASE`

### CSS

- Tailwind uniquement (pas de CSS inline sauf exceptions)
- Classes ordonnées : layout → spacing → sizing → colors → typography

## Patterns spécifiques

### Stores Zustand

**Store simple (client-side only)** :
```typescript
// features/actions/stores/actions-store.ts
export const useActionsStore = create<ActionsStore>((set) => ({
  activeActions: new Map(),
  startAction: (animalId, type, duration) => { ... },
  completeAction: (animalId) => { ... },
}))
```

**Store persisté** :
```typescript
// features/audio/stores/audio-store.ts
export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      musicVolume: 0.5,
      sfxVolume: 0.5,
      isMusicMuted: false,
      isSfxMuted: false,
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      // ...
    }),
    { name: 'audio-settings' }
  )
)
```

**Store avec state machine (fishing)** :
```typescript
// features/fishing/stores/fishing.store.ts
export const useFishingStore = create<FishingStore>((set, get) => ({
  gameState: 'idle',
  tension: 50,
  catchProgress: 0,
  qteConfig: DEFAULT_QTE_CONFIG,

  setGameState: (state) => set({ gameState: state }),
  updateTension: (delta) => {
    const newTension = Math.max(0, Math.min(100, get().tension + delta))
    set({ tension: newTension })
  },
  // ...
}))
```

### Pattern Repository (Backend)

```typescript
// Base Repository
class BaseRepository<T, CreateInput, UpdateInput> {
  async findMany(): Promise<T[]>
  async findById(id: string): Promise<T | null>
  async create(data: CreateInput): Promise<T>
  async update(id: string, data: UpdateInput): Promise<T>
  async delete(id: string): Promise<T>
}

// Singleton Repository (Wallet, Progress)
class SingletonRepository<T, UpdateInput> {
  async get(): Promise<T>
  async getOrCreate(): Promise<T>
  async update(data: UpdateInput): Promise<T>
}
```

### Audio Manager

```typescript
// features/audio/services/audio-manager.ts
class AudioManager {
  private musicElement: HTMLAudioElement | null = null

  playMusic(track: string): void
  stopMusic(): void
  playSFX(sound: string): void
  setMusicVolume(volume: number): void
  setSFXVolume(volume: number): void
}

export const audioManager = new AudioManager()
```

## TanStack Query

### Hooks custom avec invalidation

```typescript
export const useFeedAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: feedAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    }
  })
}
```

### Query keys

```typescript
// Conventions de query keys
['animals']
['animal-types']
['wallet']
['inventory']
['shop-items']
['history', animalId]
['fishing', 'species']
['fishing', 'rods']
['fishing', 'baits']
['fishing', 'locations']
['fishing', 'upgrades']
['fishing', 'progress']
['clicker-upgrades']
```

## Communication IPC

### Services côté renderer

```typescript
// features/fishing/services/fishing-api.ts
export const fishingApi = {
  getAllSpecies: () => window.api.fishing.getAllSpecies(),
  catchFish: (speciesId, size, locationId, rodId, baitId) =>
    window.api.fishing.catchFish(speciesId, size, locationId, rodId, baitId),
  purchaseRod: (rodId) => window.api.fishing.purchaseRod(rodId),
  // ...
}
```

### Écoute d'événements IPC

```typescript
useEffect(() => {
  const unsubscribe = window.api.onWalletUpdated((wallet) => {
    queryClient.setQueryData(['wallet'], wallet)
  })
  return unsubscribe
}, [])
```

## Validation (Zod)

```typescript
// Backend validation
import { z } from 'zod'

const createAnimalSchema = z.object({
  name: z.string().min(3).max(20),
  typeId: z.string().uuid()
})

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(result.error)
  }
  return result.data
}
```

## Tests

### Stratégie TDD

1. Écrire un test qui échoue (red)
2. Implémenter le minimum pour passer (green)
3. Refactoriser (refactor)

### Types de tests

- **Unitaires** → Repositories, Controllers, utils
- **Intégration** → Hooks, components
- **E2E** → Playwright (optionnel)

### Co-location

```
fishing/
├── controllers/
│   ├── fishing.controller.ts
│   └── fishing.controller.test.ts
├── repositories/
│   ├── fish-species.repository.ts
│   └── fish-species.repository.test.ts
```

### Couverture

- Minimum : **80%**
- Mock des appels IPC avec Vitest

## Git workflow

Voir [GIT_FLOW.md](./GIT_FLOW.md) pour les détails complets.

### Branches

- `main` → Production
- `develop` → Intégration
- `feature/nom` → Nouvelles fonctionnalités
- `fix/nom` → Correctifs
- `refactor/nom` → Restructuration

### Commits atomiques OBLIGATOIRES

```bash
1. feat: ajout types fishing
2. feat: implémentation repositories fishing
3. feat: ajout controller fishing
4. feat: création hooks useFishing*
5. feat: ajout composants UI fishing
6. test: ajout tests fishing
7. docs: mise à jour PROGRESS_TRACKER
```

## Checklist avant PR

- [ ] TypeScript compile sans erreur (`npm run type-check`)
- [ ] Tests passent (`npm test`)
- [ ] Pas de warnings ESLint (`npm run lint`)
- [ ] Code formaté (Prettier)
- [ ] Queries via TanStack Query
- [ ] IPC via services dans `features/*/services/`
- [ ] Stores Zustand pour état client complexe
- [ ] `PROGRESS_TRACKER.md` mis à jour

## Scripts npm

```bash
# Développement
npm run dev           # Lance Electron en dev mode
npm run dev:vite      # Vite dev server seul
npm run dev:electron  # Electron seul

# Build
npm run build         # Build production
npm run package       # Package l'app

# Base de données
npx prisma migrate dev    # Créer migration
npx prisma generate       # Générer client
npx prisma studio         # Ouvrir Prisma Studio

# Tests
npm test              # Lancer tous les tests
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture

# Qualité
npm run lint          # ESLint
npm run type-check    # TypeScript
```

---

**Version** : 2.0
**Date** : 26 novembre 2025
