import { useState } from 'react'
import { useWallet } from '@frontend/features/economy'
import { cn } from '@frontend/shared/lib/utils'
import { RodsTab } from './rods-tab'
import { BaitsTab } from './baits-tab'
import { LocationsTab } from './locations-tab'

type Tab = 'rods' | 'baits' | 'locations'

export function EquipmentPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('rods')
  const { coins } = useWallet()

  return (
    <div className="bg-blue-950/50 rounded-xl border-2 border-blue-900/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-blue-900/50">
        {(['rods', 'baits', 'locations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-2 font-pixel text-xs transition-colors",
              activeTab === tab
                ? "bg-blue-800/50 text-blue-200"
                : "text-gray-400 hover:text-gray-300 hover:bg-blue-900/30"
            )}
          >
            {tab === 'rods' && '🎣 CANNES'}
            {tab === 'baits' && '🪱 APPATS'}
            {tab === 'locations' && '📍 LIEUX'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-screen overflow-y-auto pixel-scrollbar">
        {activeTab === 'rods' && <RodsTab coins={coins} />}
        {activeTab === 'baits' && <BaitsTab coins={coins} />}
        {activeTab === 'locations' && <LocationsTab coins={coins} />}
      </div>
    </div>
  )
}
