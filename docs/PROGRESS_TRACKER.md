# Progress Tracker - Tamagotchi Electron

Suivi de l'avancement des user stories du projet Tamagotchi.

**Dernière mise à jour** : 25 novembre 2025

## Légende

- ✅ **Complété** : User story implémentée et testée
- 🚧 **En cours** : User story en cours de développement
- ⏳ **À faire** : User story planifiée mais non démarrée
- ❌ **Bloqué** : User story bloquée par une dépendance

## Vue d'ensemble

| Catégorie | Total | Complété | En cours | À faire |
|-----------|-------|----------|----------|---------|
| Setup & Infrastructure | 2 | 2 | 0 | 0 |
| Gestion des types d'animaux | 1 | 1 | 0 | 0 |
| Gestion des animaux | 3 | 3 | 0 | 0 |
| Actions de base | 4 | 4 | 0 | 0 |
| Système d'items | 5 | 5 | 0 | 0 |
| Système de temps | 2 | 2 | 0 | 0 |
| Notifications | 1 | 1 | 0 | 0 |
| Statistiques | 2 | 1 | 0 | 1 |
| **TOTAL** | **20** | **19** | **0** | **1** |

**Progression globale** : 95% (19/20)

---

## Setup & Infrastructure

### ✅ US0 : Configuration projet Electron + React + Prisma

**Statut** : Complété ✅
**Description** : Setup initial du projet avec toutes les dépendances et configuration de base

**Tâches** :
- [x] Initialiser projet Electron avec Vite
- [x] Installer React 18 + TypeScript
- [x] Configurer TanStack Query + TanStack Router
- [x] Installer Tailwind CSS + Lucide React
- [x] Setup Prisma avec SQLite
- [x] Configurer IPC Bridge (preload)
- [x] Setup Vitest + React Testing Library
- [x] Configurer ESLint 9 + Prettier
- [x] Structure de dossiers feature-based
- [x] CI/CD GitHub Actions

**Critères d'acceptation** :
- ✅ App Electron démarre avec écran vide
- ✅ Hot reload fonctionne (Vite)
- ✅ Tests unitaires exécutables (Vitest)
- ✅ Prisma 7 connecté à SQLite
- ✅ CI/CD en place

**Dépendances** : Aucune

**Branche** : `feature/initial-setup`
**PR** : #1

---

### ✅ US1 : Schéma de base de données Prisma (4 tables)

**Statut** : Complété ✅
**Description** : Définir et migrer le schéma Prisma avec 4 tables : `AnimalType`, `Animal`, `Action`, `Item`

**Implémentation** :
- [x] Créer `prisma/schema.prisma` avec 4 tables
- [x] Configuration Prisma 7 avec `prisma.config.ts`
- [x] Générer client Prisma
- [x] Créer service `database.ts` avec fonctions CRUD complètes
- [x] Créer seed avec 3 AnimalTypes + 9 Items

**Schéma Prisma** :
```prisma
model AnimalType {
  id, name, displayName, hungerDecayRate, happinessDecayRate,
  energyDecayRate, healthDecayRate, emoji
  animals Animal[]
}

model Animal {
  id, name, typeId, hunger, happiness, health, energy, age,
  createdAt, updatedAt, isAlive
  type AnimalType @relation
  actions Action[]
}

model Action {
  id, animalId, actionType, itemId?, timestamp
  animal Animal @relation
  item Item? @relation
}

model Item {
  id, name, type, hungerBoost, happinessBoost, healthBoost,
  energyBoost, energyCost, emoji, description
  actions Action[]
}
```

**Critères d'acceptation** :
- ✅ 4 tables créées (dépassement contrainte de 2)
- ✅ Client Prisma généré
- ✅ Fonctions CRUD pour toutes les entités
- ✅ Seed fonctionnel
- ✅ Relations One-to-Many correctes

**Dépendances** : US0

**Branche** : `feature/initial-setup`
**PR** : #1

---

## Gestion des types d'animaux

### ✅ US1 : Voir les types d'animaux disponibles

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir la liste des types d'animaux disponibles (chat, chien, alien) avec leurs caractéristiques spécifiques

**Implémentation** :
- [x] Service `getAllAnimalTypes()` dans `src/electron/database.ts`
- [x] IPC handler `animalTypes:getAll`
- [x] Affichage dans `AnimalTypeSelector` lors de la création

