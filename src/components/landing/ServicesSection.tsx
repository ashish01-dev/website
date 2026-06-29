'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const cards = [
  {
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
    tag: 'Strategy',
    title: 'Research & Insight',
    desc: 'We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.',
  },
  {
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
    tag: 'Craft',
    title: 'Design & Execution',
    desc: 'From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.',
  },
]

function ServiceCard({ card, index }: { card: typeof cards[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="liquid-glass rounded-3xl overflow-hidden group"
    >
      <div className="aspect-video overflow-hidden relative">
        <video
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={card.video}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/40 text-xs tracking-widest uppercase">{card.tag}</span>
          <div className="liquid-glass rounded-full p-2">
            <ArrowUpRight className="text-white" size={16} />
          </div>
        </div>
        <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight">{card.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
      </div>
    </motion.div>
  )
}

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
      <div ref={ref} className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-5xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            What we do
          </h2>
          <span className="hidden md:block text-white/40 text-sm tracking-widest uppercase">Our services</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((card, i) => (
            <ServiceCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
