import {useState} from 'react'
import {cn} from '@frontend/shared/lib/utils'
import {useInventory} from '../hooks/use-inventory'
import {InventoryFilter} from './inventory-filter'
import {InventoryItem} from './inventory-item'
import type {ItemFilter, InventoryItem as InventoryItemType} from '../types'

interface InventoryPanelProps {
    animalEnergy: number
    isAlive: boolean
    isActionDisabled: boolean
    onUseItem: (itemId: string, itemType: string, onComplete: () => void) => void
    onItemUsed?: () => void
}

export function InventoryPanel({animalEnergy, isAlive, isActionDisabled, onUseItem, onItemUsed}: InventoryPanelProps) {
    const [filter, setFilter] = useState<ItemFilter>('all')
    const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null)

    const {data: inventory, isLoading} = useInventory(filter)

    const handleUseItem = () => {
        if (!selectedItem || !isAlive || isActionDisabled) return

        onUseItem(selectedItem.itemId, selectedItem.item.type, () => {
            setSelectedItem(null)
            onItemUsed?.()
        })
    }

    const canUseSelectedItem = selectedItem
        ? isAlive && !isActionDisabled && animalEnergy >= selectedItem.item.energyCost && selectedItem.quantity > 0
        : false

    const notEnoughEnergy = selectedItem
        ? animalEnergy < selectedItem.item.energyCost
        : false

    const close = () => {
        setSelectedItem(null)
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 mb-2">
                <InventoryFilter selected={filter} onChange={setFilter}/>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="font-pixel text-[10px] text-gray-500">Chargement...</span>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Items Grid - scrollable with pixel scrollbar */}
                    <div
                        className="grid grid-cols-3 gap-2 p-1 flex-1 overflow-y-auto overflow-x-hidden pixel-scrollbar content-start">
                        {inventory?.map((inv) => (
                            <InventoryItem
                                key={inv.id}
                                inventoryItem={inv}
                                isSelected={selectedItem?.id === inv.id}
                                canUse={isAlive && animalEnergy >= inv.item.energyCost}
                                onClick={() => setSelectedItem(inv)}
                            />
                        ))}
                    </div>

                    {/* Selected Item Info & Use Button */}
                    {selectedItem && (
                        <div className="border-t-2 border-black pt-3 mt-2 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[8px] text-black">
                  {selectedItem.item.emoji} {selectedItem.item.name}
                </span>
                                <span
                                    className={cn(
                                        'font-pixel text-[8px]',
                                        notEnoughEnergy ? 'text-red-600' : 'text-gray-600'
                                    )}
                                >
                  Energie: -{selectedItem.item.energyCost}
                </span>
                            </div>

                            {/* Item effects preview */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {selectedItem.item.hungerBoost > 0 && (
                                    <span className="font-pixel text-[7px] text-orange-600">
                    +{selectedItem.item.hungerBoost} Faim
                  </span>
                                )}
                                {selectedItem.item.happinessBoost > 0 && (
                                    <span className="font-pixel text-[7px] text-yellow-600">
                    +{selectedItem.item.happinessBoost} Bonheur
                  </span>
                                )}
                                {selectedItem.item.healthBoost > 0 && (
                                    <span className="font-pixel text-[7px] text-red-600">
                    +{selectedItem.item.healthBoost} Sante
                  </span>
                                )}
                                {selectedItem.item.energyBoost > 0 && (
                                    <span className="font-pixel text-[7px] text-blue-600">
                    +{selectedItem.item.energyBoost} Energie
                  </span>
                                )}
                            </div>

                            {notEnoughEnergy && (
                                <p className="font-pixel text-[8px] text-red-600 mb-2">
                                    Energie insuffisante!
                                </p>
                            )}

                            <button
                                onClick={handleUseItem}
                                disabled={!canUseSelectedItem}
                                className={cn(
                                    'w-full bg-[#87CEEB] border-4 border-black p-2',
                                    'font-pixel text-[10px] text-black uppercase',
                                    'transition-all active:translate-y-1',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'hover:bg-[#5DADE2]'
                                )}
                            >
                                UTILISER
                            </button>
                            <button onClick={close}
                                    className="mt-2 w-full bg-gray-300 border-4 border-black p-2 font-pixel text-[10px] text-black uppercase transition-all active:translate-y-1 hover:bg-gray-400">
                                FERMER
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
