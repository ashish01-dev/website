'use client'

import { useMemo } from 'react'

interface HeatmapProps {
  days?: number
}

export default function Heatmap({ days = 30 }: HeatmapProps) {
  const cells = useMemo(() => {
    const result: { level: number; day: number }[] = []
    for (let i = 0; i < days; i++) {
      result.push({ level: Math.floor(Math.random() * 5), day: i })
    }
    return result
  }, [days])

  const levels = ['bg-surface-container', 'bg-primary-container/30', 'bg-primary-container/60', 'bg-primary-container', 'bg-primary']

  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((cell) => (
        <div
          key={cell.day}
          className={`w-3 h-3 rounded-sm ${levels[cell.level]} transition-colors`}
          title={`Day ${cell.day + 1}`}
        />
      ))}
    </div>
  )
}
