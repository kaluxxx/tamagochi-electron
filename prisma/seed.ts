import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.minigameScore.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.action.deleteMany()
  await prisma.animal.deleteMany()
  await prisma.item.deleteMany()
  await prisma.animalType.deleteMany()

  // Create AnimalTypes
  const cat = await prisma.animalType.create({
    data: {
      name: 'cat',
      displayName: 'Chat',
      hungerDecayRate: 2.5, // Cats get hungry faster
      happinessDecayRate: 1.5,
      energyDecayRate: 0.8, // Cats are more energetic
      healthDecayRate: 3.0,
      emoji: '🐱',
    },
  })

  const dog = await prisma.animalType.create({
    data: {
      name: 'dog',
      displayName: 'Chien',
      hungerDecayRate: 2.0,
      happinessDecayRate: 2.0, // Dogs need more attention
      energyDecayRate: 1.2, // Dogs are more active
      healthDecayRate: 3.0,
      emoji: '🐶',
    },
  })

  const alien = await prisma.animalType.create({
    data: {
      name: 'alien',
      displayName: 'Alien',
      hungerDecayRate: 1.5, // Aliens eat less
      happinessDecayRate: 1.0, // Aliens are more independent
      energyDecayRate: 1.5,
      healthDecayRate: 2.5, // Aliens are more resistant
      emoji: '👽',
    },
  })

  console.log('✅ Animal types created:', { cat, dog, alien })

  // Create Food Items (with prices)
  const steak = await prisma.item.create({
    data: {
      name: 'Steak',
      type: 'food',
      hungerBoost: 30,
      happinessBoost: 5,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 5,
      price: 35,
      emoji: '🍖',
      description: 'Un délicieux steak juteux',
    },
  })

  const milk = await prisma.item.create({
    data: {
      name: 'Lait',
      type: 'food',
      hungerBoost: 15,
      happinessBoost: 10,
      healthBoost: 5,
      energyBoost: 0,
      energyCost: 3,
      price: 20,
      emoji: '🥛',
      description: 'Du lait frais et crémeux',
    },
  })

  const apple = await prisma.item.create({
    data: {
      name: 'Pomme',
      type: 'food',
      hungerBoost: 10,
      happinessBoost: 5,
      healthBoost: 10,
      energyBoost: 5,
      energyCost: 2,
      price: 15,
      emoji: '🍎',
      description: 'Une pomme croquante et saine',
    },
  })

  // Create Toy Items (with prices)
  const ball = await prisma.item.create({
    data: {
      name: 'Balle',
      type: 'toy',
      hungerBoost: 0,
      happinessBoost: 20,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 15,
      price: 40,
      emoji: '🎾',
      description: 'Une balle rebondissante pour jouer',
    },
  })

  const plush = await prisma.item.create({
    data: {
      name: 'Peluche',
      type: 'toy',
      hungerBoost: 0,
      happinessBoost: 15,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 5,
      price: 25,
      emoji: '🧸',
      description: 'Une peluche douce et confortable',
    },
  })

  const gameConsole = await prisma.item.create({
    data: {
      name: 'Console',
      type: 'toy',
      hungerBoost: 0,
      happinessBoost: 25,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 20,
      price: 60,
      emoji: '🎮',
      description: 'Une console de jeux vidéo',
    },
  })

  // Create Medicine Items (with prices)
  const vitamin = await prisma.item.create({
    data: {
      name: 'Vitamine',
      type: 'medicine',
      hungerBoost: 0,
      happinessBoost: 0,
      healthBoost: 20,
      energyBoost: 10,
      energyCost: 0,
      price: 45,
      emoji: '💊',
      description: 'Des vitamines pour rester en forme',
    },
  })

  const vaccine = await prisma.item.create({
    data: {
      name: 'Vaccin',
      type: 'medicine',
      hungerBoost: 0,
      happinessBoost: 0,
      healthBoost: 30,
      energyBoost: 0,
      energyCost: 0,
      price: 55,
      emoji: '💉',
      description: 'Un vaccin préventif',
    },
  })

  const bandage = await prisma.item.create({
    data: {
      name: 'Bandage',
      type: 'medicine',
      hungerBoost: 0,
      happinessBoost: 5,
      healthBoost: 15,
      energyBoost: 0,
      energyCost: 0,
      price: 30,
      emoji: '🩹',
      description: 'Un bandage pour les petites blessures',
    },
  })

  console.log('✅ Items created:', {
    food: [steak, milk, apple],
    toys: [ball, plush, gameConsole],
    medicine: [vitamin, vaccine, bandage],
  })

  // Create Inventory entries with initial quantities
  const allItems = [steak, milk, apple, ball, plush, gameConsole, vitamin, vaccine, bandage]

  for (const item of allItems) {
    await prisma.inventory.create({
      data: {
        itemId: item.id,
        quantity: 10 // 10 of each item to start
      }
    })
  }

  console.log('✅ Inventory created with 10 of each item')

  // Create initial Wallet
  await prisma.wallet.create({
    data: {
      coins: 100,
      lastPassiveGain: new Date(),
    },
  })

  console.log('✅ Wallet created with 100 coins')

  // ============== FISHING MINI-GAME DATA ==============
  console.log('🎣 Seeding fishing data...')

  // Clear existing fishing data
  await prisma.fishCatch.deleteMany()
  await prisma.fishSpecies.deleteMany()
  await prisma.fishingRod.deleteMany()
  await prisma.fishingBait.deleteMany()
  await prisma.fishingLocation.deleteMany()
  await prisma.fishingUpgrade.deleteMany()
  await prisma.fishingProgress.deleteMany()

  // Create Fishing Locations (needed first for fish location references)
  const locations = await Promise.all([
    prisma.fishingLocation.create({
      data: {
        name: 'pond',
        displayName: 'Étang',
        emoji: '🏞️',
        unlockCost: 0,
        difficulty: 1.0,
        availableFish: '[]', // Will be updated after fish creation
        description: 'Un petit étang paisible, parfait pour débuter.',
        isUnlocked: true,
        unlockOrder: 0,
      },
    }),
    prisma.fishingLocation.create({
      data: {
        name: 'river',
        displayName: 'Rivière',
        emoji: '🏞️',
        unlockCost: 50,
        difficulty: 1.1,
        availableFish: '[]',
        description: 'Une rivière aux eaux vives, idéale pour la truite.',
        isUnlocked: false,
        unlockOrder: 1,
      },
    }),
    prisma.fishingLocation.create({
      data: {
        name: 'lake',
        displayName: 'Lac',
        emoji: '🌊',
        unlockCost: 150,
        difficulty: 1.2,
        availableFish: '[]',
        description: 'Un grand lac aux eaux profondes.',
        isUnlocked: false,
        unlockOrder: 2,
      },
    }),
    prisma.fishingLocation.create({
      data: {
        name: 'coast',
        displayName: 'Côte',
        emoji: '🏖️',
        unlockCost: 400,
        difficulty: 1.3,
        availableFish: '[]',
        description: 'Les eaux salées de la côte, riches en poissons.',
        isUnlocked: false,
        unlockOrder: 3,
      },
    }),
    prisma.fishingLocation.create({
      data: {
        name: 'deep_sea',
        displayName: 'Haute Mer',
        emoji: '🌊',
        unlockCost: 1000,
        difficulty: 1.5,
        availableFish: '[]',
        description: 'Les profondeurs de l\'océan, territoire des géants.',
        isUnlocked: false,
        unlockOrder: 4,
      },
    }),
    prisma.fishingLocation.create({
      data: {
        name: 'grotto',
        displayName: 'Grotte Mystique',
        emoji: '🔮',
        unlockCost: 2500,
        difficulty: 1.8,
        availableFish: '[]',
        description: 'Une grotte secrète où vivent des créatures légendaires.',
        isUnlocked: false,
        unlockOrder: 5,
      },
    }),
  ])

  const [pond, river, lake, coast, deepSea, grotto] = locations
  console.log('✅ Fishing locations created')

  // Create Fishing Baits
  await Promise.all([
    prisma.fishingBait.create({
      data: {
        name: 'worm',
        displayName: 'Ver',
        emoji: '🪱',
        price: 5,
        catchRateBonus: 0.05,
        maxUses: 1,
        targetRarity: null,
        targetSpecies: null,
        description: 'Un appât basique mais efficace.',
        quantity: 10,
      },
    }),
    prisma.fishingBait.create({
      data: {
        name: 'bread',
        displayName: 'Pain',
        emoji: '🍞',
        price: 3,
        catchRateBonus: 0,
        maxUses: 1,
        targetRarity: null,
        targetSpecies: '["carp"]',
        description: 'Attire particulièrement les carpes.',
        quantity: 10,
      },
    }),
    prisma.fishingBait.create({
      data: {
        name: 'shrimp',
        displayName: 'Crevette',
        emoji: '🦐',
        price: 10,
        catchRateBonus: 0.10,
        maxUses: 1,
        targetRarity: null,
        targetSpecies: null,
        description: 'Parfait pour les poissons côtiers.',
        quantity: 5,
      },
    }),
    prisma.fishingBait.create({
      data: {
        name: 'silver_lure',
        displayName: 'Leurre Argent',
        emoji: '🪝',
        price: 25,
        catchRateBonus: 0.15,
        maxUses: 5,
        targetRarity: null,
        targetSpecies: null,
        description: 'Un leurre réutilisable de qualité.',
        quantity: 2,
      },
    }),
    prisma.fishingBait.create({
      data: {
        name: 'gold_lure',
        displayName: 'Leurre Or',
        emoji: '✨',
        price: 75,
        catchRateBonus: 0.25,
        maxUses: 10,
        targetRarity: '["rare", "epic"]',
        targetSpecies: null,
        description: 'Attire les poissons rares et épiques.',
        quantity: 1,
      },
    }),
    prisma.fishingBait.create({
      data: {
        name: 'legendary_bait',
        displayName: 'Appât Légendaire',
        emoji: '🌟',
        price: 200,
        catchRateBonus: 0.50,
        maxUses: 1,
        targetRarity: '["legendary"]',
        targetSpecies: null,
        description: 'L\'appât ultime pour les créatures légendaires.',
        quantity: 0,
      },
    }),
  ])

  console.log('✅ Fishing baits created')

  // Create Fishing Rods
  await Promise.all([
    prisma.fishingRod.create({
      data: {
        name: 'bamboo',
        displayName: 'Canne Bambou',
        tier: 1,
        price: 0,
        reelZoneBonus: 0,
        catchRateBonus: 0,
        rarityBonus: 0,
        description: 'Une simple canne en bambou pour débuter.',
        isOwned: true,
        isEquipped: true,
      },
    }),
    prisma.fishingRod.create({
      data: {
        name: 'wooden',
        displayName: 'Canne Bois',
        tier: 2,
        price: 100,
        reelZoneBonus: 0.10,
        catchRateBonus: 0.05,
        rarityBonus: 0,
        description: 'Une canne en bois solide et fiable.',
        isOwned: false,
        isEquipped: false,
      },
    }),
    prisma.fishingRod.create({
      data: {
        name: 'fiberglass',
        displayName: 'Canne Fibre',
        tier: 3,
        price: 300,
        reelZoneBonus: 0.20,
        catchRateBonus: 0.10,
        rarityBonus: 0,
        description: 'Une canne moderne en fibre de verre.',
        isOwned: false,
        isEquipped: false,
      },
    }),
    prisma.fishingRod.create({
      data: {
        name: 'carbon',
        displayName: 'Canne Carbone',
        tier: 4,
        price: 750,
        reelZoneBonus: 0.30,
        catchRateBonus: 0.15,
        rarityBonus: 0.05,
        description: 'Une canne légère et performante en carbone.',
        isOwned: false,
        isEquipped: false,
      },
    }),
    prisma.fishingRod.create({
      data: {
        name: 'master',
        displayName: 'Canne Master',
        tier: 5,
        price: 2000,
        reelZoneBonus: 0.50,
        catchRateBonus: 0.25,
        rarityBonus: 0.15,
        description: 'La canne ultime pour les pêcheurs experts.',
        isOwned: false,
        isEquipped: false,
      },
    }),
  ])

  console.log('✅ Fishing rods created')

  // Create Fish Species (20 total)
  // Common (6)
  const commonFish = await Promise.all([
    prisma.fishSpecies.create({
      data: {
        name: 'sardine',
        displayName: 'Sardine',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 5,
        difficulty: 1,
        minSize: 10,
        maxSize: 20,
        locations: JSON.stringify([pond.id, coast.id]),
        baitPreference: '[]',
        description: 'Un petit poisson argenté, très commun.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'trout',
        displayName: 'Truite',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 8,
        difficulty: 2,
        minSize: 20,
        maxSize: 40,
        locations: JSON.stringify([river.id, lake.id]),
        baitPreference: '["worm"]',
        description: 'Un poisson d\'eau douce très apprécié.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'carp',
        displayName: 'Carpe',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 6,
        difficulty: 2,
        minSize: 30,
        maxSize: 60,
        locations: JSON.stringify([pond.id, lake.id]),
        baitPreference: '["bread"]',
        description: 'Un gros poisson paisible qui aime le pain.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'anchovy',
        displayName: 'Anchois',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 4,
        difficulty: 1,
        minSize: 8,
        maxSize: 15,
        locations: JSON.stringify([coast.id]),
        baitPreference: '[]',
        description: 'Un tout petit poisson de mer très abondant.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'mackerel',
        displayName: 'Maquereau',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 7,
        difficulty: 2,
        minSize: 25,
        maxSize: 45,
        locations: JSON.stringify([coast.id, deepSea.id]),
        baitPreference: '["shrimp"]',
        description: 'Un poisson rapide aux reflets bleutés.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'perch',
        displayName: 'Perche',
        emoji: '🐟',
        rarity: 'common',
        baseValue: 6,
        difficulty: 2,
        minSize: 15,
        maxSize: 35,
        locations: JSON.stringify([pond.id, river.id, lake.id]),
        baitPreference: '["worm"]',
        description: 'Un poisson rayé d\'eau douce.',
      },
    }),
  ])

  // Uncommon (6)
  const uncommonFish = await Promise.all([
    prisma.fishSpecies.create({
      data: {
        name: 'bass',
        displayName: 'Bar',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 15,
        difficulty: 4,
        minSize: 30,
        maxSize: 70,
        locations: JSON.stringify([lake.id, coast.id]),
        baitPreference: '["silver_lure"]',
        description: 'Un poisson combatif très recherché.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'salmon',
        displayName: 'Saumon',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 18,
        difficulty: 4,
        minSize: 40,
        maxSize: 80,
        locations: JSON.stringify([river.id]),
        baitPreference: '["shrimp"]',
        description: 'Le roi des rivières, délicieux et vaillant.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'cod',
        displayName: 'Morue',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 14,
        difficulty: 3,
        minSize: 35,
        maxSize: 90,
        locations: JSON.stringify([coast.id, deepSea.id]),
        baitPreference: '[]',
        description: 'Un poisson des eaux froides très nutritif.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'pike',
        displayName: 'Brochet',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 16,
        difficulty: 5,
        minSize: 50,
        maxSize: 120,
        locations: JSON.stringify([lake.id, river.id]),
        baitPreference: '["silver_lure"]',
        description: 'Un prédateur féroce d\'eau douce.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'catfish',
        displayName: 'Silure',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 17,
        difficulty: 5,
        minSize: 60,
        maxSize: 150,
        locations: JSON.stringify([lake.id, river.id]),
        baitPreference: '["worm", "bread"]',
        description: 'Un géant moustache des profondeurs.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'flounder',
        displayName: 'Sole',
        emoji: '🐠',
        rarity: 'uncommon',
        baseValue: 13,
        difficulty: 3,
        minSize: 25,
        maxSize: 50,
        locations: JSON.stringify([coast.id]),
        baitPreference: '["shrimp"]',
        description: 'Un poisson plat caché dans le sable.',
      },
    }),
  ])

  // Rare (4)
  const rareFish = await Promise.all([
    prisma.fishSpecies.create({
      data: {
        name: 'tuna',
        displayName: 'Thon',
        emoji: '🐡',
        rarity: 'rare',
        baseValue: 35,
        difficulty: 6,
        minSize: 80,
        maxSize: 200,
        locations: JSON.stringify([deepSea.id]),
        baitPreference: '["gold_lure"]',
        description: 'Un torpille des mers, rapide et puissant.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'swordfish',
        displayName: 'Espadon',
        emoji: '🐡',
        rarity: 'rare',
        baseValue: 40,
        difficulty: 7,
        minSize: 150,
        maxSize: 300,
        locations: JSON.stringify([deepSea.id]),
        baitPreference: '["gold_lure"]',
        description: 'Un guerrier des océans au nez tranchant.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'eel',
        displayName: 'Anguille',
        emoji: '🐡',
        rarity: 'rare',
        baseValue: 30,
        difficulty: 6,
        minSize: 40,
        maxSize: 100,
        locations: JSON.stringify([river.id, grotto.id]),
        baitPreference: '["worm"]',
        description: 'Un serpent des eaux, glissant et mystérieux.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'anglerfish',
        displayName: 'Baudroie',
        emoji: '🐡',
        rarity: 'rare',
        baseValue: 38,
        difficulty: 7,
        minSize: 30,
        maxSize: 80,
        locations: JSON.stringify([deepSea.id, grotto.id]),
        baitPreference: '[]',
        description: 'Une créature des abysses avec sa propre lumière.',
      },
    }),
  ])

  // Epic (3)
  const epicFish = await Promise.all([
    prisma.fishSpecies.create({
      data: {
        name: 'giant_squid',
        displayName: 'Calmar Géant',
        emoji: '🦑',
        rarity: 'epic',
        baseValue: 80,
        difficulty: 8,
        minSize: 200,
        maxSize: 500,
        locations: JSON.stringify([deepSea.id, grotto.id]),
        baitPreference: '["gold_lure"]',
        description: 'Une terreur tentaculaire des profondeurs.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'shark',
        displayName: 'Requin',
        emoji: '🦈',
        rarity: 'epic',
        baseValue: 100,
        difficulty: 9,
        minSize: 150,
        maxSize: 400,
        locations: JSON.stringify([deepSea.id]),
        baitPreference: '["gold_lure"]',
        description: 'L\'apex prédateur des océans.',
      },
    }),
    prisma.fishSpecies.create({
      data: {
        name: 'manta_ray',
        displayName: 'Raie Manta',
        emoji: '🐠',
        rarity: 'epic',
        baseValue: 75,
        difficulty: 8,
        minSize: 200,
        maxSize: 600,
        locations: JSON.stringify([deepSea.id, grotto.id]),
        baitPreference: '["shrimp"]',
        description: 'Un géant gracieux qui vole sous l\'eau.',
      },
    }),
  ])

  // Legendary (1)
  const legendaryFish = await prisma.fishSpecies.create({
    data: {
      name: 'golden_koi',
      displayName: 'Koï Doré',
      emoji: '🐠',
      rarity: 'legendary',
      baseValue: 500,
      difficulty: 10,
      minSize: 60,
      maxSize: 100,
      locations: JSON.stringify([grotto.id]),
      baitPreference: '["legendary_bait"]',
      description: 'Une créature mythique aux écailles d\'or pur.',
    },
  })

  console.log('✅ Fish species created (20 total)')

  // Update locations with available fish
  const allFish = [...commonFish, ...uncommonFish, ...rareFish, ...epicFish, legendaryFish]

  for (const location of locations) {
    const fishInLocation = allFish.filter(fish => {
      const fishLocations = JSON.parse(fish.locations)
      return fishLocations.includes(location.id)
    })

    await prisma.fishingLocation.update({
      where: { id: location.id },
      data: {
        availableFish: JSON.stringify(fishInLocation.map(f => f.id)),
      },
    })
  }

  console.log('✅ Locations updated with available fish')

  // Create Fishing Upgrades (all at level 0)
  await Promise.all([
    prisma.fishingUpgrade.create({
      data: { type: 'luck', level: 0 },
    }),
    prisma.fishingUpgrade.create({
      data: { type: 'reflexes', level: 0 },
    }),
    prisma.fishingUpgrade.create({
      data: { type: 'value', level: 0 },
    }),
    prisma.fishingUpgrade.create({
      data: { type: 'bait_efficiency', level: 0 },
    }),
  ])

  console.log('✅ Fishing upgrades initialized')

  // Create Fishing Progress
  await prisma.fishingProgress.create({
    data: {
      level: 1,
      experience: 0,
      totalFishCaught: 0,
      bestStreak: 0,
    },
  })

  console.log('✅ Fishing progress initialized')
  console.log('🎣 Fishing data seeding completed!')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
