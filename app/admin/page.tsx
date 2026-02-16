"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Film, Tv, Star, Music, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  users: number
  movies: number
  series: number
  originals: number
  music: number
  carousel: number
}

const quickActions = [
  {
    icon: Film,
    label: "Manage Movies",
    description: "Add, edit, or delete movies",
    href: "/admin/movies",
    color: "text-red-500",
  },
  {
    icon: Tv,
    label: "Manage Series",
    description: "Add series with episodes",
    href: "/admin/series",
    color: "text-green-500",
  },
  {
    icon: Star,
    label: "Manage Originals",
    description: "Upload exclusive content",
    href: "/admin/originals",
    color: "text-yellow-500",
  },
  {
    icon: Music,
    label: "Manage Music",
    description: "Upload music videos",
    href: "/admin/music",
    color: "text-pink-500",
  },
  {
    icon: ImageIcon,
    label: "Manage Carousel",
    description: "Update featured banners",
    href: "/admin/carousel",
    color: "text-blue-500",
  },
  {
    icon: Users,
    label: "Manage Users",
    description: "View user activity",
    href: "/admin/users",
    color: "text-cyan-500",
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    movies: 0,
    series: 0,
    originals: 0,
    music: 0,
    carousel: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, moviesRes, seriesRes, originalsRes, musicRes, carouselRes] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("movies").select("*", { count: "exact", head: true }),
        supabase.from("series").select("*", { count: "exact", head: true }),
        supabase.from("originals").select("*", { count: "exact", head: true }),
        supabase.from("music_videos").select("*", { count: "exact", head: true }),
        supabase.from("carousel").select("*", { count: "exact", head: true }),
      ])

      setStats({
        users: usersRes.count || 0,
        movies: moviesRes.count || 0,
        series: seriesRes.count || 0,
        originals: originalsRes.count || 0,
        music: musicRes.count || 0,
        carousel: carouselRes.count || 0,
      })
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.users, color: "text-cyan-500" },
    { icon: Film, label: "Total Movies", value: stats.movies, color: "text-red-500" },
    { icon: Tv, label: "Total Series", value: stats.series, color: "text-green-500" },
    { icon: Star, label: "Total Originals", value: stats.originals, color: "text-yellow-500" },
    { icon: Music, label: "Music Videos", value: stats.music, color: "text-pink-500" },
    { icon: ImageIcon, label: "Carousel Items", value: stats.carousel, color: "text-blue-500" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, admin@example.com</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-4 border border-border">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <action.icon className={`w-8 h-8 ${action.color}`} />
              <div>
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
