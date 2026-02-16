'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, ImageIcon, Film, Tv, Star, Sparkles, Music, Wallet, LogOut, Home } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: ImageIcon, label: 'Carousel', href: '/admin/carousel' },
  { icon: Film, label: 'Movies', href: '/admin/movies' },
  { icon: Tv, label: 'Series', href: '/admin/series' },
  { icon: Star, label: 'Originals', href: '/admin/originals' },
  { icon: Sparkles, label: 'Animation', href: '/admin/animation' },
  { icon: Music, label: 'Music', href: '/admin/music' },
  { icon: Wallet, label: 'Wallet', href: '/admin/wallet' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        setIsAuthorized(true)
      } else if (!user) {
        router.push('/')
      }
    }
  }, [user, isAdmin, loading, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access the admin panel.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-2 overflow-x-auto">
          <div className="flex items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-4 py-3 min-w-[80px] transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center px-4 py-3 min-w-[80px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  )
}
