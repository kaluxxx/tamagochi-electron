/**
 * Sprite Loader Utility
 *
 * Provides helper functions to load sprite paths consistently across the application.
 * All sprites are stored in public/sprites/ directory.
 */

export type MoodType = 'happy' | 'sad' | 'hungry' | 'sleeping' | 'neutral'
export type ItemType = 'food' | 'toy' | 'medicine'
export type StatType = 'hunger' | 'happiness' | 'health' | 'energy'
export type ActionType = 'feed' | 'play' | 'heal' | 'sleep'

/**
 * Get the sprite path for an animal based on type and mood
 * @param animalType - The animal type (cat, dog, alien)
 * @param mood - The current mood state
 * @returns Path to the sprite image
 */
export const getAnimalSprite = (animalType: string, mood: MoodType): string => {
  return `/sprites/animals/${animalType}/${mood}.svg`
}

/**
 * Get the sprite path for an item
 * @param itemType - The category of item (food, toy, medicine)
 * @param itemName - The specific item name
 * @returns Path to the sprite image
 */
export const getItemSprite = (itemType: ItemType, itemName: string): string => {
  return `/sprites/items/${itemType}/${itemName}.svg`
}

/**
 * Get the sprite path for an action button
 * @param actionType - The type of action
 * @returns Path to the sprite image
 */
export const getActionSprite = (actionType: ActionType): string => {
  return `/sprites/actions/${actionType}.svg`
}

/**
 * Get the sprite path for a stat icon
 * @param statType - The type of stat
 * @returns Path to the sprite image
 */
export const getStatSprite = (statType: StatType): string => {
  return `/sprites/stats/${statType}.svg`
}

/**
 * Get the sprite path for UI elements
 * @param uiElement - The UI element name
 * @returns Path to the sprite image
 */
export const getUISprite = (uiElement: string): string => {
  return `/sprites/ui/${uiElement}.svg`
}

/**
 * Calculate the mood of an animal based on its stats
 * @param stats - The animal's current stats
 * @returns The appropriate mood type
 */
export const calculateMood = (stats: {
  hunger: number
  happiness: number
  energy: number
  health: number
}): MoodType => {
  const { hunger, happiness, energy } = stats

  // Priority: sleeping > hungry > sad > happy > neutral
  if (energy < 30) return 'sleeping'
  if (hunger < 30) return 'hungry'
  if (happiness < 30) return 'sad'
  if (happiness > 60 && hunger > 60) return 'happy'

  return 'neutral'
}

/**
 * Preload sprites to improve performance
 * @param spritePaths - Array of sprite paths to preload
 */
export const preloadSprites = (spritePaths: string[]): void => {
  if (typeof window === 'undefined') return

  spritePaths.forEach(path => {
    const img = new window.Image()
    img.src = path
  })
}

/**
 * Get all animal sprites for a specific type (for preloading)
 * @param animalType - The animal type
 * @returns Array of all sprite paths for that animal
 */
export const getAllAnimalSprites = (animalType: string): string[] => {
  const moods: MoodType[] = ['happy', 'sad', 'hungry', 'sleeping', 'neutral']
  return moods.map(mood => getAnimalSprite(animalType, mood))
}
