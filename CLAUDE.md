# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tamagotchi Electron - Application desktop de gestion d'animaux virtuels type Tamagotchi. Les utilisateurs créent et prennent soin de créatures (chat, chien, alien) dont les stats se dégradent avec le temps.

**Stack:** React 18, TypeScript, Electron, Prisma, SQLite, TanStack Query/Router, Tailwind CSS, Vite

## Development Commands

```bash
# Setup
npm install
npx prisma generate
npx prisma migrate dev

# Development
npm run dev                    # Start Electron app
npm run dev:vite              # Vite dev server only
npm run dev:electron          # Electron main process only

# Database
npx prisma studio             # Open database GUI
npx prisma migrate dev --name <name>  # Create migration

# Testing
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage

# Build
npm run build                 # Production build
npm run package               # Package with electron-builder
npm run lint                  # ESLint
npm run type-check            # TypeScript check
```

## Documentation

**Before working on any task, read the relevant documentation file:**

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture détaillée, structure du code, flux de données, système IPC, feature-based organization
- **[docs/SPEC.md](docs/SPEC.md)** - Spécifications fonctionnelles, user stories, règles métier, système de stats et temps, modèle de données
- **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - Design system, palette de couleurs, typographie, sprites pixel-art, composants UI, animations
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guidelines de contribution (si applicable)
- **[docs/PROGRESS_TRACKER.md](docs/PROGRESS_TRACKER.md)** - Suivi de progression du projet

**Important:** Always read the architecture file before making structural changes, the spec file before implementing game mechanics, and the design system before creating UI components.

## Key Architectural Points

- **Feature-based structure:** `src/features/{animals,actions,stats}` with components/hooks/services/types per feature
- **Layered architecture:** Components → Hooks → Services → IPC → Electron Main → Prisma → SQLite
- **IPC via Context Bridge:** Use `window.api.*` methods (defined in `electron/preload.ts`)
- **Time system:** Tick every 10s, calculate elapsed time from `updatedAt`, handle offline time in batch
- **Stats degradation:** Hunger -2/h, Happiness -1.5/h, Energy -1/h, Health -3/h (only if hunger or happiness < 20)
- **Type safety:** Strict TypeScript, Prisma-generated types, no `any`

## Database Schema

**4 tables pour gestion complète:**

```prisma
model AnimalType {
  id, name, displayName, hungerDecayRate, happinessDecayRate, energyDecayRate, healthDecayRate, emoji
  animals Animal[]
}

model Animal {
  id, name, typeId, hunger, happiness, health, energy, age, createdAt, updatedAt, isAlive
  type AnimalType @relation
  actions Action[]
}

model Action {
  id, animalId, actionType, itemId?, timestamp
  animal Animal @relation
  item Item? @relation
}

model Item {
  id, name, type, hungerBoost, happinessBoost, healthBoost, energyBoost, energyCost, emoji, description
  actions Action[]
}
```