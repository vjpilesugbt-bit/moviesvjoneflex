'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { LeftSidebar } from '@/components/left-sidebar'
import { RightSidebar } from '@/components/right-sidebar'
import { HeroCarousel } from '@/components/hero-carousel'
import { MovieGrid } from '@/components/movie-grid'
import { LoginModal } from '@/components/login-modal'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

interface Movie {
  id: string
  title: string
  year: number
  category?: string
  genre?: string
  rating: number
  poster_url: string
  stream_url?: string
  is_trending?: boolean
}

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Real-time listener for movies from Firebase
    const q = query(collection(db, 'movies'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const moviesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Movie[]
        setMovies(moviesData)
        setLoading(false)
      },
      (error) => {
        console.error('[v0] Error fetching movies:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar onLoginClick={() => setIsLoginModalOpen(true)} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex-1 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 overflow-y-auto">
            <HeroCarousel movies={movies} />
            <MovieGrid movies={movies} title="Popular on VJ Oneflex" />
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            )}
            {!loading && movies.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No movies available. Check back soon!</p>
              </div>
            )}
          </div>
        </main>

        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}
