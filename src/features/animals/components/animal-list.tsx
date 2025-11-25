import {Link} from '@tanstack/react-router'
import {Button} from '@/shared/components/ui/button'
import {SpriteImage} from '@/shared/components/ui/sprite-image'
import {AnimalCard} from './animal-card'
import type {Animal} from '../types'

interface AnimalListProps {
    animals: Animal[]
    isLoading?: boolean
}

/**
 * Composant principal affichant la liste des animaux
 * Sépare les animaux vivants et morts en deux sections
 */
export function AnimalList({animals, isLoading}: AnimalListProps) {
    // Filtrage des animaux
    const livingAnimals = animals.filter((animal) => animal.isAlive)
    const deadAnimals = animals.filter((animal) => !animal.isAlive)

    // État de chargement
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div
                        className="w-16 h-16 mx-auto border-4 border-primary-pink border-t-transparent rounded-full animate-spin"/>
                    <p className="font-semibold text-text-secondary">
                        Chargement de vos compagnons...
                    </p>
                </div>
            </div>
        )
    }

    // État vide : aucun animal créé
    if (animals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 py-12">
                <SpriteImage
                    src="/sprites/ui/empty-state.svg"
                    alt="Empty State"
                    pixelated
                    className="w-64 h-64"
                />

                <div className="text-center space-y-4">
                    <h2 className="font-pixel text-2xl text-text-primary">
                        Aucun animal créé
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        Commence ton aventure Tamagotchi en créant ton premier compagnon virtuel.
                        <br/>
                        Choisis son type et donne-lui un nom unique !
                    </p>
                </div>

                <Link to="/animals/create">
                    <Button
                        size="lg"
                        className="font-pixel text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        Créer mon premier animal
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-8">
            {/* Section : Animaux vivants */}
            {livingAnimals.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6 pb-3 border-b-4 border-primary-pink">
                        <div className="flex items-center">
                            <h2 className="font-pixel text-2xl text-text-primary inline-block">
                                Compagnons
                            </h2>
                            <span
                                className="ml-3 text-sm font-bold text-text-secondary bg-primary-pink/10 px-3 py-1 rounded-full">
              {livingAnimals.length}
            </span>
                        </div>
                        <Link to="/animals/create">
                            <Button
                                size="lg"
                                className="font-pixel text-base px-6 py-3 ml-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                + Nouveau compagnon
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {livingAnimals.map((animal) => (
                            <AnimalCard
                                key={animal.id}
                                animal={animal}
                                onClick={() => {
                                    // TODO: Navigation vers la page de détail de l'animal (US4)
                                    console.log('Navigate to animal detail:', animal.id)
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Section : Cimetière (animaux morts) */}
            {deadAnimals.length > 0 && (
                <section>
                    <div className="mb-6 pb-3 border-b-4 border-gray-400">
                        <h2 className="font-pixel text-2xl text-gray-600 inline-block">
                            Cimetière
                        </h2>
                        <span className="ml-3 text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {deadAnimals.length}
            </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deadAnimals.map((animal) => (
                            <AnimalCard
                                key={animal.id}
                                animal={animal}
                                onClick={() => {
                                    // TODO: Navigation vers la page de détail de l'animal (US4)
                                    console.log('Navigate to animal detail:', animal.id)
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}