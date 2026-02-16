'use client'

import { GoogleDrivePlayer } from '@/components/google-drive-player'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface Episode {
  episode_number: number
  title: string
  stream_url: string
  season: number
}

interface Series {
  id: string
  title: string
  year: number
  category?: string
  rating: number
  poster_url: string
  episodes?: Episode[]
  description?: string
}

export default function WatchSeriesPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [series, setSeries] = useState<Series | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const docRef = doc(db, 'series', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Series
          setSeries(data)
          // Select first episode by default
          if (data.episodes && data.episodes.length > 0) {
            setSelectedEpisode(data.episodes[0])
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Series not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  // Group episodes by season
  const episodesBySeason = new Map<number, Episode[]>()
  series.episodes?.forEach((ep) => {
    const season = ep.season || 1
    if (!episodesBySeason.has(season)) {
      episodesBySeason.set(season, [])
    }
    episodesBySeason.get(season)!.push(ep)
  })

  const seasons = Array.from(episodesBySeason.keys()).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground truncate">{series.title}</h1>
        </div>
      </header>

      {/* Player and Episodes */}
      <div className="w-full mx-auto px-2 sm:px-4 py-6">
        {/* Video Player - Responsive */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 max-w-full md:max-w-4xl md:mx-auto">
          {selectedEpisode && selectedEpisode.stream_url ? (
            <GoogleDrivePlayer
              videoUrl={selectedEpisode.stream_url}
              title={`${series.title} - Season ${selectedEpisode.season} Episode ${selectedEpisode.episode_number}`}
            />
          ) : (
            <div className="w-full bg-black aspect-video flex items-center justify-center">
              <p className="text-muted-foreground">No episode selected</p>
            </div>
          )}
        </div>

        {/* Episodes Grid */}
        {seasons.length > 0 && (
          <div className="max-w-full md:max-w-4xl md:mx-auto">
            {seasons.map((season) => {
              const seasonEpisodes = episodesBySeason.get(season) || []
              return (
                <div key={season} className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">Season {season}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {seasonEpisodes
                      .sort((a, b) => a.episode_number - b.episode_number)
                      .map((episode) => (
                        <button
                          key={`${episode.season}-${episode.episode_number}`}
                          onClick={() => setSelectedEpisode(episode)}
                          className={`p-3 rounded-lg transition-all text-center text-sm font-medium truncate ${
                            selectedEpisode?.episode_number === episode.episode_number &&
                            selectedEpisode?.season === episode.season
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title={episode.title}
                        >
                          <div className="font-bold">EP {episode.episode_number}</div>
                          <div className="text-xs mt-1 truncate">{episode.title}</div>
                        </button>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(!series.episodes || series.episodes.length === 0) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No episodes available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
