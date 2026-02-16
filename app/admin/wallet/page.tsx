'use client'

import { Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore'

interface Subscription {
  uid: string
  email: string
  planName: string
  amount: number
  currency: string
  status: string
  startDate: any
  expiryDate: any
  isActive: boolean
}

interface UserData {
  uid: string
  email: string
  displayName?: string
  subscriptionStatus?: string
  subscriptionPlan?: string
  subscriptionExpiryDate?: any
}

export default function ManageWallet() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [userData, setUserData] = useState<Map<string, UserData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    activeSubscriptions: 0,
    users: 0,
  })

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersMap = new Map()
      usersSnapshot.forEach((doc) => {
        usersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserData)
      })
      setUserData(usersMap)
    }

    // Fetch subscriptions in real-time
    const q = query(collection(db, 'subscriptions'), orderBy('startDate', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const subsData = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Subscription[]

        setSubscriptions(subsData)

        // Calculate stats
        let totalRevenue = 0
        let thisMonth = 0
        let activeCount = 0
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        subsData.forEach((sub) => {
          totalRevenue += sub.amount || 0

          const subDate = sub.startDate?.toDate?.() || new Date(sub.startDate)
          if (
            subDate.getMonth() === currentMonth &&
            subDate.getFullYear() === currentYear
          ) {
            thisMonth += sub.amount || 0
          }

          if (sub.isActive) {
            activeCount += 1
          }
        })

        setStats({
          totalRevenue,
          thisMonth,
          activeSubscriptions: activeCount,
          users: userData.size,
        })

        setLoading(false)
      },
      (error) => {
        console.error('[v0] Error fetching subscriptions:', error)
        setLoading(false)
      }
    )

    fetchUsers()
    return () => unsubscribe()
  }, [userData.size])

  const formatDate = (date: any) => {
    if (!date) return '-'
    const d = date?.toDate?.() || new Date(date)
    return d.toLocaleDateString('en-UG')
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-UG', { style: 'currency', currency: 'UGX' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-8 h-8" />
          Wallet & Subscriptions
        </h1>
        <p className="text-muted-foreground">Real-time user subscriptions and revenue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <DollarSign className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.thisMonth)}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <CreditCard className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.activeSubscriptions}</p>
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <User className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{userData.size}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Active Subscriptions</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No subscriptions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-foreground">User Email</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Plan</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Start Date</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Expiry Date</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const user = userData.get(sub.uid)
                  const isExpired = sub.expiryDate?.toDate?.()
                    ? new Date() > sub.expiryDate.toDate()
                    : false

                  return (
                    <tr key={sub.uid} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm text-foreground">{user?.email || sub.email}</td>
                      <td className="p-4 text-sm text-foreground font-medium">{sub.planName}</td>
                      <td className="p-4 text-sm font-medium text-green-500">
                        {formatCurrency(sub.amount)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.startDate)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.expiryDate)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isExpired
                              ? 'bg-red-500/20 text-red-500'
                              : sub.isActive
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {isExpired ? 'Expired' : sub.isActive ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
