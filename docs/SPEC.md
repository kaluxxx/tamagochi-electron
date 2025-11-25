# Spécifications fonctionnelles – Tamagotchi Electron

## Objectif

Créer une application desktop (Electron) de gestion d'animaux virtuels type Tamagotchi, où l'utilisateur doit prendre soin de créatures qui évoluent et se dégradent avec le temps.

## Public cible

- Étudiants en développement web
- Développeurs débutants Electron
- Personnes cherchant un projet pédagogique avec gestion d'état et base de données

## Contrainte projet

**Durée** : 3.5 jours
**Contrainte académique** : Au moins 2 entités en base de données
**Réalisé** : 5 entités (`AnimalType`, `Animal`, `Action`, `Item`, `Inventory`)

---

## User stories - MVP

### Gestion des types d'animaux

**US1 : Voir les types d'animaux disponibles**
En tant qu'utilisateur, je veux voir la liste des types d'animaux disponibles (chat, chien, alien) avec leurs caractéristiques spécifiques (taux de dégradation, emoji)

### Gestion des animaux

**US2 : Création d'un animal**
En tant qu'utilisateur, je veux créer un nouvel animal en choisissant un nom et un type parmi les types disponibles

**US3 : Liste des animaux**
En tant qu'utilisateur, je veux voir la liste de tous mes animaux avec leur type, leurs stats actuelles (vivants et morts séparés)

**US4 : Détail d'un animal**
En tant qu'utilisateur, je veux voir le détail complet d'un animal avec toutes ses stats en temps réel, son type, son âge et son emoji

### Actions de base

**US5 : Nourrir un animal**
En tant qu'utilisateur, je veux nourrir mon animal pour augmenter sa faim (+20), son bonheur (+5) au coût de son énergie (-5)

**US6 : Jouer avec un animal**
En tant qu'utilisateur, je veux jouer avec mon animal pour augmenter son bonheur (+15) au coût de son énergie (-10) et de sa faim (-5)

**US7 : Soigner un animal**
En tant qu'utilisateur, je veux soigner mon animal pour restaurer sa santé (+20)

**US8 : Mettre un animal au repos**
En tant qu'utilisateur, je veux mettre mon animal au repos pour restaurer son énergie (+30) et son bonheur (+5)

### Système d'items

**US9 : Voir l'inventaire d'items**
En tant qu'utilisateur, je veux voir la liste de tous les items disponibles (nourriture, jouets, médicaments) avec leurs effets

**US10 : Filtrer les items par type**
En tant qu'utilisateur, je veux filtrer les items par catégorie (food, toy, medicine) pour trouver facilement ce dont j'ai besoin

**US11 : Utiliser un item sur un animal**
En tant qu'utilisateur, je veux utiliser un item sur mon animal pour appliquer ses effets (boosts de stats) en fonction du type d'item

**US12 : Vérifier le coût énergétique**
En tant qu'utilisateur, je veux être informé si mon animal n'a pas assez d'énergie pour utiliser un item

**US13 : Voir l'historique des items utilisés**
En tant qu'utilisateur, je veux voir dans l'historique des actions quels items ont été utilisés sur mon animal

### Système de temps

**US14 : Dégradation passive des stats**
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent automatiquement avec le temps selon les taux de son type (chat: faim -2.5/h, chien: bonheur -2/h, alien: moins de dégradation)

**US15 : Calcul du temps écoulé offline**
En tant qu'utilisateur, je veux que les stats de mon animal se dégradent même quand l'app est fermée, en fonction du temps réellement écoulé

### Notifications

**US16 : Notifications desktop**
En tant qu'utilisateur, je veux recevoir des notifications quand les stats de mon animal sont critiques (< 30%)

### Statistiques