**Critères d'acceptation** :
- ✅ 3 types disponibles : Chat, Chien, Alien
- ✅ Chaque type affiche son emoji et nom
- ✅ Taux de dégradation spécifiques par type

---

## Gestion des animaux

### ✅ US2 : Création d'un animal

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux créer un nouvel animal avec un nom et un type

**Implémentation** :
- [x] Service `createAnimal()` dans `electron/database.ts` (déjà existant)
- [x] Hook `useCreateAnimal()` avec TanStack Query
- [x] Composant `CreateAnimalForm` avec validation Zod et TanStack Form
- [x] Composant `AnimalTypeSelector` avec cards cliquables
- [x] Page `/animals/create` avec TanStack Router
- [x] Types `CreateAnimalDto` et interfaces
- [x] Configuration shadcn/ui adaptée au design system

**Validation Zod** :
```typescript
const createAnimalSchema = z.object({
  nom: z.string().min(3, 'Minimum 3 caractères').max(20),
  type: z.enum(['chat', 'chien', 'alien'])
})
```

**Critères d'acceptation** :
- ✅ Formulaire valide le nom (3-20 caractères)
- ✅ Choix du type avec cards cliquables et sprites pixel-art
- ✅ Animal créé avec stats par défaut (100/100/100/100)
- ✅ Toast de succès avec Sonner
- ✅ Formulaire réinitialisé après création
- ✅ Messages d'erreur clairs (validation + API)

**Dépendances** : US0, US1

**Branche** : `feature/us2-creation-animal`
**PR** : À créer

---

### ✅ US3 : Liste des animaux

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir la liste de tous mes animaux (vivants et morts séparés)

**Implémentation** :
- [x] Service `getAllAnimals()` dans `electron/database.ts`
- [x] Hook `useAnimals()` avec TanStack Query
- [x] Composant `AnimalCard` pour affichage carte
- [x] Composant `AnimalList` pour liste avec séparation vivants/morts
- [x] Composant `AnimalTabs` pour navigation par onglets
- [x] Page `/` (index) avec vue jeu intégrée
- [x] Séparation vivants/morts dans les onglets

**Composants** :
- `AnimalCard` : sprite, nom, âge, badge statut (vivant/mort)
- `AnimalTabs` : onglets avec séparation vivants/morts
- `AnimalGameView` : vue de jeu principale avec actions

**Critères d'acceptation** :
- ✅ Liste des animaux vivants en premier
- ✅ Animaux morts séparés dans les onglets
- ✅ Badge statut clair (dead-badge.svg)
- ✅ Si aucun animal, redirection vers création

**Dépendances** : US2

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

### ✅ US4 : Détail d'un animal (GameView)

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir le détail complet d'un animal avec toutes ses stats

