'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedPlanId?: string | null
}

const PLANS = [
  {
    id: 'one-day',
    name: '1 Day',
    price: 3000,
    duration: '24 hours',
    popular: false,
  },
  {
    id: 'two-days',
    name: '2 Days',
    price: 5000,
    duration: '48 hours',
    popular: true,
  },
  {
    id: 'one-week',
    name: '1 Week',
    price: 10000,
    duration: '7 days',
    popular: false,
  },
]

export function SubscriptionModal({ isOpen, onClose, preselectedPlanId }: SubscriptionModalProps) {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(preselectedPlanId || null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setError('')
    setSuccessMessage('')
  }

  const handlePayment = async () => {
    if (!selectedPlan || !phoneNumber.trim()) {
      setError('Please select a plan and enter your phone number')
      return
    }

    if (!user) {
      setError('Please sign in to subscribe')
      return
    }

    if (!/^(\+?256|0)?[0-9]{9}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid Uganda phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan)
      if (!plan) throw new Error('Invalid plan selected')

      // Calculate expiry date
      const expiryDate = new Date()
      if (selectedPlan === 'one-day') {
        expiryDate.setDate(expiryDate.getDate() + 1)
      } else if (selectedPlan === 'two-days') {
        expiryDate.setDate(expiryDate.getDate() + 2)
      } else if (selectedPlan === 'one-week') {
        expiryDate.setDate(expiryDate.getDate() + 7)
      }

      // In production, integrate with actual payment processor (MTN, Airtel, etc)
      // For now, we'll simulate the payment and save to Firebase
      
      // Create subscription record in Firebase
      const subscriptionRef = doc(db, 'subscriptions', user.uid)
      
      await setDoc(subscriptionRef, {
        uid: user.uid,
        email: user.email,
        planId: selectedPlan,
        planName: plan.name,
        amount: plan.price,
        phoneNumber: phoneNumber,
        currency: 'UGX',
        status: 'active',
        startDate: new Date(),
        expiryDate: expiryDate,
        isActive: true,
        updated_at: new Date(),
      }, { merge: true })

      // Also update user document with subscription status
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        await setDoc(userRef, {
          subscriptionStatus: 'active',
          subscriptionExpiryDate: expiryDate,
          subscriptionPlan: selectedPlan,
          updated_at: new Date(),
        }, { merge: true })
      }

      setSuccessMessage(
        `Payment successful! Your ${plan.name} subscription is now active until ${expiryDate.toLocaleDateString()}`
      )
      
      // Clear form
      setSelectedPlan(null)
      setPhoneNumber('')

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose()
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      console.error('[v0] Subscription error:', err)
      setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">VJ Oneflex Premium</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* If no plan selected - show plans */}
        {!selectedPlan ? (
          <>
            <div className="space-y-3 mb-6">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    plan.popular
                      ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{plan.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">UGX</p>
                    </div>
                  </div>
                  {plan.popular && (
                    <p className="text-xs font-medium text-primary mt-2">Most Popular</p>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Select a plan to continue
            </p>
          </>
        ) : (
          /* If plan selected - show payment form */
          <>
            {/* Selected Plan Summary */}
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{currentPlan?.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentPlan?.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{currentPlan?.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">UGX</p>
                </div>
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+256 or 0700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Works with MTN Money, Airtel Money, Abracadabra
              </p>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 rounded-lg transition-colors mb-3"
            >
              {loading ? 'Processing...' : `Pay UGX ${currentPlan?.price.toLocaleString()}`}
            </button>

            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedPlan(null)
                setPhoneNumber('')
                setError('')
              }}
              disabled={loading}
              className="w-full bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground font-medium py-2 rounded-lg transition-colors"
            >
              Change Plan
            </button>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Secure payment via mobile money
            </p>
          </>
        )}
      </div>
    </div>
  )
}