**US17 : Historique des actions**
En tant qu'utilisateur, je veux voir l'historique des 20 dernières actions effectuées sur mon animal (type d'action, item utilisé si applicable, timestamp)

**US18 : Statistiques globales** (optionnel)
En tant qu'utilisateur, je veux voir des statistiques sur tous mes animaux (total créés par type, vivants/morts, actions effectuées, items les plus utilisés)

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
    - Durée animation : 5 secondes
- **Jouer** : `bonheur +15`, `energie -10`, `faim -5`
    - Bouton désactivé si `energie < 20`
    - Tooltip : "Énergie insuffisante (min 20%)"
    - Durée animation : 20 secondes
- **Soigner** : `sante +20`
    - Durée animation : 8 secondes
- **Dormir** : `energie +30`, `bonheur +5`
    - Bouton désactivé si `energie > 80`
    - Tooltip : "Pas assez fatigué (max 80%)"
    - Durée animation : 30 secondes
- **Utiliser Item** : effets variables selon l'item
    - Durée animation : 3 secondes

### Dégradation (par heure) - Taux par type d'animal

| Type | Faim | Bonheur | Énergie | Santé |
|------|------|---------|---------|-------|
| **Chat** 🐱 | -2.5 | -1.5 | -0.8 | -3.0 |
| **Chien** 🐶 | -2.0 | -2.0 | -1.2 | -3.0 |
| **Alien** 👽 | -1.5 | -1.0 | -1.5 | -2.5 |

**Règle santé** : La santé diminue uniquement si une stat est critique (< 20).
Le taux de dégradation est **multiplié par le nombre de stats critiques**.

Exemple : Si faim ET bonheur < 20 pour un Chat → santé diminue de 3.0 × 2 = **6.0/heure**

### Âge

- Incrémenté automatiquement avec le temps écoulé
- Affiché en heures ou jours selon la durée

### Types d'animaux

- **Chat** : emoji 🐱 ou sprite minimaliste
- **Chien** : emoji 🐶 ou sprite minimaliste
- **Alien** : emoji 👽 ou sprite minimaliste

### Humeurs (affichage sprite)

Priorité d'affichage (de la plus haute à la plus basse) :

1. **Actions actives** (override tout) :
   - `sleeping` : si action dormir en cours
   - `playing` : si action jouer en cours
   - `feeding` : si action nourrir en cours
   - `healing` : si action soigner en cours
   - `using_item` : si utilisation d'item en cours

2. **États critiques** :
   - `sick` : si `sante < 30` → spirale animation
   - `tired` : si `energie < 30` → yeux endormis
   - `hungry` : si `faim < 30` → triste avec focus nourriture
   - `sad` : si `bonheur < 30` → larmes

3. **État positif** :
   - `happy` : si `bonheur > 60` ET `faim > 60` → cœurs

4. **État par défaut** :
   - `neutral` : sinon

5. **État mort** :
   - `dead` : si `isAlive = false` → yeux en croix

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

### Table `AnimalType`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom technique unique (cat/dog/alien) |
| `displayName` | String | Nom d'affichage (Chat/Chien/Alien) |
| `hungerDecayRate` | Float | Taux de dégradation de la faim par heure (défaut: 2.0) |
| `happinessDecayRate` | Float | Taux de dégradation du bonheur par heure (défaut: 1.5) |
| `energyDecayRate` | Float | Taux de dégradation de l'énergie par heure (défaut: 1.0) |
| `healthDecayRate` | Float | Taux de dégradation de la santé par heure (défaut: 3.0) |
| `emoji` | String | Emoji représentant le type (🐱/🐶/👽) |

### Table `Animal`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom de l'animal (3-20 caractères) |
| `typeId` | UUID | Référence vers AnimalType |
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
| `actionType` | String | Type (feed/play/heal/sleep/use_item) |
| `itemId` | UUID (nullable) | Référence vers Item utilisé (optionnel) |
| `timestamp` | DateTime | Horodatage de l'action |
| `hungerBefore` | Int (nullable) | Faim avant l'action |
| `happinessBefore` | Int (nullable) | Bonheur avant l'action |
| `healthBefore` | Int (nullable) | Santé avant l'action |
| `energyBefore` | Int (nullable) | Énergie avant l'action |
| `hungerAfter` | Int (nullable) | Faim après l'action |
| `happinessAfter` | Int (nullable) | Bonheur après l'action |
| `healthAfter` | Int (nullable) | Santé après l'action |
| `energyAfter` | Int (nullable) | Énergie après l'action |

### Table `Item`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom de l'objet |
| `type` | String | Type (food/toy/medicine) |
| `hungerBoost` | Integer | Bonus de faim (0-100) |
| `happinessBoost` | Integer | Bonus de bonheur (0-100) |
| `healthBoost` | Integer | Bonus de santé (0-100) |
| `energyBoost` | Integer | Bonus d'énergie (0-100) |
| `energyCost` | Integer | Coût en énergie pour utiliser l'objet |
| `emoji` | String | Emoji représentant l'objet |
| `description` | String | Description de l'objet |

### Table `Inventory`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `itemId` | UUID (unique) | Référence vers Item |
| `quantity` | Int | Quantité disponible (défaut: 0) |

**Note** : Relation 1:1 avec Item. Chaque item a exactement une entrée d'inventaire.

### Relations

- Un `AnimalType` a plusieurs `Animal` (One-to-Many)
- Un `Animal` a plusieurs `Action` (One-to-Many)
- Un `Animal` appartient à un `AnimalType` (Many-to-One)
- Un `Item` peut être utilisé dans plusieurs `Action` (One-to-Many)
- Une `Action` peut utiliser un `Item` (Many-to-One, optionnel)
- Un `Item` a une entrée `Inventory` (One-to-One)
- Suppression en cascade : si animal supprimé → actions supprimées

### Exemples d'items (Seed Data)

**Nourriture (food):**

| Item | Faim | Bonheur | Santé | Énergie | Coût énergie |
|------|------|---------|-------|---------|--------------|
| 🍖 Steak | +30 | +5 | - | - | 5 |
| 🥛 Lait | +15 | +10 | +5 | - | 3 |
| 🍎 Pomme | +10 | +5 | +10 | +5 | 2 |

**Jouets (toy):**

| Item | Faim | Bonheur | Santé | Énergie | Coût énergie |
|------|------|---------|-------|---------|--------------|
| 🎾 Balle | - | +20 | - | - | 15 |
| 🧸 Peluche | - | +15 | - | - | 5 |
| 🎮 Console | - | +25 | - | - | 20 |

**Médicaments (medicine):**

| Item | Faim | Bonheur | Santé | Énergie | Coût énergie |
|------|------|---------|-------|---------|--------------|
| 💊 Vitamine | - | - | +20 | +10 | 0 |
| 💉 Vaccin | - | - | +30 | - | 0 |
| 🩹 Bandage | - | +5 | +15 | - | 0 |

**Note** : Le coût énergie est déduit lors de l'utilisation. Si l'animal n'a pas assez d'énergie, l'item ne peut pas être utilisé.

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

**Version** : 2.0
**Date** : 25 novembre 2025
**Statut** : Spécifications mises à jour (post-implémentation)