'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from './firebase'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAILS = ['okotstephen57@gmail.com', 'vjpilesugbt@gmail.com']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        // Save/update user in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userRef)
          
          if (!userDoc.exists()) {
            // New user, create document
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              isAdmin: ADMIN_EMAILS.includes(currentUser.email || ''),
              created_at: new Date(),
              updated_at: new Date(),
            })
          } else {
            // Existing user, update timestamp
            await setDoc(userRef, {
              updated_at: new Date(),
            }, { merge: true })
          }
        } catch (error) {
          console.error('[v0] Error saving user to Firestore:', error)
        }
        
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email || ''))
      } else {
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
