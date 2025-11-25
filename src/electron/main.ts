/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import * as animalService from './database'
import type { TickResult } from './database'

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

function createTray() {
  // Create a simple 16x16 icon programmatically (fallback if no icon file)
  const icon = nativeImage.createEmpty()

  tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEESURBVDiNpZMxTsQwEEX/OBtFQjQUdJQ0dJQ0nIEjcARuwBG4wR6BI3AEjtBQYgoKChASBVI2TLGOstlELPxm5Pn+M+PxGP4oEgB8cEpKKQeQu/vyH4CZ1UnI5wq1Ag4TtLgDcA/gWDLfW4CXkA8VqgRwlaBYA3gDcCKZby3AS8gHCtUCOEjQxgK8Jii2AB4SnEjmWwvwEvKBQq0A9hO0tgCvCYoNgPsEJ5L51gK8hLyvUMsA9hK0sgAvCYo1gLsEJ5L51gK8hLynUIsAdhO0NACvCYoVgNsEJ5L51gK8hLyrUPMAdkqwNACvCdIKwE2CE8l8awFeQt5RqDkAuyVY/gXegF/gE1blOdYVpgAAAABJRU5ErkJggg==') : icon)

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
