# Git Flow – Tamagotchi Electron

Ce document définit le workflow Git adopté pour le projet **Tamagotchi Electron**.

---

## 1. Branches principales

### `main`
- Branche stable et déployable à tout moment
- Contient uniquement du code **testé et validé**
- Chaque commit sur `main` correspond à une version release

### `develop`
- Branche d'intégration
- Contient les features validées en attente de release
- Base pour créer les branches de fonctionnalités

---

## 2. Branches de travail

### Feature branches (`feature/[nom]`)
- Créées à partir de `develop`
- Pour nouvelles fonctionnalités
- Exemples :
  - `feature/fishing-minigame`
  - `feature/economy-system`
  - `feature/audio-controls`

### Fix branches (`fix/[nom]`)
- Créées à partir de `develop`
- Pour corrections de bugs non-urgents
- Exemples :
  - `fix/stat-degradation`
  - `fix/wallet-sync`

### Refactor branches (`refactor/[nom]`)
- Créées à partir de `develop`
- Pour restructuration de code
- Exemples :
  - `refactor/split-components`
  - `refactor/fishing-architecture`

### Hotfix branches (`hotfix/[nom]`)
- Créées à partir de `main`
- Pour corrections urgentes en production
- Fusionnées dans `main` ET `develop`

---

## 3. Cycle de développement

```
1. Créer branche feature/fix/refactor depuis develop
         │
         ▼
2. Développer avec commits atomiques
         │
         ▼
3. Ouvrir Pull Request vers develop
         │
         ▼
4. CI/CD : Tests, Lint, TypeScript
         │
         ▼
5. Code review → Squash & merge
         │
         ▼
6. Quand develop stable → merge dans main
         │
         ▼
7. Tag de release (vX.Y.Z)
```

---

## 4. Politique de commits

### Conventional Commits

Format : `type: description`

```
feat: ajout mini-jeu de pêche
fix: correction calcul dégradation santé
refactor: séparation composants fishing
test: ajout tests unitaires economy
docs: mise à jour ARCHITECTURE.md
style: formatage code fishing-game
perf: optimisation requêtes Prisma
```

### Types disponibles

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Restructuration sans changement fonctionnel |
| `test` | Ajout ou modification de tests |
| `docs` | Documentation |
| `style` | Formatage, sans changement de code |
| `perf` | Amélioration de performance |
| `chore` | Maintenance (dépendances, config) |

### Langue

- **Messages de commit en français**
- Code (variables, fonctions, composants) en anglais
- Termes techniques en anglais acceptés

### Exemples

```bash
feat: ajout système d'économie avec wallet
fix: correction affichage stats négatives
refactor: extraction hook useFishingGame
test: ajout tests fishing controller
docs: mise à jour SPEC.md avec user stories pêche
```

---

## 5. Commits atomiques

**Obligatoire** : Un commit = une seule logique

### Ordre recommandé pour une feature

```bash
1. feat: ajout types et interfaces fishing
2. feat: implémentation repositories fishing
3. feat: ajout controller fishing
4. feat: création hooks useFishing*
5. feat: ajout composants UI fishing
6. feat: intégration page /minigames/fishing
7. test: ajout tests fishing
8. docs: mise à jour PROGRESS_TRACKER
```

### Avantages

- Historique clair et lisible
- Revert facile si problème
- Code review plus efficace
- Bisect possible pour trouver bugs

---

## 6. Versioning

### Semantic Versioning (SemVer)

Format : `MAJOR.MINOR.PATCH`

- **MAJOR** : Changement incompatible (breaking change)
- **MINOR** : Nouvelle feature rétro-compatible
- **PATCH** : Bugfix rétro-compatible

### Exemples

```
v1.0.0 → Release initiale
v1.1.0 → Ajout système économie
v1.2.0 → Ajout mini-jeu clicker
v1.3.0 → Ajout mini-jeu pêche
v1.3.1 → Fix bug capture poisson
v2.0.0 → Refonte architecture (breaking)
```

---

## 7. Règles de merge

### Interdictions

- ❌ Push direct sur `main`
- ❌ Push direct sur `develop`
- ❌ Force push sur branches partagées

### Pull Request obligatoire

Chaque PR doit contenir :
- Description claire du changement
- Lien vers issue/ticket si applicable
- Screenshots si UI modifiée
- Tests passants

### Checklist PR

- [ ] TypeScript compile sans erreur
- [ ] Tests passent
- [ ] ESLint sans warning
- [ ] Code formaté (Prettier)
- [ ] Documentation mise à jour si nécessaire
- [ ] PROGRESS_TRACKER.md mis à jour

---

## 8. Workflow complet (exemple)

### Nouvelle feature : Système de quêtes

```bash
# 1. Partir de develop à jour
git checkout develop
git pull origin develop

# 2. Créer la branche feature
git checkout -b feature/quest-system

# 3. Développer avec commits atomiques
git add src/backend/features/quests/types/
git commit -m "feat: ajout types et interfaces quests"

git add src/backend/features/quests/repositories/
git commit -m "feat: implémentation QuestRepository"

git add src/backend/features/quests/controllers/
git commit -m "feat: ajout QuestController"

# ... etc

# 4. Push et créer PR
git push -u origin feature/quest-system
# → Ouvrir PR sur GitHub vers develop

# 5. Après review et CI verte
# → Squash & merge dans develop

# 6. Quand develop stable
git checkout main
git merge develop
git tag v1.4.0
git push origin main --tags
```

---

## 9. Gestion des conflits

### Prévention

- Rebase fréquent sur develop
- Petites branches, merges rapides
- Communication avec l'équipe

### Résolution

```bash
# Mettre à jour develop local
git checkout develop
git pull origin develop

# Rebase la feature branch
git checkout feature/ma-feature
git rebase develop

# Résoudre conflits si nécessaire
# ... éditer fichiers ...
git add .
git rebase --continue

# Force push (branche personnelle uniquement)
git push --force-with-lease
```

---

## 10. Outils recommandés

- **GitHub CLI** (`gh`) pour PRs et issues
- **Commitizen** pour commits conventionnels
- **Husky** pour hooks pre-commit
- **lint-staged** pour linter les fichiers stagés

---

**Version** : 1.0
**Date** : 26 novembre 2025
**Projet** : Tamagotchi Electron
