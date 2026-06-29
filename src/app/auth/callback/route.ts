import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/?error=missing_config`)
  }

  if (code) {
    try {
      const sb = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
          setAll: () => {},
        },
      })
      const { data: { session } } = await sb.auth.exchangeCodeForSession(code)
      if (!session?.user) return NextResponse.redirect(`${origin}/auth?error=auth_failed`)

      const response = NextResponse.redirect(`${origin}/`)

      if (session.user.user_metadata) {
        const meta = session.user.user_metadata
        const name = meta.full_name || meta.name || ''
        const avatar = meta.avatar_url || meta.picture || ''
        if (name || avatar) {
          const { data: existing } = await sb.from('settings').select('value').eq('id', 'main').eq('user_id', session.user.id).single() as any
          const merged = { ...(existing?.value || {}), ...(name ? { name } : {}), ...(avatar ? { avatarUrl: avatar } : {}) }
          await sb.from('settings').upsert({ user_id: session.user.id, id: 'main', value: merged }, { onConflict: 'user_id,id' })
        }
      }
      return response
    } catch {
      return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
    }
  }
  return NextResponse.redirect(`${origin}/auth`)
}
