/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import * as animalService from './services'
import type { TickResult } from './services'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let tickInterval: ReturnType<typeof setInterval> | null = null
let isQuitting = false

// Map pour éviter le spam de notifications (1 par stat par animal par heure)
const notificationCooldowns = new Map<string, number>()

// Stat names for notifications
const statNames: Record<string, string> = {
  hunger: 'faim',
  happiness: 'bonheur',
  energy: 'énergie',
  health: 'santé'
}

// ============== NOTIFICATION SYSTEM ==============

function sendDeathNotification(animalName: string, diedOffline = false) {
  const title = diedOffline
    ? `${animalName} est mort pendant ton absence...`
    : `${animalName} est mort...`

  new Notification({
    title,
    body: `Ton animal n'a pas survécu. 😢`
  }).show()
}

function checkCriticalStats(animal: { id: string; name: string }, criticalStats: Record<string, boolean>) {
  Object.entries(criticalStats).forEach(([stat, isCritical]) => {
    if (isCritical) {
      const key = `${animal.id}-${stat}`
      const lastNotif = notificationCooldowns.get(key) || 0
      const now = Date.now()

      // Cooldown de 1 heure entre les notifications pour la même stat
      if (now - lastNotif > 3600000) {
        new Notification({
          title: `${animal.name} a besoin d'aide !`,
          body: `Sa ${statNames[stat]} est critique (< 30%)`
        }).show()
        notificationCooldowns.set(key, now)
      }
    }
  })
}

// ============== IPC COMMUNICATION ==============

function notifyRenderer(channel: string, data: unknown) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}

// ============== TICK SYSTEM ==============

async function runTick() {
  try {
    // Collect passive coin gains
    const wallet = await animalService.collectPassiveGains()
    notifyRenderer('wallet:updated', wallet)

    const animals = await animalService.getAllAnimals()
    const aliveAnimals = animals.filter(a => a.isAlive)

    for (const animal of aliveAnimals) {
      const result: TickResult = await animalService.tickAnimal(animal.id)

      // Notification de mort
      if (result.justDied) {
        sendDeathNotification(result.animal.name)
        notifyRenderer('animal:died', result.animal)
      }

      // Notification stats critiques (< 30%)
      checkCriticalStats(result.animal, result.criticalStats)
    }

    // Notifier le renderer pour refresh
    notifyRenderer('animals:updated', null)
  } catch (error) {
    console.error('Tick error:', error)
  }
}

function startTickSystem() {
  // Run immediately then every 10 seconds
  tickInterval = setInterval(runTick, 10000)
  console.log('Tick system started')
}

function stopTickSystem() {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
    console.log('Tick system stopped')
  }
}

// ============== TRAY ICON ==============

