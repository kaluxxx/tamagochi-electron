# Tamagotchi Electron

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Licence](https://img.shields.io/badge/licence-MIT-green)
![Electron](https://img.shields.io/badge/Electron-39-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)

Application desktop de gestion d'animaux virtuels type Tamagotchi, construite avec Electron, React et Prisma.

## A propos

Prenez soin de vos creatures virtuelles (chat, chien, alien) dont les stats se degradent avec le temps. Nourrissez-les, jouez avec eux, soignez-les et gagnez des coins pour acheter des items ou jouer a des mini-jeux.

## Fonctionnalites

### Gestion d'animaux virtuels
- Creation d'animaux avec caracteristiques uniques par type
- Systeme de stats (faim, bonheur, energie, sante) avec degradation temporelle
- Actions : nourrir, jouer, soigner, dormir
- Gestion du temps offline
- Notifications desktop pour stats critiques

### Systeme d'economie
- Portefeuille de coins avec generation passive
- Recompenses pour les actions
- Boutique d'items (nourriture, jouets, medicaments)
- Inventaire persistant

### Mini-jeux
- **Clicker** : Gagnez des coins en cliquant, achetez des upgrades
- **Peche** : Attrapez des poissons avec un systeme QTE, debloquez des lieux et equipements

### Audio
- Musique de fond contextuelle
- Effets sonores

## Use Cases

1. **Creer un animal** : Choisir un nom et un type, l'animal demarre avec 100% de stats
2. **Prendre soin** : Effectuer des actions pour maintenir les stats et gagner des coins
3. **Acheter des items** : Utiliser les coins en boutique, stocker dans l'inventaire
4. **Jouer aux mini-jeux** : Gagner des coins supplementaires

> Details complets : [docs/SPEC.md](docs/SPEC.md)

## Stack technique

| Categorie | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, TanStack Query/Router, Zustand, Tailwind CSS |
| **Backend** | Electron, Prisma, SQLite |
| **Build** | Vite, electron-builder |
| **Tests** | Vitest, React Testing Library |

## Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

## Developpement

```bash
npm run dev          # Lancer l'app
npm test             # Tests
npm run lint         # Linting
npm run type-check   # Verification TypeScript
```

## Build

```bash
npm run build        # Build de production
npm run package      # Packaging Electron
```

## Base de donnees

Schema complet (14 tables) : [docs/database-schema.mmd](docs/database-schema.mmd)

## Architecture

```
UI (React) --> IPC Bridge (Preload) --> Main Process (Electron + Prisma) --> SQLite
```

> Details : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Specifications](docs/SPEC.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Schema BDD](docs/database-schema.mmd)

## Licence

MIT
