import { createFileRoute } from '@tanstack/react-router'
import { CreateAnimalForm } from '@/features/animals/components/create-animal-form'

export const Route = createFileRoute('/animals/create')({
  component: CreateAnimalComponent,
})

function CreateAnimalComponent() {
  return <CreateAnimalForm />
}
