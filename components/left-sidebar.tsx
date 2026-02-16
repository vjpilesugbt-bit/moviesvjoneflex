'use client'

import { Home, Film, Tv, Flag, Music, Star, CreditCard, Shield, Sun, Moon, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useAuth } from '@/lib/auth-context'

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Tv, label: 'Series', href: '/series' },
  { icon: Flag, label: 'Nigerian', href: '/nigerian' },
  { icon: Music, label: 'Music', href: '/music' },
  { icon: Star, label: 'Top Rated', href: '/top-rated' },
  { icon: CreditCard, label: 'Subscription', href: '/subscription' },
  { icon: Shield, label: 'Admin Panel', href: '/admin' },
]

export function LeftSidebar({ onLoginClick }: { onLoginClick?: () => void }) {
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <aside className="w-40 bg-sidebar flex flex-col h-screen sticky top-0 border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-primary font-bold text-sm text-center">VJ ONEFLEX</h1>
      </div>

      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Hide admin panel if not admin
            if (item.href === '/admin' && !isAdmin) {
              return null
            }
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 w-full transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}
