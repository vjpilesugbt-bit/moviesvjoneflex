import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  id: string
  title: string
  year: number
  genre: string
  rating: number
  posterUrl: string
}

export function MovieCard({ id, title, year, genre, rating, posterUrl }: MovieCardProps) {
  const stars = Math.round(rating)

  return (
    <Link href={`/watch/${id}`} className="group relative block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {/* Rating stars */}
        <div className="absolute top-2 left-2 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
          ))}
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">{year}</span>
              <span className="text-xs text-white">{genre}</span>
            </div>
            <button className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Watch
            </button>
          </div>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium text-foreground truncate">{title}</h3>
    </Link>
  )
}
