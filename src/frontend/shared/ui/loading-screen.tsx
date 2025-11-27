import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  'Preparation des croquettes...',
  'Reveil des animaux...',
  'Calibration du bonheur...',
  'Chargement des sprites...',
  'Configuration du monde...',
]

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

  // Rotate loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    return () => clearInterval(messageInterval)
  }, [])

  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    return () => clearInterval(dotsInterval)
  }, [])

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center overflow-hidden">
      {/* Pixel art egg/creature container */}
      <div className="relative mb-8">
        {/* Glowing background */}
        <div className="absolute inset-0 bg-[#FF69B4]/20 rounded-full blur-3xl animate-pulse" />

        {/* Pixel art egg */}
        <div className="relative w-32 h-40 animate-bounce-slow">
          <svg viewBox="0 0 64 80" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            {/* Egg outline */}
            <ellipse cx="32" cy="45" rx="28" ry="32" fill="#FFF4E6" stroke="#2C3E50" strokeWidth="4" />

            {/* Egg shine */}
            <ellipse cx="22" cy="35" rx="6" ry="8" fill="white" opacity="0.6" />

            {/* Crack pattern - animated */}
            <g className="animate-crack">
              <path d="M32 13 L35 25 L30 30 L36 40" stroke="#2C3E50" strokeWidth="2" fill="none" />
            </g>

            {/* Question mark (what's inside?) */}
            <text x="32" y="55" textAnchor="middle" fill="#FF69B4" fontFamily="'Press Start 2P'" fontSize="12">?</text>
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-pixel text-2xl text-white mb-4 drop-shadow-[3px_3px_0_#FF69B4]">
        TAMAGOTCHI
      </h1>

      {/* Loading bar container */}
      <div className="w-64 h-6 bg-[#2C3E50] border-4 border-black rounded-sm overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-[#FF69B4] via-[#9B59B6] to-[#4A90E2] animate-loading-bar" />
      </div>

      {/* Loading message */}
      <p className="font-pixel text-[10px] text-[#7F8C8D] h-4">
        {LOADING_MESSAGES[messageIndex]}{dots}
      </p>

      {/* Decorative pixels */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-[#FFD700] animate-twinkle" style={{ animationDelay: '0s' }} />
      <div className="absolute top-20 right-20 w-3 h-3 bg-[#FF69B4] animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 left-20 w-3 h-3 bg-[#4A90E2] animate-twinkle" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-10 right-10 w-4 h-4 bg-[#9B59B6] animate-twinkle" style={{ animationDelay: '1.5s' }} />
    </div>
  )
}