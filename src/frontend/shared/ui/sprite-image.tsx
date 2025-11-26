/**
 * SpriteImage Component
 *
 * Displays pixel art sprites with proper rendering settings.
 * Ensures crisp pixel art rendering without blur.
 */

import { ImgHTMLAttributes, useState, useEffect } from 'react'

interface SpriteImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Path to the sprite image */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Size preset for the sprite */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Whether to use crisp pixel rendering (default: true) */
  pixelated?: boolean
  /** Fallback image or emoji to show if sprite fails to load */
  fallback?: string
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  xs: 'w-4 h-4',      // 16px
  sm: 'w-8 h-8',      // 32px
  md: 'w-12 h-12',    // 48px
  lg: 'w-16 h-16',    // 64px
  xl: 'w-24 h-24',    // 96px
  '2xl': 'w-32 h-32', // 128px
}

/**
 * SpriteImage component for rendering pixel art sprites
 * Automatically applies image-rendering: pixelated for crisp pixels
 */
export function SpriteImage({
  src,
  alt,
  size = 'md',
  pixelated = true,
  fallback,
  className = '',
  ...props
}: SpriteImageProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    console.warn(`Failed to load sprite: ${src}`)
    setImageError(true)
  }

  // If image failed to load and we have a fallback
  if (imageError && fallback) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          text-2xl
          ${className}
        `}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleImageError}
      className={`
        ${sizeClasses[size]}
        ${pixelated ? 'image-pixelated' : 'image-smooth'}
        ${className}
      `}
      draggable={false}
      {...props}
    />
  )
}

/**
 * AnimatedSprite component for sprites with multiple frames
 * Useful for idle animations, walking, etc.
 */
interface AnimatedSpriteProps extends Omit<SpriteImageProps, 'src'> {
  /** Array of sprite frame paths */
  frames: string[]
  /** Frame duration in milliseconds */
  frameDuration?: number
  /** Whether the animation should loop */
  loop?: boolean
}

export function AnimatedSprite({
  frames,
  frameDuration = 200,
  loop = true,
  alt,
  size = 'md',
  pixelated,
  className = '',
  ...props
}: AnimatedSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0)

  // Simple frame animation
  useEffect(() => {
    if (frames.length <= 1) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const next = prev + 1
        if (next >= frames.length) {
          return loop ? 0 : prev
        }
        return next
      })
    }, frameDuration)

    return () => clearInterval(interval)
  }, [frames.length, frameDuration, loop])

  const currentSrc = frames[currentFrame] || frames[0]

  return (
    <SpriteImage
      src={currentSrc}
      alt={alt}
      size={size}
      pixelated={pixelated}
      className={className}
      {...props}
    />
  )
}
