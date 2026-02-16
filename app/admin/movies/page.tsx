'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { Film, Trash2, TrendingUp } from 'lucide-react'
import {
  addMovie,
  getMovies,
  deleteMovie,
  updateMovie,
} from '@/lib/firebase-utils'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

interface Movie {
  id: string
  title: string
  category: string
  stream_url: string
  rating: number
  year: number
  poster_url: string
  is_trending?: boolean
}

const categories = ['Action', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']

export default function ManageMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Animation',
    stream_url: '',
    rating: '7.5',
    year: '2026',
    poster_url: '',
    is_trending: false,
  })

  useEffect(() => {
    // Real-time listener for movies
    const q = query(collection(db, 'movies'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moviesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Movie[]
      setMovies(moviesData)
    })

    return () => unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await addMovie({
        title: formData.title,
        category: formData.category,
        stream_url: formData.stream_url,
        rating: Number.parseFloat(formData.rating),
        year: Number.parseInt(formData.year),
        poster_url: formData.poster_url,
        is_trending: formData.is_trending,
      })

      setFormData({
        title: '',
        category: 'Animation',
        stream_url: '',
        rating: '7.5',
        year: '2026',
        poster_url: '',
        is_trending: false,
      })
    } catch (error) {
      console.error('Error adding movie:', error)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    try {
      await deleteMovie(id)
    } catch (error) {
      console.error('Error deleting movie:', error)
    }
  }

  async function toggleTrending(id: string, currentTrending: boolean) {
    try {
      await updateMovie(id, { is_trending: !currentTrending })
    } catch (error) {
      console.error('Error updating movie:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Film className="w-8 h-8" />
          Manage Movies
        </h1>
        <p className="text-muted-foreground">Total: {movies.length} movies</p>
      </div>

      {/* Add Movie Form */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1">
                Movie Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter movie title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">
                Category <span className="text-primary">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">
                Stream Link <span className="text-primary">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/stream/movie.mp4"
                value={formData.stream_url}
                onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1">Rating (0-10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="7.5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">Year</label>
              <input
                type="number"
                placeholder="2026"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">
                Poster Image URL <span className="text-primary">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trending"
              checked={formData.is_trending}
              onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="trending" className="text-sm text-foreground">
              Mark as Trending
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Movie"}
          </button>
        </form>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="relative group">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              <img
                src={movie.poster_url || "/placeholder.svg?height=400&width=280&query=movie poster"}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {movie.is_trending && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </div>
              )}
              <button
                onClick={() => handleDelete(movie.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground truncate">{movie.title}</p>
            <p className="text-xs text-muted-foreground">
              {movie.year} • {movie.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
