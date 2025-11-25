/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  animalTypes: {
    getAll: () => ipcRenderer.invoke('animalTypes:getAll'),
    getById: (id: string) => ipcRenderer.invoke('animalTypes:getById', id),
  },
  animals: {
    getAll: () => ipcRenderer.invoke('animals:getAll'),
    getById: (id: string) => ipcRenderer.invoke('animals:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('animals:create', data),
    feed: (id: string) => ipcRenderer.invoke('animals:feed', id),
    play: (id: string) => ipcRenderer.invoke('animals:play', id),
    heal: (id: string) => ipcRenderer.invoke('animals:heal', id),
    sleep: (id: string) => ipcRenderer.invoke('animals:sleep', id),
    tick: (id: string) => ipcRenderer.invoke('animals:tick', id),
  },
  actions: {
    getByAnimalId: (animalId: string) => ipcRenderer.invoke('actions:getByAnimalId', animalId),
  },
  items: {
    getAll: () => ipcRenderer.invoke('items:getAll'),
    getById: (id: string) => ipcRenderer.invoke('items:getById', id),
    getByType: (type: string) => ipcRenderer.invoke('items:getByType', type),
    useItem: (animalId: string, itemId: string) => ipcRenderer.invoke('items:useItem', animalId, itemId),
  },
  inventory: {
    getAll: () => ipcRenderer.invoke('inventory:getAll'),
    getByType: (type: string) => ipcRenderer.invoke('inventory:getByType', type),
  },
  history: {
    getByAnimalId: (animalId: string, limit?: number) => ipcRenderer.invoke('history:getByAnimalId', animalId, limit),
  },
  // Economy System
  wallet: {
    get: () => ipcRenderer.invoke('wallet:get'),
    collectPassive: () => ipcRenderer.invoke('wallet:collectPassive'),
    addCoins: (amount: number) => ipcRenderer.invoke('wallet:addCoins', amount),
  },
  shop: {
    getItems: () => ipcRenderer.invoke('shop:getItems'),
    purchase: (itemId: string, quantity?: number) => ipcRenderer.invoke('shop:purchase', itemId, quantity || 1),
  },
  minigame: {
    saveScore: (gameType: string, score: number, coinsEarned: number) =>
      ipcRenderer.invoke('minigame:saveScore', gameType, score, coinsEarned),
    getHighScores: (gameType: string) => ipcRenderer.invoke('minigame:getHighScores', gameType),
  },
  clickerUpgrades: {
    getAll: () => ipcRenderer.invoke('clickerUpgrades:getAll'),
    purchase: (type: string) => ipcRenderer.invoke('clickerUpgrades:purchase', type),
    getGameStats: () => ipcRenderer.invoke('clickerUpgrades:getGameStats'),
  },
  // Event listeners for Main → Renderer communication
  onAnimalsUpdated: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('animals:updated', handler)
    return () => ipcRenderer.removeListener('animals:updated', handler)
  },
  onAnimalDied: (callback: (animal: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, animal: unknown) => callback(animal)
    ipcRenderer.on('animal:died', handler)
    return () => ipcRenderer.removeListener('animal:died', handler)
  },
  onWalletUpdated: (callback: (wallet: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, wallet: unknown) => callback(wallet)
    ipcRenderer.on('wallet:updated', handler)
    return () => ipcRenderer.removeListener('wallet:updated', handler)
  }
})
