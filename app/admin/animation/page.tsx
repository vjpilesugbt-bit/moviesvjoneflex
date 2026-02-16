"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sparkles, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Animation {
  id: string
  title: string
  genre: string
  stream_url: string
  rating: number
  year: number
  poster_url: string
}

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"]

export default function ManageAnimation() {
  const [animations, setAnimations] = useState<Animation[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    genre: "Action",
    stream_url: "",
    rating: "7.5",
    year: "2026",
    poster_url: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchAnimations()
  }, [])

  async function fetchAnimations() {
    const { data } = await supabase.from("animations").select("*").order("created_at", { ascending: false })
    if (data) setAnimations(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("animations").insert({
      title: formData.title,
      genre: formData.genre,
      stream_url: formData.stream_url,
      rating: Number.parseFloat(formData.rating),
      year: Number.parseInt(formData.year),
      poster_url: formData.poster_url,
    })

    if (!error) {
      setFormData({
        title: "",
        genre: "Action",
        stream_url: "",
        rating: "7.5",
        year: "2026",
        poster_url: "",
      })
      fetchAnimations()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("animations").delete().eq("id", id)
    fetchAnimations()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          Manage Animations
        </h1>
        <p className="text-muted-foreground">Total: {animations.length} animations</p>
      </div>

      {/* Add Animation Form */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Animation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1">
                Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter animation title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">
                Genre <span className="text-primary">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
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
                placeholder="https://example.com/stream/anime.mp4"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Animation"}
          </button>
        </form>
      </div>

      {/* Animations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {animations.map((item) => (
          <div key={item.id} className="relative group">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              <img
                src={item.poster_url || "/placeholder.svg?height=400&width=280&query=anime poster"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.year} • {item.genre}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