// Icône Tamagotchi 32x32 PNG en base64 (boîtier rose avec écran vert et créature)
const TRAY_ICON_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKbSURBVFhH7ZY9aBRBFMf/M3t3uTMXk0gUCxFBEBRBsLBQsBEbwUoQBBsLGxs7wcrGwsLCRrCwECwsLETBQrAQBEGwEAQLQRDBQvEjxt8xtzv7xpm7vWRvd/aOCxb+YJi5N/Pm/WfezOwuEUL8V0I0ARYWFjA7O4vp6WnMzMxgamoKExMTGB8fx9jYGEZHRzEyMoLh4WEMDQ1hcHAQAwMD6O/vR19fH3p7e9HT04Pu7m50dXWhs7MTCoUC2tvb0dbWhtbWVrS0tKC5uRlNTU1obGxEQ0MD6uvrUVdXh9raWtTU1KC6uhpVVVWorKxERUUFysvLUVZWhtLSUpSUlKC4uBhFRUUoLCxEQUEB8vPzkZeXh9zcXOTk5CA7OxtZWVnIzMxERkYG0tPTkZaWhtTUVKSkpCA5ORlJSUlITExEQkIC4uPjERcXh9jYWMTExCA6OhpRUVGIjIxEREQEwsPDERYWhtDQUISEhCA4OBhBQUEIDAxEQEAA/P394efnB19fX/j4+MDb2xteXl7w9PSEh4cH3N3d4ebmBldXV7i4uMDZ2RlOTk5wdHSEg4MD7O3tYWdnB1tbW9jY2MDa2hpWVlawtLSEhYUFzM3NYWZmBlNTU5iYmMDY2BhGRkYwNDSEgYEB9PX1oaenBx0dHWhra0NLSwuampqgo6MDLS0taGhoQF1dHaqqqkJFRQXKy8tRWlqKkpISpKenIy0tDVFRUcjOzkZmZiYyMjKQlpaG1NRUpKSkICkpCQkJCYiLi8Mvb2f8+DKB79+/Y3l5GcvLy/j27Ru+fv2KL1++4PPnz/j06RM+fvyIDx8+4P3793j37h3evn2LN2/e4PXr13j16hVevnyJFy9e4Pnz53j27BmePn2KJ0+e4PHjx3j06BEePnyIBw8e4P79+7h37x7u3r2LO3fu4Pbt2/i7/gAbfKdSIVuJSwAAAABJRU5ErkJggg==`

function createTray() {
  // Créer l'icône depuis le PNG base64
  const icon = nativeImage.createFromDataURL(TRAY_ICON_BASE64)

  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir Tamagotchi',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        isQuitting = true
        stopTickSystem()
        app.quit()
      }
    }
  ])

  tray.setToolTip('Tamagotchi')
  tray.setContextMenu(contextMenu)

  // Clic sur l'icône = ouvrir la fenêtre
  tray.on('click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  console.log('Tray icon created')
}

// ============== OFFLINE TIME SYNC ==============

async function syncOfflineTime() {
  try {
    const animals = await animalService.getAllAnimals()
    const aliveAnimals = animals.filter(a => a.isAlive)

    for (const animal of aliveAnimals) {
      const result: TickResult = await animalService.tickAnimal(animal.id)

      if (result.justDied) {
        // Notification différée pour laisser la fenêtre s'ouvrir
        setTimeout(() => {
          sendDeathNotification(result.animal.name, true)
          notifyRenderer('animal:died', result.animal)
        }, 2000)
      }
    }

    console.log(`Offline sync completed for ${aliveAnimals.length} animals`)
  } catch (error) {
    console.error('Offline sync error:', error)
  }
}

// ============== WINDOW CREATION ==============

async function createWindow() {
  // Initialize database connection
  try {
    await animalService.initializeDatabase()
  } catch (error) {
    console.error('Failed to initialize database:', error)
    app.quit()
    return
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  })

  // Hide window instead of closing (minimize to tray)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Load app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Create tray icon
  createTray()

  // Sync offline time (apply degradation for time passed)
  await syncOfflineTime()

  // Start the tick system
  startTickSystem()
}

// IPC Handlers - AnimalTypes
ipcMain.handle('animalTypes:getAll', async () => {
  return animalService.getAllAnimalTypes()
})

ipcMain.handle('animalTypes:getById', async (_, id: string) => {
  return animalService.getAnimalTypeById(id)
})

// IPC Handlers - Animals
ipcMain.handle('animals:getAll', async () => {
  return animalService.getAllAnimals()
})

ipcMain.handle('animals:getById', async (_, id: string) => {
  return animalService.getAnimalById(id)
})

ipcMain.handle('animals:create', async (_, data) => {
  return animalService.createAnimal(data)
})

ipcMain.handle('animals:feed', async (_, id: string) => {
  return animalService.feedAnimal(id)
})

ipcMain.handle('animals:play', async (_, id: string) => {
  return animalService.playWithAnimal(id)
})

ipcMain.handle('animals:heal', async (_, id: string) => {
  return animalService.healAnimal(id)
})

ipcMain.handle('animals:sleep', async (_, id: string) => {
  return animalService.sleepAnimal(id)
})

ipcMain.handle('animals:tick', async (_, id: string) => {
  return animalService.tickAnimal(id)
})

ipcMain.handle('actions:getByAnimalId', async (_, animalId: string) => {
  return animalService.getActionsByAnimalId(animalId)
})

// IPC Handlers - Items
ipcMain.handle('items:getAll', async () => {
  return animalService.getAllItems()
})

ipcMain.handle('items:getById', async (_, id: string) => {
  return animalService.getItemById(id)
})

ipcMain.handle('items:getByType', async (_, type: string) => {
  return animalService.getItemsByType(type)
})

ipcMain.handle('items:useItem', async (_, animalId: string, itemId: string) => {
  return animalService.useItem(animalId, itemId)
})

// IPC Handlers - Inventory
ipcMain.handle('inventory:getAll', async () => {
  return animalService.getInventory()
})

ipcMain.handle('inventory:getByType', async (_, type: string) => {
  return animalService.getInventoryByType(type)
})

// IPC Handlers - History
ipcMain.handle('history:getByAnimalId', async (_, animalId: string, limit?: number) => {
  return animalService.getActionHistory(animalId, limit)
})

// IPC Handlers - Wallet
ipcMain.handle('wallet:get', async () => {
  return animalService.getWallet()
})

ipcMain.handle('wallet:collectPassive', async () => {
  return animalService.collectPassiveGains()
})

ipcMain.handle('wallet:addCoins', async (_, amount: number) => {
  return animalService.addCoins(amount)
})

// IPC Handlers - Shop
ipcMain.handle('shop:getItems', async () => {
  return animalService.getShopItems()
})

ipcMain.handle('shop:purchase', async (_, itemId: string, quantity: number) => {
  return animalService.purchaseItem(itemId, quantity)
})

// IPC Handlers - Minigame
ipcMain.handle('minigame:saveScore', async (_, gameType: string, score: number, coinsEarned: number) => {
  return animalService.saveMinigameScore(gameType, score, coinsEarned)
})

ipcMain.handle('minigame:getHighScores', async (_, gameType: string) => {
  return animalService.getMinigameHighScores(gameType)
})

// IPC Handlers - Clicker Upgrades
ipcMain.handle('clickerUpgrades:getAll', async () => {
  return animalService.getClickerUpgrades()
})

ipcMain.handle('clickerUpgrades:purchase', async (_, type: string) => {
  const result = await animalService.purchaseClickerUpgrade(type as animalService.UpgradeType)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

ipcMain.handle('clickerUpgrades:getGameStats', async () => {
  return animalService.getClickerGameStats()
})

// ============== IPC Handlers - Fishing ==============

// Fish Species
ipcMain.handle('fishing:getAllSpecies', async () => {
  return animalService.getAllFishSpecies()
})

ipcMain.handle('fishing:getSpeciesById', async (_, id: string) => {
  return animalService.getFishSpeciesById(id)
})

// Catalog
ipcMain.handle('fishing:getCaughtFish', async () => {
  return animalService.getCaughtFish()
})

ipcMain.handle('fishing:getCaughtSpeciesIds', async () => {
  return animalService.getCaughtSpeciesIds()
})

// Game Actions
ipcMain.handle('fishing:selectRandomFish', async (_, locationId: string, baitId?: string) => {
  return animalService.selectRandomFish(locationId, baitId)
})

ipcMain.handle('fishing:catchFish', async (_, speciesId: string, size: number, locationId: string, rodId: string, baitId?: string) => {
  const result = await animalService.catchFish(speciesId, size, locationId, rodId, baitId)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

ipcMain.handle('fishing:failCatch', async () => {
  return animalService.failCatch()
})

// Rods
ipcMain.handle('fishing:getRods', async () => {
  return animalService.getFishingRods()
})

ipcMain.handle('fishing:getEquippedRod', async () => {
  return animalService.getEquippedRod()
})

ipcMain.handle('fishing:purchaseRod', async (_, rodId: string) => {
  const result = await animalService.purchaseRod(rodId)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

ipcMain.handle('fishing:equipRod', async (_, rodId: string) => {
  return animalService.equipRod(rodId)
})

// Baits
ipcMain.handle('fishing:getBaits', async () => {
  return animalService.getFishingBaits()
})

ipcMain.handle('fishing:purchaseBait', async (_, baitId: string, quantity: number) => {
  const result = await animalService.purchaseBait(baitId, quantity)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

// Locations
ipcMain.handle('fishing:getLocations', async () => {
  return animalService.getFishingLocations()
})

ipcMain.handle('fishing:unlockLocation', async (_, locationId: string) => {
  const result = await animalService.unlockLocation(locationId)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

// Upgrades
ipcMain.handle('fishing:getUpgrades', async () => {
  return animalService.getFishingUpgrades()
})

ipcMain.handle('fishing:purchaseUpgrade', async (_, type: string) => {
  const result = await animalService.purchaseFishingUpgrade(type as animalService.FishingUpgradeType)
  notifyRenderer('wallet:updated', result.wallet)
  return result
})

ipcMain.handle('fishing:getStats', async () => {
  return animalService.getFishingStats()
})

ipcMain.handle('fishing:getUpgradesWithDetails', async () => {
  return animalService.getFishingUpgradesWithDetails()
})

// Progress
ipcMain.handle('fishing:getProgress', async () => {
  return animalService.getFishingProgress()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // Ne pas quitter l'app quand la fenêtre est fermée
  // L'app reste active en arrière-plan avec le tray icon
  // La fermeture se fait via le menu du tray "Quitter"
})

app.on('before-quit', async () => {
  isQuitting = true
  stopTickSystem()
  await animalService.closeDatabase()
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
