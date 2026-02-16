import { MovieCard } from "./movie-card"

interface Movie {
  id: string
  title: string
  year: number
  genre: string
  rating: number
  poster_url: string
}

interface MovieGridProps {
  movies: Movie[]
  title?: string
}

export function MovieGrid({ movies, title }: MovieGridProps) {
  return (
    <section className="px-4 py-4">
      {title && <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            year={movie.year || 2025}
            genre={movie.genre || "Action"}
            rating={movie.rating || 4}
            posterUrl={movie.poster_url || "/abstract-movie-poster.png"}
          />
        ))}
      </div>
    </section>
  )
}
