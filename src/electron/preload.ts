import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
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
  }
})
