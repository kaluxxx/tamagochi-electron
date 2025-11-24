import { createFileRoute } from '@tanstack/react-router'
import { CreateAnimalForm } from '@/features/animals/components/create-animal-form'

export const Route = createFileRoute('/animals/create')({
  component: CreateAnimalComponent,
})

function CreateAnimalComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-pixel text-3xl text-text-primary mb-8 text-center">
          Créer un nouvel animal
        </h1>
        <CreateAnimalForm />
      </div>
    </div>
  )
}
