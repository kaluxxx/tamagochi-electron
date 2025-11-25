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
  }
})
