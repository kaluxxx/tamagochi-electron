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
  // Charger l'icône depuis le dossier public
  // En développement : public/sprites/ui/logo.svg
  // En production : resources/public/sprites/ui/logo.svg
  let iconPath: string

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    iconPath = path.join(__dirname, '../../public/sprites/ui/logo.svg')
  } else {
    iconPath = path.join(process.resourcesPath, 'public/sprites/ui/logo.svg')
  }

  // Créer l'icône - nativeImage supporte SVG sur certaines plateformes
  // Fallback vers une icône par défaut si le fichier n'existe pas
  let icon = nativeImage.createFromPath(iconPath)

  // Si l'icône est vide (SVG non supporté), utiliser un fallback PNG encodé en base64
  if (icon.isEmpty()) {
    // Fallback: icône Tamagotchi simple en base64 PNG (16x16)
    icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANnSURBVFiFtZdNaBNBFMf/M5vdTdK0TdOmtbZVW6pVsKIIXhQRFRQPevCgeBFBEAQRwYMHD+LBg+hBEDx4UBQED4oHQRAUFMGDIIhQBT9QqdZWa5s0H5vdzYyHbJLdbDZN6h/CzszOe7+Zefvm7RKMMfDCGEMgEBh2u92lHo8nSSldAnJIURTPAPgDAFVVVUei0Wg4GAzKiqI4OOeuXbt27SQBbJdleTuA7TRdCYIgHHO5XMccDoerqakpHI1Go8FgkCqK4szLAIDMy0bjxoWCJXVdP5OXgMfjSfKGJElBr9cbCQaDsqIoLq77zBoIh8NhVVVVl8tFOOdYLkXX9TO8BPx+f5QDSDQ0NPjD4XBMURQXqSFr/sN+d/r9fu7z+UIOhyMRiUSi4XCYybIsE8YYrOB5ngEI+nw+v9/v17q7u6WOjo6Ex+NJ8iZrIAgCBYC2trZEV1eX1NnZmXA6nUmeBJKC6wBgaWlJAIDW1tZERIhIXV1dCZ7LAJ/PR9ra2hJdXV1SZ2dnwul0JnkJqDkHMkuSJAFA0ufzSTabLb506dJZp9OZ4CUgiD4fJ4C4z+eLuVyumN1uj9lstuXX2LIsAkA+fPjwjM1miy9cuHC2oaEhIUlSaGBgQJs7d+5gfX39oMPhSBRKQLSCpwSCIAgMQHzOnDkyALS3t8fn5ubOS5LkDwQC8smTJ2MbNmwItrW1RWtra0O8CIKAPwkhJAAEOjo6EgDiNTU1YQCx2bNnywCwa9euWG9vb2Du3LkSL4FkwQ4hOQEiImkPMMYYEonEAABp3rx5EgBUV1cnZ86cmfD7/QleAprhCYIQAIBQKBQBgNraWrG1tTUxe/Zs2d/fH66oqBjknP8XPyNJktDf3x8GgKamJgkAqqqqHDNmzIg3NjYGpk+fHuYlwOsMJsAYCxJCIgAwbdo0GQAmT548WlZWNupyuWKJRMKmKIrAOecCALIFl2UZDocj6nK5hi0A6qWsadOmCQBQXl4+6nK5YoZhSAAkQRBCAPKu8nJBnhASDMMQAeDWrVtBAGhoaJCrq6vjLpeLWY1vtfnI6urqUQCor6+XAWDSpEmjJSUlY4IgJAghCUJI4vjx4zEASbfbLbe2to5WVVXFc6m/AgCTJk0aBYC6ujrZ7XYP5vq/rIA8hfb0n3sUmJf4H/kHKHINmBlCHH0AAAAASUVORK5CYII=')
  }

  // Redimensionner pour le tray (16x16 sur Windows, peut varier)
  const resizedIcon = icon.resize({ width: 16, height: 16 })

  tray = new Tray(resizedIcon)

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
