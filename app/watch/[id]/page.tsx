'use client'

import { GoogleDrivePlayer } from '@/components/google-drive-player'
import { SubscriptionWall } from '@/components/subscription-wall'
import { Star, ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { checkSubscriptionStatus } from '@/lib/subscription-utils'

interface Movie {
  id: string
  title: string
  year: number
  category?: string
  rating: number
  poster_url: string
  stream_url: string
  description?: string
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [movieId, setMovieId] = useState<string | null>(null)
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(true)
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  // Handle params which might be a Promise
  useEffect(() => {
    const getParams = async () => {
      if (params instanceof Promise) {
        const resolvedParams = await params
        setMovieId(resolvedParams.id)
      } else {
        setMovieId(params.id)
      }
    }
    getParams()
  }, [params])

  // Fetch movie once we have the ID
  useEffect(() => {
    if (!movieId) return

    const fetchMovie = async () => {
      try {
        console.log('[v0] Fetching movie with ID:', movieId)
        // Fetch movie from Firebase
        const docRef = doc(db, 'movies', movieId)
        const docSnap = await getDoc(docRef)

        console.log('[v0] Document exists:', docSnap.exists())

        if (docSnap.exists()) {
          const movieData = { id: docSnap.id, ...docSnap.data() } as Movie
          console.log('[v0] Movie data:', movieData)
          setMovie(movieData)

          // Fetch related movies by category
          const category = movieData.category
          if (category) {
            const q = query(
              collection(db, 'movies'),
              where('category', '==', category)
            )
            const querySnapshot = await getDocs(q)
            const related = querySnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as Movie))
              .filter((m) => m.id !== movieId)
              .slice(0, 6)
            setRelatedMovies(related)
          }
        } else {
          console.log('[v0] Movie document not found for ID:', movieId)
        }
      } catch (error) {
        console.error('[v0] Error fetching movie:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [movieId])

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        // Not logged in - allow preview but can show subscription wall if needed
        setHasSubscription(false)
        setCheckingSubscription(false)
        return
      }

      try {
        const { isActive } = await checkSubscriptionStatus(user.uid)
        setHasSubscription(isActive)
      } catch (error) {
        console.error('[v0] Error checking subscription:', error)
        setHasSubscription(false)
      } finally {
        setCheckingSubscription(false)
      }
    }

    checkSubscription()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Movie not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  const stars = Math.round(movie.rating || 4)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-foreground truncate">{movie.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Video Player - Responsive */}
      <div className="w-full bg-black">
        <div className="mx-auto max-w-full md:max-w-4xl px-2 sm:px-4 py-2 sm:py-4 relative">
          {movie.stream_url && (
            <>
              <GoogleDrivePlayer
                videoUrl={movie.stream_url}
                title={movie.title}
              />
              {!hasSubscription && !checkingSubscription && (
                <SubscriptionWall contentTitle={movie.title} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Movie Info */}
      <div className="w-full mx-auto px-2 sm:px-4 py-6 max-w-full md:max-w-4xl md:mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden">
              <Image
                src={movie.poster_url || '/placeholder.svg?height=240&width=160'}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{movie.title}</h2>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">{movie.year}</span>
              {movie.category && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                  {movie.category}
                </span>
              )}
            </div>

            {movie.description && (
              <p className="text-muted-foreground text-sm mb-4">{movie.description}</p>
            )}

            {movie.stream_url && (
              <a
                href={movie.stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-foreground mb-4">More {movie.category} Movies</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {relatedMovies.map((related) => (
                <Link key={related.id} href={`/watch/${related.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={related.poster_url || '/placeholder.svg?height=300&width=200'}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h4 className="mt-2 text-xs text-foreground truncate group-hover:text-primary">
                    {related.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
