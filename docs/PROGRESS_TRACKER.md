# Progress Tracker - Tamagotchi Electron

Suivi de l'avancement des user stories du projet Tamagotchi.

**Dernière mise à jour** : 24 novembre 2025

## Légende

- ✅ **Complété** : User story implémentée et testée
- 🚧 **En cours** : User story en cours de développement
- ⏳ **À faire** : User story planifiée mais non démarrée
- ❌ **Bloqué** : User story bloquée par une dépendance

## Vue d'ensemble

| Catégorie | Total | Complété | En cours | À faire |
|-----------|-------|----------|----------|---------|
| Setup & Infrastructure | 2 | 0 | 0 | 2 |
| Gestion des animaux | 3 | 0 | 0 | 3 |
| Actions & Interactions | 4 | 0 | 0 | 4 |
| Système de temps | 2 | 0 | 0 | 2 |
| Notifications | 1 | 0 | 0 | 1 |
| Statistiques | 2 | 0 | 0 | 2 |
| **TOTAL** | **14** | **0** | **0** | **14** |

**Progression globale** : 0% (0/14)

---

## Setup & Infrastructure

### ⏳ US0 : Configuration projet Electron + React + Prisma

**Statut** : À faire  
**Description** : Setup initial du projet avec toutes les dépendances et configuration de base

**Tâches** :
- [ ] Initialiser projet Electron avec Vite
- [ ] Installer React 18 + TypeScript
- [ ] Configurer TanStack Query + TanStack Router
- [ ] Installer Tailwind CSS + Lucide React
- [ ] Setup Prisma avec SQLite
- [ ] Configurer IPC Bridge (preload)
- [ ] Setup Vitest + React Testing Library
- [ ] Configurer ESLint + Prettier
- [ ] Structure de dossiers feature-based

**Critères d'acceptation** :
- App Electron démarre avec écran vide
- Hot reload fonctionne
- Tests unitaires exécutables
- Prisma connecté à SQLite

**Dépendances** : Aucune

---

### ⏳ US1 : Schéma de base de données Prisma

**Statut** : À faire  
**Description** : Définir et migrer le schéma Prisma pour les tables `Animal` et `Action`

**Implémentation** :
- [ ] Créer `prisma/schema.prisma` avec tables Animal + Action
- [ ] Générer migration initiale
- [ ] Générer client Prisma
- [ ] Créer service `database.ts` avec fonctions CRUD basiques
- [ ] Tests unitaires des fonctions CRUD

**Schéma Prisma** :
```prisma
model Animal {
  id             String    @id @default(uuid())
  nom            String
  type           String
  faim           Int       @default(100)
  bonheur        Int       @default(100)
  sante          Int       @default(100)
  energie        Int       @default(100)
  age            Int       @default(0)
  dateCreation   DateTime  @default(now())
  derniereUpdate DateTime  @default(now())
  vivant         Boolean   @default(true)
  actions        Action[]
}

model Action {
  id         String   @id @default(uuid())
  animalId   String
  typeAction String
  timestamp  DateTime @default(now())
  animal     Animal   @relation(fields: [animalId], references: [id], onDelete: Cascade)
}
```

**Critères d'acceptation** :
- Migration appliquée avec succès
- Client Prisma généré
- Fonctions CRUD testées (>80% couverture)

**Dépendances** : US0

---

## Gestion des animaux

### ⏳ US2 : Création d'un animal

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux créer un nouvel animal avec un nom et un type

**Implémentation** :
- [ ] Service `createAnimal()` dans `electron/database.ts`
- [ ] Hook `useCreateAnimal()` avec TanStack Query
- [ ] Composant `AnimalForm` avec validation Zod
- [ ] Page `/animals/new` avec TanStack Router
- [ ] Types `CreateAnimalDto`
- [ ] Tests unitaires (service + hook + composant)

**Validation Zod** :
```typescript
const createAnimalSchema = z.object({
  nom: z.string().min(3, 'Minimum 3 caractères').max(20),
  type: z.enum(['chat', 'chien', 'alien'])
})
```

**Critères d'acceptation** :
- Formulaire valide le nom (3-20 caractères)
- Choix du type (chat/chien/alien)
- Animal créé avec stats par défaut (100/100/100/100)
- Redirection vers liste après création
- Toast de succès
- >80% couverture tests

**Dépendances** : US0, US1

