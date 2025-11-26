/**
 * Zod validation schemas for IPC inputs
 * All IPC handlers should validate inputs using these schemas
 */

import { z } from 'zod'
import { ValidationError } from './errors'

// ============== Common Schemas ==============

export const idSchema = z.string().min(1, 'ID is required')

export const positiveIntSchema = z.number().int().positive()

export const nonNegativeIntSchema = z.number().int().nonnegative()

// ============== Animal Schemas ==============

export const createAnimalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  typeId: z.string().min(1, 'Type ID is required')
})

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>

// ============== Economy Schemas ==============

export const addCoinsSchema = z.object({
  amount: positiveIntSchema
})

export type AddCoinsInput = z.infer<typeof addCoinsSchema>

export const purchaseItemSchema = z.object({
  itemId: idSchema,
  quantity: positiveIntSchema
})

export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>

// ============== Item Usage Schemas ==============

export const useItemSchema = z.object({
  animalId: idSchema,
  itemId: idSchema
})

export type UseItemInput = z.infer<typeof useItemSchema>

// ============== Minigame Schemas ==============

export const saveScoreSchema = z.object({
  gameType: z.string().min(1, 'Game type is required'),
  score: nonNegativeIntSchema,
  coinsEarned: nonNegativeIntSchema
})

export type SaveScoreInput = z.infer<typeof saveScoreSchema>

// ============== Clicker Upgrade Schemas ==============

export const clickerUpgradeTypeSchema = z.enum([
  'multiplier',
  'time_bonus',
  'auto_clicker'
])

export type ClickerUpgradeType = z.infer<typeof clickerUpgradeTypeSchema>

export const purchaseClickerUpgradeSchema = z.object({
  type: clickerUpgradeTypeSchema
})

export type PurchaseClickerUpgradeInput = z.infer<typeof purchaseClickerUpgradeSchema>

// ============== Fishing Schemas ==============

export const fishingUpgradeTypeSchema = z.enum([
  'luck',
  'reflexes',
  'value',
  'bait_efficiency'
])

export type FishingUpgradeType = z.infer<typeof fishingUpgradeTypeSchema>

export const selectRandomFishSchema = z.object({
  locationId: idSchema,
  baitId: idSchema.optional()
})

export type SelectRandomFishInput = z.infer<typeof selectRandomFishSchema>

export const catchFishSchema = z.object({
  speciesId: idSchema,
  size: z.number().positive(),
  locationId: idSchema,
  rodId: idSchema,
  baitId: idSchema.optional()
})

export type CatchFishInput = z.infer<typeof catchFishSchema>

export const purchaseRodSchema = z.object({
  rodId: idSchema
})

export type PurchaseRodInput = z.infer<typeof purchaseRodSchema>

export const equipRodSchema = z.object({
  rodId: idSchema
})

export type EquipRodInput = z.infer<typeof equipRodSchema>

export const purchaseBaitSchema = z.object({
  baitId: idSchema,
  quantity: positiveIntSchema
})

export type PurchaseBaitInput = z.infer<typeof purchaseBaitSchema>

export const unlockLocationSchema = z.object({
  locationId: idSchema
})

export type UnlockLocationInput = z.infer<typeof unlockLocationSchema>

export const purchaseFishingUpgradeSchema = z.object({
  type: fishingUpgradeTypeSchema
})

export type PurchaseFishingUpgradeInput = z.infer<typeof purchaseFishingUpgradeSchema>

// ============== History Schemas ==============

export const getHistorySchema = z.object({
  animalId: idSchema,
  limit: positiveIntSchema.optional()
})

export type GetHistoryInput = z.infer<typeof getHistorySchema>

// ============== Validation Helper ==============

/**
 * Validates input against a Zod schema
 * @throws ValidationError if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const details: Record<string, string[]> = {}

    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root'
      if (!details[path]) {
        details[path] = []
      }
      details[path].push(issue.message)
    }

    throw new ValidationError('Validation failed', details)
  }

  return result.data
}
