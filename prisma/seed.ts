import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
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

  // Create Food Items
  const steak = await prisma.item.create({
    data: {
      name: 'Steak',
      type: 'food',
      hungerBoost: 30,
      happinessBoost: 5,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 5,
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
      emoji: '🍎',
      description: 'Une pomme croquante et saine',
    },
  })

  // Create Toy Items
  const ball = await prisma.item.create({
    data: {
      name: 'Balle',
      type: 'toy',
      hungerBoost: 0,
      happinessBoost: 20,
      healthBoost: 0,
      energyBoost: 0,
      energyCost: 15,
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
      emoji: '🎮',
      description: 'Une console de jeux vidéo',
    },
  })

  // Create Medicine Items
  const vitamin = await prisma.item.create({
    data: {
      name: 'Vitamine',
      type: 'medicine',
      hungerBoost: 0,
      happinessBoost: 0,
      healthBoost: 20,
      energyBoost: 10,
      energyCost: 0,
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
      emoji: '🩹',
      description: 'Un bandage pour les petites blessures',
    },
  })

  console.log('✅ Items created:', {
    food: [steak, milk, apple],
    toys: [ball, plush, gameConsole],
    medicine: [vitamin, vaccine, bandage],
  })

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