**Implémentation** :
- [x] Composant `AnimalGameView` orchestrateur
- [x] Composant `StatsPanel` (barres de progression avec icônes)
- [x] Composant `GameZone` (sprite animé, indicateurs, alertes)
- [x] Composant `ActionsPanel` (boutons d'actions)
- [x] Hook `useAnimalActions` pour gestion des actions
- [x] Store Zustand `animal-actions-store` pour état global des actions
- [x] Sprites pixel-art pour tous les moods (happy, sad, hungry, tired, sleeping, playing, dead)

**Affichage** :
- ✅ Sprite animé selon humeur (bounce animation)
- ✅ 4 barres de stats : Santé, Faim, Bonheur, Énergie
- ✅ Indicateur d'âge en jours
- ✅ Statut vivant/mort avec badge
- ✅ Boutons d'actions intégrés
- ✅ Alertes pour stats basses (< 30%)

**Critères d'acceptation** :
- ✅ Vue 3 colonnes (stats | jeu | actions)
- ✅ Sprite change selon les stats et actions
- ✅ Barres de stats avec couleurs distinctes
- ✅ Message de décès si animal mort

**Dépendances** : US3

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

## Actions & Interactions

### ✅ US5 : Nourrir un animal

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux nourrir mon animal pour augmenter sa faim

**Implémentation** :
- [x] Service `feedAnimal()` dans `electron/database.ts`
- [x] Mutation via `useAnimalActions` hook
- [x] Bouton "NOURRIR" dans `ActionsPanel`
- [x] Mise à jour stats : `faim +20`, `bonheur +5`, `energie -5`
- [x] Invalidation cache TanStack Query

**Critères d'acceptation** :
- ✅ Clic sur "Nourrir" met à jour les stats
- ✅ Stats ne dépassent pas 100
- ✅ Cache invalidé et refetch automatique
- ✅ Bouton désactivé pendant l'action

**Dépendances** : US4

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

### ✅ US6 : Jouer avec un animal

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux jouer avec mon animal pour augmenter son bonheur

**Implémentation** :
- [x] Service `playWithAnimal()` dans `electron/database.ts`
- [x] Système de jeu avec durée (20 secondes)
- [x] Sprite `playing.svg` pendant l'action
- [x] Barre de progression "JOUE! X%"
- [x] Store Zustand pour persistance entre onglets
- [x] Mise à jour stats : `bonheur +15`, `energie -10`, `faim -5`

**Critères d'acceptation** :
- ✅ Clic sur "Jouer" démarre le jeu (20s)
- ✅ Sprite change en mode "playing"
- ✅ Barre de progression visible
- ✅ Actions bloquées pendant le jeu
- ✅ État persistant entre changements d'onglets

**Dépendances** : US5

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

### ✅ US7 : Soigner un animal

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux soigner mon animal pour restaurer sa santé

**Implémentation** :
- [x] Service `healAnimal()` dans `electron/database.ts`
- [x] Mutation via `useAnimalActions` hook
- [x] Bouton "SOIGNER" dans `ActionsPanel`
- [x] Mise à jour stats : `sante +20`

**Critères d'acceptation** :
- ✅ Clic sur "Soigner" restaure la santé
- ✅ Santé ne dépasse pas 100
- ✅ Bouton désactivé pendant l'action

**Dépendances** : US5

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

### ✅ US8 : Mettre un animal au repos

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux mettre mon animal au repos pour restaurer son énergie

**Implémentation** :
- [x] Service `sleepAnimal()` dans `electron/database.ts`
- [x] Système de sommeil avec durée (30 secondes)
- [x] Sprite `sleeping.svg` pendant l'action
- [x] Sprite `tired.svg` quand énergie < 30%
- [x] Barre de progression "ZZZ... X%"
- [x] Pas d'animation bounce pendant le sommeil
- [x] Store Zustand pour persistance entre onglets
- [x] Mise à jour stats : `energie +30`, `bonheur +5`

**Critères d'acceptation** :
- ✅ Clic sur "Dormir" démarre le sommeil (30s)
- ✅ Sprite change en mode "sleeping"
- ✅ Barre de progression visible
- ✅ Actions bloquées pendant le sommeil
- ✅ État persistant entre changements d'onglets

**Dépendances** : US5

**Branche** : `feature/us3-us8-game-view`
**PR** : #4

---

## Système de temps

### ✅ US9 : Dégradation passive des stats (tick)

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux que les stats de mon animal se dégradent automatiquement avec le temps

**Implémentation** :
- [x] Service `tickAnimal()` dans `src/electron/database.ts`
- [x] Tick system dans main process (`setInterval` 10s)
- [x] Calcul dégradation selon temps écoulé et type d'animal
- [x] Logique de mort si `sante = 0`
- [x] Multiplicateur santé basé sur nombre de stats critiques (< 20)

**Logique de dégradation** (par type d'animal) :
- Chat : Faim -2.5/h, Bonheur -1.5/h, Énergie -0.8/h
- Chien : Faim -2.0/h, Bonheur -2.0/h, Énergie -1.2/h
- Alien : Faim -1.5/h, Bonheur -1.0/h, Énergie -1.5/h
- Santé : -healthDecayRate × nombre de stats < 20

**Critères d'acceptation** :
- ✅ Tick toutes les 10 secondes dans main process
- ✅ Stats diminuent progressivement selon type
- ✅ Animal meurt si santé = 0
- ✅ Toast "Ton animal est mort 😢" si décès
- ✅ Event IPC `animals:updated` pour refresh UI

**Dépendances** : US4

**Branche** : `feature/us14-us15-stat-degradation`
**PR** : #8

---

### ✅ US10 : Calcul du temps écoulé offline

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux que les stats de mon animal se dégradent même quand l'app est fermée

**Implémentation** :
- [x] Fonction `syncOfflineTime()` dans `src/electron/main.ts`
- [x] Appelé au démarrage avant création de fenêtre
- [x] Applique dégradation batch à la réouverture
- [x] Notification spéciale si animal mort pendant absence

**Critères d'acceptation** :
- ✅ Au démarrage, calcul du temps écoulé depuis `updatedAt`
- ✅ Dégradation appliquée en une fois
- ✅ Si animal mort offline, message "mort pendant ton absence"

**Dépendances** : US9

**Branche** : `feature/us14-us15-stat-degradation`
**PR** : #8

---

## Notifications

### ✅ US11 : Notifications desktop

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux recevoir des notifications quand les stats de mon animal sont critiques

**Implémentation** :
- [x] Fonction `sendDeathNotification()` dans `src/electron/main.ts`
- [x] Fonction `checkCriticalStats()` dans `src/electron/main.ts`
- [x] Déclenchement depuis tick si stats < 30%
- [x] Cooldown de 1 heure par stat par animal

**Notifications** :
- Mort : "X est mort..." / "X est décédé pendant ton absence"
- Faim < 30% : "X a faim !"
- Bonheur < 30% : "X s'ennuie !"
- Santé < 30% : "X est malade !"
- Énergie < 30% : "X est fatigué !"

**Critères d'acceptation** :
- ✅ Notifications natives Electron
- ✅ Pas de spam (max 1 notif par stat par heure via cooldown map)
- ✅ Notifications de mort immédiates

**Dépendances** : US9

**Branche** : `feature/us14-us15-stat-degradation`
**PR** : #8

---

## Statistiques

### ✅ US12 : Historique des actions

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir l'historique des actions effectuées sur mon animal

**Implémentation** :
- [x] Service `getActionHistory()` dans `src/electron/database.ts`
- [x] Hook `useHistory()` dans `src/features/history/hooks/`
- [x] Composant `HistoryPanel` dans `src/features/history/components/`
- [x] Composant `HistoryEntry` avec icônes et deltas
- [x] Affichage dans GameView (colonne gauche)
- [x] Stats before/after dans chaque action

**Critères d'acceptation** :
- ✅ Liste des 20 dernières actions
- ✅ Icône + label + timestamp relatif
- ✅ Affichage des deltas de stats (+/-) pour chaque action
- ✅ Item affiché pour actions `use_item`

**Dépendances** : US5, US6, US7, US8

---

### ⏳ US13 : Statistiques globales (optionnel)

**Statut** : À faire
**Description** : En tant qu'utilisateur, je veux voir des statistiques sur tous mes animaux

**Implémentation** :
- [ ] Composant `GlobalStats` (dashboard)
- [ ] Nombre total d'animaux créés
- [ ] Nombre d'animaux vivants vs morts
- [ ] Âge moyen des animaux vivants
- [ ] Total d'actions effectuées
- [ ] Tests

**Critères d'acceptation** :
- Page `/stats` ou section dans dashboard
- Graphiques simples (optionnel)

**Dépendances** : US3, US12

---

## Système d'Items

### ✅ US-Items-1 : Voir l'inventaire d'items

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir la liste de tous les items disponibles

**Implémentation** :
- [x] Composant `InventoryPanel` dans `src/features/inventory/components/`
- [x] Hook `useInventory()` avec TanStack Query
- [x] Service `inventoryApi` pour IPC
- [x] Affichage dans GameView (colonne droite)

**Critères d'acceptation** :
- ✅ Liste des items avec emoji, nom, quantité
- ✅ Filtre par type (food/toy/medicine/all)
- ✅ Affichage des effets de chaque item

---

### ✅ US-Items-2 : Filtrer les items par type

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux filtrer les items par catégorie

**Implémentation** :
- [x] Tabs dans `InventoryPanel` (Tout, Nourriture, Jouets, Médicaments)
- [x] Service `getInventoryByType()` dans database
- [x] IPC handler `inventory:getByType`

**Critères d'acceptation** :
- ✅ 4 filtres : all, food, toy, medicine
- ✅ Compteur d'items par catégorie

---

### ✅ US-Items-3 : Utiliser un item sur un animal

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux utiliser un item sur mon animal

**Implémentation** :
- [x] Service `useItem()` dans `src/electron/database.ts`
- [x] Transaction atomique (update animal + decrement inventory + create action)
- [x] Validation énergie suffisante
- [x] Animation d'utilisation (3s)

**Critères d'acceptation** :
- ✅ Stats de l'animal mises à jour selon item
- ✅ Quantité décrémentée dans inventaire
- ✅ Action enregistrée dans historique

---

### ✅ US-Items-4 : Vérifier le coût énergétique

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux être informé si mon animal n'a pas assez d'énergie

**Implémentation** :
- [x] Validation dans `useItem()` avant utilisation
- [x] Bouton désactivé si énergie insuffisante
- [x] Tooltip avec coût énergétique

**Critères d'acceptation** :
- ✅ Erreur claire si énergie insuffisante
- ✅ Affichage du coût énergétique sur chaque item

---

### ✅ US-Items-5 : Voir l'historique des items utilisés

**Statut** : Complété ✅
**Description** : En tant qu'utilisateur, je veux voir dans l'historique quels items ont été utilisés

**Implémentation** :
- [x] ActionType `use_item` avec `itemId` dans Action
- [x] Relation Item incluse dans query historique
- [x] Affichage item dans `HistoryEntry`

**Critères d'acceptation** :
- ✅ Actions `use_item` affichent le nom et emoji de l'item
- ✅ Deltas de stats visibles

---

## Notes de développement

### Stack technique
- **Frontend** : React 18 + TypeScript
- **Routing** : TanStack Router (file-based)
- **State** : TanStack Query + Zustand
- **UI** : Tailwind CSS + shadcn/ui + Lucide React
- **Backend** : Electron + Prisma + SQLite
- **Tests** : Vitest + React Testing Library
- **Build** : Vite + electron-builder

### Conventions
- Architecture feature-based
- Commits atomiques selon Conventional Commits
- Branches `feature/` pour chaque US
- Review obligatoire avant merge

---

## Planning suggéré (3.5 jours)

### Jour 1 (7h)
- ✅ US0 : Setup projet (2h)
- ✅ US1 : Schéma BDD (1h)
- ✅ US2 : Création animal (2h)
- ✅ US3 : Liste animaux (2h)

### Jour 2 (7h)
- ✅ US4 : Détail animal (2h)
- ✅ US5 : Nourrir (1h)
- ✅ US6 : Jouer (1h)
- ✅ US7 : Soigner (1h)
- ✅ US8 : Dormir (1h)
- ✅ US9 : Dégradation passive (1h)

### Jour 3 (7h)
- ✅ US10 : Temps offline (2h)
- ✅ US11 : Notifications (2h)
- ✅ US12 : Historique actions (2h)
- ✅ Polish + bugfixes (1h)

### Jour 4 (3.5h)
- ✅ Tests finaux (1h)
- ✅ Documentation (1h)
- ✅ US13 : Stats globales (optionnel) (1.5h)

---

## Prochaine étape

🎯 **US13 : Statistiques globales** - Dashboard avec statistiques (optionnel)

---

## Historique des complétions

### 25 novembre 2025 (suite)
- ✅ **US9** : Dégradation passive des stats avec tick system backend (PR #8)
- ✅ **US10** : Calcul du temps écoulé offline avec syncOfflineTime (PR #8)
- ✅ **US11** : Notifications desktop avec cooldown 1h (PR #8)
- ✅ **US12** : Historique des actions avec stats before/after
- ✅ **US-Items-1 à 5** : Système d'items complet avec inventaire

### 25 novembre 2025
- ✅ **US3** : Liste des animaux avec onglets et séparation vivants/morts (PR #4)
- ✅ **US4** : GameView avec vue 3 colonnes, sprites animés, barres de stats (PR #4)
- ✅ **US5** : Action nourrir avec mutation TanStack Query (PR #4)
- ✅ **US6** : Action jouer avec système de durée 20s et sprite dédié (PR #4)
- ✅ **US7** : Action soigner avec mutation TanStack Query (PR #4)
- ✅ **US8** : Action dormir avec système de durée 30s et sprite dédié (PR #4)

### 24 novembre 2025
- ✅ **US0** : Configuration projet Electron + React + Prisma (PR #1)
- ✅ **US1** : Schéma de base de données Prisma avec 5 tables (PR #1)
- ✅ **US2** : Création d'un animal avec formulaire et validation (PR #3)

**Version** : 2.0
**Date** : 25 novembre 2025