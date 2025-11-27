import 'dotenv/config'
import { app, BrowserWindow, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

// Set DATABASE_URL early, before Prisma module loads
// This is needed because Prisma reads env vars at module load time
const userDataPath = app.getPath('userData')
const dbPath = app.isPackaged
  ? path.join(userDataPath, 'tamagotchi.db')
  : path.join(process.cwd(), 'prisma', 'prisma', 'tamagotchi.db')
process.env.DATABASE_URL = `file:${dbPath}`

// Database
import { initializeDatabase, closeDatabase } from './database/prisma'

// Feature handlers
import { registerEconomyHandlers, walletController } from './features/economy'
import { registerAnimalsHandlers, animalController, type TickResult } from './features/animals'
import { registerInventoryHandlers } from './features/inventory'
import { registerMinigamesHandlers } from './features/minigames'
import { registerFishingHandlers } from './features/fishing'

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
    const wallet = await walletController.collectPassiveGains()
    notifyRenderer('wallet:updated', wallet)

    const animals = await animalController.getAllAnimals()
    const aliveAnimals = animals.filter(a => a.isAlive)

    for (const animal of aliveAnimals) {
      const result: TickResult = await animalController.tickAnimal(animal.id)

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

// ============== OFFLINE TIME SYNC ==============

async function syncOfflineTime() {
  try {
    const animals = await animalController.getAllAnimals()
    const aliveAnimals = animals.filter(a => a.isAlive)

    for (const animal of aliveAnimals) {
      const result: TickResult = await animalController.tickAnimal(animal.id)

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

// ============== REGISTER IPC HANDLERS ==============

function registerAllHandlers() {
  // Register all feature handlers
  registerEconomyHandlers()
  registerAnimalsHandlers()
  registerInventoryHandlers()
  registerMinigamesHandlers(notifyRenderer)
  registerFishingHandlers(notifyRenderer)

  console.log('All IPC handlers registered')
}

// ============== TRAY ==============

function createTray() {
  // Chemin vers l'icône (dev: public/, prod: dist/)
  const iconPath = app.isPackaged
    ? path.join(__dirname, '../dist/icons/games.png')
    : path.join(process.cwd(), 'public/icons/games.png')

  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir Tamagotchi',
      click: () => mainWindow?.show()
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Tamagotchi')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

// ============== WINDOW CREATION ==============

async function createWindow() {
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

  // Notify renderer when window is hidden/shown (for audio control)
  mainWindow.on('hide', () => {
    mainWindow?.webContents.send('window:visibility', false)
  })

  mainWindow.on('show', () => {
    mainWindow?.webContents.send('window:visibility', true)
  })

  // Load app immediately (shows loading screen)
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    await mainWindow.loadURL('http://localhost:5173')
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Track start time for minimum loading duration
  const loadingStartTime = Date.now()
  const MIN_LOADING_DURATION = 5000 // 5 seconds minimum

  // Initialize database in background while loading screen is shown
  try {
    await initializeDatabase()
  } catch (error) {
    console.error('Failed to initialize database:', error)
    app.quit()
    return
  }

  // Register all IPC handlers after DB is ready
  registerAllHandlers()

  // Sync offline time (apply degradation for time passed)
  await syncOfflineTime()

  // Start the tick system
  startTickSystem()

  // Wait for minimum loading duration before showing app
  const elapsedTime = Date.now() - loadingStartTime
  const remainingTime = MIN_LOADING_DURATION - elapsedTime
  if (remainingTime > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingTime))
  }

  // Notify renderer that app is ready
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app:ready')
  }
}

app.whenReady().then(() => {
  // Masquer la barre de menu en production
  if (app.isPackaged) {
    Menu.setApplicationMenu(null)
  }

  createTray()
  void createWindow()
})

app.on('window-all-closed', () => {
  // Ne pas quitter l'app quand la fenêtre est fermée
  // L'app reste active en arrière-plan avec le tray icon
  // La fermeture se fait via le menu du tray "Quitter"
})

app.on('before-quit', async () => {
  isQuitting = true
  stopTickSystem()
  await closeDatabase()
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  } else if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow()
  }
})
