import { useForm } from '@tanstack/react-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { AnimalTypeSelector } from './animal-type-selector'
import { useAnimalTypes } from '../hooks/use-animal-types'
import { useCreateAnimal } from '../hooks/use-create-animal'
import { createAnimalSchema } from '../schemas/create-animal.schema'

export function CreateAnimalForm() {
  const { data: animalTypes, isLoading: isLoadingTypes } = useAnimalTypes()
  const { mutate: createAnimal, isPending } = useCreateAnimal()

  const form = useForm({
    defaultValues: {
      name: '',
      typeId: '',
    },
    onSubmit: async ({ value }) => {
      createAnimal(value, {
        onSuccess: () => {
          // Réinitialiser le formulaire après succès
          form.reset()
        },
      })
    },
  })

  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="font-sans text-text-secondary">Chargement...</p>
      </div>
    )
  }

  return (
    <Card className="border-4 border-primary-pink shadow-xl">
      <CardHeader>
        <CardTitle className="font-pixel text-xl text-center text-primary-pink">
          Nouveau compagnon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Champ Nom */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = createAnimalSchema.shape.name.safeParse(value)
                if (!result.success) {
                  return result.error.errors[0]?.message
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-semibold">
                  Nom de l'animal
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ex: Fluffy"
                  className={field.state.meta.errors.length > 0 ? 'border-danger-red' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-danger-red text-sm font-semibold">
                    {field.state.meta.errors[0]?.toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Sélection du type */}
          <form.Field
            name="typeId"
            validators={{
              onChange: ({ value }) => {
                const result = createAnimalSchema.shape.typeId.safeParse(value)
                if (!result.success) {
                  return result.error.errors[0]?.message
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <AnimalTypeSelector
                animalTypes={animalTypes || []}
                selectedTypeId={field.state.value}
                onSelectType={field.handleChange}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>

          {/* Bouton de soumission */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="min-w-[200px]"
            >
              {isPending ? 'Création...' : 'Créer mon animal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
