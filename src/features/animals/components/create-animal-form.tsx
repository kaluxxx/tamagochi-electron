import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useAnimalTypes } from '../hooks/use-animal-types'
import { useCreateAnimal } from '../hooks/use-create-animal'
import { createAnimalSchema } from '../schemas/create-animal.schema'
import { SpriteImage } from '@/shared/components/ui/sprite-image'
import { getAnimalSprite } from '@/shared/utils/sprite-loader'
import { cn } from '@/shared/lib/utils'
import type { AnimalType } from '../types'

export function CreateAnimalForm() {
  const { data: animalTypes, isLoading: isLoadingTypes } = useAnimalTypes()
  const { mutate: createAnimal, isPending } = useCreateAnimal()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      name: '',
      typeId: '',
    },
    onSubmit: async ({ value }) => {
      createAnimal(value, {
        onSuccess: () => {
          form.reset()
          navigate({ to: '/' })
        },
      })
    },
  })

  if (isLoadingTypes) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="bg-[#FFF4E6] border-8 border-black p-8 pixel-panel">
          <p className="font-pixel text-black text-sm">CHARGEMENT...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen w-screen overflow-auto relative">
      {/* Background incubateur */}
      <div
        className="fixed inset-0 bg-cover bg-center pixel-scene"
        style={{ backgroundImage: "url('/sprites/ui/incubator.jpg')" }}
      />

      {/* Contenu centré */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-[500px] bg-[#FFF4E6] border-8 border-black p-8 pixel-panel">
          {/* Bouton retour */}
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="mb-4 px-3 py-1.5 bg-gray-200 border-2 border-black font-pixel text-[10px] uppercase hover:bg-gray-300 active:translate-y-0.5 transition-all"
          >
            RETOUR
          </button>

          {/* Header */}
          <div className="border-b-4 border-black pb-4 mb-6">
            <h1 className="text-2xl font-pixel text-black text-center tracking-wider">
              TAMAGOTCHI
            </h1>
            <p className="text-[10px] font-pixel text-black text-center mt-2">
              CREATION
            </p>
          </div>

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
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-pixel text-black tracking-wider">
                    NOM DE TON AMI
                  </label>
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={10}
                    className={cn(
                      'w-full px-4 py-3 bg-white border-4 text-black focus:outline-none font-pixel text-sm placeholder:text-gray-400 uppercase',
                      field.state.meta.errors.length > 0
                        ? 'border-[#FF6B6B]'
                        : 'border-black'
                    )}
                    placeholder="MON AMI"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[#FF6B6B] text-[10px] font-pixel">
                      {field.state.meta.errors[0]?.toString()}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Sélection du type avec sprites */}
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
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-pixel text-black tracking-wider">
                    CHOISIS TON AMI
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {animalTypes?.map((type: AnimalType) => {
                      const isSelected = field.state.value === type.id
                      const sprite = getAnimalSprite(type.name, 'neutral')

                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => field.handleChange(type.id)}
                          className={cn(
                            'p-4 bg-white border-4 transition-all',
                            isSelected
                              ? 'border-[#FFD700] bg-[#FFFACD] scale-105'
                              : 'border-black hover:border-gray-600'
                          )}
                        >
                          <div className="flex justify-center mb-2">
                            <SpriteImage
                              src={sprite}
                              alt={type.displayName}
                              size="xl"
                              pixelated
                              className="w-16 h-16"
                            />
                          </div>
                          <div className="text-[8px] font-pixel uppercase text-black text-center">
                            {type.displayName}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[#FF6B6B] text-[10px] font-pixel">
                      {field.state.meta.errors[0]?.toString()}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#87CEEB] hover:bg-[#5DADE2] text-black font-pixel py-4 text-sm border-4 border-black disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest transition-all active:translate-y-1"
            >
              {isPending ? 'CREATION...' : 'START!'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
