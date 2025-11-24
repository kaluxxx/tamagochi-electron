import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import * as animalService from './database'

let mainWindow: BrowserWindow | null = null

function createWindow() {
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

  // Load app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
