'use client'

import { useEffect, useState } from 'react'
import { Users, Trash2, Shield, ShieldOff } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'

interface User {
  id: string
  uid: string
  email: string
  displayName?: string | null
  isAdmin?: boolean
  created_at: any
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // Real-time listener for users
    const q = query(collection(db, 'users'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)
    })

    return () => unsubscribe()
  }, [])

  async function toggleAdmin(id: string, currentStatus: boolean) {
    try {
      await updateDoc(doc(db, 'users', id), {
        isAdmin: !currentStatus,
      })
    } catch (error) {
      console.error('Error updating admin status:', error)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, 'users', id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-8 h-8" />
          Manage Users
        </h1>
        <p className="text-muted-foreground">Total: {users.length} users</p>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-foreground">Email</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Username</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Role</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Joined</th>
              <th className="text-right p-4 text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="p-4 text-sm text-foreground">{user.email}</td>
                <td className="p-4 text-sm text-muted-foreground">{user.displayName || '-'}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{user.created_at?.toDate?.()?.toLocaleDateString?.() || '-'}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleAdmin(user.id, user.isAdmin || false)}
                      className={`p-2 rounded transition-colors ${
                        user.isAdmin
                          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      }`}
                      title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