---

### ⏳ US3 : Liste des animaux

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux voir la liste de tous mes animaux (vivants et morts séparés)

**Implémentation** :
- [ ] Service `getAllAnimals()` dans `electron/database.ts`
- [ ] Hook `useGetAnimals()` avec TanStack Query
- [ ] Composant `AnimalCard` pour affichage carte
- [ ] Composant `AnimalList` pour liste avec séparation vivants/morts
- [ ] Page `/` (index) affichant la liste
- [ ] Filtre vivants/morts
- [ ] Tests (service + hook + composants)

**Composants** :
- `AnimalCard` : photo, nom, âge, icône statut (vivant/mort)
- `AnimalList` : 2 sections (Vivants / Cimetière)

**Critères d'acceptation** :
- Liste des animaux vivants en haut
- Cimetière en bas (animaux morts)
- Badge statut clair
- Si aucun animal, message d'incitation "Créer ton premier animal"
- >80% couverture tests

**Dépendances** : US2

---

### ⏳ US4 : Détail d'un animal

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux voir le détail complet d'un animal avec toutes ses stats

**Implémentation** :
- [ ] Service `getAnimalById()` dans `electron/database.ts`
- [ ] Hook `useGetAnimalById()` avec TanStack Query
- [ ] Composant `AnimalSprite` (représentation visuelle CSS)
- [ ] Composant `AnimalStats` (barres de progression)
- [ ] Composant `AnimalDetail` (page complète)
- [ ] Page `/animals/$id` avec TanStack Router
- [ ] Tests (service + hook + composants)

**Affichage** :
- Sprite animé selon humeur (emoji ou CSS)
- 4 barres de stats : Faim, Bonheur, Santé, Énergie
- Indicateur d'âge (en heures ou jours)
- Statut vivant/mort
- Boutons d'actions

**Critères d'acceptation** :
- Route dynamique `/animals/:id` fonctionne
- Loader prefetch data
- Sprite change selon les stats
- Barres de stats avec code couleur (vert/orange/rouge)
- >80% couverture tests

**Dépendances** : US3

---

## Actions & Interactions

### ⏳ US5 : Nourrir un animal

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux nourrir mon animal pour augmenter sa faim

**Implémentation** :
- [ ] Service `feedAnimal()` dans `electron/database.ts`
- [ ] Hook `useFeedAnimal()` avec mutation TanStack Query
- [ ] Bouton "Nourrir" dans `AnimalDetail`
- [ ] Enregistrement action dans table `Action`
- [ ] Mise à jour stats : `faim +20`, `bonheur +5`, `energie -5`
- [ ] Invalidation cache TanStack Query
- [ ] Toast de feedback
- [ ] Tests (service + hook)

**Critères d'acceptation** :
- Clic sur "Nourrir" met à jour les stats
- Action enregistrée en BDD
- Stats ne dépassent pas 100
- Toast "Animal nourri !"
- Cache invalidé et refetch automatique
- >80% couverture tests

**Dépendances** : US4

---

### ⏳ US6 : Jouer avec un animal

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux jouer avec mon animal pour augmenter son bonheur

**Implémentation** :
- [ ] Service `playWithAnimal()` dans `electron/database.ts`
- [ ] Hook `usePlayWithAnimal()` avec mutation
- [ ] Bouton "Jouer" dans `AnimalDetail`
- [ ] Mise à jour stats : `bonheur +15`, `energie -10`, `faim -5`
- [ ] Tests

**Critères d'acceptation** :
- Clic sur "Jouer" met à jour les stats
- Énergie ne peut pas être < 0 (désactiver bouton si energie < 10)
- Toast "Animal content !"
- >80% couverture tests

**Dépendances** : US5

---

### ⏳ US7 : Soigner un animal

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux soigner mon animal pour restaurer sa santé

**Implémentation** :
- [ ] Service `healAnimal()` dans `electron/database.ts`
- [ ] Hook `useHealAnimal()` avec mutation
- [ ] Bouton "Soigner" dans `AnimalDetail`
- [ ] Mise à jour stats : `sante +20`
- [ ] Tests

**Critères d'acceptation** :
- Clic sur "Soigner" restaure la santé
- Santé ne dépasse pas 100
- Toast "Animal soigné !"
- >80% couverture tests

**Dépendances** : US5

---

