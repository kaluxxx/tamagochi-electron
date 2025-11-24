# Spécifications fonctionnelles – Tamagotchi Electron

## Objectif

Créer une application desktop (Electron) de gestion d'animaux virtuels type Tamagotchi, où l'utilisateur doit prendre soin de créatures qui évoluent et se dégradent avec le temps.

## Public cible

- Étudiants en développement web
- Développeurs débutants Electron
- Personnes cherchant un projet pédagogique avec gestion d'état et base de données

## Contrainte projet

**Durée** : 3.5 jours  
**Contrainte académique** : Au moins 2 entités en base de données (`Animal` + `Action`)

---

## User stories - MVP

### Gestion des animaux

**US2 : Création d'un animal**  
En tant qu'utilisateur, je veux créer un nouvel animal avec un nom et un type (chat/chien/alien)

**US3 : Liste des animaux**  
En tant qu'utilisateur, je veux voir la liste de tous mes animaux (vivants et morts séparés)

**US4 : Détail d'un animal**  
En tant qu'utilisateur, je veux voir le détail complet d'un animal avec toutes ses stats en temps réel

### Actions & Interactions

**US5 : Nourrir un animal**  
En tant qu'utilisateur, je veux nourrir mon animal pour augmenter sa faim

**US6 : Jouer avec un animal**  
En tant qu'utilisateur, je veux jouer avec mon animal pour augmenter son bonheur

**US7 : Soigner un animal**  
En tant qu'utilisateur, je veux soigner mon animal pour restaurer sa santé

**US8 : Mettre un animal au repos**  
En tant qu'utilisateur, je veux mettre mon animal au repos pour restaurer son énergie

### Système de temps

**US9 : Dégradation passive des stats**  
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent automatiquement avec le temps

**US10 : Calcul du temps écoulé offline**  
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent même quand l'app est fermée

### Notifications

**US11 : Notifications desktop**  
En tant qu'utilisateur, je veux recevoir des notifications quand les stats de mon animal sont critiques (< 30%)

### Statistiques

**US12 : Historique des actions**  
En tant qu'utilisateur, je veux voir l'historique des actions effectuées sur mon animal

**US13 : Statistiques globales** (optionnel)  
En tant qu'utilisateur, je veux voir des statistiques sur tous mes animaux (total créés, vivants/morts, actions effectuées)

---

## Workflows principaux

### 1. Création d'un premier animal

1. L'utilisateur lance l'application
2. Voit un écran vide avec message "Créer ton premier animal"
3. Clique sur "Créer un animal"
4. Remplit le formulaire :
    - Nom (3-20 caractères)
    - Type (chat/chien/alien)
5. Valide → l'animal est créé avec stats par défaut (100/100/100/100)
6. Redirection vers la liste des animaux
7. L'animal apparaît dans la liste avec un sprite/emoji

### 2. Prendre soin d'un animal

1. L'utilisateur clique sur un animal dans la liste
2. Accède au détail avec :
    - Sprite animé selon humeur
    - 4 barres de stats (Faim/Bonheur/Santé/Énergie)
    - Âge de l'animal
    - Statut vivant/mort
3. Voit 4 boutons d'actions :
    - **Nourrir** : +20 faim, +5 bonheur, -5 énergie
    - **Jouer** : +15 bonheur, -10 énergie, -5 faim
    - **Soigner** : +20 santé
    - **Dormir** : +30 énergie, +5 bonheur
4. Clique sur "Nourrir"
5. Les barres se mettent à jour instantanément
6. Toast de succès "Animal nourri !"
7. L'action est enregistrée dans l'historique

### 3. Dégradation automatique

1. L'utilisateur laisse l'app ouverte
2. Toutes les 10 secondes, un "tick" se déclenche
3. Les stats diminuent progressivement :
    - Faim : -2 par heure
    - Bonheur : -1.5 par heure
    - Énergie : -1 par heure
    - Santé : -3 par heure si faim < 20 ou bonheur < 20
4. Si une stat < 30%, notification desktop
5. Si santé = 0 → l'animal meurt
6. Toast "Ton animal est mort 😢"
7. L'animal passe dans la section "Cimetière"

### 4. Fermeture/Réouverture de l'app

1. L'utilisateur ferme l'application à 14h00
2. Réouvre l'app à 18h00 (4h plus tard)
3. Au démarrage, calcul du temps écoulé depuis `derniereUpdate`
4. Application de la dégradation en batch (4h × taux de dégradation)
5. Si l'animal est mort pendant l'absence :
    - Toast "Ton animal est mort pendant ton absence 😢"
    - Animal déplacé au cimetière
6. Si l'animal est vivant mais stats critiques :
    - Notification "Ton animal a besoin de toi !"

### 5. Consultation de l'historique

1. L'utilisateur accède au détail d'un animal
2. Scroll vers le bas pour voir l'historique
3. Liste des 20 dernières actions avec :
    - Icône (🍖 Nourrir, 🎮 Jouer, 💊 Soigner, 😴 Dormir)
    - Timestamp relatif ("Il y a 2h")
4. Regroupement par jour (optionnel)

---

## Règles métier

### Stats

- Toutes les stats sont bornées entre **0 et 100**
- Un animal **meurt** si `sante = 0`
- La **santé** diminue uniquement si `faim < 20` ou `bonheur < 20`

