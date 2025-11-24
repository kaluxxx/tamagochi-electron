# Git Flow – CopróVision

Ce document définit le workflow Git adopté pour le projet **CopróVision** afin de garantir une gestion claire des branches, une intégration continue fluide et une qualité de code élevée.

---

## 1. Branches principales

- **`main`**
    - Branche stable et déployable à tout moment.
    - Contient uniquement du code **testé et validé**.
    - Chaque commit sur `main` doit être lié à une release.

- **`develop`**
    - Branche d'intégration.
    - Contient les features validées mais pas encore taguées en release.
    - Sert de base pour créer des branches de fonctionnalités.

---

## 2. Branches secondaires

- **Feature branches** (`feature/[feature-name]`)
    - Créées à partir de `develop`.
    - Exemple : `feature/property-form`, `feature/incident-wizard`.
    - Fusionnées dans `develop` via **Pull Request** (PR).
    - Règles :
        - Tests unitaires obligatoires.
        - Code review obligatoire.

- **Hotfix branches** (`hotfix/[issue-name]`)
    - Créées à partir de `main`.
    - Corrigent rapidement un bug critique en production.
    - Fusionnées dans `main` **et** `develop`.

- **Release branches** (`release/x.y.z`)
    - Créées depuis `develop`.
    - Permettent stabilisation avant mise en production.
    - Incluent corrections mineures, mise à jour `CHANGELOG.md`, version bump.
    - Fusionnées dans `main` et `develop`.

---

## 3. Cycle de développement

1. Créer une **feature branch** depuis `develop`.
2. Implémenter la fonctionnalité avec **TDD**.
3. Committer régulièrement avec des messages clairs (`feat:`, `fix:`, `test:`, etc.).
4. Ouvrir une **Pull Request vers `develop`**.
5. Passer la CI/CD :
    - ✅ Tests unitaires & intégration (Vitest, React Testing Library).
    - ✅ Linter & formatage (ESLint, Prettier).
    - ✅ Type checking (TypeScript).
6. Code review → squash & merge.
7. Quand `develop` est stable → créer `release/x.y.z`.
8. Tests finaux → merge dans `main`.
9. Tag de release + déploiement.

---

## 4. Politique de commits

- Utiliser **Conventional Commits** :
    - `feat: ajout formulaire création copropriété`
    - `fix: correction affichage date expiration contrat`
    - `test: ajout test unitaire pour property-service`
    - `docs: mise à jour ARCHITECTURE.MD`
    - `refactor: optimisation hook useProperties`

- **OBLIGATOIRE : Messages de commit en français**
    - Les messages de commit doivent être rédigés en français
    - Exception : les termes techniques du langage omniprésent (properties, contracts, reports, incidents) restent en anglais
    - Le code (noms de variables, fonctions, composants) reste en anglais selon les conventions
    - Exemple : `feat: ajout composant PropertyCard pour affichage copropriétés`

- **OBLIGATOIRE : Commits atomiques**
    - Un commit = une seule logique/fonctionnalité
    - Séparer types, services, composants, tests en commits distincts
    - Exemple pour une feature :
        1. `feat: ajout types et interfaces pour properties`
        2. `feat: implémentation service properties avec intégration API`
        3. `feat: ajout hook personnalisé useProperties`
        4. `feat: création composants PropertyCard et PropertyForm`
        5. `feat: intégration properties dans dashboard et routes`
        6. `test: ajout tests complets pour fonctionnalité properties`
        7. `perf: optimisation liste properties avec virtualisation`
        8. `docs: mise à jour PROGRESS_TRACKER pour feature properties`

---

## 5. Versioning & Releases

- Suivre **Semantic Versioning (SemVer)** :
    - `MAJOR.MINOR.PATCH`
    - Exemple : `1.2.3`
    - `MAJOR` → changement incompatible.
    - `MINOR` → nouvelle feature rétro-compatible.
    - `PATCH` → bugfix.

- Chaque release est :
    - Taguée (`git tag v1.2.3`).
    - Documentée dans `CHANGELOG.md`.
    - Déployée sur l'environnement de production.

---

## 6. Règles de merge

- Interdiction de **push direct** sur `main` ou `develop`.
- Merge uniquement via **Pull Request**.
- PR doit contenir :
    - Description claire du changement.
    - Liens vers issues/tickets.
    - Screenshots si UI modifiée.
    - Tests unitaires et d'intégration passants.

---

## 7. Exemple de cycle complet

1. Créer `feature/property-management` depuis `develop`.
2. Développer avec TDD + commits conventionnels atomiques.
3. PR → review + merge dans `develop`.
4. Quand plusieurs features sont stables → `release/1.1.0`.
5. Vérif QA → merge dans `main` + tag `v1.1.0`.
6. Déploiement sur environnement de production.

---

**Version :** 1.0
**Date :** 2 Octobre 2025