### ⏳ US8 : Mettre un animal au repos

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux mettre mon animal au repos pour restaurer son énergie

**Implémentation** :
- [ ] Service `sleepAnimal()` dans `electron/database.ts`
- [ ] Hook `useSleepAnimal()` avec mutation
- [ ] Bouton "Dormir" dans `AnimalDetail`
- [ ] Mise à jour stats : `energie +30`, `bonheur +5`
- [ ] Tests

**Critères d'acceptation** :
- Clic sur "Dormir" restaure l'énergie
- Toast "Animal reposé !"
- >80% couverture tests

**Dépendances** : US5

---

## Système de temps

### ⏳ US9 : Dégradation passive des stats (tick)

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux que les stats de mon animal se dégradent automatiquement avec le temps

**Implémentation** :
- [ ] Service `tickAnimal()` dans `electron/database.ts`
- [ ] Hook `useAnimalTick()` avec `useInterval()` (10s)
- [ ] Calcul dégradation selon temps écoulé
- [ ] Logique de mort si `sante = 0`
- [ ] Tests (service + hook)

**Logique de dégradation** :
- Toutes les heures :
    - Faim : -2
    - Bonheur : -1.5
    - Énergie : -1
    - Santé : -3 si faim < 20 ou bonheur < 20

**Critères d'acceptation** :
- Tick toutes les 10 secondes quand app ouverte
- Stats diminuent progressivement
- Animal meurt si santé = 0
- Toast "Ton animal est mort 😢" si décès
- >80% couverture tests

**Dépendances** : US4

---

### ⏳ US10 : Calcul du temps écoulé offline

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux que les stats de mon animal se dégradent même quand l'app est fermée

**Implémentation** :
- [ ] Hook `useOfflineTime()` pour calculer temps écoulé au démarrage
- [ ] Appliquer dégradation batch à la réouverture
- [ ] Toast d'information si animal mort pendant fermeture
- [ ] Tests

**Critères d'acceptation** :
- Au démarrage, calcul du temps écoulé depuis `derniereUpdate`
- Dégradation appliquée en une fois
- Si animal mort offline, affichage message
- >80% couverture tests

**Dépendances** : US9

---

## Notifications

### ⏳ US11 : Notifications desktop

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux recevoir des notifications quand les stats de mon animal sont critiques

**Implémentation** :
- [ ] Service `sendNotification()` dans `electron/main.ts`
- [ ] Déclenchement depuis `tickAnimal()` si stats < 30%
- [ ] Notification critique si stats < 10%
- [ ] Tests

**Notifications** :
- Faim < 30% : "Ton animal a faim !"
- Bonheur < 30% : "Ton animal s'ennuie !"
- Santé < 30% : "Ton animal est malade !"
- Énergie < 30% : "Ton animal est fatigué !"

**Critères d'acceptation** :
- Notifications natives Electron
- Pas de spam (max 1 notif par stat par heure)
- Clic sur notif ouvre l'app sur l'animal concerné
- >80% couverture tests

**Dépendances** : US9

---

## Statistiques

### ⏳ US12 : Historique des actions

**Statut** : À faire  
**Description** : En tant qu'utilisateur, je veux voir l'historique des actions effectuées sur mon animal

**Implémentation** :
- [ ] Service `getActionsByAnimalId()` dans `electron/database.ts`
- [ ] Hook `useGetActionsByAnimalId()` avec TanStack Query
- [ ] Composant `ActionHistory` (liste avec icônes)
- [ ] Affichage dans page détail animal
- [ ] Tests

**Critères d'acceptation** :
- Liste des 20 dernières actions
- Icône + label + timestamp
- Regroupement par jour (optionnel)
- >80% couverture tests

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
- >80% couverture tests

**Dépendances** : US3, US12

---

## Notes de développement

### Approche TDD
- Tous les composants sont développés en TDD (Test-Driven Development)
- Tests écrits avant l'implémentation
- Couverture de code : objectif >80% global

### Stack technique
- **Frontend** : React 18 + TypeScript
- **Routing** : TanStack Router (file-based)
- **State** : TanStack Query + Context API
- **UI** : Tailwind CSS + Lucide React
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

🎯 **US0 : Configuration projet Electron + React + Prisma**

---

**Historique des complétions** : Aucune pour le moment

**Version** : 1.0  
**Date** : 24 novembre 2025