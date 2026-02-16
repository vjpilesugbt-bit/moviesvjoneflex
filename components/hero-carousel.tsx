'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

type CarouselItem = {
  id: string
  title: string
  subtitle?: string
  banner_url: string
  link_type?: string
  link_id?: string
}

type Movie = {
  id: string
  title: string
  poster_url: string
  year?: number
  rating?: number
}

const defaultSlides: CarouselItem[] = [
  {
    id: '1',
    title: 'Bait',
    subtitle: '(ENGLISH, TAMIL, TELUGU & HINDI)',
    banner_url: '/shark-attack-underwater-thriller-movie-banner.jpg',
  },
  {
    id: '2',
    title: 'Rapid Action',
    subtitle: '(ENGLISH, DUBBED)',
    banner_url: '/action-soldier-military-movie-banner.jpg',
  },
]

interface HeroCarouselProps {
  movies?: Movie[]
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<CarouselItem[]>(defaultSlides)

  useEffect(() => {
    // Listen to carousel collection from Firebase
    const q = query(collection(db, 'carousel'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const carouselItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CarouselItem[]

      // Only use carousel items from admin upload, not movies
      if (carouselItems.length > 0) {
        setSlides(carouselItems)
      } else {
        setSlides(defaultSlides)
      }
    })

    return () => unsubscribe()
  }, [movies])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const slide = slides[currentSlide]

  const getWatchLink = () => {
    if (slide.link_type === "movie" && slide.link_id) {
      return `/watch/${slide.link_id}`
    }
    if (slide.link_type === "series" && slide.link_id) {
      return `/series/${slide.link_id}`
    }
    return "#"
  }

  return (
    <div className="relative rounded-xl overflow-hidden mx-4 mt-4">
      <div className="relative h-64 md:h-80">
        <Image
          src={slide.banner_url || "/placeholder.svg?height=400&width=1200&query=movie banner"}
          alt={slide.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />

        <div className="absolute bottom-6 left-6">
          <p className="text-xs text-gray-300 mb-1">{slide.subtitle}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{slide.title}</h2>
          <Link
            href={getWatchLink()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Watch Now
          </Link>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? "bg-primary" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
