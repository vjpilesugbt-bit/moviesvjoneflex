'use client'

import { X, Lock, Star } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionWallProps {
  onClose?: () => void
  contentTitle?: string
}

export function SubscriptionWall({ onClose, contentTitle = 'This Content' }: SubscriptionWallProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur flex items-center justify-center rounded-lg z-40">
      <div className="text-center max-w-sm px-6">
        <div className="mb-4">
          <Lock className="w-16 h-16 text-primary mx-auto" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Premium Content</h2>
        <p className="text-muted-foreground mb-6">
          {contentTitle} is exclusive to VJ Oneflex Premium subscribers. Upgrade now to watch.
        </p>

        <div className="space-y-3">
          <Link
            href="/subscription"
            className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-colors"
          >
            View Plans
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Premium Benefits</p>
          <div className="space-y-2">
            {[
              'Watch unlimited content',
              'HD & 4K quality',
              'Ad-free experience',
              'Download & offline watch',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