### Actions

- **Nourrir** : `faim +20`, `bonheur +5`, `energie -5`
- **Jouer** : `bonheur +15`, `energie -10`, `faim -5`
    - Bouton désactivé si `energie < 10`
- **Soigner** : `sante +20`
- **Dormir** : `energie +30`, `bonheur +5`

### Dégradation (par heure)

- `faim`: -2
- `bonheur`: -1.5
- `energie`: -1
- `sante`: -3 (uniquement si `faim < 20` ou `bonheur < 20`)

### Âge

- Incrémenté automatiquement avec le temps écoulé
- Affiché en heures ou jours selon la durée

### Types d'animaux

- **Chat** : emoji 🐱 ou sprite minimaliste
- **Chien** : emoji 🐶 ou sprite minimaliste
- **Alien** : emoji 👽 ou sprite minimaliste

### Humeurs (affichage sprite)

- **Content** : si `bonheur > 60` et `faim > 60` → 😊
- **Triste** : si `bonheur < 30` → 😢
- **Affamé** : si `faim < 30` → 😫
- **Endormi** : si `energie < 30` → 😴
- **Neutre** : sinon → 😐

---

## Cas limites

### Aucun animal créé

- Affichage d'un écran vide avec message d'incitation
- Bouton "Créer ton premier animal"

### Animal mort

- Badge "💀 Mort"
- Stats figées
- Boutons d'actions désactivés
- Déplacé dans la section "Cimetière"

### Stats à 100

- Les actions n'augmentent pas au-delà de 100
- Message "Stat déjà au maximum"

### Stats à 0

- Si `sante = 0` → mort instantané
- Si `faim = 0` → `sante` diminue rapidement
- Si `energie = 0` → bouton "Jouer" désactivé

### Notifications

- Maximum 1 notification par stat par heure (pas de spam)
- Notifications groupées si plusieurs stats critiques

### Temps écoulé > 24h

- Si animal mort depuis >24h, message spécifique
- Si animal vivant après >24h sans actions, stats critiques garanties

---

## Modèle de données

### Table `Animal`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom de l'animal (3-20 caractères) |
| `type` | String | Type (cat/dog/alien) |
| `hunger` | Integer | Niveau de faim (0-100) |
| `happiness` | Integer | Niveau de bonheur (0-100) |
| `health` | Integer | Niveau de santé (0-100) |
| `energy` | Integer | Niveau d'énergie (0-100) |
| `age` | Integer | Âge en heures |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière mise à jour des stats |
| `isAlive` | Boolean | Statut vivant/mort |

### Table `Action`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `animalId` | UUID | Référence vers Animal |
| `actionType` | String | Type (feed/play/heal/sleep) |
| `timestamp` | DateTime | Horodatage de l'action |

### Relations

- Un `Animal` a plusieurs `Action` (One-to-Many)
- Suppression en cascade : si animal supprimé → actions supprimées

---

## Contraintes techniques

### Performance

- Temps de chargement page < 1 seconde
- Tick toutes les **10 secondes** (pas chaque seconde pour économiser la batterie)
- Calcul batch du temps écoulé offline (pas de boucle)

### Sécurité

- Base de données locale (SQLite) dans dossier utilisateur
- Pas de données sensibles stockées
- Validation côté client ET serveur (Electron main process)

### Compatibilité

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)
- Résolution minimale : 1280×720

### Accessibilité

- Navigation au clavier possible
- Labels ARIA pour screen readers
- Contraste suffisant (WCAG 2.1 AA)
- Tailles de police lisibles

---

## Extensions possibles (hors MVP)

### Phase 2

- **Mini-jeu** : Cliquer sur des objets qui tombent pour gagner du bonheur
- **Évolution** : Bébé → Adulte → Vieux selon l'âge
- **Objets** : Système d'inventaire avec nourriture, jouets, médicaments
- **Multiples types** : Débloquer de nouveaux types d'animaux
- **Achievements** : "Première semaine", "100 actions", "Animal centenaire"

### Phase 3

- **Export/Import** : Sauvegarder et partager ses animaux
- **Thèmes** : Mode sombre/clair
- **Graphiques** : Courbes d'évolution des stats dans le temps
- **Sons** : Bruitages pour chaque action
- **Animations** : Transitions CSS pour les sprites

---

## Critères de succès

### Fonctionnels

- ✅ Au moins 2 entités en BDD (`Animal` + `Action`)
- ✅ CRUD complet sur les animaux
- ✅ Système de dégradation automatique
- ✅ Persistance entre sessions
- ✅ Notifications desktop natives

### Techniques

- ✅ Architecture feature-based
- ✅ Tests unitaires >80% couverture
- ✅ TypeScript strict sans `any`
- ✅ TanStack Query pour le state serveur
- ✅ TanStack Router pour la navigation
- ✅ Prisma pour l'ORM

### UX

- ✅ Interface claire et intuitive
- ✅ Feedback immédiat (toasts)
- ✅ Barres de stats visuelles
- ✅ Animations fluides
- ✅ Responsive (desktop uniquement)

---

**Version** : 1.0  
**Date** : 24 novembre 2025  
**Statut** : Spécifications validées pour développement MVP