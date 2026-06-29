'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, Camera, X } from 'lucide-react'

interface HeroSectionProps {
  onOpenAuth: (mode: 'signup' | 'login') => void
}

export default function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const opacityRef = useRef(1)
  const [opacity, setOpacity] = useState(0)

  const fadeTo = useCallback((from: number, to: number, duration: number) => {
    const start = performance.now()
    opacityRef.current = from
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const val = from + (to - from) * t
      opacityRef.current = val
      setOpacity(val)
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onCanplay = () => {
      video.play()
      fadeTo(0, 1, 500)
    }

    const onTimeupdate = () => {
      const remaining = video.duration - video.currentTime
      if (remaining <= 0.55 && opacityRef.current > 0.01) {
        fadeTo(opacityRef.current, 0, 500)
      }
    }

    const onEnded = () => {
      setOpacity(0)
      opacityRef.current = 0
      setTimeout(() => {
        video.currentTime = 0
        video.play()
        fadeTo(0, 1, 500)
      }, 100)
    }

    video.addEventListener('canplay', onCanplay)
    video.addEventListener('timeupdate', onTimeupdate)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('canplay', onCanplay)
      video.removeEventListener('timeupdate', onTimeupdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [fadeTo])

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col bg-black">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        style={{ opacity }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
      />

      <div className="relative z-20 px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="text-white" size={24} />
            <span className="text-white font-semibold text-lg">JEEIFY</span>
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href="#features" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">About</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenAuth('signup')} className="text-white text-sm font-medium hover:text-white/80 transition-colors">Sign Up</button>
            <button onClick={() => onOpenAuth('login')} className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">Login</button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Know it then <em className="italic">all</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-xl w-full mt-10"
        >
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-sm"
            />
            <button className="bg-white rounded-full p-3 text-black flex-shrink-0 hover:bg-white/90 transition-colors">
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-white/60 text-sm leading-relaxed px-4 max-w-md mt-6"
        >
          Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8"
        >
          <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
            Read the Manifesto
          </button>
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-center gap-4 pb-12">
        {[Camera, X, Globe].map((Icon, i) => (
          <button key={i} className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Icon size={20} />
          </button>
        ))}
      </div>
    </section>
  )
}
