import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const BATCHES = [
  { name: 'Beginner', chapters: 5 },
  { name: 'Intermediate', chapters: 15 },
  { name: 'Advanced', chapters: 30 },
  { name: 'Expert', chapters: 50 },
  { name: 'Master', chapters: 75 },
]

function getBatchId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

export async function GET() {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      /* Fallback: return empty stats when no backend */
      return NextResponse.json({
        batches: BATCHES.map(b => ({ id: getBatchId(b.name), name: b.name, chapters: b.chapters, percentage: 0, totalUsers: 0, owners: 0 })),
        totalUsers: 0,
      })
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

    /* Count total unique users who have at least one progress entry */
    const { count: totalUsers } = await sb
      .from('progress')
      .select('user_id', { count: 'exact', head: true })

    /* Get per-user chapter completion counts */
    const { data: doneData } = await sb
      .from('progress')
      .select('user_id')
      .eq('status', 'done')

    if (!doneData || !totalUsers) {
      return NextResponse.json({
        batches: BATCHES.map(b => ({ id: getBatchId(b.name), name: b.name, chapters: b.chapters, percentage: 0, totalUsers: totalUsers || 0, owners: 0 })),
        totalUsers: totalUsers || 0,
      })
    }

    /* Count chapters done per user */
    const userCounts: Record<string, number> = {}
    for (const row of doneData) {
      userCounts[row.user_id] = (userCounts[row.user_id] || 0) + 1
    }
    const uniqueUsers = Object.keys(userCounts).length
    const total = Math.max(totalUsers, uniqueUsers)

    const batches = BATCHES.map(b => {
      const owners = Object.values(userCounts).filter(c => c >= b.chapters).length
      return {
        id: getBatchId(b.name),
        name: b.name,
        chapters: b.chapters,
        percentage: total > 0 ? Math.round((owners / total) * 100) : 0,
        totalUsers: total,
        owners,
      }
    })

    return NextResponse.json({ batches, totalUsers: total })
  } catch (err) {
    console.error('Badge stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch badge stats' }, { status: 500 })
  }
}
