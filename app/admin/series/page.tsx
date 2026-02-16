'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { Tv, Trash2, Plus } from 'lucide-react'
import { addSeries, deleteSeries } from '@/lib/firebase-utils'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

interface Episode {
  season: number
  episode_number: number
  title: string
  stream_url: string
}

interface Series {
  id: string
  title: string
  category: string
  poster_url: string
  rating: number
  year: number
  episodes?: Episode[]
}

const categories = ['Action', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']

export default function ManageSeries() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(false)
  const [episodes, setEpisodes] = useState<Episode[]>([{ season: 1, episode_number: 1, title: '', stream_url: '' }])
  const [formData, setFormData] = useState({
    title: '',
    category: 'Animation',
    poster_url: '',
    rating: '7.5',
    year: '2026',
  })

  useEffect(() => {
    // Real-time listener for series
    const q = query(collection(db, 'series'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const seriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Series[]
      setSeries(seriesData)
    })

    return () => unsubscribe()
  }, [])

  function addEpisode() {
    const lastEpisode = episodes[episodes.length - 1]
    setEpisodes([...episodes, { season: lastEpisode.season, episode_number: lastEpisode.episode_number + 1, title: '', stream_url: '' }])
  }

  function updateEpisode(index: number, field: keyof Episode, value: string) {
    const updated = [...episodes]
    updated[index][field] = value
    setEpisodes(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const validEpisodes = episodes.filter((ep) => ep.title.trim() !== '')

      await addSeries({
        title: formData.title,
        category: formData.category,
        poster_url: formData.poster_url,
        rating: Number.parseFloat(formData.rating),
        year: Number.parseInt(formData.year),
        episodes: validEpisodes,
      })

      setFormData({
        title: '',
        category: 'Animation',
        poster_url: '',
        rating: '7.5',
        year: '2026',
      })
      setEpisodes([{ season: 1, episode_number: 1, title: '', stream_url: '' }])
    } catch (error) {
      console.error('Error adding series:', error)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    try {
      await deleteSeries(id)
    } catch (error) {
      console.error('Error deleting series:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Tv className="w-8 h-8" />
          Manage Series
        </h1>
        <p className="text-muted-foreground">Total: {series.length} series</p>
      </div>

      {/* Add Series Form */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Series</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1">
                Series Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter series title"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Episodes Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Episodes</label>
            {episodes.map((episode, index) => (
              <div key={index} className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium text-foreground mb-2">Episode {index + 1}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input
                    type="number"
                    placeholder="Season"
                    min="1"
                    value={episode.season}
                    onChange={(e) => updateEpisode(index, 'season' as any, e.target.value)}
                    className="px-3 py-2 bg-card border border-border rounded-md text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Ep Number"
                    min="1"
                    value={episode.episode_number}
                    onChange={(e) => updateEpisode(index, 'episode_number' as any, e.target.value)}
                    className="px-3 py-2 bg-card border border-border rounded-md text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Episode title"
                    value={episode.title}
                    onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                    className="px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground col-span-2"
                  />
                </div>
                <input
                  type="url"
                  placeholder="Stream link URL"
                  value={episode.stream_url}
                  onChange={(e) => updateEpisode(index, 'stream_url', e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addEpisode}
              className="w-full py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Episode
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Series"}
          </button>
        </form>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {series.map((item) => (
          <div key={item.id} className="relative group">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              <img
                src={item.poster_url || "/placeholder.svg?height=400&width=280&query=tv series poster"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.episodes && item.episodes.length > 0 && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                  {item.episodes.length} Eps
                </div>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.year} • {item.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
