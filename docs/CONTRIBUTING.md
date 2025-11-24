# Contributing – Tamagotchi Electron

Ce document décrit les conventions à respecter pour garantir un code maintenable, testé et cohérent.

## Architecture feature-based

Chaque fonctionnalité doit vivre dans un dossier `src/features/[feature-name]` :

```
features/
├── animals/
│   ├── components/      # UI (stateless)
│   ├── hooks/           # Logique métier + state
│   ├── services/        # Appels IPC vers Electron
│   └── types/           # Types TypeScript
├── actions/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
```

### Règles d'or

- `components/` → UI uniquement, stateless
- `hooks/` → Logique métier, side-effects, TanStack Query
- `services/` → Wrapper IPC vers main process
- `types/` → Types custom (Prisma types importés depuis `@prisma/client`)

## Conventions de code

### Langage

- TypeScript strict (`"strict": true`)
- Pas de `any` sauf cas exceptionnel documenté

### Imports

Chemins absolus avec alias : `@/features/...`, `@/shared/...`

**Ordre des imports :**
1. React et libraries externes
2. TanStack packages
3. Electron APIs (si applicable)
4. Composants internes (`@/shared`, `@/features`)
5. Types
6. Styles

```typescript
// Bon exemple
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/button'
import { useAnimals } from '@/features/animals/hooks/use-animals'
import type { Animal } from '@prisma/client'
```

### Nommage

- **Fichiers** : `kebab-case.tsx` / `kebab-case.ts`
- **Composants** : `PascalCase`
- **Hooks** : `useCamelCase`
- **Services** : `camelCase`
- **Types** : `PascalCase`
- **Constantes** : `UPPER_SNAKE_CASE`

### CSS

- Tailwind uniquement (pas de CSS inline sauf exceptions)
- Classes ordonnées : layout → spacing → sizing → colors → typography

## TanStack Router

### File-based routing

Les routes sont définies dans `src/routes/` :

```
routes/
├── __root.tsx           # Root layout
├── index.tsx            # / (liste animaux)
└── animals/
    ├── $id.tsx          # /animals/:id (détail animal)
    └── new.tsx          # /animals/new (créer animal)
```

### Conventions routes

```typescript
// Route simple
export const Route = createFileRoute('/animals/')({
  component: AnimalsPage
})

// Route avec loader (prefetch data)
export const Route = createFileRoute('/animals/$id')({
  component: AnimalDetailPage,
  loader: async ({ params }) => {
    return queryClient.ensureQueryData(animalOptions(params.id))
  }
})
```

### Navigation type-safe

```typescript
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

// Type-safe navigation
navigate({
  to: '/animals/$id',
  params: { id: animalId }
})
```

## TanStack Query

### Utiliser des hooks custom

```typescript
// features/animals/hooks/use-get-animals.ts
import { useQuery } from '@tanstack/react-query'
import { getAnimals } from '../services/animal-service'

export const useGetAnimals = () => {
  return useQuery({
    queryKey: ['animals'],
    queryFn: getAnimals
  })
}

// Dans le composant
const { data: animals, isLoading } = useGetAnimals()
```

### Conventions

- Toujours définir un `queryKey` explicite
- Invalider le cache après mutations
- Utiliser `useSuspenseQuery` pour les données critiques (optionnel)

```typescript
// Hook custom avec invalidation
export const useFeedAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: feedAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    }
  })
}
```

## Communication IPC (Electron)

### Services côté renderer

```typescript
// features/animals/services/animal-service.ts
export const getAnimals = async () => {
  return window.api.animals.getAll()
}

export const feedAnimal = async (animalId: string) => {
  return window.api.animals.feed(animalId)
}
```

### Preload types

```typescript
// electron/preload.d.ts
export interface IElectronAPI {
  animals: {
    getAll: () => Promise<Animal[]>
    feed: (id: string) => Promise<Animal>
    // ...
  }
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
```

## Prisma

### Migrations

```bash
# Créer une migration
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio
npm run prisma:studio
```

### Services côté main

```typescript
// electron/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllAnimals = async () => {
  return prisma.animal.findMany({
    include: { actions: true },
    where: { vivant: true }
  })
}

export const feedAnimal = async (animalId: string) => {
  // 1. Enregistrer l'action
  await prisma.action.create({
    data: {
      animalId,
      typeAction: 'nourrir'
    }
  })
  
  // 2. Mettre à jour les stats
  return prisma.animal.update({
    where: { id: animalId },
    data: {
      faim: { increment: 20 },
      bonheur: { increment: 5 },
      energie: { decrement: 5 },
      derniereUpdate: new Date()
    }
  })
}
```

