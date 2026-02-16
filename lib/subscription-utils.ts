import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export interface SubscriptionData {
  uid: string
  email: string
  planId: string
  planName: string
  amount: number
  phoneNumber: string
  currency: string
  status: 'active' | 'expired' | 'pending'
  startDate: any
  expiryDate: any
  isActive: boolean
  updated_at: any
}

export async function checkSubscriptionStatus(uid: string): Promise<{
  isActive: boolean
  subscription: SubscriptionData | null
  daysRemaining: number
}> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', uid)
    const subscriptionSnap = await getDoc(subscriptionRef)

    if (!subscriptionSnap.exists()) {
      return {
        isActive: false,
        subscription: null,
        daysRemaining: 0,
      }
    }

    const subscription = subscriptionSnap.data() as SubscriptionData

    // Check if subscription has expired
    const expiryDate = subscription.expiryDate?.toDate?.() || new Date(subscription.expiryDate)
    const now = new Date()

    if (now > expiryDate) {
      // Mark as expired
      return {
        isActive: false,
        subscription: subscription,
        daysRemaining: 0,
      }
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      isActive: subscription.isActive && subscription.status === 'active',
      subscription: subscription,
      daysRemaining: Math.max(0, daysRemaining),
    }
  } catch (error) {
    console.error('[v0] Error checking subscription:', error)
    return {
      isActive: false,
      subscription: null,
      daysRemaining: 0,
    }
  }
}

export async function getUserSubscription(uid: string): Promise<SubscriptionData | null> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', uid)
    const subscriptionSnap = await getDoc(subscriptionRef)

    if (subscriptionSnap.exists()) {
      return subscriptionSnap.data() as SubscriptionData
    }
    return null
  } catch (error) {
    console.error('[v0] Error fetching subscription:', error)
    return null
  }
}

export function formatRemainingTime(daysRemaining: number): string {
  if (daysRemaining === 0) return 'Expired'
  if (daysRemaining === 1) return '1 day remaining'
  if (daysRemaining < 7) return `${daysRemaining} days remaining`
  const weeks = Math.floor(daysRemaining / 7)
  const days = daysRemaining % 7
  if (days === 0) return `${weeks} week${weeks > 1 ? 's' : ''} remaining`
  return `${weeks}w ${days}d remaining`
}
