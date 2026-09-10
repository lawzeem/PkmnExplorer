import PokemonGrid from '@/components/PokemonGrid'

export default function App() {
  return (
    <main className="bg-background min-h-screen">
      <header className="border-b px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Pokemon Explorer</h1>
      </header>
      <PokemonGrid />
    </main>
  )
}