## Validation (Zod)

Pour les formulaires de création :

```typescript
import { z } from 'zod'

const createAnimalSchema = z.object({
  nom: z.string().min(3, 'Minimum 3 caractères'),
  type: z.enum(['chat', 'chien', 'alien'])
})

type CreateAnimalDto = z.infer<typeof createAnimalSchema>
```

## Tests (TDD obligatoire)

### Stratégie

1. Écrire un test qui échoue (red)
2. Implémenter le minimum pour passer (green)
3. Refactoriser (refactor)

### Types de tests

- **Unitaires** → `lib/`, utils, fonctions pures
- **Intégration** → hooks, components
- **E2E** → Playwright (optionnel, Phase 2)

### Règles

- Tests co-localisés : `animal-card.tsx` → `animal-card.test.tsx`
- Couverture minimale : **80%**
- Mock des appels IPC avec Vitest

```typescript
// animal-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { AnimalCard } from './animal-card'

vi.mock('@/features/animals/hooks/use-feed-animal', () => ({
  useFeedAnimal: () => ({
    mutate: vi.fn()
  })
}))

describe('AnimalCard', () => {
  it('affiche le nom de l\'animal', () => {
    const animal = { id: '1', nom: 'Mochi', type: 'chat', faim: 80 }
    render(<AnimalCard animal={animal} />)
    expect(screen.getByText('Mochi')).toBeInTheDocument()
  })

  it('appelle feedAnimal au clic sur Nourrir', () => {
    const animal = { id: '1', nom: 'Mochi', type: 'chat', faim: 50 }
    render(<AnimalCard animal={animal} />)
    fireEvent.click(screen.getByText('Nourrir'))
    // Assert mutation appelée
  })
})
```

## Git workflow

### Branches

- `main` → Production (stable)
- `develop` → Intégration
- `feature/nom-feature` → Nouvelles fonctionnalités
- `fix/nom-bug` → Correctifs

### Commits (Conventional Commits)

```
feat: ajout composant AnimalCard avec stats
fix: correction calcul dégradation santé
test: ajout tests unitaires animal-service
docs: mise à jour CONTRIBUTING.md
refactor: optimisation hook useAnimalTick
```

### Commits atomiques OBLIGATOIRES

Un commit = une seule logique. Séparer :

1. Types et interfaces
2. Services
3. Hooks
4. Composants UI
5. Tests
6. Documentation

## Checklist avant PR

- [ ] TypeScript sans `any`
- [ ] Tests passent (>80% couverture)
- [ ] Pas de warnings ESLint
- [ ] Code formaté (Prettier)
- [ ] Types importés depuis `@prisma/client`
- [ ] Queries via TanStack Query
- [ ] IPC via services dans `features/*/services/`
- [ ] Responsive (desktop 1280px minimum)
- [ ] `PROGRESS_TRACKER.md` mis à jour

## Scripts npm

```bash
# Développement
npm run dev           # Lance Electron en dev mode

# Build
npm run build         # Build production
npm run package       # Package l'app (exe/dmg/deb)

# Base de données
npm run prisma:migrate  # Créer migration
npm run prisma:generate # Générer client
npm run prisma:studio   # Ouvrir Prisma Studio

# Tests
npm run test          # Lancer tous les tests
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture

# Qualité
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript
```

## Conventions UI

### Sprites/Visuels

Pour les sprites animaux, on utilise du **CSS pur** pour un design minimaliste et moderne :

```typescript
// features/animals/components/animal-sprite.tsx
export const AnimalSprite = ({ type, mood }: AnimalSpriteProps) => {
  const getMoodEmoji = () => {
    if (mood === 'happy') return '😊'
    if (mood === 'sad') return '😢'
    if (mood === 'hungry') return '😫'
    if (mood === 'sleeping') return '😴'
    return '😐'
  }

  return (
    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="absolute inset-0 flex items-center justify-center text-6xl">
        {getMoodEmoji()}
      </div>
    </div>
  )
}
```

### Barres de stats

Utiliser un composant Progress réutilisable avec code couleur :

- Vert : > 60%
- Orange : 30-60%
- Rouge : < 30%

## Performances

- Tick toutes les **10 secondes** (pas chaque seconde)
- Batch les calculs de dégradation offline
- Utiliser `React.memo()` pour les composants lourds
- Lazy load des routes avec TanStack Router

---

Avec ces règles, le projet Tamagotchi restera maintenable, type-safe, et performant.

**Version** : 1.0  
**Date** : 24 novembre 2025