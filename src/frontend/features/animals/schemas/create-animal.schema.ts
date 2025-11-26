import { z } from 'zod'

/**
 * Schéma de validation Zod pour la création d'un animal
 */
export const createAnimalSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(20, 'Le nom ne peut pas dépasser 20 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne peut contenir que des lettres, espaces et tirets'),
  typeId: z.string().uuid('Veuillez sélectionner un type d\'animal'),
})

export type CreateAnimalFormData = z.infer<typeof createAnimalSchema>
