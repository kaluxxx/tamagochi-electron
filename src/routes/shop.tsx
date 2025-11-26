import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CoinDisplay, useWallet, useShop } from '@/features/economy'
import type { ShopItem } from '@/features/economy'
import { useSoundEffects, AudioControls } from '@/features/audio'

export const Route = createFileRoute('/shop')({
  component: ShopPage,
})

type ItemCategory = 'all' | 'food' | 'toy' | 'medicine'

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  all: 'TOUT',
  food: 'NOURRITURE',
  toy: 'JOUETS',
  medicine: 'SOINS',
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-[#FFB347]',
  toy: 'bg-[#87CEEB]',
  medicine: 'bg-[#98D8AA]',
}

function ShopPage() {
  const navigate = useNavigate()
  const { coins } = useWallet()
  const { items, purchase, isPurchasing, isLoading } = useShop()
  const { playSfx } = useSoundEffects()
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all')
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; success: boolean } | null>(null)

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.type === selectedCategory)

  const handlePurchase = async (item: ShopItem) => {
    if (coins < item.price) {
      playSfx('purchase_fail')
      setPurchaseMessage({ text: 'Pas assez de pièces !', success: false })
      window.setTimeout(() => setPurchaseMessage(null), 2000)
      return
    }

    purchase(
      { itemId: item.id, quantity: 1 },
      {
        onSuccess: () => {
          playSfx('purchase_success')
          setPurchaseMessage({ text: `${item.name} acheté !`, success: true })
          window.setTimeout(() => setPurchaseMessage(null), 2000)
        },
        onError: () => {
          playSfx('purchase_fail')
          setPurchaseMessage({ text: 'Erreur lors de l\'achat', success: false })
          window.setTimeout(() => setPurchaseMessage(null), 2000)
        },
      }
    )
  }

  return (
    <main className="h-screen w-screen bg-[#FFE5EC] flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-3 py-1.5 bg-gray-200 border-2 border-black font-pixel text-[10px] uppercase hover:bg-gray-300 active:translate-y-0.5 transition-all"
        >
          RETOUR
        </button>
        <h1 className="font-pixel text-xl text-black">BOUTIQUE</h1>
        <div className="flex items-center gap-2">
          <CoinDisplay size="md" />
          <AudioControls compact size="md" />
        </div>
      </div>

      {/* Purchase message */}
      {purchaseMessage && (
        <div
          className={`mb-2 p-2 border-2 border-black font-pixel text-[10px] text-center ${
            purchaseMessage.success ? 'bg-green-200' : 'bg-red-200'
          }`}
        >
          {purchaseMessage.text}
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 border-2 border-black font-pixel text-[8px] uppercase transition-all ${
              selectedCategory === category
                ? 'bg-[#FF6B9D] text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Shop content */}
      <div className="flex-1 bg-[#FFF4E6] border-4 border-black p-4 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-pixel text-sm text-gray-600">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-pixel text-sm text-gray-600">Aucun article disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                canAfford={coins >= item.price}
                onPurchase={() => handlePurchase(item)}
                isPurchasing={isPurchasing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

interface ShopItemCardProps {
  item: ShopItem
  canAfford: boolean
  onPurchase: () => void
  isPurchasing: boolean
}

function ShopItemCard({ item, canAfford, onPurchase, isPurchasing }: ShopItemCardProps) {
  const bgColor = CATEGORY_COLORS[item.type] || 'bg-gray-200'

  return (
    <div className={`${bgColor} border-4 border-black p-3 flex flex-col`}>
      {/* Emoji & Name */}
      <div className="text-center mb-2">
        <span className="text-3xl">{item.emoji}</span>
        <h3 className="font-pixel text-[10px] text-black mt-1">{item.name}</h3>
      </div>

      {/* Stats */}
      <div className="flex-1 mb-2">
        <div className="grid grid-cols-2 gap-1 text-[8px] font-pixel">
          {item.hungerBoost > 0 && (
            <span className="text-orange-700">Faim +{item.hungerBoost}</span>
          )}
          {item.happinessBoost > 0 && (
            <span className="text-pink-700">Joie +{item.happinessBoost}</span>
          )}
          {item.healthBoost > 0 && (
            <span className="text-green-700">Santé +{item.healthBoost}</span>
          )}
          {item.energyBoost > 0 && (
            <span className="text-blue-700">Énergie +{item.energyBoost}</span>
          )}
        </div>
        {item.energyCost > 0 && (
          <p className="text-[8px] font-pixel text-red-600 mt-1">
            Coût énergie: -{item.energyCost}
          </p>
        )}
      </div>

      {/* Price & Buy button */}
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[10px] text-yellow-700">
          &#x1FA99; {item.price}
        </span>
        <button
          onClick={onPurchase}
          disabled={!canAfford || isPurchasing}
          className={`px-2 py-1 border-2 border-black font-pixel text-[8px] uppercase transition-all ${
            canAfford
              ? 'bg-white hover:bg-gray-100 active:translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPurchasing ? '...' : 'ACHETER'}
        </button>
      </div>
    </div>
  )
}
