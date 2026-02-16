"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

type Movie = {
  id: string
  title: string
  rating: number
  poster_url: string
}

const defaultTopRated = [
  { id: "1", title: "Frankenstein", rating: 7.5, poster_url: "/frankenstein-horror-movie.jpg" },
  { id: "2", title: "Spectral", rating: 8.0, poster_url: "/spectral-ghost-horror-movie.jpg" },
]

const genres = [
  { name: "Action", count: 104, image: "/action-movie-genre.jpg" },
  { name: "Animation", count: 52, image: "/animation-movie-genre.jpg" },
  { name: "Drama", count: 78, image: "/drama-movie-genre.jpg" },
  { name: "Horror", count: 31, image: "/horror-movie-genre.jpg" },
]

export function RightSidebar() {
  const [topRated, setTopRated] = useState<Movie[]>(defaultTopRated)
  const [genreCounts, setGenreCounts] = useState(genres)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchTopRated() {
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, rating, poster_url")
        .order("rating", { ascending: false })
        .limit(4)

      if (!error && data && data.length > 0) {
        setTopRated(data)
      }
    }

    async function fetchGenreCounts() {
      const { data, error } = await supabase.from("movies").select("genre")

      if (!error && data) {
        const counts: Record<string, number> = {}
        data.forEach((m: { genre: string }) => {
          const g = m.genre || "Other"
          counts[g] = (counts[g] || 0) + 1
        })

        setGenreCounts((prev) =>
          prev.map((genre) => ({
            ...genre,
            count: counts[genre.name] || genre.count,
          })),
        )
      }
    }

    fetchTopRated()
    fetchGenreCounts()
  }, [supabase])

  return (
    null
  )
}
